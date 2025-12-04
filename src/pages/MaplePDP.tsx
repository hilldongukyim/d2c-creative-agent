import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MaplePDP = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "안녕하세요! 저는 Maple이에요 🍁\n\nPDP(Product Detail Page) URL을 보내주시면, 해당 제품 페이지를 분석해서 제품 큐레이션을 도와드릴게요.\n\n어떤 제품이 궁금하신가요?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      const textContent = doc.body?.innerText || "";
      return textContent.slice(0, 10000);
    } catch (error) {
      console.error("Failed to fetch page:", error);
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
          {
            role: "assistant",
            content: "유효한 URL을 입력해주세요. 예: https://www.lg.com/us/product/...",
          },
        ]);
        setIsLoading(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "페이지를 분석 중이에요... 🔍" },
      ]);

      let htmlContent: string;
      try {
        htmlContent = await fetchPageContent(trimmedInput);
      } catch (error) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: `죄송해요, 페이지를 가져오는데 실패했어요. CORS 정책으로 인해 직접 접근이 제한될 수 있어요.\n\n대신 페이지의 주요 내용을 직접 복사해서 붙여넣어 주시겠어요?`,
          };
          return newMessages;
        });
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

      if (!response.ok) {
        throw new Error("AI 분석에 실패했습니다.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: "assistant", content: "" };
          return newMessages;
        });

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
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return newMessages;
                });
              }
            } catch {
              // Incomplete JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "오류 발생",
        description: "분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.role === "assistant") {
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: "죄송해요, 분석 중 오류가 발생했어요. 다시 시도해주세요.",
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/home")}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <img
            src="/lovable-uploads/maple-profile.png"
            alt="Maple"
            className="w-8 h-8 rounded-full border border-slate-200"
          />
          <span className="font-medium text-slate-800">Maple</span>
        </div>
        <Logo />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-slate-900 text-white rounded-br-md"
                  : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                  <img
                    src="/lovable-uploads/maple-profile.png"
                    alt="Maple"
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-xs font-medium text-slate-500">Maple</span>
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-sm text-slate-500">분석 중...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="PDP URL을 입력하세요..."
            className="flex-1 border-slate-200 focus:border-slate-400"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          제품 페이지 URL을 입력하면 Maple이 분석해드려요
        </p>
      </div>
    </div>
  );
};

export default MaplePDP;
