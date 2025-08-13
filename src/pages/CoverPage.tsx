import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

const CoverPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEnter = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 flex flex-col items-center justify-center relative overflow-hidden">
      <Logo />
      
      {/* Mouse following gradient */}
      <div 
        className="absolute w-96 h-96 rounded-full opacity-20 pointer-events-none transition-all duration-300 ease-out"
        style={{
          background: 'radial-gradient(circle, hsl(0 70% 60% / 0.4) 0%, hsl(0 70% 60% / 0.2) 30%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
      
      {/* Main content */}
      <div className="text-center space-y-8 z-10 max-w-4xl mx-auto px-6">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            Twin Crew
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Your Professional Second Self.
          </p>
        </div>

        {/* Org Chart Preview Section */}
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-muted/20 shadow-lg">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground/80">Our Team Structure</h3>
            
            {/* Simple org chart placeholder */}
            <div className="space-y-4">
              {/* Leader */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-white font-medium">Leader</span>
                </div>
              </div>
              
              {/* Departments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-secondary to-secondary/80 mx-auto flex items-center justify-center">
                    <span className="text-white text-sm">MKT</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Marketing</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent to-accent/80 mx-auto flex items-center justify-center">
                    <span className="text-white text-sm">PLT</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-muted to-muted-foreground mx-auto flex items-center justify-center">
                    <span className="text-white text-sm">DATA</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Data</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enter button */}
        <div className="pt-6">
          <Button 
            onClick={handleEnter}
            className="px-8 py-3 text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
          >
            Explore the Crew
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;