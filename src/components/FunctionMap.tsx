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

  // Crew member profiles with descriptions and personality traits
  const crewProfiles: Record<string, {
    description: string;
    personality: string;
    videoUrl?: string;
  }> = {
    "vee": {
      description: "Vee serves as the central command center for all AI agents, coordinating complex workflows and optimizing collaboration between teams.",
      personality: "Systematic and analytical, prefers solving problems from a holistic perspective."
    },
    "candy": {
      description: "Candy leads the DAM team, coordinating team members' tasks and setting overall project direction. With excellent communication skills and leadership, maximizes team efficiency.",
      personality: "Charismatic and decisive, excels at encouraging and motivating team members.",
      videoUrl: "/candy-video.mp4"
    },
    "maya": {
      description: "Maya is an account creation specialist responsible for onboarding new DAM users.",
      personality: "Meticulous and considerate, excels at accurately understanding user needs."
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
      personality: "Executes requests immediately, interested in fast and efficient design."
    },
    "ben": {
      description: "Ben creates dotcom PTO model gallery images. Generates images reflecting accurate information with consistent and stable quality.",
      personality: "Very interested in dotcom gallery image domain and continuously learning."
    },
    "pip": {
      description: "Pip is a Content QA specialist who reviews whether content is created according to Content Creation Guidelines and Brand Guidelines, and guides proper content creation direction.",
      personality: "Meticulous and careful, provides accurate feedback based on deep understanding of brand guidelines and quality standards."
    },
    "orin": {
      description: "Orin is a data crawler who collects and organizes various information from the web. Supports team decision-making by securing accurate and reliable data.",
      personality: "Meticulous and patient, values information accuracy and reliability."
    },
    "dan": {
      description: "Dan suggests optimal metadata for image-video content to ensure better exposure in search engines and internal search systems by generative AI.",
      personality: "Exploratory and curious, enjoys web surfing."
    },
    "kai": {
      description: "Kai is a background removal specialist responsible for image editing and post-processing. Creates clean and professional images with precise technical skills.",
      personality: "Highly focused and perfectionist, enjoys detailed work."
    },
    "maple": {
      description: "Maple is a feedback collection specialist who systematically gathers and analyzes colleagues' opinions.",
      personality: "Has excellent empathy, values communication, and is skilled at listening to others' opinions."
    },
    "mell": {
      description: "Mell is an email specialist who quickly and accurately delivers all final deliveries and notifications via email.",
      personality: "Doesn't always bring good news. But delivers accurate news."
    },
    "theo": {
      description: "An operations manager who supports NPI model data inquiry and analysis so that legal entity/BU managers can efficiently track NPI model progress.",
      personality: "Systematic and reliable, excels at clearly organizing and communicating complex data."
    },
    "noa": {
      description: "Noa is a copywriting specialist who writes attractive and effective text content. Creates consistent messages that reflect brand voice.",
      personality: "Fluent in languages worldwide, has excellent creative advertising copy sense."
    },
    "ava": {
      description: "Communicates smoothly with business unit managers to upload LG.com PDP in a timely manner.",
      personality: "Systematic with excellent communication skills, excels at facilitating work collaboration."
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
      title: "DAM",
      items: [{
        name: "Candy",
        role: "Team Leader & Coordinator",
        imageSrc: "/lovable-uploads/12ea1acb-6641-4e73-85ef-14b102b12d30.png"
      }, {
        name: "Maya",
        role: "Account Create",
        imageSrc: "/lovable-uploads/d67ab42c-85c8-480e-b65e-66a15abe8586.png"
      }, {
        name: "On Hiring",
        role: "Account Delete",
        imageSrc: ""
      }]
    }, {
      title: "Content",
      items: [{
        name: "Yumi",
        role: "El-Form Designer",
        imageSrc: profiles.yumi
      }, {
        name: "Ben",
        role: "PTO Image Creator",
        imageSrc: profiles.ben
      }, {
        name: "Allen",
        role: "Content QA Assistant",
        imageSrc: "/lovable-uploads/5f177a57-30d7-413c-bfc1-46dd6a011745.png"
      }, {
        name: "Ava",
        role: "PDP Manager",
        imageSrc: "/lovable-uploads/ava-profile.png"
      }]
    }, {
      title: "GEO",
      items: [{
        name: "Dan",
        role: "GEO Specialist",
        imageSrc: "/lovable-uploads/94ff046a-059b-4866-bbb8-94ce2f9e6716.png"
      }]
    }, {
      title: "On-site",
      items: [{
        name: "Clara",
        role: "On-site Specialist",
        imageSrc: "/lovable-uploads/a4614e4b-7d0d-429f-8b4c-ddc8b85ee3ad.png"
      }, {
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }]
    }]
  }, {
    name: "Platform",
    teams: [{
      title: "Promotion",
      items: [{
        name: "Boris",
        role: "Team Leader & Promotion Initiator",
        imageSrc: "/lovable-uploads/a3da050e-3de8-404c-8ab2-868f2e319ec8.png"
      }, {
        name: "Ollie",
        role: "Sales Analyst",
        imageSrc: "/lovable-uploads/a2300ba9-4de6-4adc-88fd-b80baa1bdff7.png"
      }, {
        name: "Ravi",
        role: "Promotion Configurator",
        imageSrc: "/lovable-uploads/d18ff2c4-e8c7-4c44-b38c-74bb66e23393.png"
      }]
    }, {
      title: "Operation",
      items: [{
        name: "Theo",
        role: "NPI Manager",
        imageSrc: "/lovable-uploads/a682c963-0927-4ca3-8546-707e094f3836.png"
      }]
    }, {
      title: "Analytics",
      items: [{
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }, {
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }, {
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }, {
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }]
    }]
  }, {
    name: "Data",
    teams: [{
      title: "Crawling",
      items: [{
        name: "Orin",
        role: "Data Crawler",
        imageSrc: "/lovable-uploads/1e050018-12f0-4df5-a7ae-c92735447a6d.png"
      }]
    }, {
      title: "Insight",
      items: [{
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }, {
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }]
    }]
  }, {
    name: "Business",
    teams: [{
      title: "Sales",
      items: [{
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }, {
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }]
    }, {
      title: "Strategy",
      items: [{
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }, {
        name: "On Hiring",
        role: "",
        imageSrc: ""
      }]
    }]
  }];
  const internTeam = {
    title: "Intern",
    items: [{
      name: "Kai",
      role: "Background Remover",
      imageSrc: "/lovable-uploads/84e535ab-1fa5-418e-93aa-73fa3b361219.png"
    }, {
      name: "On Hiring",
      role: "",
      imageSrc: ""
    }, {
      name: "Mell",
      role: "Mailing",
      imageSrc: "/lovable-uploads/5a6db127-b9e3-4f85-afbb-11b477555583.png"
    }, {
      name: "On Hiring",
      role: "",
      imageSrc: ""
    }]
  };
  const containerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    // Clear previous dim states
    const allProfiles = containerRef.current?.querySelectorAll('[data-profile-name]');
    allProfiles?.forEach(el => {
      el.classList.remove('search-dimmed', 'search-highlighted');
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
      
      if (profileName.includes(searchTerm) || roleText.includes(searchTerm)) {
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
                    <div className="text-sm font-semibold text-foreground">D2C Leader</div>
                    
                  </div>
                </div>
              </div>
              {/* Vertical line from D2C Leader */}
              
            </div>

            {/* Division Headers */}
            <div className="grid grid-cols-4 gap-6 mb-8 relative">
              {/* Horizontal line connecting all divisions */}
              <div className="absolute left-16 right-16 -top-4 h-0.5 bg-border"></div>
              
              {/* Vertical lines separating divisions */}
              
              
              
              
              {divisions.map((division, index) => <div key={division.name} className="text-center">
                  <h3 className="text-foreground font-semibold text-base mb-2">
                    {division.name}
                  </h3>
                  
                  {/* Division Leader */}
                  <div className="flex justify-center mb-4 pb-6">
                    <div className="flex flex-col items-center">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <div className="h-full w-full flex items-center justify-center text-white text-sm font-medium" style={{
                      backgroundColor: '#F87171'
                    }}>
                          {division.name.charAt(0)}
                        </div>
                      </div>
                      <div className="mt-1">
                        <div className="text-xs font-medium text-foreground">{division.name} Division Leader</div>
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
                                  <div className={`relative h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden ${item.name === "Candy" || item.name === "Boris" ? "border-2 border-red-500" : ""}`}>
                                    {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full flex items-center justify-center text-foreground/80 text-sm font-medium" style={{
                            backgroundColor: '#6B6B6B'
                          }}>
                                        {item.name.charAt(0)}
                                      </div>}
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
                                  <div className={`relative h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden ${item.name === "Candy" || item.name === "Boris" ? "border-2 border-red-500" : ""}`}>
                                    {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full flex items-center justify-center text-foreground/80 text-sm font-medium" style={{
                            backgroundColor: '#6B6B6B'
                          }}>
                                      </div>}
                                  </div>
                                  <div className="mt-2">
                                    <div className="text-xs font-medium text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.role.includes("&") ? item.role.split("&").map((part, index) => <div key={index}>{part.trim()}</div>) : item.role}
                                    </div>
                                  </div>
                                </div>)}
                            </div>
                          </div> : <div className="flex flex-wrap justify-center gap-3">
                             {team.items.map(item => <div key={`${team.title}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1" onMouseEnter={e => handleMouseEnter(e, item.name, item.role)} onMouseLeave={handleMouseLeave} onClick={e => {
                       e.stopPropagation();
                       onProfileClick?.(item.name);
                     }} role="button" tabIndex={0}>
                                <div className={`relative h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden ${item.name === "Candy" || item.name === "Boris" ? "border-2 border-red-500" : ""}`}>
                                  {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full flex items-center justify-center text-foreground/80 text-sm font-medium" style={{
                          backgroundColor: '#6B6B6B'
                        }}>
                                      {item.name.charAt(0)}
                                    </div>}
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

            {/* Intern Team - Independent Section */}
            <div className="pt-1">
              <div className="text-center mb-6">
                <div className="text-foreground rounded-lg px-6 py-3 font-bold text-lg inline-block">
                  {internTeam.title}
                </div>
              </div>
              <div className="bg-card border border-border/20 rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {internTeam.items.map(item => <div key={`intern-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1" onMouseEnter={e => handleMouseEnter(e, item.name, item.role, "Intern")} onMouseLeave={handleMouseLeave} onClick={e => {
                  e.stopPropagation();
                  onProfileClick?.(item.name);
                }} role="button" tabIndex={0}>
                       <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden">
                         {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full flex items-center justify-center text-foreground/80 text-sm font-medium" style={{
                      backgroundColor: '#6B6B6B'
                    }}>
                           </div>}
                       </div>
                       <div className="mt-2">
                         <div className="text-sm font-medium text-foreground">{item.name}</div>
                         {item.role && <div className="text-xs text-muted-foreground">{item.role}</div>}
                       </div>
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Popup - Text Only */}
      {hoveredProfile && <div className="fixed z-50 bg-card border border-border/20 rounded-xl p-6 shadow-xl max-w-sm animate-fade-in pointer-events-none" style={{
      left: hoverPosition.x,
      top: hoverPosition.y,
      transform: hoverPosition.x < window.innerWidth / 2 ? 'translateY(-50%)' : 'translateX(-100%) translateY(-50%)'
    }}>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm text-foreground leading-relaxed">
                <strong>Bio:</strong> {crewProfiles[hoveredProfile.name.toLowerCase()]?.description || `${hoveredProfile.name} is responsible for ${hoveredProfile.role} role.`}
              </div>
              
              {crewProfiles[hoveredProfile.name.toLowerCase()]?.personality && <div className="text-sm text-foreground leading-relaxed">
                  <strong>Personality:</strong> {crewProfiles[hoveredProfile.name.toLowerCase()].personality}
                </div>}
            </div>
          </div>
        </div>}
    </section>;
};
export default FunctionMap;