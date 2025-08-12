import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import OrgChart from "../components/OrgChart";
import FunctionMap from "../components/FunctionMap";
const aliceProfile = "/lovable-uploads/d004c9d6-0491-459c-8639-7730374641aa.png";
const benProfile = "/lovable-uploads/df1c4dd4-a06d-4d9c-981e-4463ad0b08dc.png";
const leaderProfile = "/lovable-uploads/b9d1ddf6-1b17-41b4-9233-91642568cd3c.png";

const Home = () => {
  const navigate = useNavigate();
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  useEffect(() => {
    const title = "Meet our AI Agents — 내부 업무를 돕는 지능형 팀";
    const desc = "Intelligent AI agents that accelerate internal work through clear structure and collaboration, delivering faster, more accurate results."

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
      url: window.location.href,
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
    } else {
      setSelectedName(_agent);
      setComingSoonOpen(true);
    }
  };

  const handleProfileClick = (name: string) => {
    const lower = name.toLowerCase();
    if (lower === "yumi") return navigate("/promotional");
    if (lower === "ben") return navigate("/pto-gallery");
    setSelectedName(name);
    setComingSoonOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6 relative overflow-hidden">
      {/* Expanding circle animation */}
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Meet our AI Agents
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            An intelligent agent team that helps and accelerates the work of internal employees. Through clear structure and collaboration, we deliver faster, more accurate results.
          </p>
        </header>

<section className="mb-8">
          <header className="text-center mb-6">
            <h2 className="text-3xl font-semibold text-foreground"> Org Chart</h2>
          </header>
          <OrgChart leader={{ name: "Sungwoo", image: leaderProfile }} profiles={{ yumi: aliceProfile, ben: benProfile }} onAgentClick={handleAgentClick} />
        </section>


        <Separator className="my-12" />

        <section className="mt-12">
          <header className="mb-6 text-center">
            <h2 className="text-3xl font-semibold text-foreground">Functional Capabilities: What Our Agents Do</h2>
            <p className="text-sm text-muted-foreground">See how agents across all departments converge on shared objectives. This map highlights the unified functions of our team, providing a clear picture of their collective power.</p>
          </header>
          <FunctionMap profiles={{ yumi: aliceProfile, ben: benProfile }} onProfileClick={handleProfileClick} />
        </section>
      </div>

      {/* Coming Soon Modal */}
      <AlertDialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Coming soon</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedName ? `${selectedName} 기능은 곧 제공될 예정입니다.` : "해당 기능은 곧 제공될 예정입니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction autoFocus>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;