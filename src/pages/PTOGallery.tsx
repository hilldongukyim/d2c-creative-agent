import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Undo2, Camera, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import ConfirmationWithScreenshots from "@/components/ConfirmationWithScreenshots";
const benProfile = "/lovable-uploads/df1c4dd4-a06d-4d9c-981e-4463ad0b08dc.png";

interface FormData {
  email: string;
  mainProductUrl: string;
  secondProductUrl: string;
  mainEnergyLabel?: string;
  secondEnergyLabel?: string;
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
  const [userInput, setUserInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'failure' | null>(null);
  const [showVideo, setShowVideo] = useState(false);
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

  const conversations: ConversationItem[] = [
    {
      type: 'ben-message',
      content: "Hello! I'm Ben 🐕 I'll help you create a PTO gallery. Let me ask you a few questions to build the perfect gallery for you! 😊"
    },
    {
      type: 'ben-question',
      content: "First, could you please provide your EP ID?",
      field: 'email'
    },
    {
      type: 'ben-message',
      content: "Awesome! I'll remember this ID and send you the gallery once it's completed! 😊"
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
          !userInput?.startsWith('https://www.lg.com/')) {
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
    if (!webhookUrl || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('productAUrl', formData.mainProductUrl);
      formDataToSend.append('productBUrl', formData.secondProductUrl);

      const response = await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        body: formDataToSend,
      });

      // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 간주
      setTimeout(() => {
        setSubmissionStatus('success');
        setIsSubmitting(false);
        // 2초 후 비디오 표시
        setTimeout(() => {
          setShowVideo(true);
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error("Error sending to n8n webhook:", error);
      setSubmissionStatus('failure');
      setIsSubmitting(false);
    }
  };


  const currentConversation = conversations[currentStep];
  const isQuestion = currentConversation?.type.includes('question');
  const isConfirmation = currentConversation?.type === 'ben-confirmation';

  if (showVideo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative">
        <video
          src="/completion-video.mp4"
          autoPlay
          loop
          muted
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white space-y-4 p-8">
          <h1 className="text-4xl font-bold mb-4">Perfect! I just started working!</h1>
          <p className="text-xl mb-2">You will receive it soon.</p>
          <p className="text-xl mb-8">You can close this window now.</p>
          <p className="text-lg">
            If you don't receive the email within 10 minutes,<br/>
            please contact <span className="font-bold">donguk.yim@lge.com</span>. He will assist you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/lovable-uploads/486a0909-b1cd-4891-9d37-db02a935a89f.png)',
        backgroundSize: '80%',
        backgroundPosition: '90% center',
        backgroundRepeat: 'no-repeat',
      }}
    >
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
                    {conv.showUrl && conv.field && formData[conv.field as keyof FormData] && typeof formData[conv.field as keyof FormData] === 'string' && (
                      <div className="mt-2 p-2 bg-background rounded text-xs text-muted-foreground">
                        URL: {formData[conv.field as keyof FormData] as string}
                      </div>
                    )}
                  </div>
                  {/* Go Back Button */}
                  {index > 0 && index === currentStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGoBack}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-gray-300 px-3 py-1.5 text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <Undo2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>

                {/* Show confirmation summary with screenshots */}
                {index === currentStep && conv.type === 'ben-confirmation' && (
                  <ConfirmationWithScreenshots 
                    formData={formData}
                    setFormData={setFormData}
                    onGoBack={handleGoBack}
                    onSubmit={handleSubmit}
                  />
                )}

                {/* User Response Display */}
                {index < currentStep && conv.field && formData[conv.field as keyof FormData] && typeof formData[conv.field as keyof FormData] === 'string' && (
                  <div className="flex justify-end mb-2">
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">{formData[conv.field as keyof FormData] as string}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Ben Working Animation */}
            {isSubmitting && (
              <div className="text-center space-y-4 animate-fade-in">
                <div className="w-40 h-40 mx-auto relative">
                  {/* Circular Chat Background */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 rounded-full flex items-center justify-center animate-pulse border-4 border-blue-200 dark:border-blue-800/50">
                    {/* Ben's Image */}
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg animate-[bounce_2s_ease-in-out_infinite]">
                      <img 
                        src={benProfile} 
                        alt="Ben working" 
                        className="w-full h-full object-cover object-[center_60%] scale-150 brightness-125" 
                      />
                    </div>
                    {/* Working Indicator */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">💻</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-lg">Ben is working hard! 🐕💻</p>
                  <p className="text-sm text-muted-foreground">You will receive it soon.</p>
                  <p className="text-sm text-muted-foreground">You can close this window now.</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    If you don't receive the email within 5 minutes,<br/>
                    please contact <span className="font-medium text-blue-600">donguk.yim@lge.com</span>
                  </p>
                </div>
              </div>
            )}

            {submissionStatus === 'success' && (
              <div className="text-center space-y-4 animate-fade-in">
                <div className="w-40 h-40 mx-auto relative">
                  {/* Circular Chat Background */}
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-950/50 dark:to-blue-950/50 rounded-full flex items-center justify-center border-4 border-green-200 dark:border-green-800/50">
                    {/* Ben's Image */}
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                      <img 
                        src={benProfile} 
                        alt="Ben completed" 
                        className="w-full h-full object-cover object-[center_60%] scale-150 brightness-125" 
                      />
                    </div>
                    {/* Success Indicator */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">✅</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-lg text-green-600">Perfect! Ben has started working!</p>
                  <p className="text-sm text-muted-foreground">You will receive it soon.</p>
                  <p className="text-sm text-muted-foreground">You can close this window now.</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    If you don't receive the email within 5 minutes,<br/>
                    please contact <span className="font-medium text-blue-600">donguk.yim@lge.com</span>
                  </p>
                </div>
              </div>
            )}

            {submissionStatus === 'failure' && (
              <div className="text-center space-y-2">
                <div className="text-4xl">⚠️</div>
                <p className="font-medium text-orange-600">A system error has occurred</p>
                <p className="text-sm text-muted-foreground">The error has been reported and will be resolved soon.</p>
                <p className="text-xs text-muted-foreground mt-4">
                  If you don't receive the email within 5 minutes,<br/>
                  please contact <span className="font-medium text-blue-600">donguk.yim@lge.com</span>
                </p>
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
                            onKeyDown={(e) => e.key === 'Enter' && userInput?.trim() && handleInputSubmit()}
                           className="pr-2"
                           style={{ paddingRight: '80px' }}
                         />
                         <div 
                           className="absolute top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm pointer-events-none"
                            style={{ 
                              left: `${Math.max(12 + ((userInput?.length || 0) * 8), 12)}px`,
                             transition: 'left 0.1s ease'
                           }}
                         >
                           @lge.com
                         </div>
                       </div>
                     </div>
                     <Button
                       onClick={handleInputSubmit}
                        disabled={!userInput?.trim()}
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
                        onKeyDown={(e) => e.key === 'Enter' && userInput?.trim() && handleInputSubmit()}
                       className="flex-1"
                     />
                     <Button
                       onClick={handleInputSubmit}
                       disabled={!userInput?.trim()}
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