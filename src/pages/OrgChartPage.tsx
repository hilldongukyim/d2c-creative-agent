import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
const OrgChartPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const title = "Organization Chart — AI Agents Structure";
    const desc = "Complete organizational chart showing the hierarchical structure of our AI agent teams across 5 divisions and 11 teams.";

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

    // Structured data
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: desc,
      url: window.location.href
    };
    let script = document.getElementById('ld-json-orgchart') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'ld-json-orgchart';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(ld);
  }, []);
  return <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6 relative overflow-hidden">
      <Logo />
      
      {/* Back button */}
      <Button onClick={() => navigate('/home')} variant="ghost" size="sm" className="absolute top-6 right-6 z-20 hover:bg-muted/50 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-center items-center">
          <img 
            src="/lovable-uploads/crew-introduction.png" 
            alt="Introducing Crew - AI Twin Crew members including Ben, Candy, Maya, Ollie, Ravi, Clara, Orin, and Yumi"
            className="w-full max-w-6xl rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>;
};
export default OrgChartPage;