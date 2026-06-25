import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import Logo from '@/components/Logo';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import FunctionMap from "../components/FunctionMap";
import ContactOrder from "../components/ContactOrder";
import CrewRequestNotification, { CrewRequest } from "../components/CrewRequestNotification";
import MochiRequestDialog, { MochiRequest } from "../components/MochiRequestDialog";
import MellNewsletterDialog from "../components/MellNewsletterDialog";
import FionaAdminDialog from "../components/FionaAdminDialog";
import CrewProfileDialog from "../components/CrewProfileDialog";
import { useAnalytics } from "@/hooks/useAnalytics";
import { CREW_DATA } from "@/data/crewData";

declare const __BUILD_TIME__: string;
const CoverPage = () => {
  const navigate = useNavigate();
  const { trackCrewClick, trackFormSubmit } = useAnalytics();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isCrewVisible, setIsCrewVisible] = useState(false);
  const [submittedRequests, setSubmittedRequests] = useState<CrewRequest[]>([]);
  const [devRequestFormOpen, setDevRequestFormOpen] = useState(false);
  const [mochiRequests, setMochiRequests] = useState<MochiRequest[]>([]);
  const [mellDialogOpen, setMellDialogOpen] = useState(false);
  const [fionaDialogOpen, setFionaDialogOpen] = useState(false);
  const [crewProfileDialogOpen, setCrewProfileDialogOpen] = useState(false);
  const [selectedCrewProfile, setSelectedCrewProfile] = useState<{
    name: string;
    role: string;
    description: string;
    flowSteps?: import("@/data/crewData").FlowStep[];
    isComingSoon: boolean;
    isUpgraded?: boolean;
    ctaLabel?: string;
    ctaAction?: () => void;
  } | null>(null);
  const crewSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const title = "Meet Twin Crew — Your Intelligent Work Partners";
    const desc = "A diverse range of AI agents are ready to resolve the pain points you experience in your OBS workflows. Work more efficiently and smartly with your AI colleagues.";
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsCrewVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (crewSectionRef.current) {
      observer.observe(crewSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToCrewSection = () => {
    const section = document.getElementById('crew-section');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProfileClick = (name: string) => {
    const lower = name.toLowerCase();

    trackCrewClick(name, { is_coming_soon: CREW_DATA[lower]?.isComingSoon ?? true });

    if (lower === "fiona-admin" || (lower === "fiona" && name.includes("Admin"))) {
      setFionaDialogOpen(true);
      return;
    }

    const crew = CREW_DATA[lower];
    if (crew) {
      if (crew.isComingSoon && !crew.ctaRoute && !crew.ctaUrl && lower !== "mochi" && lower !== "mell" && lower !== "fiona-admin") {
        setSelectedName(name);
        setComingSoonOpen(true);
        return;
      }

      const ctaAction = crew.ctaRoute
        ? () => navigate(crew.ctaRoute!)
        : crew.ctaUrl
        ? () => window.open(crew.ctaUrl, "_blank")
        : lower === "mochi" ? () => setDevRequestFormOpen(true)
        : lower === "mell"  ? () => setMellDialogOpen(true)
        : lower === "fiona-admin" ? () => setFionaDialogOpen(true)
        : undefined;

      setSelectedCrewProfile({
        name,
        role: crew.role,
        description: crew.description,
        flowSteps: crew.flowSteps,
        isComingSoon: crew.isComingSoon,
        isUpgraded: crew.isUpgraded,
        ctaLabel: crew.ctaLabel,
        ctaAction,
      });
      setCrewProfileDialogOpen(true);
    } else {
      setSelectedName(name);
      setComingSoonOpen(true);
    }
  };
  const handleCrewSubmitSuccess = (data: { crewName: string; [key: string]: unknown }) => {
    trackFormSubmit('CrewRequestForm', { crew_name: data.crewName });
    const newRequest: CrewRequest = {
      id: Date.now().toString(),
      ...data,
      submittedAt: new Date(),
    };
    setSubmittedRequests(prev => [...prev, newRequest]);
  };

  const handleClearRequest = (id: string) => {
    setSubmittedRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleMochiRequestSuccess = (data: MochiRequest) => {
    trackFormSubmit('MochiRequestForm', { name: data.name, category: data.category });
    setMochiRequests(prev => [...prev, data]);
  };

  const handleDeleteMochiRequest = (id: string) => {
    setMochiRequests(prev => prev.filter(req => req.id !== id));
  };

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory">
      {/* Notification Bell */}
      <CrewRequestNotification 
        requests={submittedRequests} 
        onClearRequest={handleClearRequest} 
      />

      {/* Hero Section */}
      <section className="h-screen snap-start bg-gradient-to-br from-background via-background/95 to-accent/5 flex flex-col items-center justify-center relative overflow-hidden">
        <Logo />
        
        {/* Mouse following gradient */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-35 pointer-events-none transition-all duration-300 ease-out"
          style={{
            background: 'radial-gradient(circle, hsl(0 70% 55% / 0.5) 0%, hsl(0 70% 55% / 0.25) 35%, transparent 70%)',
            left: mousePosition.x - 300,
            top: mousePosition.y - 300
          }}
        />
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        
        {/* Main content */}
        <div className="text-center space-y-8 z-10 max-w-4xl mx-auto px-6">
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-b from-gradient-title-start to-gradient-title-end bg-clip-text text-transparent">
              Twin Crew
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              A Team of Your Second Selves.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <button 
          onClick={scrollToCrewSection}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span className="text-sm font-medium">Explore AI Crew</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </section>

      {/* Crew Section */}
      <section 
        ref={crewSectionRef}
        id="crew-section" 
        className="min-h-screen snap-start bg-gradient-to-br from-background to-secondary/20 p-6 relative overflow-hidden"
      >
        <div className={`max-w-6xl mx-auto relative z-10 transition-all duration-700 ${isCrewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <header className="text-center mb-12 pt-8">
            <h2 className={`font-bold text-foreground mb-4 text-2xl transition-all duration-700 delay-100 ${isCrewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              Meet<br className="sm:hidden" /> Twin Crew
            </h2>
            <p className={`text-muted-foreground max-w-2xl mx-auto text-xs transition-all duration-700 delay-200 ${isCrewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              A diverse range of AI agents are ready to resolve the pain points you experience in your OBS workflows. Work more efficiently and smartly alongside your AI colleagues.
            </p>
          </header>

          {/* Search Bar */}
          <div className={`mb-8 flex items-center justify-center transition-all duration-700 delay-300 ${isCrewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                type="text" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-10" 
                placeholder="Search crew..." 
              />
            </div>
          </div>

          <section className={`mt-12 transition-all duration-700 delay-400 ${isCrewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <ContactOrder 
              agents={[
                { name: "Yumi", image: CREW_DATA.yumi.image },
                { name: "Ben", image: CREW_DATA.ben.image }
              ]} 
              ariaLabel="Suggested contact order" 
            />
            <FunctionMap 
              onProfileClick={handleProfileClick} 
              highlightName={searchTerm || undefined}
            />
          </section>
        </div>

        {/* Coming Soon Modal */}
        <AlertDialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>On the Job Training</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedName ? `${selectedName} will be coming soon.` : "This feature will be coming soon."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction autoFocus>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        {/* Mochi Request Dialog */}
        <MochiRequestDialog
          open={devRequestFormOpen}
          onOpenChange={setDevRequestFormOpen}
          onSubmitSuccess={handleMochiRequestSuccess}
        />

        {/* Mell Newsletter Dialog */}
        <MellNewsletterDialog
          open={mellDialogOpen}
          onOpenChange={setMellDialogOpen}
        />

        {/* Fiona Admin Dialog */}
        <FionaAdminDialog
          open={fionaDialogOpen}
          onOpenChange={setFionaDialogOpen}
          crewRequests={submittedRequests}
          developmentRequests={mochiRequests}
        />

        {/* Crew Profile Dialog */}
        {selectedCrewProfile && (
          <CrewProfileDialog
            open={crewProfileDialogOpen}
            onOpenChange={setCrewProfileDialogOpen}
            crewName={selectedCrewProfile.name}
            crewRole={selectedCrewProfile.role}
            crewDescription={selectedCrewProfile.description}
            flowSteps={selectedCrewProfile.flowSteps}
            isComingSoon={selectedCrewProfile.isComingSoon}
            isUpgraded={selectedCrewProfile.isUpgraded}
            ctaLabel={selectedCrewProfile.ctaLabel}
            onCtaClick={selectedCrewProfile.ctaAction}
          />
        )}

        {/* Footer */}
        <footer className="py-6 px-6 text-center border-t border-border/30">
          <p className="text-xs text-muted-foreground/60">
            Last updated:{" "}
            {new Date(__BUILD_TIME__).toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Questions or issues?{" "}
            <a
              href="mailto:donguk.yim@lge.com"
              className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
            >
              donguk.yim@lge.com
            </a>
          </p>
        </footer>
      </section>
    </div>
  );
};

export default CoverPage;
