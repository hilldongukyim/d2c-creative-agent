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
      
      {/* Crew Videos - non-overlapping layout with proper spacing */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Video 1 - Top left, large */}
        <div id="crew-video-1" className="absolute top-24 left-16 w-48 h-48 bg-gradient-to-br from-purple-500/35 to-pink-500/35 rounded-3xl border border-white/25 backdrop-blur-sm scale-115 opacity-95">
          <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
            <div className="text-white/80 text-base font-medium">Coming Soon</div>
          </div>
        </div>

        {/* Video 2 - Top right, medium */}
        <div id="crew-video-2" className="absolute top-32 right-20 w-40 h-40 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl border border-white/20 backdrop-blur-sm scale-105 opacity-85">
          <div className="w-full h-full rounded-2xl bg-black/20 flex items-center justify-center">
            <div className="text-white/75 text-sm font-medium">Coming Soon</div>
          </div>
        </div>

        {/* Video 3 - Left center, medium */}
        <div id="crew-video-3" className="absolute top-1/2 left-12 w-36 h-36 bg-gradient-to-br from-green-500/25 to-emerald-500/25 rounded-2xl border border-white/15 backdrop-blur-sm scale-90 opacity-75 transform -translate-y-1/2">
          <div className="w-full h-full rounded-2xl bg-black/20 flex items-center justify-center">
            <div className="text-white/65 text-sm">Coming Soon</div>
          </div>
        </div>

        {/* Video 4 - Right center, extra large */}
        <div id="crew-video-4" className="absolute top-1/2 right-8 w-52 h-52 bg-gradient-to-br from-orange-500/35 to-red-500/35 rounded-3xl border border-white/25 backdrop-blur-sm scale-120 opacity-90 transform -translate-y-1/2 overflow-hidden">
          <video 
            className="w-full h-full object-cover rounded-3xl"
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/crew-video-4.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Video 5 - Bottom left, medium-large */}
        <div id="crew-video-5" className="absolute bottom-28 left-20 w-44 h-44 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 rounded-3xl border border-white/20 backdrop-blur-sm scale-110 opacity-80">
          <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
            <div className="text-white/70 text-sm font-medium">Coming Soon</div>
          </div>
        </div>

        {/* Video 6 - Bottom right, medium */}
        <div id="crew-video-6" className="absolute bottom-24 right-24 w-38 h-38 bg-gradient-to-br from-indigo-500/25 to-purple-500/25 rounded-2xl border border-white/15 backdrop-blur-sm scale-95 opacity-70">
          <div className="w-full h-full rounded-2xl bg-black/20 flex items-center justify-center">
            <div className="text-white/60 text-sm">Coming Soon</div>
          </div>
        </div>

        {/* Video 7 - Top center left, small for depth */}
        <div id="crew-video-7" className="absolute top-16 left-1/3 w-28 h-28 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-xl border border-white/12 backdrop-blur-sm scale-80 opacity-60">
          <div className="w-full h-full rounded-xl bg-black/15 flex items-center justify-center">
            <div className="text-white/50 text-xs">Coming Soon</div>
          </div>
        </div>

        {/* Video 8 - Bottom center right, small for depth */}
        <div id="crew-video-8" className="absolute bottom-16 right-1/3 w-32 h-32 bg-gradient-to-br from-teal-500/22 to-blue-500/22 rounded-xl border border-white/14 backdrop-blur-sm scale-85 opacity-65">
          <div className="w-full h-full rounded-xl bg-black/15 flex items-center justify-center">
            <div className="text-white/55 text-xs">Coming Soon</div>
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