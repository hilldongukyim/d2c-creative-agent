import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, ChevronDown } from "lucide-react";
import Logo from '@/components/Logo';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import FunctionMap from "../components/FunctionMap";
import ContactOrder from "../components/ContactOrder";
import CrewRequestForm, { CrewFormData } from "../components/CrewRequestForm";
import KaiBackgroundRemovalPopup from "../components/KaiBackgroundRemovalPopup";
import CrewRequestNotification, { CrewRequest } from "../components/CrewRequestNotification";
import MochiSection from "../components/MochiSection";
import DevelopmentRequestForm, { DevelopmentRequest } from "../components/DevelopmentRequestForm";
import AdminRequestHistory from "../components/AdminRequestHistory";

const aliceProfile = "/lovable-uploads/d004c9d6-0491-459c-8639-7730374641aa.png";
const benProfile = "/lovable-uploads/ben-profile-v2.png";

const CoverPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [highlightName, setHighlightName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [crewFormOpen, setCrewFormOpen] = useState(false);
  const [kaiPopupOpen, setKaiPopupOpen] = useState(false);
  const [isCrewVisible, setIsCrewVisible] = useState(false);
  const [submittedRequests, setSubmittedRequests] = useState<CrewRequest[]>([]);
  const [devRequestFormOpen, setDevRequestFormOpen] = useState(false);
  const [adminHistoryOpen, setAdminHistoryOpen] = useState(false);
  const [developmentRequests, setDevelopmentRequests] = useState<DevelopmentRequest[]>([]);
  const crewSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const title = "Meet our AI Agents — 내부 업무를 돕는 지능형 팀";
    const desc = "Intelligent AI agents that accelerate internal work through clear structure and collaboration, delivering faster, more accurate results.";
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
    if (lower === "yumi") return navigate("/promotional");
    if (lower === "ben") return navigate("/pto-gallery");
    if (lower === "mateo") return navigate("/crawling");
    if (lower === "allen") return navigate("/allen-qa");
    if (lower === "maple") return navigate("/maple-pdp");
    if (lower === "anita" || lower === "zoe") return navigate("/zoe-lifestyle");
    if (lower === "levi") {
      window.open("https://request-page-craft.lovable.app/", "_blank");
      return;
    }
    if (lower === "candy") {
      window.open("https://candy-global-dam-product-owner.lovable.app/", "_blank");
      return;
    }
    if (lower === "clara") {
      window.open("https://blank-canvas-coupone.lovable.app/", "_blank");
      return;
    }
    if (lower === "kai") {
      setKaiPopupOpen(true);
      return;
    }
    if (lower === "noa") {
      window.open("https://aiagent.pimds.aws.lge.com/", "_blank");
      return;
    }
    if (lower === "ava") {
      window.open("https://pdptracker.lovable.app", "_blank");
      return;
    }
    if (lower === "luna") {
      window.open("https://luna-marketing.lovable.app", "_blank");
      return;
    }
    setSelectedName(name);
    setComingSoonOpen(true);
  };

  const handleCrewSubmitSuccess = (data: CrewFormData) => {
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

  const handleDevRequestSuccess = (data: DevelopmentRequest) => {
    setDevelopmentRequests(prev => [...prev, data]);
  };

  const handleDeleteDevRequest = (id: string) => {
    setDevelopmentRequests(prev => prev.filter(req => req.id !== id));
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
              Meet<br className="sm:hidden" /> AI Twin Crew
            </h2>
            <p className={`text-muted-foreground max-w-2xl mx-auto text-xs transition-all duration-700 delay-200 ${isCrewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              An intelligent agent team that helps and accelerates the work of internal employees. Through clear structure and collaboration, we deliver faster, more accurate results.
            </p>
          </header>

          {/* Search and Action Bar */}
          <div className={`mb-8 flex gap-4 items-center justify-center transition-all duration-700 delay-300 ${isCrewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
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
            <Button onClick={() => setCrewFormOpen(true)} variant="outline" className="gap-2 px-3 sm:px-4">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Register</span>
            </Button>
          </div>

          <section className={`mt-12 transition-all duration-700 delay-400 ${isCrewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <ContactOrder 
              agents={[
                { name: "Yumi", image: aliceProfile },
                { name: "Ben", image: benProfile }
              ]} 
              ariaLabel="Suggested contact order" 
            />
            <FunctionMap 
              profiles={{ yumi: aliceProfile, ben: benProfile }} 
              onProfileClick={handleProfileClick} 
              highlightName={searchTerm || highlightName || undefined}
              mochiSection={
                <MochiSection 
                  onRequestClick={() => setDevRequestFormOpen(true)}
                  onHistoryClick={() => setAdminHistoryOpen(true)}
                />
              }
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

        {/* Crew Registration Form */}
        <CrewRequestForm 
          open={crewFormOpen} 
          onOpenChange={setCrewFormOpen} 
          onSubmitSuccess={handleCrewSubmitSuccess}
        />

        {/* Kai Background Removal Popup */}
        <KaiBackgroundRemovalPopup open={kaiPopupOpen} onOpenChange={setKaiPopupOpen} />

        {/* Development Request Form - Mochi */}
        <DevelopmentRequestForm
          open={devRequestFormOpen}
          onOpenChange={setDevRequestFormOpen}
          onSubmitSuccess={handleDevRequestSuccess}
        />

        {/* Admin Request History */}
        <AdminRequestHistory
          open={adminHistoryOpen}
          onOpenChange={setAdminHistoryOpen}
          requests={developmentRequests}
          onDeleteRequest={handleDeleteDevRequest}
        />
      </section>
    </div>
  );
};

export default CoverPage;
