import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
const Home = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const title = "Content QA Assistant - Pip";
    const desc = "Simple and elegant Content QA Assistant powered by Pip";

    // Title & meta description
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;

    // Canonical tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Logo */}
      <div className="absolute top-6 left-6 z-20">
        <Logo />
      </div>
      
      {/* Navigation button */}
      <div className="absolute top-6 right-6 z-20">
        <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Circular gradient background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at center, 
            rgba(102, 126, 234, 0.4) 0%, 
            rgba(118, 75, 162, 0.3) 25%, 
            rgba(240, 147, 251, 0.2) 50%, 
            rgba(245, 87, 108, 0.1) 75%, 
            transparent 100%)`
        }}
      />
      
      <div className="flex items-center justify-center min-h-screen relative z-10">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-foreground mb-6">
            Content QA Assistant
          </h1>
          <p className="text-4xl font-bold text-muted-foreground">
            Pip
          </p>
        </div>
      </div>
    </div>
  );
};
export default Home;