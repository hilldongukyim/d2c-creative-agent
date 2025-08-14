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
      
      {/* Crew Videos - horizontal banner slide */}
      <div className="absolute bottom-12 left-0 w-full h-72 overflow-hidden pointer-events-none">
        <div className="flex animate-[slide_30s_linear_infinite] space-x-4">
          {/* First set of videos */}
          <div className="flex space-x-4 min-w-max">
            {/* Video 1 - Purple video */}
            <div id="crew-video-1" className="w-40 h-60 bg-gradient-to-br from-purple-500/35 to-pink-500/35 rounded-3xl border border-white/25 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-1.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 2 - Blue video */}
            <div id="crew-video-2" className="w-40 h-60 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-3xl border border-white/20 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-2-new.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 3 - Green video */}
            <div id="crew-video-3" className="w-40 h-60 bg-gradient-to-br from-green-500/25 to-emerald-500/25 rounded-3xl border border-white/15 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-3.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 4 - Orange video */}
            <div id="crew-video-4" className="w-40 h-60 bg-gradient-to-br from-orange-500/35 to-red-500/35 rounded-3xl border border-white/25 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
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

            {/* Video 5 - Yellow video */}
            <div id="crew-video-5" className="w-40 h-60 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 rounded-3xl border border-white/20 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-5.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 6 - Indigo video */}
            <div id="crew-video-6" className="w-40 h-60 bg-gradient-to-br from-indigo-500/25 to-purple-500/25 rounded-3xl border border-white/15 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-6.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 7 - Rose coming soon */}
            <div id="crew-video-7" className="w-40 h-60 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-3xl border border-white/12 backdrop-blur-sm flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-3xl bg-black/15 flex items-center justify-center">
                <div className="text-white/50 text-sm">Coming Soon</div>
              </div>
            </div>

            {/* Video 8 - Teal video */}
            <div id="crew-video-8" className="w-40 h-60 bg-gradient-to-br from-teal-500/22 to-blue-500/22 rounded-3xl border border-white/14 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-8.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 9 - Emerald coming soon */}
            <div id="crew-video-9" className="w-40 h-60 bg-gradient-to-br from-emerald-500/25 to-green-500/25 rounded-3xl border border-white/15 backdrop-blur-sm flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
                <div className="text-white/65 text-sm">Coming Soon</div>
              </div>
            </div>

            {/* Video 10 - Violet coming soon */}
            <div id="crew-video-10" className="w-40 h-60 bg-gradient-to-br from-violet-500/25 to-purple-500/25 rounded-3xl border border-white/15 backdrop-blur-sm flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
                <div className="text-white/65 text-sm">Coming Soon</div>
              </div>
            </div>

            {/* Video 11 - Cyan coming soon */}
            <div id="crew-video-11" className="w-40 h-60 bg-gradient-to-br from-cyan-500/25 to-blue-500/25 rounded-3xl border border-white/15 backdrop-blur-sm flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
                <div className="text-white/65 text-sm">Coming Soon</div>
              </div>
            </div>

            {/* Video 12 - Amber coming soon */}
            <div id="crew-video-12" className="w-40 h-60 bg-gradient-to-br from-amber-500/25 to-orange-500/25 rounded-3xl border border-white/15 backdrop-blur-sm flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
                <div className="text-white/65 text-sm">Coming Soon</div>
              </div>
            </div>
          </div>

          {/* Duplicate set for seamless loop */}
          <div className="flex space-x-4 min-w-max">
            {/* Video 1 - Purple video (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-purple-500/35 to-pink-500/35 rounded-3xl border border-white/25 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-1.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 2 - Blue video (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-3xl border border-white/20 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-2-new.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 3 - Green video (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-green-500/25 to-emerald-500/25 rounded-3xl border border-white/15 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-3.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 4 - Orange video (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-orange-500/35 to-red-500/35 rounded-3xl border border-white/25 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
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

            {/* Video 5 - Yellow video (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 rounded-3xl border border-white/20 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-5.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 6 - Indigo video (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-indigo-500/25 to-purple-500/25 rounded-3xl border border-white/15 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-6.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 7 - Rose coming soon (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-3xl border border-white/12 backdrop-blur-sm flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-3xl bg-black/15 flex items-center justify-center">
                <div className="text-white/50 text-sm">Coming Soon</div>
              </div>
            </div>

            {/* Video 8 - Teal video (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-teal-500/22 to-blue-500/22 rounded-3xl border border-white/14 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-lg">
              <video 
                className="w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/crew-video-8.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 9 - Emerald coming soon (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-emerald-500/25 to-green-500/25 rounded-3xl border border-white/15 backdrop-blur-sm flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
                <div className="text-white/65 text-sm">Coming Soon</div>
              </div>
            </div>

            {/* Video 10 - Violet coming soon (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-violet-500/25 to-purple-500/25 rounded-3xl border border-white/15 backdrop-blur-sm flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
                <div className="text-white/65 text-sm">Coming Soon</div>
              </div>
            </div>

            {/* Video 11 - Cyan coming soon (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-cyan-500/25 to-blue-500/25 rounded-3xl border border-white/15 backdrop-blur-sm flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
                <div className="text-white/65 text-sm">Coming Soon</div>
              </div>
            </div>

            {/* Video 12 - Amber coming soon (duplicate) */}
            <div className="w-40 h-60 bg-gradient-to-br from-amber-500/25 to-orange-500/25 rounded-3xl border border-white/15 backdrop-blur-sm flex-shrink-0 shadow-lg">
              <div className="w-full h-full rounded-3xl bg-black/20 flex items-center justify-center">
                <div className="text-white/65 text-sm">Coming Soon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="text-center space-y-8 z-10 max-w-4xl mx-auto px-6 -mt-32">
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
        <div className="pt-2">
          <Button onClick={handleEnter} className="px-8 py-3 text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full">
            Explore the Crew
          </Button>
        </div>
      </div>
    </div>;
};
export default CoverPage;