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
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-muted/20 shadow-lg max-w-5xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground/80 text-center">Our Team Structure</h3>
            
            {/* Detailed org chart */}
            <div className="space-y-6">
              {/* CEO Level */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">CEO</span>
                </div>
              </div>
              
              {/* Connecting line */}
              <div className="flex justify-center">
                <div className="w-0.5 h-4 bg-muted-foreground/30"></div>
              </div>
              
              {/* Division Leaders */}
              <div className="grid grid-cols-3 gap-8">
                {/* Marketing Division */}
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center">
                      <span className="text-white text-xs">MKT</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-0.5 h-3 bg-muted-foreground/20"></div>
                  </div>
                  
                  {/* Marketing Teams */}
                  <div className="grid grid-cols-1 gap-2">
                    {/* Team 1 */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 rounded bg-secondary/60 flex items-center justify-center">
                        <span className="text-white text-xs">TL</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 rounded bg-secondary/40"></div>
                        <div className="w-6 h-6 rounded bg-secondary/40"></div>
                      </div>
                    </div>
                    
                    {/* Team 2 */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 rounded bg-secondary/60 flex items-center justify-center">
                        <span className="text-white text-xs">TL</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 rounded bg-secondary/40"></div>
                        <div className="w-6 h-6 rounded bg-secondary/40"></div>
                      </div>
                    </div>
                    
                    {/* Team 3 */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 rounded bg-secondary/60 flex items-center justify-center">
                        <span className="text-white text-xs">TL</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 rounded bg-secondary/40"></div>
                        <div className="w-6 h-6 rounded bg-secondary/40"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Platform Division */}
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-accent to-accent/80 flex items-center justify-center">
                      <span className="text-white text-xs">PLT</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-0.5 h-3 bg-muted-foreground/20"></div>
                  </div>
                  
                  {/* Platform Teams */}
                  <div className="grid grid-cols-1 gap-2">
                    {/* Team 1 */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 rounded bg-accent/60 flex items-center justify-center">
                        <span className="text-white text-xs">TL</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 rounded bg-accent/40"></div>
                        <div className="w-6 h-6 rounded bg-accent/40"></div>
                      </div>
                    </div>
                    
                    {/* Team 2 */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 rounded bg-accent/60 flex items-center justify-center">
                        <span className="text-white text-xs">TL</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 rounded bg-accent/40"></div>
                        <div className="w-6 h-6 rounded bg-accent/40"></div>
                      </div>
                    </div>
                    
                    {/* Team 3 */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 rounded bg-accent/60 flex items-center justify-center">
                        <span className="text-white text-xs">TL</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 rounded bg-accent/40"></div>
                        <div className="w-6 h-6 rounded bg-accent/40"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Data Division */}
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-muted to-muted-foreground flex items-center justify-center">
                      <span className="text-white text-xs">DATA</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-0.5 h-3 bg-muted-foreground/20"></div>
                  </div>
                  
                  {/* Data Teams */}
                  <div className="grid grid-cols-1 gap-2">
                    {/* Team 1 */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 rounded bg-muted-foreground/60 flex items-center justify-center">
                        <span className="text-white text-xs">TL</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 rounded bg-muted-foreground/40"></div>
                        <div className="w-6 h-6 rounded bg-muted-foreground/40"></div>
                      </div>
                    </div>
                    
                    {/* Team 2 */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 rounded bg-muted-foreground/60 flex items-center justify-center">
                        <span className="text-white text-xs">TL</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 rounded bg-muted-foreground/40"></div>
                        <div className="w-6 h-6 rounded bg-muted-foreground/40"></div>
                      </div>
                    </div>
                    
                    {/* Team 3 */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 rounded bg-muted-foreground/60 flex items-center justify-center">
                        <span className="text-white text-xs">TL</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 rounded bg-muted-foreground/40"></div>
                        <div className="w-6 h-6 rounded bg-muted-foreground/40"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-xs text-muted-foreground mt-4">
                20 members across 3 divisions, 9 teams
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