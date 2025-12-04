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
          { role: "assistant", content: "Please enter a valid URL.\nExample: https://www.lg.com/us/product/..." },
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
          { role: "assistant", content: "Unable to fetch the page. Access may be restricted due to CORS policy.\n\nPlease copy and paste the main content of the page directly." },
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
      toast({ title: "Error", description: "An error occurred during analysis.", variant: "destructive" });
      setMessages((prev) => [...prev, { role: "assistant", content: "An error occurred during analysis. Please try again." }]);
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate("/home")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/maple-profile.png" alt="Maple" className="w-7 h-7 rounded-full" />
          <span className="font-semibold text-foreground">Maple</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleNewChat} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <img src="/lovable-uploads/maple-profile.png" alt="Maple" className="w-16 h-16 rounded-full mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">Maple PDP Curator</h1>
            <p className="text-muted-foreground text-center max-w-md">
              Enter a product page URL you want to analyze.<br />
              I'll provide product features and recommendations.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-6 px-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-6 ${message.role === "user" ? "flex justify-end" : ""}`}>
                {message.role === "assistant" ? (
                  <div className="flex gap-3">
                    <img src="/lovable-uploads/maple-profile.png" alt="Maple" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                    <div className="text-foreground leading-relaxed whitespace-pre-wrap">{message.content || <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}</div>
                  </div>
                ) : (
                  <div className="bg-secondary rounded-2xl px-4 py-2.5 max-w-[85%]">
                    <p className="text-foreground whitespace-pre-wrap break-all">{message.content}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-secondary rounded-2xl px-4 py-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a PDP URL..."
              className="flex-1 bg-transparent border-0 resize-none focus-visible:ring-0 p-0 min-h-[24px] max-h-[200px] text-foreground placeholder:text-muted-foreground"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-8 w-8 rounded-full bg-foreground hover:bg-foreground/90 disabled:bg-muted flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Maple analyzes product pages and provides curation insights</p>
        </div>
      </div>
    </div>
  );
};

export default MaplePDP;
