import React from "react";

export type OrgChartProps = {
  leader: { name: string; image: string };
  profiles: { yumi: string; ben: string };
  onAgentClick: (agent: string, route: string) => void;
};

const OrgChart: React.FC<OrgChartProps> = ({ leader, profiles, onAgentClick }) => {
  return (
    <div className="space-y-6">
      {/* Leader (조직장) */}
      <section aria-labelledby="org-leader">
        <div className="flex justify-center">
          <article className="rounded-xl border bg-card p-5 shadow-sm flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              <img
                src={leader.image}
                alt={`${leader.name} profile image`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Leader</div>
              <h3 id="org-leader" className="text-xl font-semibold text-foreground">
                {leader.name}
              </h3>
            </div>
          </article>
        </div>
      </section>

      {/* Departments */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Marketing */}
        <article className="rounded-xl border bg-card p-5 shadow-sm">
          <header className="mb-4">
            <h2 className="text-2xl font-semibold text-foreground">Marketing</h2>
          </header>

          {/* Team Lead */}
          <section aria-labelledby="marketing-lead" className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">Team Lead</div>
            <div
              onClick={() => onAgentClick('Yumi', '')}
              className="group cursor-pointer rounded-md p-3 transition hover:bg-muted/30"
              aria-label="Open Yumi promotional workflow"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-110">
                  <img src={profiles.yumi} alt="Yumi profile image" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div>
                  <div className="font-semibold text-foreground group-hover:text-accent-foreground">Yumi</div>
                  <div className="text-xs text-muted-foreground">Promotion Lead</div>
                </div>
              </div>
            </div>
          </section>

          {/* Team Members */}
          <section aria-label="Team Members" className="space-y-3">
            <div
              onClick={() => onAgentClick('Ben', '')}
              className="group cursor-pointer rounded-md p-3 transition hover:bg-muted/30"
              aria-label="Open Ben PTO gallery workflow"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-110">
                  <img src={profiles.ben} alt="Ben profile image" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Ben</div>
                  <div className="text-xs text-muted-foreground">Gallery Images</div>
                </div>
              </div>
            </div>

            {[1,2,3].map((i) => (
              <div key={`mkt-member-${i}`} onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md p-3 transition hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
                  <div>
                    <div className="font-medium text-foreground">Hiring</div>
                    <div className="text-xs text-muted-foreground">Social/Email</div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </article>

        {/* Platform */}
        <article className="rounded-xl border bg-card p-5 shadow-sm">
          <header className="mb-4">
            <h2 className="text-2xl font-semibold text-foreground">Platform</h2>
          </header>

          {/* Team Lead */}
          <section aria-labelledby="platform-lead" className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">Team Lead</div>
            <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md p-3 transition hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
                <div>
                  <div className="font-medium text-foreground">Hiring</div>
                  <div className="text-xs text-muted-foreground">Platform Lead</div>
                </div>
              </div>
            </div>
          </section>

          {/* Team Members */}
          <section aria-label="Team Members" className="space-y-3">
            <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md p-3 transition hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
                <div>
                  <div className="font-medium text-foreground">Integration</div>
                  <div className="text-xs text-muted-foreground">Multi Agent (Hiring)</div>
                </div>
              </div>
            </div>
            <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md p-3 transition hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
                <div>
                  <div className="font-medium text-foreground">Integration</div>
                  <div className="text-xs text-muted-foreground">Sub Agent (Hiring)</div>
                </div>
              </div>
            </div>
            {[1,2].map((i) => (
              <div key={`plat-auto-${i}`} onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md p-3 transition hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
                  <div>
                    <div className="font-medium text-foreground">Automation</div>
                    <div className="text-xs text-muted-foreground">Sub Agent (Hiring)</div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </article>

        {/* Data */}
        <article className="rounded-xl border bg-card p-5 shadow-sm">
          <header className="mb-4">
            <h2 className="text-2xl font-semibold text-foreground">Data</h2>
          </header>

          {/* Team Lead */}
          <section aria-labelledby="data-lead" className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">Team Lead</div>
            <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md p-3 transition hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
                <div>
                  <div className="font-medium text-foreground">Hiring</div>
                  <div className="text-xs text-muted-foreground">Data Lead</div>
                </div>
              </div>
            </div>
          </section>

          {/* Team Members */}
          <section aria-label="Team Members" className="space-y-3">
            <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md p-3 transition hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
                <div>
                  <div className="font-medium text-foreground">Data Ingestion</div>
                  <div className="text-xs text-muted-foreground">Sub Agent (Hiring)</div>
                </div>
              </div>
            </div>
            <div onClick={() => onAgentClick('AI', '')} className="group cursor-pointer rounded-md p-3 transition hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground transition-transform duration-200 group-hover:scale-110">AI</div>
                <div>
                  <div className="font-medium text-foreground">Analytics</div>
                  <div className="text-xs text-muted-foreground">Multi Agent (Hiring)</div>
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};

export default OrgChart;
