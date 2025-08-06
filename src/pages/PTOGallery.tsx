import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
const benProfile = "/lovable-uploads/df1c4dd4-a06d-4d9c-981e-4463ad0b08dc.png";

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
  const conversationRef = useRef<HTMLDivElement>(null);

  const energyLabels = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

  const conversations = [
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
      content: "Great! I'll send the completed gallery to your email."
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
    },
    {
      type: 'ben-energy-label',
      content: "It seems you're accessing from Europe, so an energy label is mandatory for the product. Please choose the appropriate energy label:",
      field: 'mainProductEnergyLabel',
      showUrl: true
    },
    {
      type: 'ben-question',
      content: "Now please paste the product detail page URL for the second product (which will be positioned on the right side)!",
      field: 'secondProductUrl'
    },
    {
      type: 'ben-energy-label',
      content: "Please also select an energy label for this product:",
      field: 'secondProductEnergyLabel',
      showUrl: true
    },
    {
      type: 'ben-completion',
      content: "Everything is ready! Click the Submit button and you'll receive the gallery via email in a few minutes. I'll get to work now! 🐕💻"
    }
  ];

  // Auto-scroll effect
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }
  }, [currentStep]);

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
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-sky-100 p-6 relative overflow-hidden">
      {/* Flying Bone Animation */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute text-lg opacity-60 animate-[float_20s_linear_infinite] pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        >
          🦴
        </div>
      ))}
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
          <div ref={conversationRef} className="space-y-6">
            {conversations.slice(0, currentStep + 1).map((conv, index) => (
              <div 
                key={index}
                className={`transition-all duration-500 ${
                  index === currentStep ? 'animate-fade-in' : ''
                }`}
              >
                {/* Ben's Message */}
                <div className="flex gap-3 mb-4">
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
                    )}
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
                  <Button onClick={handleSubmit} size="lg" className="w-full">
                    Submit Gallery Request
                  </Button>
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
        </div>
      </div>
    </div>
  );
};

export default PTOGallery;