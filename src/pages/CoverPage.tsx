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
      
      {/* Crew Videos - repositioned closer to center with larger sizes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Video 1 - Extra large, close to center top-left */}
        <div className="absolute top-32 left-1/4 w-52 h-52 bg-gradient-to-br from-purple-500/35 to-pink-500/35 rounded-3xl border border-white/25 backdrop-blur-sm scale-115 opacity-95">
          <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
            <div className="text-white/80 text-base font-medium">Coming Soon</div>
          </div>
        </div>

        {/* Video 2 - Large, close to center top-right */}
        <div className="absolute top-28 right-1/4 w-44 h-44 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl border border-white/20 backdrop-blur-sm scale-105 opacity-85">
          <div className="w-full h-full rounded-2xl bg-black/20 flex items-center justify-center">
            <div className="text-white/75 text-sm font-medium">Coming Soon</div>
          </div>
        </div>

        {/* Video 3 - Medium, mid-left closer to center */}
        <div className="absolute top-1/2 left-1/5 w-36 h-36 bg-gradient-to-br from-green-500/25 to-emerald-500/25 rounded-2xl border border-white/15 backdrop-blur-sm scale-90 opacity-75 transform -translate-y-1/2">
          <div className="w-full h-full rounded-2xl bg-black/20 flex items-center justify-center">
            <div className="text-white/65 text-sm">Coming Soon</div>
          </div>
        </div>

        {/* Video 4 - Extra large, close to center right */}
        <div className="absolute top-1/2 right-1/5 w-56 h-56 bg-gradient-to-br from-orange-500/35 to-red-500/35 rounded-3xl border border-white/25 backdrop-blur-sm scale-120 opacity-90 transform -translate-y-1/2">
          <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
            <div className="text-white/80 text-base font-medium">Coming Soon</div>
          </div>
        </div>

        {/* Video 5 - Large, close to center bottom-left */}
        <div className="absolute bottom-32 left-1/4 w-48 h-48 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 rounded-3xl border border-white/20 backdrop-blur-sm scale-110 opacity-80">
          <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
            <div className="text-white/70 text-sm font-medium">Coming Soon</div>
          </div>
        </div>

        {/* Video 6 - Medium, bottom-right closer to center */}
        <div className="absolute bottom-28 right-1/4 w-40 h-40 bg-gradient-to-br from-indigo-500/25 to-purple-500/25 rounded-2xl border border-white/15 backdrop-blur-sm scale-95 opacity-70">
          <div className="w-full h-full rounded-2xl bg-black/20 flex items-center justify-center">
            <div className="text-white/60 text-sm">Coming Soon</div>
          </div>
        </div>

        {/* Video 7 - Small, far left for depth */}
        <div className="absolute top-20 left-12 w-24 h-24 bg-gradient-to-br from-rose-500/15 to-pink-500/15 rounded-xl border border-white/8 backdrop-blur-sm scale-70 opacity-45">
          <div className="w-full h-full rounded-xl bg-black/10 flex items-center justify-center">
            <div className="text-white/40 text-xs">Coming Soon</div>
          </div>
        </div>

        {/* Video 8 - Small, far right for depth */}
        <div className="absolute bottom-16 right-12 w-28 h-28 bg-gradient-to-br from-teal-500/18 to-blue-500/18 rounded-xl border border-white/10 backdrop-blur-sm scale-75 opacity-50">
          <div className="w-full h-full rounded-xl bg-black/15 flex items-center justify-center">
            <div className="text-white/45 text-xs">Coming Soon</div>
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