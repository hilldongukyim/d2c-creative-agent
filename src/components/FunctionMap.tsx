import React, { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";

type ProfileMap = {
  yumi: string;
  ben: string;
};

type ProfileItem = {
  name: string;
  role: string;
  imageSrc: string;
  status: "active" | "onboarding" | "inactive";
  isNew?: boolean;
  externalUrl?: string;
  description?: string;
  tags?: string[];
};

type Team = {
  title: string;
  items: ProfileItem[];
};

type Division = {
  name: string;
  badgeLetter: string;
  accent: string;
  teams: Team[];
};

type FunctionMapProps = {
  profiles: ProfileMap;
  onProfileClick?: (name: string) => void;
  highlightName?: string;
};

// Crew member profiles with descriptions for search
const crewProfiles: Record<string, {
  description: string;
  personality: string;
}> = {
  "yumi": {
    description: "Yumi is an EI-Form designer for LG Electronics brand templates.",
    personality: "Executes requests immediately, interested in fast and efficient design."
  },
  "ben": {
    description: "Ben creates dotcom PTO model gallery images with consistent quality.",
    personality: "Very interested in dotcom gallery image domain and continuously learning."
  },
  "kai": {
    description: "Kai is a background removal specialist responsible for image editing.",
    personality: "Highly focused and perfectionist, enjoys detailed work."
  },
  "maple": {
    description: "Maple crawls live content from LG.COM.",
    personality: "Meticulous and patient, excels at systematic data collection."
  },
  "mateo": {
    description: "Mateo performs crawling based on models and retailers.",
    personality: "Competitor Crawling, Product Crawling, Data DB, Trend Analysis."
  },
  "noa": {
    description: "Noa helps with practical work based on product information from PIM.",
    personality: "Organized and detail-oriented, excels at managing complex product data."
  },
  "anita": {
    description: "Anita creates compelling lifestyle content and visual storytelling.",
    personality: "Creative and artistic, excels at capturing lifestyle moments."
  },
  "milo": {
    description: "Milo creates email content based on pre-designed layouts.",
    personality: "Detail-oriented and creative, excels at crafting email content."
  },
  "clara": {
    description: "Creates personalized images by crawling SKU data.",
    personality: "Creative and detail-oriented, excels at automating image production."
  },
  "luna": {
    description: "Creates audiences and offers in Adobe Target using natural language.",
    personality: "Innovative and efficient, excels at automating marketing workflows."
  },
  "candy": {
    description: "Oversees DAM user guides, tutorials, and on-boarding.",
    personality: "Organized and supportive, excels at managing digital assets."
  },
  "rex": {
    description: "Automatically collects global AI commerce & marketing news and generates Daily/Weekly/Monthly reports.",
    personality: "AI Trend, Daily Feed, Auto Report"
  },
  "vera": {
    description: "Monitors VOC, promotions, and Chinese brand trends across 16 countries, delivering key market insights.",
    personality: "16-Country, VOC Sensing, China Watch"
  },
};

const FunctionMap: React.FC<FunctionMapProps> = ({
  profiles,
  onProfileClick,
  highlightName,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);

  const divisions: Division[] = [
    {
      name: "Market Intelligence",
      badgeLetter: "M",
      accent: "#6B6B6B",
      teams: [{
        title: "Global Market Sensing Team",
        items: [
          {
            name: "Rex", role: "AI Commerce & Marketing Intelligence Reporter",
            imageSrc: "/lovable-uploads/crew-image-28.png", status: "active", isNew: true,
            externalUrl: "https://suno7608.github.io/ai-trend-hub/",
            description: "Automatically collects global AI commerce & marketing news and generates Daily/Weekly/Monthly reports.",
            tags: ["AI Trend", "Daily Feed", "Auto Report"],
          },
          {
            name: "Vera", role: "Global D2C Market Intelligence Analyst",
            imageSrc: "/lovable-uploads/crew-image-29.png", status: "active", isNew: true,
            externalUrl: "https://suno7608.github.io/d2c-intel/",
            description: "Monitors VOC, promotions, and Chinese brand trends across 16 countries, delivering key market insights.",
            tags: ["16-Country", "VOC Sensing", "China Watch"],
          },
        ],
      }],
    },
    {
      name: "Content & Creative",
      badgeLetter: "C",
      accent: "#6B6B6B",
      teams: [{
        title: "Creative Production Team",
        items: [
          { name: "Ben", role: "PTO Image Creator", imageSrc: profiles.ben, status: "active" },
          { name: "Kai", role: "Background Remover", imageSrc: "/lovable-uploads/84e535ab-1fa5-418e-93aa-73fa3b361219.png", status: "active" },
          { name: "Anita", role: "Lifestyle Artist", imageSrc: "/lovable-uploads/anita-profile.png", status: "active" },
          { name: "Yumi", role: "El-Form Designer", imageSrc: profiles.yumi, status: "inactive" },
          { name: "Milo", role: "eCRM Designer", imageSrc: "/lovable-uploads/milo-profile.png", status: "inactive" },
        ],
      }],
    },
    {
      name: "Personalization & CX",
      badgeLetter: "P",
      accent: "#6B6B6B",
      teams: [{
        title: "Customer Experience Team",
        items: [
          { name: "Clara", role: "Personalized Content Consultant", imageSrc: "/lovable-uploads/a4614e4b-7d0d-429f-8b4c-ddc8b85ee3ad.png", status: "inactive" },
          { name: "Luna", role: "Personalized Marketing Expert", imageSrc: "/lovable-uploads/luna-profile.png", status: "inactive" },
        ],
      }],
    },
    {
      name: "Platform & Operations",
      badgeLetter: "O",
      accent: "#6B6B6B",
      teams: [{
        title: "Platform Operations Team",
        items: [
          { name: "Noa", role: "Product Information Manager", imageSrc: "/lovable-uploads/noa-profile.png", status: "active" },
        ],
      }],
    },
  ];

  useEffect(() => {
    const allProfiles = containerRef.current?.querySelectorAll('[data-profile-name]');
    allProfiles?.forEach(el => {
      el.classList.remove('search-dimmed', 'search-highlighted');
    });
    if (!highlightName) return;
    const searchTerm = highlightName.toLowerCase().trim();
    if (!searchTerm) return;

    const profileElements = containerRef.current?.querySelectorAll('[data-profile-name]');
    let hasMatches = false;
    profileElements?.forEach(el => {
      const profileName = el.getAttribute('data-profile-name') || '';
      const roleText = el.querySelector('.text-xs.text-muted-foreground')?.textContent?.toLowerCase() || '';
      const crewData = crewProfiles[profileName];
      const description = crewData?.description?.toLowerCase() || '';
      const personality = crewData?.personality?.toLowerCase() || '';
      const isMatch = profileName.includes(searchTerm) || roleText.includes(searchTerm) || description.includes(searchTerm) || personality.includes(searchTerm);
      if (isMatch) {
        el.classList.add('search-highlighted');
        hasMatches = true;
      } else {
        el.classList.add('search-dimmed');
      }
    });

    if (hasMatches) {
      const firstMatch = containerRef.current?.querySelector('.search-highlighted');
      firstMatch?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightName]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "onboarding": return "bg-yellow-500";
      default: return "bg-red-500";
    }
  };

  const handleCardClick = (item: ProfileItem) => {
    if (item.externalUrl) {
      window.open(item.externalUrl, "_blank");
    } else {
      onProfileClick?.(item.name);
    }
  };

  const renderAgentCard = (item: ProfileItem, teamTitle: string) => (
    <div
      key={`${teamTitle}-${item.name}`}
      data-profile-name={item.name.toLowerCase()}
      className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-2 relative transition-all hover:bg-muted/30"
      onClick={(e) => { e.stopPropagation(); handleCardClick(item); }}
      role="button"
      tabIndex={0}
    >
      {/* NEW badge */}
      {item.isNew && (
        <span className="absolute -top-1 -right-1 z-20 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
          NEW
        </span>
      )}

      <div className="relative">
        <div className="h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden">
          <img
            src={item.imageSrc}
            alt={`${item.name} profile image`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <span className={`absolute bottom-0 right-0 z-10 h-3.5 w-3.5 ${getStatusColor(item.status)} rounded-full border-2 border-background`} />
      </div>

      <div className="mt-2">
        <div className="text-xs font-medium text-foreground">{item.name}</div>
        <div className="text-xs text-muted-foreground leading-tight">{item.role}</div>
      </div>

      {/* Tags for new agents */}
      {item.tags && (
        <div className="flex flex-wrap gap-1 mt-1 justify-center">
          {item.tags.map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
          ))}
        </div>
      )}

      {/* External link indicator */}
      {item.externalUrl && (
        <div className="flex items-center gap-0.5 mt-1 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Go to</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </div>
      )}
    </div>
  );

  return (
    <section ref={containerRef} aria-label="Agent functions map" className="space-y-6">
      <div className="bg-[hsl(var(--function-map-bg))] rounded-xl p-4">
        {/* Organizational Chart */}
        <div className="space-y-8">
          {/* D2C Header - Root Node */}
          <div className="text-center mb-4">
            <div className="inline-block px-6 py-3 rounded-xl bg-card shadow-sm border">
              <div className="text-lg font-semibold text-foreground">D2C Overseas Sales & Marketing Group</div>
            </div>
            {/* Vertical connector from root */}
            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-border" />
            </div>
          </div>

          {/* Horizontal connector line across divisions */}
          <div className="hidden lg:block relative mx-16">
            <div className="absolute left-0 right-0 top-0 h-0.5 bg-border" />
          </div>

          {/* Division Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {divisions.map((division) => (
              <div key={division.name} className="text-center">
                {/* Vertical connector to division */}
                <div className="hidden lg:flex justify-center -mt-6 mb-2">
                  <div className="w-0.5 h-6 bg-border" />
                </div>

                {/* Division Badge + Name */}
                <div className="flex justify-center mb-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md bg-muted-foreground"
                    >
                      {division.badgeLetter}
                    </div>
                    <div className="mt-1.5">
                      <div className="text-sm font-semibold text-foreground">{division.name}</div>
                    </div>
                  </div>
                </div>

                {/* Vertical connector to team */}
                <div className="flex justify-center mb-2">
                  <div className="w-0.5 h-4 bg-border" />
                </div>

                {/* Teams */}
                {division.teams.map((team) => (
                  <div key={team.title} className="bg-card rounded-xl px-2 py-3 shadow-sm">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">
                      {team.title}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 justify-items-center">
                      {team.items.map((item) => renderAgentCard(item, team.title))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FunctionMap;
