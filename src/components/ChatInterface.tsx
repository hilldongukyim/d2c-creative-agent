import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Send, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  sender: "yumi" | "user";
  content: string;
  timestamp: Date;
  type?: "question" | "answer" | "options" | "confirmation";
}

interface FormData {
  epId: string;
  promotionInfo: string;
  productUrl: string;
  lifestyleImage: string;
  disclaimer: string;
  channels: string[];
}

const questions = [
  {
    id: 1,
    text: "Hi there! I'm Yumi, your promotional content designer. I'm excited to help you create amazing promotional content! 🎨\n\nLet's start with the basics - could you please provide your EP ID? This will be the email address where you'll receive the final deliverables.",
    field: "epId" as keyof FormData,
    inputType: "email"
  },
  {
    id: 2,
    text: "Perfect! Now, tell me about this promotion. I'd love to help you craft the perfect copy! Please share:\n\n• Brief promotion details\n• Specific discount rates and products you'd like highlighted\n• Any copy you already have in mind\n\nThe more details you give me, the better I can tailor the copywriting to match your vision perfectly!",
    field: "promotionInfo" as keyof FormData,
    inputType: "textarea"
  },
  {
    id: 3,
    text: "Awesome! We're almost there. Now I need the PDP URL of the product you want to feature. Please copy and paste the product page URL here.\n\n(Currently, we can showcase one product per promotional content)",
    field: "productUrl" as keyof FormData,
    inputType: "url"
  },
  {
    id: 4,
    text: "Great choice! Now, let's talk about the lifestyle imagery. What kind of vibe or people would you like to see in the lifestyle images?\n\nJust give me a rough description and I'll generate something amazing for you! Think about the mood, setting, or type of person that would best represent your product.",
    field: "lifestyleImage" as keyof FormData,
    inputType: "textarea"
  },
  {
    id: 5,
    text: "Perfect! Do you need any disclaimers included in the promotional content? If so, please provide the exact text you'd like to include.\n\nIf not, just type 'None' and we'll move on to the next step.",
    field: "disclaimer" as keyof FormData,
    inputType: "textarea"
  },
  {
    id: 6,
    text: "Almost done! Last question - where will this promotional content be published? Please select all the channels that apply:",
    field: "channels" as keyof FormData,
    inputType: "checkbox",
    options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
  },
  {
    id: 7,
    text: "Perfect! Let me show you everything you've provided. Please review all the details below and confirm when you're ready to proceed:",
    field: null,
    inputType: "confirmation"
  }
];

