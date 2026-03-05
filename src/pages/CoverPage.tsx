import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Users, LayoutGrid, Layers, UserPlus } from "lucide-react";
import Logo from '@/components/Logo';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import FunctionMap from "../components/FunctionMap";
import ContactOrder from "../components/ContactOrder";
import CrewRequestForm, { CrewFormData } from "../components/CrewRequestForm";
import KaiBackgroundRemovalPopup from "../components/KaiBackgroundRemovalPopup";
import CrewRequestNotification, { CrewRequest } from "../components/CrewRequestNotification";
import MochiRequestDialog, { MochiRequest } from "../components/MochiRequestDialog";
import AdminRequestHistory from "../components/AdminRequestHistory";
import MellNewsletterDialog from "../components/MellNewsletterDialog";
import FionaAdminDialog from "../components/FionaAdminDialog";
import CrewProfileDialog from "../components/CrewProfileDialog";
import FloatingSupportWidget from "../components/FloatingSupportWidget";
import { useAnalytics } from "@/hooks/useAnalytics";

const aliceProfile = "/lovable-uploads/d004c9d6-0491-459c-8639-7730374641aa.png";
const benProfile = "/lovable-uploads/ben-profile-v2.png";

const CoverPage = () => {
  const navigate = useNavigate();
  const { trackCrewClick, trackButtonClick, trackFormSubmit } = useAnalytics();
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
  const [mochiRequests, setMochiRequests] = useState<MochiRequest[]>([]);
  const [mellDialogOpen, setMellDialogOpen] = useState(false);
  const [fionaDialogOpen, setFionaDialogOpen] = useState(false);
  const [crewProfileDialogOpen, setCrewProfileDialogOpen] = useState(false);
  const [selectedCrewProfile, setSelectedCrewProfile] = useState<{
    name: string;
    role: string;
    image: string;
    detailImage?: string;
    description: string;
    isComingSoon: boolean;
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

  type CrewProfile = {
    description: string;
    role: string;
    image: string;
    detailImage?: string;
    isComingSoon: boolean;
    ctaLabel?: string;
    ctaAction?: () => void;
  };

  const crewProfiles: Record<string, CrewProfile> = {
    "yumi": { description: "Yumi is an EI-Form designer for LG Electronics brand templates, creating clean and intuitive designs that comply with brand guidelines.", role: "El-Form Designer", image: aliceProfile, detailImage: "/lovable-uploads/yumi-detail-image.png", isComingSoon: false, ctaLabel: "Work with Yumi", ctaAction: () => navigate("/promotional") },
    "ben": { description: "Ben creates dotcom PTO model gallery images. Generates images reflecting accurate information with consistent and stable quality.", role: "PTO Image Creator", image: benProfile, detailImage: "/lovable-uploads/ben-detail-image.png", isComingSoon: false, ctaLabel: "Work with Ben", ctaAction: () => navigate("/pto-gallery") },
    "mateo": { description: "Mateo avoids repetitive manual tasks. Upload an Excel template to perform crawling based on models and retailers.", role: "Web Crawler", image: "/lovable-uploads/mateo-profile.png", isComingSoon: false, ctaLabel: "Work with Mateo", ctaAction: () => navigate("/crawling") },
    "kai": { description: "Kai is a background removal specialist responsible for image editing and post-processing.", role: "Background Remover", image: "/lovable-uploads/84e535ab-1fa5-418e-93aa-73fa3b361219.png", detailImage: "/lovable-uploads/kai-detail-image.png", isComingSoon: false, ctaLabel: "Work with Kai", ctaAction: () => setKaiPopupOpen(true) },
    "maple": { description: "Maple crawls live content from LG.COM. Currently, only homepage hero banners can be viewed.", role: "Content Crawler", image: "/lovable-uploads/maple-profile.png", detailImage: "/lovable-uploads/maple-detail-image.png", isComingSoon: false, ctaLabel: "Work with Maple", ctaAction: () => navigate("/maple-pdp") },
    "noa": { description: "Noa helps with practical work based on product information from PIM (Product Information Management).", role: "Product Information Manager", image: "/lovable-uploads/noa-profile.png", detailImage: "/lovable-uploads/noa-detail-image.png", isComingSoon: false, ctaLabel: "Work with Noa", ctaAction: () => window.open("https://aiagent.pimds.aws.lge.com/", "_blank") },
    "luna": { description: "Creates audiences and offers in Adobe Target using natural language input.", role: "Personalized Marketing Expert", image: "/lovable-uploads/luna-profile.png", isComingSoon: false, ctaLabel: "Work with Luna", ctaAction: () => window.open("https://luna-marketing.lovable.app", "_blank") },
    "clara": { description: "Creates personalized images by crawling SKU data.", role: "Personalized Content Consultant", image: "/lovable-uploads/a4614e4b-7d0d-429f-8b4c-ddc8b85ee3ad.png", isComingSoon: false, ctaLabel: "Work with Clara", ctaAction: () => window.open("https://blank-canvas-coupone.lovable.app/", "_blank") },
    "candy": { description: "Oversees DAM user guides, tutorials, and on-boarding.", role: "DAM Tutor", image: "/lovable-uploads/candy-profile.png", isComingSoon: false, ctaLabel: "Work with Candy", ctaAction: () => window.open("https://candy-global-dam-product-owner.lovable.app/", "_blank") },
    "anita": { description: "Anita is a Lifestyle Photographer who creates compelling lifestyle content and visual storytelling for marketing campaigns.", role: "Lifestyle Photographer", image: "/lovable-uploads/anita-profile.png", detailImage: "/lovable-uploads/anita-detail-image.png", isComingSoon: false, ctaLabel: "Work with Anita", ctaAction: () => navigate("/zoe-lifestyle") },
    "milo": { description: "Milo is an eCRM Designer who creates email content based on pre-designed layouts.", role: "eCRM Designer", image: "/lovable-uploads/milo-profile.png", detailImage: "/lovable-uploads/milo-detail-image.png", isComingSoon: false, ctaLabel: "Work with Milo", ctaAction: () => navigate("/milo-ecrm") },
    "rex": { description: "매일 글로벌 AI 커머스·마케팅 최신 소식을 수집하고 Daily / Weekly / Monthly 리포트를 자동 생성합니다. LG Global DTC 멤버를 위한 트렌드 인사이트를 제공합니다.", role: "AI Commerce & Marketing Intelligence Reporter", image: "/lovable-uploads/rex-profile.png", isComingSoon: false, ctaLabel: "Visit Rex", ctaAction: () => window.open("https://suno7608.github.io/ai-trend-hub/", "_blank") },
    "vera": { description: "글로벌 16개국의 소비자 반응(VOC), 유통 채널 프로모션 동향, 중국 브랜드 움직임을 주간 단위로 모니터링하고 핵심 인사이트와 실행 액션을 도출합니다.", role: "Global D2C Market Intelligence Analyst", image: "/lovable-uploads/vera-profile.png", isComingSoon: false, ctaLabel: "Visit Vera", ctaAction: () => window.open("https://suno7608.github.io/d2c-intel/", "_blank") },
    "mochi": { description: "Mochi receives and manages development requests from the team.", role: "Development Request Manager", image: "/lovable-uploads/mochi-profile.png", isComingSoon: false, ctaLabel: "Submit Request", ctaAction: () => setDevRequestFormOpen(true) },
    "mell": { description: "Mell manages newsletter subscriptions and communication preferences.", role: "Newsletter Manager", image: "/lovable-uploads/mell-profile.png", isComingSoon: false, ctaLabel: "Subscribe", ctaAction: () => setMellDialogOpen(true) },
    "fiona-admin": { description: "Fiona is the admin dashboard manager.", role: "Admin Dashboard", image: "/lovable-uploads/fiona-admin-profile.png", isComingSoon: false, ctaLabel: "Access Dashboard", ctaAction: () => setFionaDialogOpen(true) },
  };

  const handleProfileClick = (name: string) => {
    const lower = name.toLowerCase();
    trackCrewClick(name, { is_coming_soon: crewProfiles[lower]?.isComingSoon ?? true });

    if (lower === "fiona-admin" || (lower === "fiona" && name.includes("Admin"))) {
      setFionaDialogOpen(true);
      return;
    }

    // For Rex and Vera, open URL directly
    if (lower === "rex") {
      window.open("https://suno7608.github.io/ai-trend-hub/", "_blank");
      return;
    }
    if (lower === "vera") {
      window.open("https://suno7608.github.io/d2c-intel/", "_blank");
      return;
    }

    const profile = crewProfiles[lower];
    if (profile) {
      setSelectedCrewProfile({
        name: name,
        role: profile.role,
        image: profile.image,
        detailImage: profile.detailImage,
        description: profile.description,
        isComingSoon: profile.isComingSoon,
        ctaLabel: profile.ctaLabel,
        ctaAction: profile.ctaAction,
      });
      setCrewProfileDialogOpen(true);
    } else {
      setSelectedName(name);
      setComingSoonOpen(true);
    }
  };

  const handleCrewSubmitSuccess = (data: CrewFormData) => {
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

  // Stats
  const totalActiveAgents = 13;
  const totalDivisions = 4;
  const incomingAgents = 2;

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory">
      <CrewRequestNotification
        requests={submittedRequests}
        onClearRequest={handleClearRequest}
      />

      {/* Hero Section */}
      <section className="h-screen snap-start bg-gradient-to-br from-background via-background/95 to-accent/5 flex flex-col items-center justify-center relative overflow-hidden">
        <Logo />

        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-35 pointer-events-none transition-all duration-300 ease-out"
          style={{
            background: 'radial-gradient(circle, hsl(0 70% 55% / 0.5) 0%, hsl(0 70% 55% / 0.25) 35%, transparent 70%)',
            left: mousePosition.x - 300,
            top: mousePosition.y - 300
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />

        <div className="text-center space-y-6 z-10 max-w-4xl mx-auto px-6">
          <div className="space-y-3">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-b from-gradient-title-start to-gradient-title-end bg-clip-text text-transparent">
              Twin Crew
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              A Team of Your Second Selves.
            </p>
            <p className="text-sm md:text-base text-muted-foreground/70 font-light">
              D2C Overseas Sales &amp; Marketing Group AI Agent Directory
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto mt-8">
            {[
              { icon: Users, label: "Active Agents", value: totalActiveAgents },
              { icon: LayoutGrid, label: "Divisions", value: totalDivisions },
              { icon: Layers, label: "Teams", value: totalDivisions },
              { icon: UserPlus, label: "Incoming", value: incomingAgents },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 bg-card/50 rounded-xl px-3 py-3 border border-border/30">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

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

          <section className={`transition-all duration-700 delay-400 ${isCrewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <FunctionMap
              profiles={{ yumi: aliceProfile, ben: benProfile }}
              onProfileClick={handleProfileClick}
              highlightName={searchTerm || highlightName || undefined}
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

        <CrewRequestForm
          open={crewFormOpen}
          onOpenChange={setCrewFormOpen}
          onSubmitSuccess={handleCrewSubmitSuccess}
        />

        <KaiBackgroundRemovalPopup open={kaiPopupOpen} onOpenChange={setKaiPopupOpen} />

        <MochiRequestDialog
          open={devRequestFormOpen}
          onOpenChange={setDevRequestFormOpen}
          onSubmitSuccess={handleMochiRequestSuccess}
        />

        <AdminRequestHistory
          open={adminHistoryOpen}
          onOpenChange={setAdminHistoryOpen}
          requests={mochiRequests}
          onDeleteRequest={handleDeleteMochiRequest}
        />

        <MellNewsletterDialog
          open={mellDialogOpen}
          onOpenChange={setMellDialogOpen}
        />

        <FionaAdminDialog
          open={fionaDialogOpen}
          onOpenChange={setFionaDialogOpen}
          crewRequests={submittedRequests}
          developmentRequests={mochiRequests}
        />

        {selectedCrewProfile && (
          <CrewProfileDialog
            open={crewProfileDialogOpen}
            onOpenChange={setCrewProfileDialogOpen}
            crewName={selectedCrewProfile.name}
            crewRole={selectedCrewProfile.role}
            crewImage={selectedCrewProfile.image}
            crewDetailImage={selectedCrewProfile.detailImage}
            crewDescription={selectedCrewProfile.description}
            isComingSoon={selectedCrewProfile.isComingSoon}
            ctaLabel={selectedCrewProfile.ctaLabel}
            onCtaClick={selectedCrewProfile.ctaAction}
          />
        )}
      </section>

      {/* Floating Support Widget */}
      <FloatingSupportWidget
        onMochiClick={() => setDevRequestFormOpen(true)}
        onMellClick={() => setMellDialogOpen(true)}
        onFionaClick={() => setFionaDialogOpen(true)}
      />
    </div>
  );
};

export default CoverPage;
