import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, UserPlus } from "lucide-react";
import Logo from "@/components/Logo";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import OrgChart from "../components/OrgChart";
import FunctionMap from "../components/FunctionMap";
import ContactOrder from "../components/ContactOrder";
import CrewRequestForm from "../components/CrewRequestForm";
import KaiBackgroundRemovalPopup from "../components/KaiBackgroundRemovalPopup";
const aliceProfile = "/lovable-uploads/d004c9d6-0491-459c-8639-7730374641aa.png";
const benProfile = "/lovable-uploads/df1c4dd4-a06d-4d9c-981e-4463ad0b08dc.png";
const leaderProfile = "/lovable-uploads/b9d1ddf6-1b17-41b4-9233-91642568cd3c.png";
const Home = () => {
  const navigate = useNavigate();
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [highlightName, setHighlightName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [crewFormOpen, setCrewFormOpen] = useState(false);
  const [kaiPopupOpen, setKaiPopupOpen] = useState(false);
  useEffect(() => {
    const title = "Meet our AI Agents — 내부 업무를 돕는 지능형 팀";
    const desc = "Intelligent AI agents that accelerate internal work through clear structure and collaboration, delivering faster, more accurate results.";

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

    // Structured data (WebPage)
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: desc,
      url: window.location.href
    };
    let script = document.getElementById('ld-json-home') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'ld-json-home';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(ld);
  }, []);
  const handleAgentClick = (_agent: string, route: string) => {
    if (route) {
      navigate(route);
      return;
    }
    const name = _agent.toLowerCase();
    const highlightable = new Set(["yumi", "ben", "carmen", "candy", "maya", "theo", "fiona", "tango", "juno", "luna", "fern", "pip", "kai", "noa", "boris", "ollie", "levi"]);
    if (highlightable.has(name)) {
      setHighlightName(_agent);
      setComingSoonOpen(false);
      return;
    }
    setSelectedName(_agent);
    setComingSoonOpen(true);
  };
  const handleProfileClick = (name: string) => {
    console.log('handleProfileClick called with:', name);
    const lower = name.toLowerCase();
    if (lower === "yumi") return navigate("/promotional");
    if (lower === "ben") return navigate("/pto-gallery");
    if (lower === "mateo") return navigate("/crawling");
    if (lower === "allen") return navigate("/allen-qa");
    if (lower === "theo") {
      window.open("https://welcome-thanks-lim.lovable.app/", "_blank");
      return;
    }
    if (lower === "levi") {
      window.open("https://request-page-craft.lovable.app/", "_blank");
      return;
    }
    if (lower === "ollie") {
      window.open("https://welcome-ollie-start.lovable.app/", "_blank");
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
  return <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6 relative overflow-hidden">
      <Logo />
      
      {/* Navigation button */}
      <div className="absolute top-6 right-6 z-20">
        <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      
      {/* Expanding circle animation */}
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-12 pt-8">
          <h1 className="font-bold text-foreground mb-4 text-2xl">
            Meet<br className="sm:hidden" /> AI Twin Crew
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-xs">
            An intelligent agent team that helps and accelerates the work of internal employees. Through clear structure and collaboration, we deliver faster, more accurate results.
          </p>
        </header>

        {/* Search and Action Bar */}
        <div className="mb-8 flex gap-4 items-center justify-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" placeholder="Search crew..." />
          </div>
          <Button onClick={() => setCrewFormOpen(true)} variant="outline" className="gap-2 px-3 sm:px-4">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Register</span>
          </Button>
        </div>

        <section className="mt-12">
          <header className="mb-6 text-center">
            
            
          </header>
          <ContactOrder agents={[{
          name: "Yumi",
          image: aliceProfile
        }, {
          name: "Ben",
          image: benProfile
        }]} ariaLabel="Suggested contact order" />
          <FunctionMap profiles={{
          yumi: aliceProfile,
          ben: benProfile
        }} onProfileClick={handleProfileClick} highlightName={searchTerm || highlightName || undefined} />
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
      <CrewRequestForm open={crewFormOpen} onOpenChange={setCrewFormOpen} />

      {/* Kai Background Removal Popup */}
      <KaiBackgroundRemovalPopup open={kaiPopupOpen} onOpenChange={setKaiPopupOpen} />
    </div>;
};
export default Home;