import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import OrgChart from "../components/OrgChart";
import FunctionMap from "../components/FunctionMap";
const aliceProfile = "/lovable-uploads/d004c9d6-0491-459c-8639-7730374641aa.png";
const benProfile = "/lovable-uploads/df1c4dd4-a06d-4d9c-981e-4463ad0b08dc.png";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const title = "AI Agent Hierarchy & Functional Capabilities";
    const desc =
      "Explore our AI agent hierarchy and functional capabilities—clear structure and powerful teamwork.";

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
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6 relative overflow-hidden">
      {/* Expanding circle animation */}
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Engineered for Impact. Built with Intelligence.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Welcome to the home of our AI Agents. Discover a team designed for clarity, collaboration, and exceptional results.
          </p>
        </header>
        <section className="flex justify-center mb-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
            <div className="text-sm text-muted-foreground">Super Agent</div>
            <div className="text-2xl font-semibold text-foreground">Project Orchestrator</div>
            <p className="text-sm text-muted-foreground mt-2">Assigns tasks and coordinates teams</p>
          </div>
        </section>
        <div className="flex justify-center -mt-2 mb-8" aria-hidden>
          <div className="h-8 w-0.5 bg-muted" />
        </div>

<section className="mb-8">
          <header className="text-center mb-6">
            <h2 className="text-3xl font-semibold text-foreground">The AI Hierarchy: Our Integrated Agent Framework</h2>
            <p className="text-sm text-muted-foreground">A clear view of our operational structure. Each agent plays a distinct role, from strategic oversight to granular execution, forming a cohesive and powerful team.</p>
          </header>
          <OrgChart profiles={{ yumi: aliceProfile, ben: benProfile }} onAgentClick={handleAgentClick} />
        </section>

        <Separator className="my-12" />

        <section className="mt-12">
          <header className="mb-6 text-center">
            <h2 className="text-3xl font-semibold text-foreground">Functional Capabilities: What Our Agents Do</h2>
            <p className="text-sm text-muted-foreground">See how agents across all departments converge on shared objectives. This map highlights the unified functions of our team, providing a clear picture of their collective power.</p>
          </header>
          <FunctionMap profiles={{ yumi: aliceProfile, ben: benProfile }} />
        </section>
      </div>

    </div>
  );
};

export default Home;