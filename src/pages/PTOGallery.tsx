import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
const benProfile = "/lovable-uploads/df1c4dd4-a06d-4d9c-981e-4463ad0b08dc.png";

interface FormData {
  email: string;
  mainProductUrl: string;
  secondProductUrl: string;
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
    mainProductUrl: '',
    secondProductUrl: ''
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
    'bulgaria', 'dinamarca', 'suecia', 'finlandia', 'noruega', 'islandia', 'irlanda', 'reino unido',
    // French
    'allemagne', 'france', 'italie', 'espagne', 'pays-bas', 'belgique', 'autriche', 'suisse', 'portugal', 
    'grèce', 'pologne', 'république tchèque', 'hongrie', 'slovaquie', 'slovénie', 'croatie', 'roumanie', 
    'bulgarie', 'danemark', 'suède', 'finlande', 'norvège', 'islande', 'irlande', 'royaume-uni',
    // German
    'deutschland', 'frankreich', 'italien', 'spanien', 'niederlande', 'belgien', 'österreich', 'schweiz', 
    'portugal', 'griechenland', 'polen', 'tschechien', 'ungarn', 'slowakei', 'slowenien', 'kroatien', 
    'rumänien', 'bulgarien', 'dänemark', 'schweden', 'finnland', 'norwegen', 'island', 'irland', 'vereinigtes königreich',
    // Italian
    'germania', 'francia', 'italia', 'spagna', 'paesi bassi', 'belgio', 'austria', 'svizzera', 'portogallo', 
    'grecia', 'polonia', 'repubblica ceca', 'ungheria', 'slovacchia', 'slovenia', 'croazia', 'romania', 
    'bulgaria', 'danimarca', 'svezia', 'finlandia', 'norvegia', 'islanda', 'irlanda', 'regno unito',
    // Dutch
    'duitsland', 'frankrijk', 'italië', 'spanje', 'nederland', 'belgië', 'oostenrijk', 'zwitserland', 
    'portugal', 'griekenland', 'polen', 'tsjechië', 'hongarije', 'slowakije', 'slovenië', 'kroatië', 
    'roemenië', 'bulgarije', 'denemarken', 'zweden', 'finland', 'noorwegen', 'ijsland', 'ierland', 'verenigd koninkrijk',
    // Portuguese
    'alemanha', 'frança', 'itália', 'espanha', 'países baixos', 'bélgica', 'áustria', 'suíça', 'portugal', 
    'grécia', 'polónia', 'república checa', 'hungria', 'eslováquia', 'eslovénia', 'croácia', 'roménia', 
    'bulgária', 'dinamarca', 'suécia', 'finlândia', 'noruega', 'islândia', 'irlanda', 'reino unido',
    // Polish
    'niemcy', 'francja', 'włochy', 'hiszpania', 'holandia', 'belgia', 'austria', 'szwajcaria', 'portugalia', 
    'grecja', 'polska', 'czechy', 'węgry', 'słowacja', 'słowenia', 'chorwacja', 'rumunia', 'bułgaria', 
    'dania', 'szwecja', 'finlandia', 'norwegia', 'islandia', 'irlandia', 'wielka brytania',
    // Czech
    'německo', 'francie', 'itálie', 'španělsko', 'nizozemsko', 'belgie', 'rakousko', 'švýcarsko', 'portugalsko', 
    'řecko', 'polsko', 'česko', 'maďarsko', 'slovensko', 'slovinsko', 'chorvatsko', 'rumunsko', 'bulharsko', 
    'dánsko', 'švédsko', 'finsko', 'norsko', 'island', 'irsko', 'spojené království'
  ];

  const energyLabels = [
    'A+++D_D', 'A+++D_C', 'A+++D_B', 'A+++D_A+++', 'A+++D_A++', 'A+++D_A+', 'A+++D_A',
    'AG_G', 'AG_F', 'AG_E', 'AG_D', 'AG_C', 'AG_B', 'AG_A',
    'A+F_F', 'A+F_E', 'A+F_D', 'A+F_C', 'A+F_B', 'A+F_A+', 'A+F_A'
  ];

  // Conversations without country and energy label questions
  const conversations: ConversationItem[] = [
    {
      type: 'ben-message',
      content: "Hello! I'm Ben 🐕 I'll help you create a PTO gallery. Let me ask you a few questions to build the perfect gallery for you! 😊"
    },
    {
      type: 'ben-question',
      content: "First, could you please provide your LGEP ID?",
      field: 'email'
    },
    {
      type: 'ben-message',
      content: "Awesome! I'll remember this email and send you the gallery once it's completed! 😊"
    },
    {
      type: 'ben-question',
      content: "Please paste the product detail page URL for the main model (the product that will be displayed on the left side of the gallery).",
      field: 'mainProductUrl',
      exampleUrl: "https://www.lg.com/es/tv-y-barras-de-sonido/oled-evo/oled83c5elb-esb/"
    },
    {
      type: 'ben-question',
      content: "Now please paste the product detail page URL for the second product (which will be positioned on the right side)!",
      field: 'secondProductUrl'
    },
    {
      type: 'ben-confirmation',
      content: "Let me confirm your information before we proceed:"
    },
    {
      type: 'ben-completion',
      content: "Perfect! I'll start working on your gallery right away! 🐕💻"
    }
  ];

  

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
      // URL validation for product URLs
      if ((currentConversation.field === 'mainProductUrl' || currentConversation.field === 'secondProductUrl') && 
          !userInput.startsWith('https://www.lg.com/')) {
        setUrlValidationError('Please make sure you provided a valid LG product URL that starts with "https://www.lg.com/"');
        return;
      }
      
      setUrlValidationError(null);
      // Handle email input specially
      if (currentConversation.field === 'email') {
        setFormData(prev => ({
          ...prev,
          email: userInput + '@lge.com'
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [currentConversation.field]: userInput
        }));
      }
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
  const isQuestion = currentConversation?.type.includes('question');
  const isConfirmation = currentConversation?.type === 'ben-confirmation';

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
                  {/* Go Back Button - Enhanced visibility */}
                  {index > 0 && index === currentStep && (
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGoBack}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300 px-3 py-1 text-xs font-medium"
                      >
                        <Undo2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <span className="text-xs text-muted-foreground text-center leading-tight">
                        Want to modify?<br/>Click to re-enter
                      </span>
                    </div>
                  )}
                </div>

                {/* Show confirmation summary */}
                {index === currentStep && conv.type === 'ben-confirmation' && (
                  <div className="flex gap-3 mt-4 animate-fade-in">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 max-w-[90%]">
                      <div className="space-y-2 text-sm">
                        <div><strong>Email:</strong> {formData.email}</div>
                        <div><strong>Main Product URL:</strong> {formData.mainProductUrl}</div>
                        <div><strong>Second Product URL:</strong> {formData.secondProductUrl}</div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        Is this information correct? Please confirm to proceed.
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={handleGoBack}
                        >
                          Edit Information
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleNext}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        >
                          Confirm & Proceed
                        </Button>
                      </div>
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
                    <Button onClick={handleSubmit} size="lg" className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white" disabled={!webhookUrl}>
                      Start Work
                    </Button>
                  </div>
                )}

                {isSubmitting && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-2xl">🐕💻</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Ben is starting work on your gallery...</p>
                  </div>
                )}

                {submissionStatus === 'success' && (
                  <div className="text-center space-y-2">
                    <div className="text-4xl">✅</div>
                    <p className="font-medium text-green-600">Perfect! Ben has started working!</p>
                    <p className="text-sm text-muted-foreground">You'll receive your PTO gallery via email shortly.</p>
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
              {currentConversation?.field === 'email' ? (
                 <div className="space-y-2">
                   <div className="flex gap-2">
                     <div className="flex-1 relative">
                       <div className="relative">
                         <Input
                           value={userInput}
                           onChange={(e) => setUserInput(e.target.value)}
                           placeholder=""
                           onKeyDown={(e) => e.key === 'Enter' && userInput.trim() && handleInputSubmit()}
                           className="pr-2"
                           style={{ paddingRight: '80px' }}
                         />
                         <div 
                           className="absolute top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm pointer-events-none"
                           style={{ 
                             left: `${Math.max(12 + (userInput.length * 8), 12)}px`,
                             transition: 'left 0.1s ease'
                           }}
                         >
                           @lge.com
                         </div>
                       </div>
                     </div>
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