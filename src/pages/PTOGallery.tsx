import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import benProfile from "@/assets/ben-profile.jpg";

interface FormData {
  email: string;
  country: string;
  mainProductUrl: string;
  mainProductEnergyLabel: string;
  secondProductUrl: string;
  secondProductEnergyLabel: string;
}

const PTOGallery = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    country: '',
    mainProductUrl: '',
    mainProductEnergyLabel: '',
    secondProductUrl: '',
    secondProductEnergyLabel: ''
  });
  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'failure' | null>(null);

  const energyLabels = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

  const conversations = [
    {
      type: 'ben-message',
      content: "안녕하세요! 저는 Ben이에요. PTO 갤러리 제작을 도와드릴게요. 몇 가지 질문을 통해 완벽한 갤러리를 만들어드리겠습니다! 😊"
    },
    {
      type: 'ben-question',
      content: "먼저 요청하시는 분의 이메일 주소를 알려주세요.",
      field: 'email'
    },
    {
      type: 'ben-message',
      content: "네, 감사합니다! 이메일로 완성된 갤러리를 보내드릴게요."
    },
    {
      type: 'ben-question',
      content: "어느 국가를 담당하고 계신가요?",
      field: 'country'
    },
    {
      type: 'ben-message',
      content: "좋습니다! 해당 지역에 맞는 갤러리를 제작해드릴게요."
    },
    {
      type: 'ben-question',
      content: "갤러리의 메인 모델(가장 좌측에 표시될 제품)의 상세페이지 URL을 붙여넣어주세요.\n예: https://www.lg.com/es/tv-y-barras-de-sonido/oled-evo/oled83c5elb-esb/",
      field: 'mainProductUrl'
    },
    {
      type: 'ben-energy-label',
      content: "유럽에서 접속하신 것 같은데, 제품에 대한 에너지라벨이 필수로 들어가야 합니다. 어떤 에너지라벨을 선택하시겠어요?",
      field: 'mainProductEnergyLabel',
      showUrl: true
    },
    {
      type: 'ben-question',
      content: "이번엔 오른쪽에 위치할 두 번째 제품의 상세페이지 URL도 붙여넣어주세요!",
      field: 'secondProductUrl'
    },
    {
      type: 'ben-energy-label',
      content: "이 제품도 에너지라벨을 선택해주세요.",
      field: 'secondProductEnergyLabel',
      showUrl: true
    },
    {
      type: 'ben-completion',
      content: "모든 준비가 완료되었습니다! 이제 Submit 버튼을 누르면 몇 분 뒤에 이메일로 받아보실 수 있습니다. 그동안 전 잠시 작업하고 올게요! 🐕💻"
    }
  ];

  const handleNext = () => {
    if (currentStep < conversations.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUserInput('');
    }
  };

  const handleInputSubmit = () => {
    const currentConversation = conversations[currentStep];
    if (currentConversation.field) {
      setFormData(prev => ({
        ...prev,
        [currentConversation.field]: userInput
      }));
    }
    setTimeout(handleNext, 300);
  };

  const handleEnergyLabelSelect = (label: string) => {
    const currentConversation = conversations[currentStep];
    if (currentConversation.field) {
      setFormData(prev => ({
        ...prev,
        [currentConversation.field]: label
      }));
    }
    setTimeout(handleNext, 300);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate random success/failure
    const success = Math.random() > 0.3;
    setSubmissionStatus(success ? 'success' : 'failure');
    setIsSubmitting(false);
  };

  const currentConversation = conversations[currentStep];
  const isQuestion = currentConversation?.type.includes('question') || currentConversation?.type.includes('energy-label');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 min-h-[500px]">
          {/* Ben's Profile */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400/50">
              <img src={benProfile} alt="Ben" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Ben</h3>
              <p className="text-sm text-muted-foreground">PTO Gallery Creator</p>
            </div>
          </div>

          {/* Conversation Flow */}
          <div className="space-y-6">
            {conversations.slice(0, currentStep + 1).map((conv, index) => (
              <div 
                key={index}
                className={`transition-all duration-500 ${
                  index === currentStep ? 'animate-fade-in' : ''
                }`}
              >
                {/* Ben's Message */}
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm font-medium">B</span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm whitespace-pre-line">{conv.content}</p>
                    {conv.showUrl && conv.field && formData[conv.field as keyof FormData] && (
                      <div className="mt-2 p-2 bg-background rounded text-xs text-muted-foreground">
                        URL: {formData[conv.field as keyof FormData]}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Input Area */}
                {index === currentStep && isQuestion && (
                  <div className="mt-4 animate-fade-in">
                    {conv.type === 'ben-energy-label' ? (
                      <div className="grid grid-cols-5 gap-2">
                        {energyLabels.map((label) => (
                          <Button
                            key={label}
                            variant="outline"
                            size="sm"
                            onClick={() => handleEnergyLabelSelect(label)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="답변을 입력하세요..."
                          onKeyDown={(e) => e.key === 'Enter' && userInput.trim() && handleInputSubmit()}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleInputSubmit}
                          disabled={!userInput.trim()}
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* User Response Display */}
                {index < currentStep && conv.field && formData[conv.field as keyof FormData] && (
                  <div className="flex gap-3 justify-end mb-2">
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">{formData[conv.field as keyof FormData]}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-medium">U</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Completion Actions */}
            {currentStep === conversations.length - 1 && (
              <div className="text-center space-y-4 animate-fade-in">
                {!isSubmitting && !submissionStatus && (
                  <Button onClick={handleSubmit} size="lg" className="w-full">
                    Submit Gallery Request
                  </Button>
                )}

                {isSubmitting && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-2xl">🐕💻</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Ben이 갤러리를 제작하고 있습니다...</p>
                  </div>
                )}

                {submissionStatus === 'success' && (
                  <div className="text-center space-y-2">
                    <div className="text-4xl">✅</div>
                    <p className="font-medium text-green-600">성공적으로 전송되었습니다!</p>
                    <p className="text-sm text-muted-foreground">요청하신 메일함을 확인해보세요.</p>
                  </div>
                )}

                {submissionStatus === 'failure' && (
                  <div className="text-center space-y-2">
                    <div className="text-4xl">❌</div>
                    <p className="font-medium text-red-600">뭔가 이상합니다...</p>
                    <p className="text-sm text-muted-foreground">다시 시도해주세요.</p>
                    <Button onClick={() => setSubmissionStatus(null)} variant="outline">
                      다시 시도
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Continue Button for non-question messages */}
            {currentStep < conversations.length - 1 && !isQuestion && (
              <div className="text-center animate-fade-in">
                <Button onClick={handleNext} variant="ghost" size="sm">
                  계속하기 →
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PTOGallery;