import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Marketing Org */}
          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <header className="mb-4">
              <h2 className="text-2xl font-semibold text-foreground">Marketing</h2>
              <p className="text-sm text-muted-foreground">Promotion & Gallery Teams</p>
            </header>
            <section className="space-y-4">
              {/* Promotion Team - Yumi (Multi Agent) */}
              <div className="rounded-lg border bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Promotion Team</h3>
                  <span className="text-xs text-muted-foreground">Multi Agent</span>
                </div>
                <div className="mt-3 space-y-3">
                  <div
                    onClick={() => handleAgentClick('alice', '/promotional')}
                    className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-[hsl(var(--agent-accent))]"
                    aria-label="Open Yumi promotional workflow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-[hsl(var(--agent-accent))] ring-offset-2 ring-offset-card transition-transform duration-200 group-hover:scale-110">
                        <img src={aliceProfile} alt="Yumi profile image" className="h-full w-full object-cover" loading="lazy" />
                        <video
                          src="/alice-video.mp4"
                          className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-[hsl(var(--agent-accent))]">Yumi</div>
                        <div className="text-xs text-muted-foreground">Multi Agent</div>
                      </div>
                    </div>
                  </div>
                  {/* Additional Sub Agent - Hiring */}
                  <div className="rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">AI</div>
                      <div>
                        <div className="font-medium text-foreground">Hiring</div>
                        <div className="text-xs text-muted-foreground">Sub Agent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Images Team - Ben (Multi Agent) */}
              <div className="rounded-lg border bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Gallery Images Team</h3>
                  <span className="text-xs text-muted-foreground">Multi Agent</span>
                </div>
                <div className="mt-3 space-y-3">
                  <div
                    onClick={() => handleAgentClick('ben', '/pto-gallery')}
                    className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-sky-300"
                    aria-label="Open Ben PTO gallery workflow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-accent ring-offset-2 ring-offset-card transition-transform duration-200 group-hover:scale-110">
                        <img src={benProfile} alt="Ben profile image" className="h-full w-full object-cover" loading="lazy" />
                        <video
                          src="/ben-video.mp4"
                          className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-sky-400">Ben</div>
                        <div className="text-xs text-muted-foreground">Multi Agent</div>
                      </div>
                    </div>
                  </div>
                  {/* Additional Sub Agent - Hiring */}
                  <div className="rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">AI</div>
                      <div>
                        <div className="font-medium text-foreground">Hiring</div>
                        <div className="text-xs text-muted-foreground">Sub Agent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Team - Sub Agents (Hiring) */}
              <div className="rounded-lg border bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Social Media Team</h3>
                  <span className="text-xs text-muted-foreground">Sub Agents</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  {[1,2].map((i) => (
                    <div key={`mkt-social-${i}`} className="rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">AI</div>
                        <div>
                          <div className="font-medium text-foreground">Hiring</div>
                          <div className="text-xs text-muted-foreground">Sub Agent</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Campaign Team - Sub Agents (Hiring) */}
              <div className="rounded-lg border bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Email Campaign Team</h3>
                  <span className="text-xs text-muted-foreground">Sub Agents</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  {[1,2].map((i) => (
                    <div key={`mkt-email-${i}`} className="rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">AI</div>
                        <div>
                          <div className="font-medium text-foreground">Hiring</div>
                          <div className="text-xs text-muted-foreground">Sub Agent</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </article>

          {/* Platform Org */}
          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <header className="mb-4">
              <h2 className="text-2xl font-semibold text-foreground">Platform</h2>
              <p className="text-sm text-muted-foreground">Infrastructure & Automation</p>
            </header>
            <section className="space-y-4">
              {/* Integration Team */}
              <div className="rounded-lg border bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Integration Team</h3>
                  <span className="text-xs text-muted-foreground">Multi & Sub</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  {/* Multi Agent - Hiring */}
                  <div className="rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">AI</div>
                      <div>
                        <div className="font-medium text-foreground">Hiring</div>
                        <div className="text-xs text-muted-foreground">Multi Agent</div>
                      </div>
                    </div>
                  </div>
                  {/* Sub Agent - Hiring */}
                  <div className="rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">AI</div>
                      <div>
                        <div className="font-medium text-foreground">Hiring</div>
                        <div className="text-xs text-muted-foreground">Sub Agent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automation Team */}
              <div className="rounded-lg border bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Automation Team</h3>
                  <span className="text-xs text-muted-foreground">Sub Agents</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  {[1,2].map((i) => (
                    <div key={`plat-auto-${i}`} className="rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">AI</div>
                        <div>
                          <div className="font-medium text-foreground">Hiring</div>
                          <div className="text-xs text-muted-foreground">Sub Agent</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </article>

          {/* Data Org */}
          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <header className="mb-4">
              <h2 className="text-2xl font-semibold text-foreground">Data</h2>
              <p className="text-sm text-muted-foreground">Ingestion & Analytics</p>
            </header>
            <section className="space-y-4">
              {/* Data Ingestion Team */}
              <div className="rounded-lg border bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Data Ingestion Team</h3>
                  <span className="text-xs text-muted-foreground">Sub Agent</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div className="rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">AI</div>
                      <div>
                        <div className="font-medium text-foreground">Hiring</div>
                        <div className="text-xs text-muted-foreground">Sub Agent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Team */}
              <div className="rounded-lg border bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Analytics Team</h3>
                  <span className="text-xs text-muted-foreground">Multi Agent</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div className="rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">AI</div>
                      <div>
                        <div className="font-medium text-foreground">Hiring</div>
                        <div className="text-xs text-muted-foreground">Multi Agent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>

    </div>
  );
};

export default Home;