import React from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const AllenQA = () => {
  const navigate = useNavigate();

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

      {/* Main content area - clean empty page */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Allen - Content QA Assistant</h1>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AllenQA;