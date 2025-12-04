import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MaplePDP = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text.trim());
      return true;
    } catch {
      return false;
    }
  };

  const fetchPageContent = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      doc.querySelectorAll("script, style, noscript").forEach((el) => el.remove());
      return (doc.body?.innerText || "").slice(0, 10000);
    } catch {
      throw new Error("페이지를 가져올 수 없습니다.");
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!isValidUrl(trimmedInput)) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "유효한 URL을 입력해주세요.\n예: https://www.lg.com/us/product/..." },
        ]);
        setIsLoading(false);
        return;
      }

      let htmlContent: string;
      try {
        htmlContent = await fetchPageContent(trimmedInput);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "페이지를 가져올 수 없어요. CORS 정책으로 접근이 제한될 수 있습니다.\n\n페이지의 주요 내용을 직접 복사해서 붙여넣어 주세요." },
        ]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maple-pdp-analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ url: trimmedInput, htmlContent }),
        }
      );

      if (!response.ok) throw new Error("AI 분석 실패");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { role: "assistant", content: assistantContent };
                  return newMessages;
                });
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "오류 발생", description: "분석 중 오류가 발생했습니다.", variant: "destructive" });
      setMessages((prev) => [...prev, { role: "assistant", content: "분석 중 오류가 발생했어요. 다시 시도해주세요." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate("/home")} className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/maple-profile.png" alt="Maple" className="w-7 h-7 rounded-full" />
          <span className="font-semibold text-slate-800">Maple</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleNewChat} className="text-slate-500 hover:text-slate-900">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <img src="/lovable-uploads/maple-profile.png" alt="Maple" className="w-16 h-16 rounded-full mb-4" />
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">Maple PDP Curator</h1>
            <p className="text-slate-500 text-center max-w-md">
              분석하고 싶은 제품 페이지 URL을 입력해주세요.<br />
              제품의 특징과 추천 포인트를 알려드릴게요.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-6 px-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-6 ${message.role === "user" ? "flex justify-end" : ""}`}>
                {message.role === "assistant" ? (
                  <div className="flex gap-3">
                    <img src="/lovable-uploads/maple-profile.png" alt="Maple" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{message.content || <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}</div>
                  </div>
                ) : (
                  <div className="bg-slate-200 rounded-2xl px-4 py-2.5 max-w-[85%]">
                    <p className="text-slate-800 whitespace-pre-wrap break-all">{message.content}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-slate-100 rounded-2xl px-4 py-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="PDP URL을 입력하세요..."
              className="flex-1 bg-transparent border-0 resize-none focus-visible:ring-0 p-0 min-h-[24px] max-h-[200px] text-slate-800 placeholder:text-slate-400"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-8 w-8 rounded-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">Maple은 제품 페이지를 분석하여 큐레이션 정보를 제공합니다</p>
        </div>
      </div>
    </div>
  );
};

export default MaplePDP;
