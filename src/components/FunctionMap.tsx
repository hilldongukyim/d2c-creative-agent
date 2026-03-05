import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";

type ProfileItem = {
  name: string;
  role: string;
  imageSrc: string;
  status: "green" | "yellow" | "red";
  isNew?: boolean;
  actionUrl?: string;
  tags?: string[];
};

type Division = {
  name: string;
  accentColor: string;
  agents: ProfileItem[];
};

type FunctionMapProps = {
  profiles: { yumi: string; ben: string };
  onProfileClick?: (name: string) => void;
  highlightName?: string;
};

const divisions: Division[] = [
  {
    name: "Market Intelligence",
    accentColor: "217 91% 60%",
    agents: [
      { name: "Maple", role: "Content Crawler", imageSrc: "/lovable-uploads/maple-profile.png", status: "yellow", tags: ["Content Crawling", "LG.COM", "Hero Banner"] },
      { name: "Mateo", role: "Web Crawler", imageSrc: "/lovable-uploads/mateo-profile.png", status: "yellow", tags: ["Competitor Crawling", "Product Crawling", "Trend Analysis"] },
      { name: "Rex", role: "AI Commerce & Marketing Intelligence Reporter", imageSrc: "/lovable-uploads/rex-profile.png", status: "green", isNew: true, actionUrl: "https://suno7608.github.io/ai-trend-hub/", tags: ["AI Trend", "Daily Feed", "Auto Report"] },
      { name: "Vera", role: "Global D2C Market Intelligence Analyst", imageSrc: "/lovable-uploads/vera-profile.png", status: "green", isNew: true, actionUrl: "https://suno7608.github.io/d2c-intel/", tags: ["16-Country", "VOC Sensing", "China Watch"] },
    ],
  },
  {
    name: "Content & Creative",
    accentColor: "340 100% 32%",
    agents: [
      { name: "Ben", role: "PTO Image Creator", imageSrc: "/lovable-uploads/ben-profile-v2.png", status: "green" },
      { name: "Kai", role: "Background Remover", imageSrc: "/lovable-uploads/84e535ab-1fa5-418e-93aa-73fa3b361219.png", status: "green" },
      { name: "Anita", role: "Lifestyle Artist", imageSrc: "/lovable-uploads/anita-profile.png", status: "green" },
      { name: "Yumi", role: "El-Form Designer", imageSrc: "/lovable-uploads/d004c9d6-0491-459c-8639-7730374641aa.png", status: "red" },
      { name: "Milo", role: "eCRM Designer", imageSrc: "/lovable-uploads/milo-profile.png", status: "green" },
    ],
  },
  {
    name: "Personalization & CX",
    accentColor: "173 82% 29%",
    agents: [
      { name: "Clara", role: "Personalized Content Consultant", imageSrc: "/lovable-uploads/a4614e4b-7d0d-429f-8b4c-ddc8b85ee3ad.png", status: "red" },
      { name: "Luna", role: "Personalized Marketing Expert", imageSrc: "/lovable-uploads/luna-profile.png", status: "red" },
    ],
  },
  {
    name: "Platform & Operations",
    accentColor: "215 14% 34%",
    agents: [
      { name: "Noa", role: "Product Information Manager", imageSrc: "/lovable-uploads/noa-profile.png", status: "green" },
      { name: "Candy", role: "DAM Tutor", imageSrc: "/lovable-uploads/candy-profile.png", status: "green" },
    ],
  },
];

// Crew descriptions for search
const crewDescriptions: Record<string, string> = {
  maple: "Maple crawls live content from LG.COM. Content Crawling, Hero Banner, Web Scraping.",
  mateo: "Mateo avoids repetitive manual tasks. Competitor Crawling, Product Crawling, Trend Analysis, Excel Template.",
  rex: "매일 글로벌 AI 커머스·마케팅 최신 소식을 수집하고 Daily / Weekly / Monthly 리포트를 자동 생성합니다. AI Trend, Daily Feed, Auto Report.",
  vera: "글로벌 16개국의 소비자 반응(VOC), 유통 채널 프로모션 동향, 중국 브랜드 움직임을 주간 단위로 모니터링. 16-Country, VOC Sensing, China Watch.",
  ben: "Ben creates dotcom PTO model gallery images. PTO, Gallery, Image.",
  kai: "Kai is a background removal specialist. Background Removal, Image Editing.",
  anita: "Anita is a Lifestyle Artist. Lifestyle Content, Visual Storytelling.",
  yumi: "Yumi is an EI-Form designer. El-Form, Brand Template, Design.",
  milo: "Milo is an eCRM Designer. Email Marketing, Modular Content.",
  clara: "Creates personalized images by crawling SKU data. SKU Crawling, Image Creation.",
  luna: "Creates audiences and offers in Adobe Target. Audience Automation, Natural Language.",
  noa: "Noa helps with product information from PIM. Product Catalog, Data Extract.",
  candy: "Oversees DAM user guides and tutorials. Digital Asset Management, AEM, DAM.",
};