const ChatInterface = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    epId: "",
    promotionInfo: "",
    productUrl: "",
    lifestyleImage: "",
    disclaimer: "",
    channels: []
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial message from Yumi
    const welcomeMessage: Message = {
      id: "welcome",
      sender: "yumi",
      content: questions[0].text,
      timestamp: new Date(),
      type: "question"
    };
    setMessages([welcomeMessage]);
  }, []);

  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (currentQuestion < 6) {
      // Add user's answer
      const userMessage: Message = {
        id: `user-${currentQuestion}`,
        sender: "user",
        content: questions[currentQuestion].inputType === "checkbox" 
          ? selectedChannels.join(", ") 
          : currentInput,
        timestamp: new Date(),
        type: "answer"
      };

      // Update form data
      const field = questions[currentQuestion].field;
      if (field) {
        setFormData(prev => ({
          ...prev,
          [field]: questions[currentQuestion].inputType === "checkbox" 
            ? selectedChannels 
            : currentInput
        }));
      }

      setMessages(prev => [...prev, userMessage]);
      
      // Clear input
      setCurrentInput("");
      setSelectedChannels([]);
      
      // Move to next question
      setCurrentQuestion(prev => prev + 1);
      
      // Add Yumi's next question after a delay
      setTimeout(() => {
        simulateTyping();
        setTimeout(() => {
          const nextMessage: Message = {
            id: `yumi-${currentQuestion + 1}`,
            sender: "yumi",
            content: questions[currentQuestion + 1].text,
            timestamp: new Date(),
            type: "question"
          };
          setMessages(prev => [...prev, nextMessage]);
        }, 1000);
      }, 500);
    } else {
      // Final confirmation - send data to webhook
      const userMessage: Message = {
        id: "final-confirm",
        sender: "user",
        content: "Confirmed! Please proceed with creating the promotional content.",
        timestamp: new Date(),
        type: "answer"
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Send data to n8n webhook
      try {
        const webhookUrl = "https://your-n8n-webhook-url.com/webhook/promotional-content"; // Replace with actual n8n URL
        
        const payload = {
          epId: formData.epId,
          promotionInfo: formData.promotionInfo,
          productUrl: formData.productUrl,
          lifestyleImage: formData.lifestyleImage,
          disclaimer: formData.disclaimer,
          channels: formData.channels,
          timestamp: new Date().toISOString()
        };

        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(payload),
        });

        console.log("Data sent to webhook:", payload);
      } catch (error) {
        console.error("Failed to send data to webhook:", error);
      }
      
      // Success message
      setTimeout(() => {
        const successMessage: Message = {
          id: "success",
          sender: "yumi",
          content: "Excellent! I've received all your details and sent them to our content creation system. You'll receive the final deliverables at your provided email address. Thank you for working with me! 🎉",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      }, 1000);
    }
  };

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const renderInput = () => {
    const question = questions[currentQuestion];
    
    if (currentQuestion >= 7) return null;

    if (question.inputType === "checkbox") {
      return (
        <div className="space-y-3">
          {question.options?.map(option => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={selectedChannels.includes(option)}
                onCheckedChange={() => handleChannelToggle(option)}
              />
              <label htmlFor={option} className="text-sm font-medium">
                {option}
              </label>
            </div>
          ))}
          <Button 
            onClick={handleSubmit}
            disabled={selectedChannels.length === 0}
            className="w-full mt-4"
          >
            <Send className="w-4 h-4 mr-2" />
            Continue
          </Button>
        </div>
      );
    }

    if (question.inputType === "confirmation") {
      return (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
            <div><strong>EP ID:</strong> {formData.epId}</div>
            <div><strong>Promotion Info:</strong> {formData.promotionInfo}</div>
            <div><strong>Product URL:</strong> {formData.productUrl}</div>
            <div><strong>Lifestyle Image:</strong> {formData.lifestyleImage}</div>
            <div><strong>Disclaimer:</strong> {formData.disclaimer}</div>
            <div><strong>Channels:</strong> {formData.channels.join(", ")}</div>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Confirm & Proceed
          </Button>
        </div>
      );
    }

    if (question.inputType === "textarea") {
      return (
        <div className="flex gap-2">
          <Textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type your response here..."
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (currentInput.trim()) handleSubmit();
              }
            }}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!currentInput.trim()}
            size="icon"
            className="shrink-0 self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Input
          type={question.inputType}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Type your response here..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && currentInput.trim()) {
              handleSubmit();
            }
          }}
        />
        <Button 
          onClick={handleSubmit}
          disabled={!currentInput.trim()}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
              <img 
                src="/lovable-uploads/17094800-5b16-4d6c-a2af-41b224a30be0.png" 
                alt="Yumi"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-semibold">Yumi</h1>
              <p className="text-xs text-muted-foreground">Promotional Content Designer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6 pb-32">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "yumi" && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center shrink-0">
                  <img 
                    src="/lovable-uploads/17094800-5b16-4d6c-a2af-41b224a30be0.png" 
                    alt="Yumi"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === "yumi"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {message.content}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {message.sender === "yumi" && message.type === "question" && (
                    <Edit3 className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </div>
              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  U
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/17094800-5b16-4d6c-a2af-41b224a30be0.png" 
                  alt="Yumi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {currentQuestion < 7 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t p-4">
            <div className="max-w-4xl mx-auto">
              {renderInput()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;