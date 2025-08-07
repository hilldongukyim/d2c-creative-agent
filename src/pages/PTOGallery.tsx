import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
const benProfile = "/lovable-uploads/df1c4dd4-a06d-4d9c-981e-4463ad0b08dc.png";

interface FormData {
  email: string;
  country: string;
  mainProductUrl: string;
  mainProductEnergyLabel: string;
  secondProductUrl: string;
  secondProductEnergyLabel: string;
}

interface ConversationItem {
  type: string;
  content: string;
  field?: string;
  exampleUrl?: string;
  showUrl?: boolean;
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
  const [showEnergyLabelHelp, setShowEnergyLabelHelp] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);
  const [isEuropeanCountry, setIsEuropeanCountry] = useState<boolean | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('https://dev.eaip.lge.com/n8n/webhook-test/ae7461ab-d3d2-45ac-be03-286bc165439d');
  const conversationRef = useRef<HTMLDivElement>(null);

  // European countries (in various languages)
  const europeanCountries = [
    // English
    'albania', 'andorra', 'armenia', 'austria', 'azerbaijan', 'belarus', 'belgium', 'bosnia and herzegovina', 
    'bulgaria', 'croatia', 'cyprus', 'czech republic', 'denmark', 'estonia', 'finland', 'france', 'georgia', 
    'germany', 'greece', 'hungary', 'iceland', 'ireland', 'italy', 'kazakhstan', 'kosovo', 'latvia', 
    'liechtenstein', 'lithuania', 'luxembourg', 'malta', 'moldova', 'monaco', 'montenegro', 'netherlands', 
    'north macedonia', 'norway', 'poland', 'portugal', 'romania', 'russia', 'san marino', 'serbia', 
    'slovakia', 'slovenia', 'spain', 'sweden', 'switzerland', 'turkey', 'ukraine', 'united kingdom', 'uk', 'vatican city',
    // Korean
    '독일', '프랑스', '이탈리아', '스페인', '네덜란드', '벨기에', '오스트리아', '스위스', '포르투갈', '그리스', 
    '폴란드', '체코', '헝가리', '슬로바키아', '슬로베니아', '크로아티아', '루마니아', '불가리아', '덴마크', 
    '스웨덴', '핀란드', '노르웨이', '아이슬란드', '아일랜드', '영국', '룩셈부르크', '몰타', '키프로스',
    // Spanish  
    'alemania', 'francia', 'italia', 'españa', 'países bajos', 'bélgica', 'austria', 'suiza', 'portugal', 
    'grecia', 'polonia', 'república checa', 'hungría', 'eslovaquia', 'eslovenia', 'croacia', 'rumania', 
    'bulgaria', 'dinamarca', 'suecia', 'finlandia', 'noruega', 'islandia', 'irlanda', 'reino unido'
  ];

  const energyLabels = [
    'A+++D_D', 'A+++D_C', 'A+++D_B', 'A+++D_A+++', 'A+++D_A++', 'A+++D_A+', 'A+++D_A',
    'AG_G', 'AG_F', 'AG_E', 'AG_D', 'AG_C', 'AG_B', 'AG_A',
    'A+F_F', 'A+F_E', 'A+F_D', 'A+F_C', 'A+F_B', 'A+F_A+', 'A+F_A'
  ];

  // Dynamic conversations based on European country check
  const getFilteredConversations = (): ConversationItem[] => {
    const baseConversations: ConversationItem[] = [
      {
        type: 'ben-message',
        content: "Hello! I'm Ben 🐕 I'll help you create a PTO gallery. Let me ask you a few questions to build the perfect gallery for you! 😊"
      },
      {
        type: 'ben-question',
        content: "First, could you please provide your email address?",
        field: 'email'
      },
      {
        type: 'ben-message',
        content: "Awesome! I'll remember this email and send you the gallery once it's completed! 😊"
      },
      {
        type: 'ben-question',
        content: "Which country are you responsible for?",
        field: 'country'
      },
      {
        type: 'ben-message',
        content: "Perfect! I'll create a gallery tailored for that region."
      },
      {
        type: 'ben-question',
        content: "Please paste the product detail page URL for the main model (the product that will be displayed on the left side of the gallery).",
        field: 'mainProductUrl',
        exampleUrl: "https://www.lg.com/es/tv-y-barras-de-sonido/oled-evo/oled83c5elb-esb/"
      }
    ];

    // Add energy label questions only for European countries
    if (isEuropeanCountry === true) {
      baseConversations.push({
        type: 'ben-energy-label',
        content: "It seems you're accessing from Europe, so an energy label is mandatory for the product. Please choose the appropriate energy label:",
        field: 'mainProductEnergyLabel',
        showUrl: true
      });
    }

    baseConversations.push({
      type: 'ben-question',
      content: "Now please paste the product detail page URL for the second product (which will be positioned on the right side)!",
      field: 'secondProductUrl'
    });

    // Add second energy label question only for European countries
    if (isEuropeanCountry === true) {
      baseConversations.push({
        type: 'ben-energy-label',
        content: "Please also select an energy label for this product:",
        field: 'secondProductEnergyLabel',
        showUrl: true
      });
    }

    baseConversations.push({
      type: 'ben-completion',
      content: "Everything is ready! Click the Submit button and you'll receive the gallery via email in a few minutes. I'll get to work now! 🐕💻"
    });

    return baseConversations;
  };

  const conversations = getFilteredConversations();

  // Auto-scroll effect
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [currentStep, showEnergyLabelHelp, urlValidationError]);

  // Auto-proceed for Ben's messages
  useEffect(() => {
    const currentConversation = conversations[currentStep];
    if (currentConversation && 
        currentConversation.type === 'ben-message' && 
        currentStep < conversations.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, conversations.length]);

  // Energy label help timer - only for clicks, not mouse movement
  useEffect(() => {
    const currentConversation = conversations[currentStep];
    if (currentConversation?.type === 'ben-energy-label') {
      setShowEnergyLabelHelp(false);
      const timer = setTimeout(() => {
        setShowEnergyLabelHelp(true);
      }, 10000);
      
      // Reset timer on any click
      const handleClick = () => {
        setShowEnergyLabelHelp(false);
        clearTimeout(timer);
      };
      
      document.addEventListener('click', handleClick);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClick);
      };
    }
  }, [currentStep, conversations]);

  const handleNext = () => {
    if (currentStep < conversations.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUserInput('');
    }
  };

  const handleGoBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setUserInput('');
      setShowEnergyLabelHelp(false);
    }
  };

  const handleInputSubmit = () => {
    const currentConversation = conversations[currentStep];
    if (currentConversation.field) {
      // Check if country is European when country field is submitted
      if (currentConversation.field === 'country') {
        const isEuropean = europeanCountries.some(country => 
          userInput.toLowerCase().includes(country.toLowerCase()) || 
          country.toLowerCase().includes(userInput.toLowerCase())
        );
        setIsEuropeanCountry(isEuropean);
      }
      
      // URL validation for product URLs
      if ((currentConversation.field === 'mainProductUrl' || currentConversation.field === 'secondProductUrl') && 
          !userInput.startsWith('https://www.lg.com/')) {
        setUrlValidationError('Please make sure you provided a valid LG product URL that starts with "https://www.lg.com/"');
        return;
      }
      
      setUrlValidationError(null);
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
    if (!webhookUrl) {
      setSubmissionStatus('failure');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      setSubmissionStatus('success');
    } catch (error) {
      console.error("Error sending to n8n webhook:", error);
      setSubmissionStatus('failure');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fixed bones animation positions to prevent re-rendering
  const bonePositions = useMemo(() => 
    [...Array(6)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 10,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.6
    })), []
  );

  const currentConversation = conversations[currentStep];
  const isQuestion = currentConversation?.type.includes('question') || currentConversation?.type.includes('energy-label');

  return (
    <div className="min-h-screen bg-black p-6 relative overflow-hidden">
      {/* Flying Bone Animation */}
      {bonePositions.map((bone, i) => (
        <div
          key={i}
          className="absolute opacity-40 animate-[float_20s_linear_infinite] pointer-events-none z-0"
          style={{
            left: `${bone.left}%`,
            top: `${bone.top}%`,
            animationDelay: `${bone.delay}s`,
            animationDuration: `${bone.duration}s`,
            transform: `rotate(${bone.rotation}deg) scale(${bone.scale})`
          }}
        >
          <img 
            src="/lovable-uploads/415ec45d-2d61-453f-b33b-4ba46b9561ad.png" 
            alt="floating bone" 
            className="w-12 h-12 animate-[spin_30s_linear_infinite]"
          />
        </div>
      ))}
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4 text-gray-400 hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 h-[600px] flex flex-col relative z-10">
          {/* Ben's Profile */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-400/50">
              <img 
                src={benProfile} 
                alt="Ben" 
                className="w-full h-full object-cover object-[center_60%] scale-150 brightness-125" 
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Ben</h3>
              <p className="text-sm text-muted-foreground">PTO Gallery Creator</p>
            </div>
          </div>

          {/* Conversation Flow */}
          <div ref={conversationRef} className="flex-1 overflow-y-auto space-y-6 pr-2" style={{ scrollBehavior: 'smooth' }}>
            {conversations.slice(0, currentStep + 1).map((conv, index) => (
              <div 
                key={index}
                className={`transition-all duration-500 ${
                  index === currentStep ? 'animate-fade-in' : ''
                }`}
              >
                {/* Ben's Message */}
                <div className="flex gap-3 mb-4 items-start">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm whitespace-pre-line">{conv.content}</p>
                    {conv.exampleUrl && (
                      <div className="mt-2 text-xs text-muted-foreground opacity-70 font-mono bg-muted/30 px-2 py-1 rounded">
                        For example: {conv.exampleUrl}
                      </div>
                    )}
                    {conv.showUrl && conv.field && formData[conv.field as keyof FormData] && (
                      <div className="mt-2 p-2 bg-background rounded text-xs text-muted-foreground">
                        URL: {formData[conv.field as keyof FormData]}
                      </div>
                    )}
                  </div>
                  {/* Go Back Button */}
                  {index > 0 && index === currentStep && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGoBack}
                      className="text-muted-foreground hover:text-foreground p-1 h-6 w-6"
                    >
                      <Undo2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Show energy label help for current step */}
                {index === currentStep && conv.type === 'ben-energy-label' && showEnergyLabelHelp && (
                  <div className="flex gap-3 mt-4 animate-fade-in">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm text-muted-foreground">
                        If you're not sure which one to choose, please check the URL you provided above again. You'll be able to see the energy label there!
                      </p>
                    </div>
                  </div>
                )}

                {/* User Response Display */}
                {index < currentStep && conv.field && formData[conv.field as keyof FormData] && (
                  <div className="flex justify-end mb-2">
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">{formData[conv.field as keyof FormData]}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Completion Actions */}
            {currentStep === conversations.length - 1 && (
              <div className="text-center space-y-4 animate-fade-in">
                {!isSubmitting && !submissionStatus && (
                  <div className="space-y-3">
                    <Input
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="Enter your n8n webhook URL..."
                      className="text-sm"
                    />
                    <Button onClick={handleSubmit} size="lg" className="w-full" disabled={!webhookUrl}>
                      Submit Gallery Request
                    </Button>
                  </div>
                )}

                {isSubmitting && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-2xl">🐕💻</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Ben is creating your gallery...</p>
                  </div>
                )}

                {submissionStatus === 'success' && (
                  <div className="text-center space-y-2">
                    <div className="text-4xl">✅</div>
                    <p className="font-medium text-green-600">Successfully sent!</p>
                    <p className="text-sm text-muted-foreground">Please check your email inbox.</p>
                  </div>
                )}

                {submissionStatus === 'failure' && (
                  <div className="text-center space-y-2">
                    <div className="text-4xl">❌</div>
                    <p className="font-medium text-red-600">Something went wrong...</p>
                    <p className="text-sm text-muted-foreground">Please try again.</p>
                    <Button onClick={() => setSubmissionStatus(null)} variant="outline">
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}

          </div>
          
          {/* Fixed Input Area at Bottom */}
          {isQuestion && (
            <div className="mt-4 pt-4 border-t border-border animate-fade-in">
              {currentConversation?.type === 'ben-energy-label' ? (
                <div className="grid grid-cols-5 gap-2">
                  {energyLabels.map((label) => (
                    <Button
                      key={label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleEnergyLabelSelect(label)}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-red-500"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your answer..."
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
                  {urlValidationError && (
                    <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
                      <p className="text-sm text-red-600 dark:text-red-400">{urlValidationError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PTOGallery;