const statusColors: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
};

const FunctionMap: React.FC<FunctionMapProps> = ({ onProfileClick, highlightName }) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const [visibleDivisions, setVisibleDivisions] = useState<Set<number>>(new Set());

  // Intersection observer for staggered entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-division-index"));
            setVisibleDivisions((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = containerRef.current?.querySelectorAll("[data-division-index]");
    sections?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Search/highlight logic
  useEffect(() => {
    const allProfiles = containerRef.current?.querySelectorAll("[data-profile-name]");
    allProfiles?.forEach((el) => {
      el.classList.remove("search-dimmed", "search-highlighted");
    });
    if (!highlightName) return;
    const term = highlightName.toLowerCase().trim();
    if (!term) return;

    let hasMatches = false;
    allProfiles?.forEach((el) => {
      const name = el.getAttribute("data-profile-name") || "";
      const roleText = el.querySelector(".agent-role")?.textContent?.toLowerCase() || "";
      const desc = crewDescriptions[name]?.toLowerCase() || "";
      const isMatch = name.includes(term) || roleText.includes(term) || desc.includes(term);
      if (isMatch) {
        el.classList.add("search-highlighted");
        hasMatches = true;
      } else {
        el.classList.add("search-dimmed");
      }
    });
    if (hasMatches) {
      containerRef.current?.querySelector(".search-highlighted")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightName]);

  const handleAgentClick = (agent: ProfileItem) => {
    if (agent.actionUrl) {
      window.open(agent.actionUrl, "_blank");
    } else {
      onProfileClick?.(agent.name);
    }
  };

  return (
    <section ref={containerRef} aria-label="Agent functions map" className="space-y-8">
      {divisions.map((division, divIdx) => (
        <div
          key={division.name}
          data-division-index={divIdx}
          className={`rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-700 ${
            visibleDivisions.has(divIdx) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: `${divIdx * 100}ms` }}
        >
          {/* Division Header */}
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{ backgroundColor: `hsl(${division.accentColor})` }}
          >
            <h3 className="text-sm font-bold text-white tracking-wide">{division.name}</h3>
            <span className="text-xs text-white/70 ml-auto">{division.agents.length} agents</span>
          </div>

          {/* Agent Grid */}
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {division.agents.map((agent, agentIdx) => (
              <div
                key={agent.name}
                data-profile-name={agent.name.toLowerCase()}
                className="group flex flex-col items-center text-center cursor-pointer rounded-xl p-3 transition-all duration-200 hover:bg-muted/50 hover:shadow-md"
                onClick={() => handleAgentClick(agent)}
                role="button"
                tabIndex={0}
                style={{
                  transitionDelay: visibleDivisions.has(divIdx) ? `${agentIdx * 60}ms` : "0ms",
                }}
              >
                {/* Profile Image */}
                <div className="relative mb-2">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden ring-2 ring-border/30 group-hover:ring-primary/30 transition-all">
                    <img
                      src={agent.imageSrc}
                      alt={`${agent.name} profile`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  {/* Status dot */}
                  <span className={`absolute bottom-0 right-0 z-10 h-4 w-4 ${statusColors[agent.status]} rounded-full border-2 border-card`} />
                  {/* NEW badge */}
                  {agent.isNew && (
                    <span className="absolute -top-1 -right-1 z-10 px-1.5 py-0.5 text-[9px] font-bold text-white bg-red-500 rounded-full animate-pulse shadow-sm">
                      NEW
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="text-xs font-semibold text-foreground">{agent.name}</div>
                <div className="agent-role text-[11px] text-muted-foreground leading-tight mt-0.5">{agent.role}</div>

                {/* Tags */}
                {agent.tags && (
                  <div className="flex flex-wrap gap-1 mt-2 justify-center">
                    {agent.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* External link indicator */}
                {agent.actionUrl && (
                  <ExternalLink className="h-3 w-3 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default FunctionMap;
