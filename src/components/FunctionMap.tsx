import React, { useEffect, useRef, useState } from "react";
type ProfileMap = {
  yumi: string;
  ben: string;
};
type ProfileItem = {
  name: string;
  role: string;
  imageSrc: string;
};
type Group = {
  title: string;
  items: ProfileItem[];
} | {
  title: string;
  sections: {
    subtitle: string;
    items: ProfileItem[];
  }[];
};
type FunctionMapProps = {
  profiles: ProfileMap;
  onProfileClick?: (name: string) => void;
  highlightName?: string;
};
const FunctionMap: React.FC<FunctionMapProps> = ({
  profiles,
  onProfileClick,
  highlightName
}) => {
  const [hoveredProfile, setHoveredProfile] = useState<{
    name: string;
    role: string;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0
  });

  // Crew member profiles with descriptions, personality traits, and admin info
  const crewProfiles: Record<string, {
    description: string;
    personality: string;
    videoUrl?: string;
    admin?: { name: string; email: string };
  }> = {
    "vee": {
      description: "Vee serves as the central command center for all AI agents, coordinating complex workflows and optimizing collaboration between teams.",
      personality: "Systematic and analytical, prefers solving problems from a holistic perspective."
    },
    "fiona": {
      description: "Fiona is dedicated to account deletion and cleanup tasks, ensuring safe account management through compliance with data security and privacy regulations.",
      personality: "Cautious and perfectionist, with strong responsibility for security and compliance."
    },
    "boris": {
      description: "Boris serves as the promotion team coordinator, assisting in marketing campaign planning and connecting specialized departments.",
      personality: "Always ready to help, enjoys fast and efficient communication."
    },
    "ollie": {
      description: "Ollie is a sales analysis expert who analyzes market trends and customer behavior. Derives business insights from data and supports strategic decision-making.",
      personality: "Logical and systematic, excels at finding meaningful patterns in numbers and data."
    },
    "ravi": {
      description: "Ravi is a promotion configuration specialist who sets up and manages various marketing tools and platforms. Realizes marketing ideas through technical implementation.",
      personality: "Has technical mindset, demonstrates strong focus and patience in problem-solving."
    },
    "yumi": {
      description: "Yumi is an EI-Form designer for LG Electronics brand templates, creating clean and intuitive designs that comply with brand guidelines.",
      personality: "Executes requests immediately, interested in fast and efficient design.",
      admin: { name: "Donguk Yim", email: "donguk.yim@lge.com" }
    },
    "ben": {
      description: "Ben creates dotcom PTO model gallery images. Generates images reflecting accurate information with consistent and stable quality.",
      personality: "Very interested in dotcom gallery image domain and continuously learning.",
      admin: { name: "Donguk Yim", email: "donguk.yim@lge.com" }
    },
    "pip": {
      description: "Pip is a Content QA specialist who reviews whether content is created according to Content Creation Guidelines and Brand Guidelines, and guides proper content creation direction.",
      personality: "Meticulous and careful, provides accurate feedback based on deep understanding of brand guidelines and quality standards."
    },
    "mateo": {
      description: "Mateo avoids repetitive manual tasks. Upload an Excel template to perform crawling based on models and retailers, enabling trend analysis through competitor and own product data.",
      personality: "Competitor Crawling, Product Crawling, Data DB, Trend Analysis, Excel Template.",
      admin: { name: "Hyunsoo Park", email: "hyunsoo9.park@lge.com" }
    },
    "dan": {
      description: "Dan suggests optimal metadata for image-video content to ensure better exposure in search engines and internal search systems by generative AI.",
      personality: "Exploratory and curious, enjoys web surfing."
    },
    "kai": {
      description: "Kai is a background removal specialist responsible for image editing and post-processing. Creates clean and professional images with precise technical skills.",
      personality: "Highly focused and perfectionist, enjoys detailed work.",
      admin: { name: "Donguk Yim", email: "donguk.yim@lge.com" }
    },
    "maple": {
      description: "Maple crawls live content from LG.COM. Currently, only homepage hero banners can be viewed, but we plan to gradually expand to bring various content from different pages.",
      personality: "Meticulous and patient, excels at systematic data collection. Content Crawling, LG.COM, Hero Banner, Web Scraping.",
      admin: { name: "Donguk Yim", email: "donguk.yim@lge.com" }
    },
    "theo": {
      description: "An operations manager who supports NPI model data inquiry and analysis so that legal entity/BU managers can efficiently track NPI model progress.",
      personality: "Systematic and reliable, excels at clearly organizing and communicating complex data."
    },
    "noa": {
      description: "Noa helps with practical work based on product information from PIM (Product Information Management). Data extraction and product catalog creation are also possible.",
      personality: "Organized and detail-oriented, excels at managing complex product data. Product Catalog, Review syndication, Data extract.",
      admin: { name: "Jaeho Lee", email: "jaeho10.lee@lge.com" }
    },
    "ava": {
      description: "Checks and reports SKU-level status to ensure timely upload of LG.com PDP.",
      personality: "Systematic with excellent communication skills, excels at facilitating work collaboration. PDP Tracker, SKU status."
    },
    "luna": {
      description: "Creates audiences and offers in Adobe Target using natural language input.",
      personality: "Innovative and efficient, excels at automating complex marketing workflows. API Integration, Natural Language-Based Rule Setup, Offer in Adobe Target, Audience Automation.",
      admin: { name: "Yuseon Han", email: "yuseon.han@lge.com" }
    },
    "clara": {
      description: "Creates personalized images by crawling SKU data.",
      personality: "Creative and detail-oriented, excels at automating image production workflows. SKU Crawling, Image Creation, Image Resize, Image Combination.",
      admin: { name: "Yuseon Han", email: "yuseon.han@lge.com" }
    },
    "candy": {
      description: "Oversees DAM user guides, tutorials, and on-boarding.",
      personality: "Organized and supportive, excels at managing digital assets and guiding users. Digital Asset Management, AEM, DAM On-Boarding, DAM Guide.",
      admin: { name: "Yunju bak", email: "yunju.bak@lge.com" }
    }
  };
  const handleMouseEnter = (event: React.MouseEvent, name: string, role: string, teamTitle?: string) => {
    const rect = event.currentTarget.getBoundingClientRect();

    // For Intern team members, position popup on the left side
    const isInternMember = teamTitle === "Intern";
    setHoverPosition({
      x: isInternMember ? rect.left - 5 : rect.right + 5,
      y: rect.top + rect.height / 2
    });
    setHoveredProfile({
      name,
      role
    });
  };
  const handleMouseLeave = () => {
    setHoveredProfile(null);
  };
  // Organizational structure with divisions
  const divisions = [{
    name: "Marketing",
    teams: [{
      title: "Content Team",
      items: [{
        name: "Yumi",
        role: "El-Form Designer",
        imageSrc: profiles.yumi
      }, {
        name: "Ben",
        role: "PTO Image Creator",
        imageSrc: profiles.ben
      }, {
        name: "Maple",
        role: "Content Crawler",
        imageSrc: "/lovable-uploads/maple-profile.png"
      }, {
        name: "Ava",
        role: "PDP Manager",
        imageSrc: "/lovable-uploads/ava-profile.png"
      }, {
        name: "Kai",
        role: "Background Remover",
        imageSrc: "/lovable-uploads/84e535ab-1fa5-418e-93aa-73fa3b361219.png"
      }, {
        name: "Noa",
        role: "Product Information Manager",
        imageSrc: "/lovable-uploads/noa-profile.png"
      }, {
        name: "Candy",
        role: "DAM Product Owner",
        imageSrc: "/lovable-uploads/candy-profile.png"
      }]
    }, {
      title: "On-Site Marketing Team",
      items: [{
        name: "Clara",
        role: "Personalized Content Consultant",
        imageSrc: "/lovable-uploads/a4614e4b-7d0d-429f-8b4c-ddc8b85ee3ad.png"
      }, {
        name: "Luna",
        role: "Personalized Marketing Expert",
        imageSrc: "/lovable-uploads/luna-profile.png"
      }]
    }]
  }, {
    name: "Digital Platform",
    teams: [{
      title: "Platform Operation Team",
      items: [{
        name: "Ollie",
        role: "Sales Analyst",
        imageSrc: "/lovable-uploads/a2300ba9-4de6-4adc-88fd-b80baa1bdff7.png"
      }, {
        name: "Ravi",
        role: "Promotion Configurator",
        imageSrc: "/lovable-uploads/d18ff2c4-e8c7-4c44-b38c-74bb66e23393.png"
      }]
    }, {
      title: "Platform Development Team",
      items: [{
        name: "Theo",
        role: "NPI Manager",
        imageSrc: "/lovable-uploads/a682c963-0927-4ca3-8546-707e094f3836.png"
      }, {
        name: "Mateo",
        role: "Crawler",
        imageSrc: "/lovable-uploads/mateo-profile.png"
      }]
    }]
  }, {
    name: "Data Intelligence",
    teams: [{
      title: "Global Data Insight Team",
      items: []
    }, {
      title: "Strategy",
      items: []
    }]
  }];
  const containerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    // Clear previous dim states and highlights
    const allProfiles = containerRef.current?.querySelectorAll('[data-profile-name]');
    allProfiles?.forEach(el => {
      el.classList.remove('search-dimmed', 'search-highlighted', 'search-highlight', 'ring-2', 'ring-primary', 'bg-primary/10', 'pulse', 'bg-muted/40');
    });
    if (!highlightName) return;
    const searchTerm = highlightName.toLowerCase().trim();
    if (!searchTerm) return;

    // Find all profiles and determine matches
    const profileElements = containerRef.current?.querySelectorAll('[data-profile-name]');
    let hasMatches = false;
    profileElements?.forEach(el => {
      const profileName = el.getAttribute('data-profile-name') || '';
      const roleText = el.querySelector('.text-xs.text-muted-foreground')?.textContent?.toLowerCase() || '';

      // Get crew profile data for bio and description
      const crewData = crewProfiles[profileName];
      const description = crewData?.description?.toLowerCase() || '';
      const personality = crewData?.personality?.toLowerCase() || '';

      // Search across name, role, description, and personality
      const isMatch = profileName.includes(searchTerm) || roleText.includes(searchTerm) || description.includes(searchTerm) || personality.includes(searchTerm);
      if (isMatch) {
        // Mark as highlighted (no visual change, just for tracking)
        el.classList.add('search-highlighted');
        hasMatches = true;
      } else {
        // Dim non-matching profiles
        el.classList.add('search-dimmed');
      }
    });

    // Scroll to first match
    if (hasMatches) {
      const firstMatch = containerRef.current?.querySelector('.search-highlighted');
      if (firstMatch) {
        firstMatch.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [highlightName]);
  return <section ref={containerRef} aria-label="Agent functions map" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Super Agent as first item */}
        <div className="xl:col-span-3 md:col-span-2 bg-[hsl(var(--function-map-bg))] rounded-xl p-4">
          {/* Super Agent Section */}
          <div className="text-center mb-8">
            
            
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                 
                <div className="text-center">
                  
                  
                </div>
              </div>
            </div>
          </div>
          
          {/* Organizational Chart */}
          <div className="space-y-8">
            {/* D2C Leader */}
            <div className="text-center mb-4 relative">
              <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary">
                    <img src="/lovable-uploads/a8109d06-3cdd-4319-ae43-a6f78550e7db.png" alt="D2C Leader profile image" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-foreground">D2C Overseas Sales and Marketing Group</div>
                    
                  </div>
                </div>
              </div>
              {/* Vertical line from D2C Leader */}
              
            </div>

            {/* Division Headers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 relative">
              {/* Horizontal line connecting all divisions - hidden on mobile */}
              <div className="hidden lg:block absolute left-16 right-16 -top-4 h-0.5 bg-border"></div>
              
              {/* Vertical lines separating divisions */}
              
              
              
              
              {divisions.map((division, index) => <div key={division.name} className="text-center">
                  <h3 className="text-foreground font-semibold text-base mb-2">
                    {division.name}
                  </h3>
                  
                  {/* Division Leader */}
                  <div className="flex justify-center mb-4 pb-6">
                    <div className="flex flex-col items-center">
                      <div className="relative h-12 w-12">
                        <div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-medium" style={{
                      backgroundColor: '#F87171'
                    }}>
                          {division.name.charAt(0)}
                        </div>
                        {/* Leader Badge */}
                        <img 
                          src="/lovable-uploads/leader-badge.png" 
                          alt="Leader badge" 
                          className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border border-background"
                        />
                      </div>
                      <div className="mt-1">
                        <div className="text-xs font-medium text-foreground">Division Leader</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Teams under each division */}
                  <div className="grid gap-4">
                    {division.teams.map(team => <div key={team.title} className="bg-card rounded-xl px-1 py-2 shadow-sm">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">
                          {team.title}
                        </h4>
                        {team.title === "DAM" || team.title === "Promotion" ? <div className="space-y-3">
                            {/* First row - Candy only */}
                            <div className="flex justify-center">
                                {team.items.slice(0, 1).map(item => <div key={`${team.title}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1" onMouseEnter={e => handleMouseEnter(e, item.name, item.role)} onMouseLeave={handleMouseLeave} onClick={e => {
                        e.stopPropagation();
                        console.log('Clicked profile:', item.name);
                        onProfileClick?.(item.name);
                      }} role="button" tabIndex={0}>
                                  <div className="relative">
                                    {(item.name === "Kai" || item.name === "Noa") && (
                                      <span className="absolute -top-1 -right-1 z-10 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-md">New</span>
                                    )}
                                    <div className={`h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden ${item.name === "Boris" ? "border-2 border-red-500" : ""}`}>
                                      {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full flex items-center justify-center text-foreground/80 text-sm font-medium" style={{
                              backgroundColor: '#6B6B6B'
                            }}>
                                          {item.name.charAt(0)}
                                        </div>}
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <div className="text-xs font-medium text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.role.includes("&") ? item.role.split("&").map((part, index) => <div key={index}>{part.trim()}</div>) : item.role}
                                    </div>
                                  </div>
                                </div>)}
                            </div>
                            {/* Second row - Maya and On Hiring */}
                            <div className="flex justify-center gap-3">
                                {team.items.slice(1).map(item => <div key={`${team.title}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1" onMouseEnter={e => handleMouseEnter(e, item.name, item.role)} onMouseLeave={handleMouseLeave} onClick={e => {
                        e.stopPropagation();
                        console.log('Clicked profile:', item.name);
                        onProfileClick?.(item.name);
                      }} role="button" tabIndex={0}>
                                  <div className="relative">
                                    {(item.name === "Kai" || item.name === "Noa") && (
                                      <span className="absolute -top-1 -right-1 z-10 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-md">New</span>
                                    )}
                                    <div className={`h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden ${item.name === "Boris" ? "border-2 border-red-500" : ""}`}>
                                      {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full flex items-center justify-center text-foreground/80 text-sm font-medium" style={{
                              backgroundColor: '#6B6B6B'
                            }}>
                                        </div>}
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <div className="text-xs font-medium text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.role.includes("&") ? item.role.split("&").map((part, index) => <div key={index}>{part.trim()}</div>) : item.role}
                                    </div>
                                  </div>
                                </div>)}
                            </div>
                          </div> : <div className="grid grid-cols-2 gap-4 justify-items-center">
                             {team.items.map(item => <div key={`${team.title}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1" onMouseEnter={e => handleMouseEnter(e, item.name, item.role)} onMouseLeave={handleMouseLeave} onClick={e => {
                      e.stopPropagation();
                      onProfileClick?.(item.name);
                    }} role="button" tabIndex={0}>
                                <div className="relative">
                                  {(item.name === "Kai" || item.name === "Noa") && (
                                    <span className="absolute -top-1 -right-1 z-10 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-md">New</span>
                                  )}
                                  <div className={`h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden ${item.name === "Boris" ? "border-2 border-red-500" : ""}`}>
                                    {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full flex items-center justify-center text-foreground/80 text-sm font-medium" style={{
                            backgroundColor: '#6B6B6B'
                          }}>
                                        {item.name.charAt(0)}
                                      </div>}
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-foreground">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.role.includes("&") ? item.role.split("&").map((part, index) => <div key={index}>{part.trim()}</div>) : item.role}
                                  </div>
                                </div>
                              </div>)}
                          </div>}
                      </div>)}
                  </div>
                </div>)}
            </div>

          </div>
        </div>
      </div>

      {/* Hover Popup - Text Only - Hidden on mobile */}
      {hoveredProfile && <div className="hidden sm:block fixed z-50 bg-card border border-border/20 rounded-xl p-6 shadow-xl max-w-sm animate-fade-in pointer-events-none" style={{
      left: hoverPosition.x,
      top: hoverPosition.y,
      transform: hoverPosition.x < window.innerWidth / 2 ? 'translateY(-50%)' : 'translateX(-100%) translateY(-50%)'
    }}>
          <div className="text-sm text-foreground leading-relaxed">
            {crewProfiles[hoveredProfile.name.toLowerCase()]?.description || `${hoveredProfile.name} is responsible for ${hoveredProfile.role} role.`}
          </div>
          {crewProfiles[hoveredProfile.name.toLowerCase()]?.admin && (
            <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
              <span>Admin: {crewProfiles[hoveredProfile.name.toLowerCase()]?.admin?.name}, {crewProfiles[hoveredProfile.name.toLowerCase()]?.admin?.email}</span>
            </div>
          )}
        </div>}
    </section>;
};
export default FunctionMap;