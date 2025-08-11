import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import OrgChart from "../components/OrgChart";
import FunctionMap from "../components/FunctionMap";
const aliceProfile = "/lovable-uploads/e1676369-5523-42da-a372-dcedff449611.png";
const benProfile = "/lovable-uploads/df1c4dd4-a06d-4d9c-981e-4463ad0b08dc.png";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AI Agent Org Chart | Marketing, Platform, Data";
    const desc =
      "Org chart of AI agents: Super, Multi (Yumi, Ben), and Sub agents across Marketing, Platform, Data.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;
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
            AI Agent Org Chart
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Super, Multi, and Sub Agents organized by Marketing, Platform, and Data. Yumi and Ben are active; others are Hiring.
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

        <OrgChart profiles={{ yumi: aliceProfile, ben: benProfile }} onAgentClick={handleAgentClick} />

        <section className="mt-12">
          <header className="mb-6 text-center">
            <h2 className="text-3xl font-semibold text-foreground">Agent Functions Map</h2>
            <p className="text-sm text-muted-foreground">기능별로 묶인 AI Agent 자리 배치입니다. 세부 내용은 추후 조정 가능합니다.</p>
          </header>
          <FunctionMap profiles={{ yumi: aliceProfile, ben: benProfile }} />
        </section>
      </div>

    </div>
  );
};

export default Home;