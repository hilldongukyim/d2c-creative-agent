import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
const CoverPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  const handleEnter = () => {
    navigate('/home');
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 flex flex-col items-center justify-center relative overflow-hidden">
      <Logo />
      
      {/* Mouse following gradient */}
      <div className="absolute w-96 h-96 rounded-full opacity-20 pointer-events-none transition-all duration-300 ease-out" style={{
      background: 'radial-gradient(circle, hsl(0 70% 60% / 0.4) 0%, hsl(0 70% 60% / 0.2) 30%, transparent 70%)',
      left: mousePosition.x - 192,
      top: mousePosition.y - 192
    }} />
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
      
      {/* Crew Videos - randomly positioned */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Video 1 - Top left */}
        <div className="absolute top-16 left-16 w-32 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-white/10 backdrop-blur-sm">
          <div className="w-full h-full rounded-xl bg-black/20 flex items-center justify-center">
            <div className="text-white/60 text-xs">Coming Soon</div>
          </div>
        </div>

        {/* Video 2 - Top right */}
        <div className="absolute top-24 right-20 w-28 h-36 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-white/10 backdrop-blur-sm">
          <div className="w-full h-full rounded-xl bg-black/20 flex items-center justify-center">
            <div className="text-white/60 text-xs">Coming Soon</div>
          </div>
        </div>

        {/* Video 3 - Middle left */}
        <div className="absolute top-1/2 left-8 w-24 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-white/10 backdrop-blur-sm transform -translate-y-1/2">
          <div className="w-full h-full rounded-xl bg-black/20 flex items-center justify-center">
            <div className="text-white/60 text-xs">Coming Soon</div>
          </div>
        </div>

        {/* Video 4 - Middle right */}
        <div className="absolute top-1/2 right-12 w-36 h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-white/10 backdrop-blur-sm transform -translate-y-1/2">
          <div className="w-full h-full rounded-xl bg-black/20 flex items-center justify-center">
            <div className="text-white/60 text-xs">Coming Soon</div>
          </div>
        </div>

        {/* Video 5 - Bottom left */}
        <div className="absolute bottom-20 left-24 w-28 h-28 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl border border-white/10 backdrop-blur-sm">
          <div className="w-full h-full rounded-xl bg-black/20 flex items-center justify-center">
            <div className="text-white/60 text-xs">Coming Soon</div>
          </div>
        </div>

        {/* Video 6 - Bottom right */}
        <div className="absolute bottom-16 right-16 w-32 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/10 backdrop-blur-sm">
          <div className="w-full h-full rounded-xl bg-black/20 flex items-center justify-center">
            <div className="text-white/60 text-xs">Coming Soon</div>
          </div>
        </div>

        {/* Video 7 - Top center offset */}
        <div className="absolute top-12 left-1/3 w-20 h-24 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-xl border border-white/10 backdrop-blur-sm">
          <div className="w-full h-full rounded-xl bg-black/20 flex items-center justify-center">
            <div className="text-white/60 text-xs">Coming Soon</div>
          </div>
        </div>

        {/* Video 8 - Bottom center offset */}
        <div className="absolute bottom-12 right-1/3 w-24 h-20 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-xl border border-white/10 backdrop-blur-sm">
          <div className="w-full h-full rounded-xl bg-black/20 flex items-center justify-center">
            <div className="text-white/60 text-xs">Coming Soon</div>
          </div>
        </div>
      </div>
      
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


        {/* Enter button */}
        <div className="pt-6">
          <Button onClick={handleEnter} className="px-8 py-3 text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full">
            Explore the Crew
          </Button>
        </div>
      </div>
    </div>;
};
export default CoverPage;