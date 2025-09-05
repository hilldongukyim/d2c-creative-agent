import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const AllenQA = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Load ElevenLabs ConvAI widget script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Logo - reusing existing component */}
      <Logo />
      
      {/* Home button */}
      <div className="fixed top-4 right-4 z-50">
        <Button 
          onClick={() => navigate('/home')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Home
        </Button>
      </div>

      {/* Main content area with ElevenLabs ConvAI widget */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">Allen - Content QA Assistant</h1>
          <p className="text-muted-foreground mb-8">음성으로 대화할 수 있는 콘텐츠 QA 어시스턴트입니다</p>
          <div className="flex justify-center">
            <elevenlabs-convai agent-id="agent_5701k4cze7cqff9vf8nz8hz7akaf"></elevenlabs-convai>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllenQA;