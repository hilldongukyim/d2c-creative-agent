import { CREW_DATA } from "@/data/crewData";
import React, { useEffect, useRef } from "react";

type ProfileItem = {
  name: string;
  role: string;
  imageSrc: string;
  status: "active" | "onboarding" | "inactive";
  isNew?: boolean;
  isUpgraded?: boolean;
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
  onProfileClick?: (name: string) => void;
  highlightName?: string;
};

const FunctionMap: React.FC<FunctionMapProps> = ({
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
            imageSrc: CREW_DATA.rex.image, status: "active",
          },
          {
            name: "Vera", role: "Global D2C Market Intelligence Analyst",
            imageSrc: CREW_DATA.vera.image, status: "active",
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
          { name: "Ben", role: CREW_DATA.ben.role, imageSrc: CREW_DATA.ben.image, status: "active", isUpgraded: true },
          
          { name: "Anita", role: CREW_DATA.anita.role, imageSrc: CREW_DATA.anita.image, status: "active", isUpgraded: true },
          { name: "Yumi", role: CREW_DATA.yumi.role, imageSrc: CREW_DATA.yumi.image, status: "active", isNew: true },
          { name: "Milo", role: CREW_DATA.milo.role, imageSrc: CREW_DATA.milo.image, status: "active", isNew: true },
        ],
      }, {
        title: "Content Infrastructure & Data Team",
        items: [
          { name: "Noa", role: CREW_DATA.noa.role, imageSrc: CREW_DATA.noa.image, status: "active" },
        ],
      }],
    },
    {
      name: "Personalization",
      badgeLetter: "P",
      accent: "#6B6B6B",
      teams: [{
        title: "Onsite Marketing Team",
        items: [
          { name: "Luna", role: CREW_DATA.luna.role, imageSrc: CREW_DATA.luna.image, status: "inactive" },
          { name: "Clara", role: CREW_DATA.clara.role, imageSrc: CREW_DATA.clara.image, status: "inactive" },
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
      const crewData = CREW_DATA[profileName];
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
    onProfileClick?.(item.name);
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
        <span className="absolute -top-1 -left-1 z-20 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
          NEW
        </span>
      )}
      {/* Upgraded badge */}
      {item.isUpgraded && (
        <span className="absolute -top-1 -left-1 z-20 px-1.5 py-0.5 text-[10px] font-bold text-white bg-green-500 rounded-full">
          Upgraded
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

    </div>
  );

  return (
    <section ref={containerRef} aria-label="Agent functions map" className="space-y-6">
      <div className="bg-[hsl(var(--function-map-bg))] rounded-xl p-4">
        {/* Organizational Chart */}
        <div className="space-y-6">
          {/* Division Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {divisions.map((division) => (
              <div key={division.name} className="text-center">
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
                <div className="space-y-3">
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
              </div>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
};

export default FunctionMap;
