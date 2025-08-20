import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Edit3, Globe, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

const languages = {
  en: {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    questions: [
      {
        id: 1,
        messages: [
          "Hi there! I'm Yumi, your promotional content designer. 🎨",
          "I'm excited to help you create amazing promotional content!",
          "Let's start with the basics - could you please provide your EP ID?",
          "This will be the email address where you'll receive the final deliverables."
        ],
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        messages: [
          "Perfect! Now, tell me about this promotion.",
          "I'd love to help you craft the perfect copy! Please share:",
          "• Brief promotion details\n• Specific discount rates and products you'd like highlighted\n• Any copy you already have in mind",
          "The more details you give me, the better I can tailor the copywriting to match your vision perfectly!"
        ],
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        messages: [
          "Awesome! We're almost there.",
          "Now I need the PDP URL of the product you want to feature.",
          "Please copy and paste the product page URL here.",
          "(Currently, we can showcase one product per promotional content)"
        ],
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        messages: [
          "Great choice! Now, let's talk about the lifestyle imagery.",
          "What kind of vibe or people would you like to see in the lifestyle images?",
          "Just give me a rough description and I'll generate something amazing for you!",
          "Think about the mood, setting, or type of person that would best represent your product."
        ],
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        messages: [
          "Perfect! Do you need any disclaimers included in the promotional content?",
          "If so, please provide the exact text you'd like to include.",
          "If not, just type 'None' and we'll move on to the next step."
        ],
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        messages: [
          "Almost done! Last question.",
          "Where will this promotional content be published?",
          "Please select all the channels that apply:"
        ],
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        messages: [
          "Perfect! Let me show you everything you've provided.",
          "Please review all the details below and confirm when you're ready to proceed:"
        ],
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "Continue",
      confirmProceed: "Confirm & Proceed",
      enterYourId: "Enter your ID",
      typeResponse: "Type your response here...",
      confirmed: "Confirmed! Please proceed with creating the promotional content.",
      successMessage: "Excellent! I've received all your details and sent them to our content creation system. You'll receive the final deliverables at your provided email address. Will get back to you soon! 🎉"
    }
  },
  ko: {
    code: "ko",
    name: "한국어",
    flag: "🇰🇷",
    questions: [
      {
        id: 1,
        messages: [
          "안녕하세요! 저는 프로모션 콘텐츠 디자이너 유미입니다. 🎨",
          "멋진 프로모션 콘텐츠를 만들어드릴 수 있어서 기쁩니다!",
          "기본 정보부터 시작하겠습니다. EP ID를 알려주시겠어요?",
          "최종 결과물을 받으실 이메일 주소입니다."
        ],
        field: "epId" as keyof FormData,
        inputType: "email"
      },
      {
        id: 2,
        messages: [
          "완벽합니다! 이제 이번 프로모션에 대해 알려주세요.",
          "완벽한 카피를 작성하는데 도움이 되도록 다음 내용을 공유해 주세요:",
          "• 프로모션 간단 소개\n• 구체적인 할인율과 강조하고 싶은 제품\n• 이미 생각해두신 카피가 있다면",
          "자세한 내용을 알려주실수록 귀하의 비전에 완벽하게 맞는 카피라이팅을 만들어드릴 수 있습니다!"
        ],
        field: "promotionInfo" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 3,
        messages: [
          "훌륭합니다! 거의 다 왔어요.",
          "이제 특집하고 싶은 제품의 PDP URL이 필요합니다.",
          "제품 페이지 URL을 복사해서 붙여넣어 주세요.",
          "(현재 프로모션 콘텐츠당 하나의 제품을 소개할 수 있습니다)"
        ],
        field: "productUrl" as keyof FormData,
        inputType: "url"
      },
      {
        id: 4,
        messages: [
          "좋은 선택이네요! 이제 라이프스타일 이미지에 대해 이야기해볼까요?",
          "라이프스타일 이미지에서 어떤 분위기나 사람들을 보고 싶으신가요?",
          "대략적인 설명만 해주시면 멋진 이미지를 생성해드리겠습니다!",
          "제품을 가장 잘 나타낼 수 있는 분위기, 설정, 또는 사람의 유형을 생각해보세요."
        ],
        field: "lifestyleImage" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 5,
        messages: [
          "완벽합니다! 프로모션 콘텐츠에 포함해야 할 면책 조항이 있나요?",
          "있으시다면 포함하고 싶은 정확한 텍스트를 제공해 주세요.",
          "없으시다면 '없음'이라고 입력하시고 다음 단계로 넘어가겠습니다."
        ],
        field: "disclaimer" as keyof FormData,
        inputType: "textarea"
      },
      {
        id: 6,
        messages: [
          "거의 끝났어요! 마지막 질문입니다.",
          "이 프로모션 콘텐츠는 어디에 게시될 예정인가요?",
          "해당하는 모든 채널을 선택해 주세요:"
        ],
        field: "channels" as keyof FormData,
        inputType: "checkbox",
        options: ["LG.COM", "Pmax", "DV360", "Criteo", "AWIN", "Social"]
      },
      {
        id: 7,
        messages: [
          "완벽합니다! 제공해주신 모든 내용을 보여드리겠습니다.",
          "아래 세부사항을 검토하시고 진행할 준비가 되면 확인해 주세요:"
        ],
        field: null,
        inputType: "confirmation"
      }
    ],
    ui: {
      continue: "계속하기",
      confirmProceed: "확인 및 진행",
      enterYourId: "ID를 입력하세요",
      typeResponse: "답변을 입력하세요...",
      confirmed: "확인되었습니다! 프로모션 콘텐츠 제작을 진행해주세요.",
      successMessage: "훌륭합니다! 모든 세부사항을 받았으며 콘텐츠 제작 시스템으로 전송했습니다. 제공해주신 이메일 주소로 최종 결과물을 받으실 수 있습니다. 빨리 작업하고 올게요! 🎉"
    }
  }
};

const ChatInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>("en");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [formData, setFormData] = useState<FormData>({
    epId: "",
    promotionInfo: "",
    productUrl: "",
    lifestyleImage: "",
    disclaimer: "",
    channels: []
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isYumiThinking, setIsYumiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with first question messages
    const firstQuestion = languages[currentLanguage].questions[0];
    sendSequentialMessages(firstQuestion.messages);
  }, [currentLanguage]);

  const sendSequentialMessages = (messages: string[]) => {
    messages.forEach((messageText, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `yumi-${Date.now()}-${index}`,
          sender: "yumi",
          content: messageText,
          timestamp: new Date(),
          type: "question"
        }]);
      }, index * 1500); // 1.5 second delay between each message
    });
  };

  const getCurrentQuestion = () => {
    return languages[currentLanguage].questions[currentQuestionIndex];
  };

  const addThinkingMessage = () => {
    const thinkingId = `thinking-${Date.now()}`;
    setIsYumiThinking(true);
    
    setMessages(prev => [...prev, {
      id: thinkingId,
      sender: "yumi",
      content: "...",
      timestamp: new Date(),
      type: "question"
    }]);

    // Replace thinking message with sequential messages after 1.5 seconds
    setTimeout(() => {
      setIsYumiThinking(false);
      if (currentQuestionIndex < languages[currentLanguage].questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = languages[currentLanguage].questions[nextIndex];
        
        // Remove thinking message
        setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
        
        // Send sequential messages
        sendSequentialMessages(nextQuestion.messages);
      }
    }, 1500);
  };

  const handleInputSubmit = () => {
    const currentQuestion = getCurrentQuestion();
    
    if (!inputValue.trim() && currentQuestion.inputType !== "checkbox") return;

    // For the first question (EP ID), automatically append @lge.com if not already present
    let finalValue = inputValue;
    if (currentQuestion.inputType === "email" && currentQuestionIndex === 0) {
      if (!inputValue.includes("@")) {
        finalValue = inputValue + "@lge.com";
      }
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: finalValue,
      timestamp: new Date(),
      type: "answer"
    };

    setMessages(prev => [...prev, userMessage]);

    if (currentQuestion.field) {
      setFormData(prev => ({
        ...prev,
        [currentQuestion.field]: finalValue
      }));
    }

    setInputValue("");
    
    setTimeout(() => {
      addThinkingMessage();
    }, 300);
  };

  const handleChannelSubmit = () => {
    const channelsText = formData.channels.length > 0 
      ? formData.channels.join(", ") 
      : "None selected";

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: channelsText,
      timestamp: new Date(),
      type: "answer"
    };

    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      addThinkingMessage();
    }, 300);
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  const handleConfirmation = async () => {
    setIsSubmitting(true);
    setSubmissionStatus('idle');

    const confirmationMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: languages[currentLanguage].ui.confirmed,
      timestamp: new Date(),
      type: "answer"
    };

    setMessages(prev => [...prev, confirmationMessage]);

    // Submit to webhook
    try {
      const response = await fetch('https://dev.eaip.lge.com/n8n/webhook/4fa28184-90d6-41bb-aa21-8b620685d162', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EPID: formData.epId,
          PromotionInfo: formData.promotionInfo,
          ProductUrl: formData.productUrl,
          LifestyleImage: formData.lifestyleImage,
          Disclaimer: formData.disclaimer,
          Channels: formData.channels
        }),
      });

      if (response.ok) {
        setSubmissionStatus('success');
        toast({
          title: "Success",
          description: "Your request has been submitted successfully!",
        });

        setTimeout(() => {
          const successMessage: Message = {
            id: `yumi-${Date.now()}`,
            sender: "yumi",
            content: languages[currentLanguage].ui.successMessage,
            timestamp: new Date(),
            type: "question"
          };

          setMessages(prev => [...prev, successMessage]);
          setIsCompleted(true);
        }, 1500);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      setSubmissionStatus('error');
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentInputField = () => {
    const currentQuestion = getCurrentQuestion();
    
    if (currentQuestion.inputType === "confirmation") {
      return (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-900">Review Your Information:</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">EP ID:</span> {formData.epId}</p>
              <p><span className="font-medium">Promotion Info:</span> {formData.promotionInfo}</p>
              <p><span className="font-medium">Product URL:</span> {formData.productUrl}</p>
              <p><span className="font-medium">Lifestyle Image:</span> {formData.lifestyleImage}</p>
              <p><span className="font-medium">Disclaimer:</span> {formData.disclaimer}</p>
              <p><span className="font-medium">Channels:</span> {formData.channels.join(", ") || "None"}</p>
            </div>
          </div>
          <Button 
            onClick={handleConfirmation} 
            className="w-full flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : submissionStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                Submitted Successfully!
              </>
            ) : submissionStatus === 'error' ? (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                Try Again
              </>
            ) : (
              languages[currentLanguage].ui.confirmProceed
            )}
          </Button>
        </div>
      );
    }

    if (currentQuestion.inputType === "checkbox") {
      return (
        <div className="space-y-4">
          {currentQuestion.options?.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={formData.channels.includes(option)}
                onCheckedChange={(checked) => handleChannelChange(option, checked as boolean)}
              />
              <label htmlFor={option} className="text-sm font-medium">{option}</label>
            </div>
          ))}
          <Button 
            onClick={handleChannelSubmit}
            className="w-full mt-4 bg-orange-400 hover:bg-orange-500 text-white"
            disabled={formData.channels.length === 0}
          >
            {languages[currentLanguage].ui.continue}
          </Button>
        </div>
      );
    }

    if (currentQuestion.inputType === "textarea") {
      return (
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={languages[currentLanguage].ui.typeResponse}
            rows={3}
            className="flex-1 border-gray-200"
          />
          <Button 
            onClick={handleInputSubmit}
            disabled={!inputValue.trim()}
            size="icon"
            className="self-end bg-orange-400 hover:bg-orange-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-2 items-center bg-gray-100 rounded-lg px-3 py-2">
        <Input
          type={currentQuestion.inputType}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={currentQuestion.inputType === "email" ? languages[currentLanguage].ui.enterYourId : languages[currentLanguage].ui.typeResponse}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          onKeyPress={(e) => e.key === "Enter" && handleInputSubmit()}
        />
        {currentQuestionIndex === 0 && <span className="text-gray-600 text-sm">@lge.com</span>}
        <Button 
          onClick={handleInputSubmit}
          disabled={!inputValue.trim()}
          size="icon"
          className="bg-orange-400 hover:bg-orange-500"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: `url('/lovable-uploads/16b91392-64fd-4dd0-8569-0c35e54e11cb.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Back to Home button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-white hover:bg-white/10 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      {/* Main chat container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Chat header with Yumi's profile */}
          <div className="bg-white p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img 
                  src="/lovable-uploads/1d0546ae-2d59-40cf-a231-60343eecc72a.png" 
                  alt="Yumi Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Yumi</h2>
                <p className="text-gray-600">Promotional Content Designer</p>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-900 shadow-sm rounded-bl-md border border-gray-100"
                  }`}
                >
                   <p className="text-sm whitespace-pre-wrap">
                     {message.content === "..." ? (
                       <span className="inline-flex">
                         <span className="animate-pulse mr-1">.</span>
                         <span className="animate-pulse delay-150 mr-1">.</span>
                         <span className="animate-pulse delay-300">.</span>
                       </span>
                     ) : (
                       message.content
                     )}
                   </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender === "user" && (
                      <Edit3 className="w-3 h-3 opacity-50" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          {!isCompleted && (
            <div className="p-6 bg-white border-t border-gray-100">
              {getCurrentInputField()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;