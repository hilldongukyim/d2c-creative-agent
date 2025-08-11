import React from "react";

type OrgChartProps = {
  profiles: { yumi: string; ben: string };
  onAgentClick: (agent: string, route: string) => void;
};

const OrgChart: React.FC<OrgChartProps> = ({ profiles, onAgentClick }) => {
  return (
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
                onClick={() => onAgentClick('alice', '/promotional')}
                className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-[hsl(var(--agent-accent))]"
                aria-label="Open Yumi promotional workflow"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-[hsl(var(--agent-accent))] ring-offset-2 ring-offset-card transition-transform duration-200 group-hover:scale-110">
                    <img src={profiles.yumi} alt="Yumi profile image" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-[hsl(var(--agent-accent))]">Yumi</div>
                    <div className="text-sm text-muted-foreground">Multi Agent</div>
                  </div>
                </div>
              </div>
              {/* Additional Sub Agent - Hiring */}
              <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-muted-foreground/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
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
                onClick={() => onAgentClick('ben', '/pto-gallery')}
                className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-sky-300"
                aria-label="Open Ben PTO gallery workflow"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-accent ring-offset-2 ring-offset-card transition-transform duration-200 group-hover:scale-110">
                    <img src={profiles.ben} alt="Ben profile image" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-sky-400">Ben</div>
                    <div className="text-sm text-muted-foreground">Multi Agent</div>
                  </div>
                </div>
              </div>
              {/* Additional Sub Agent - Hiring */}
              <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-muted-foreground/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
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
                <div onClick={() => onAgentClick('AI', '')} key={`mkt-social-${i}`} className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-muted-foreground/30">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
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
                <div onClick={() => onAgentClick('AI', '')} key={`mkt-email-${i}`} className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-muted-foreground/30">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
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
              <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-muted-foreground/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
                  <div>
                    <div className="font-medium text-foreground">Hiring</div>
                    <div className="text-xs text-muted-foreground">Multi Agent</div>
                  </div>
                </div>
              </div>
              {/* Sub Agent - Hiring */}
              <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-muted-foreground/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
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
                <div onClick={() => onAgentClick('AI', '')} key={`plat-auto-${i}`} className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-muted-foreground/30">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
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
              <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-muted-foreground/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
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
              <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md border p-3 transition hover:ring-2 hover:ring-muted-foreground/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
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
  );
};

export default OrgChart;
