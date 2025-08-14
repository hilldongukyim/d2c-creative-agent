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
  const [hoveredProfile, setHoveredProfile] = useState<{name: string, role: string} | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{x: number, y: number}>({x: 0, y: 0});

  // Crew member profiles with descriptions and video URLs
  const crewProfiles: Record<string, {description: string, videoUrl?: string}> = {
    "candy": {
      description: "Candy는 DAM 팀의 리더로서 팀원들의 업무를 조율하고 전체적인 프로젝트 방향을 설정합니다. 뛰어난 커뮤니케이션 능력과 리더십으로 팀의 효율성을 극대화합니다.",
      videoUrl: "/crew-video-1.mp4"
    },
    "maya": {
      description: "Maya는 계정 생성 전문가로서 신규 사용자 온보딩 프로세스를 담당합니다. 사용자 경험을 최우선으로 하여 원활한 계정 생성 플로우를 구축합니다.",
      videoUrl: "/crew-video-2.mp4"
    },
    "fiona": {
      description: "Fiona는 계정 삭제 및 정리 업무를 전담하며, 데이터 보안과 개인정보 보호 규정을 준수하여 안전한 계정 관리를 수행합니다.",
      videoUrl: "/crew-video-3.mp4"
    }
  };

  const handleMouseEnter = (event: React.MouseEvent, name: string, role: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setHoveredProfile({name, role});
  };

  const handleMouseLeave = () => {
    setHoveredProfile(null);
  };
  const groups: Group[] = [{
    title: "DAM",
    sections: [{
      subtitle: "Team Leader",
      items: [{
        name: "Candy",
        role: "Team Leader & Coordinator",
        imageSrc: "/lovable-uploads/12ea1acb-6641-4e73-85ef-14b102b12d30.png"
      }]
    }, {
      subtitle: "Team Members",
      items: [{
        name: "Maya",
        role: "Account Create",
        imageSrc: "/lovable-uploads/d67ab42c-85c8-480e-b65e-66a15abe8586.png"
      }, {
        name: "Fiona",
        role: "Account Delete",
        imageSrc: "/lovable-uploads/f3264e74-893f-4cb0-9ec7-91b84b56c631.png"
      }]
    }]
  }, {
    title: "Promotion",
    sections: [{
      subtitle: "Team Leader",
      items: [{
        name: "Boris",
        role: "Team Leader & Promotion Initiator",
        imageSrc: "/lovable-uploads/a3da050e-3de8-404c-8ab2-868f2e319ec8.png"
      }]
    }, {
      subtitle: "Analytics",
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
      subtitle: "Content Creation",
      items: [{
        name: "Yumi",
        role: "El-Form Designer",
        imageSrc: profiles.yumi
      }, {
        name: "Ben",
        role: "PTO Image Creator",
        imageSrc: profiles.ben
      }]
    }]
  }, {
    title: "Data",
    items: [{
      name: "Orin",
      role: "Data Crawler",
      imageSrc: "/lovable-uploads/1e050018-12f0-4df5-a7ae-c92735447a6d.png"
    }]
  }, {
    title: "GEO",
    items: [{
      name: "Dan",
      role: "GEO Specialist",
      imageSrc: "/lovable-uploads/94ff046a-059b-4866-bbb8-94ce2f9e6716.png"
    }]
  }, {
    title: "Intern",
    items: [{
      name: "Kai",
      role: "Background Remover",
      imageSrc: "/lovable-uploads/84e535ab-1fa5-418e-93aa-73fa3b361219.png"
    }, {
      name: "Maple",
      role: "Feedback Taker",
      imageSrc: "/lovable-uploads/5c13c299-f9c2-46a9-9b91-4695964179a5.png"
    }, {
      name: "Penny",
      role: "Mailing",
      imageSrc: "/lovable-uploads/5a6db127-b9e3-4f85-afbb-11b477555583.png"
    }, {
      name: "Noa",
      role: "Copy Writing",
      imageSrc: "/lovable-uploads/0fbe5af8-19f4-4ff0-8c9f-3f1a2c010572.png"
    }]
  }];
  const containerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!highlightName) return;
    const selector = `[data-profile-name="${highlightName.toLowerCase()}"]`;
    const el = containerRef.current?.querySelector(selector);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      el.classList.add('pulse', 'bg-muted/40');
      window.setTimeout(() => {
        el.classList.remove('pulse', 'bg-muted/40');
      }, 1500);
    }
  }, [highlightName]);
  return <section ref={containerRef} aria-label="Agent functions map" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Super Agent as first item */}
        <div className="xl:col-span-3 md:col-span-2 bg-[hsl(var(--function-map-bg))] rounded-xl p-6">
          {/* Super Agent Section */}
          <div className="text-center mb-8">
            
            
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="relative h-16 w-16 rounded-full overflow-hidden mb-3 ring-2 ring-primary/20">
                  <img src="/lovable-uploads/721071c1-63ee-4bc4-b9d8-264657716340.png" alt="Super Agent robot" className="h-full w-full object-cover" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground mb-1">Vee</div>
                  <div className="text-xs text-muted-foreground">Central Command & Orchestration</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Teams Section */}
          <div className="space-y-4">
            {/* Top row: DAM, Promotion, GEO, Intern (4 columns as in image) */}
            <div className="grid gap-4 grid-cols-4">
              {/* DAM Team */}
              {groups.filter(group => group.title === "DAM").map(group => <div key={group.title} className="bg-card border border-border/20 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow pointer-events-auto h-[600px]">
                  <header className="mb-4 pointer-events-none">
                    <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                  </header>
                  {"sections" in group && <>
                      {group.sections.map(section => <div key={section.subtitle} className="mb-5 last:mb-0 pointer-events-auto">
                           <div className={section.subtitle === "Team Leader" ? "flex justify-center pointer-events-none mb-6" : "flex flex-col gap-4 pointer-events-none"}>
                             {section.items.map(item => <div key={`${group.title}-${section.subtitle}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" 
                               onMouseEnter={(e) => handleMouseEnter(e, item.name, item.role)}
                               onMouseLeave={handleMouseLeave}
                               onClick={e => {
                       e.stopPropagation();
                       onProfileClick?.(item.name);
                     }} role="button" tabIndex={0}>
                                   <div className={`relative ${section.subtitle === "Team Leader" ? "h-20 w-20 md:h-24 md:w-24" : "h-14 w-14 md:h-16 md:w-16"} rounded-full overflow-hidden`}>
                                    {hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() && crewProfiles[item.name.toLowerCase()]?.videoUrl ? (
                                      <video 
                                        src={crewProfiles[item.name.toLowerCase()].videoUrl} 
                                        autoPlay 
                                        loop 
                                        muted 
                                        className="h-full w-full object-cover"
                                      />
                                    ) : item.imageSrc ? (
                                      <img src={item.imageSrc} alt={`${item.name} profile image`} className="h-full w-full object-cover transition-transform duration-300" loading="lazy" />
                                    ) : (
                                      <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
                                        {item.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    <div className="text-sm font-medium text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.role.includes("&") ? item.role.split("&").map((part, index) => <div key={index}>{part.trim()}</div>) : item.role}
                                    </div>
                                  </div>
                               </div>)}
                          </div>
                        </div>)}
                    </>}
                 </div>)}

              {/* Promotion Team */}
              {groups.filter(group => group.title === "Promotion").map(group => <div key={group.title} className="bg-card border border-border/20 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow pointer-events-auto h-[600px]">
                  <header className="mb-4 pointer-events-none">
                    <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                  </header>
                  {"sections" in group && <>
                      {/* Team Leader section first */}
                      {group.sections.filter(section => section.subtitle === "Team Leader").map(section => <div key={section.subtitle} className="mb-6 pointer-events-auto">
                          <div className="flex justify-center pointer-events-none">
                            {section.items.map(item => <div key={`${group.title}-${section.subtitle}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" onClick={e => {
                      e.stopPropagation();
                      onProfileClick?.(item.name);
                    }} role="button" tabIndex={0}>
                                <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden">
                                  {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
                                      {item.name.charAt(0)}
                                    </div>}
                                </div>
                                 <div className="mt-2">
                                   <div className="text-sm font-medium text-foreground">{item.name}</div>
                                   <div className="text-xs text-muted-foreground">
                                     {item.role.includes("&") ? item.role.split("&").map((part, index) => <div key={index}>{part.trim()}</div>) : item.role}
                                   </div>
                                 </div>
                              </div>)}
                          </div>
                        </div>)}
                      
                      {/* Analytics and Content Creation sections with aligned tops */}
                      <div className="grid grid-cols-2 gap-3 items-start">
                        {group.sections.filter(section => section.subtitle !== "Team Leader").map(section => <div key={section.subtitle} className="pointer-events-auto">
                            <div className="h-8 flex items-center justify-center mb-3">
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center pointer-events-none">
                                {section.subtitle}
                              </h4>
                            </div>
                            <div className="space-y-4 pointer-events-none">
                              {section.items.map(item => <div key={`${group.title}-${section.subtitle}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" onClick={e => {
                        e.stopPropagation();
                        onProfileClick?.(item.name);
                      }} role="button" tabIndex={0}>
                                   <div className="relative h-16 w-16 md:h-18 md:w-18 rounded-full overflow-hidden">
                                    {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
                                        {item.name.charAt(0)}
                                      </div>}
                                  </div>
                                   <div className="mt-2">
                                     <div className="text-sm font-medium text-foreground">{item.name}</div>
                                     <div className="text-xs text-muted-foreground">{item.role}</div>
                                   </div>
                                </div>)}
                            </div>
                          </div>)}
                      </div>
                    </>}
                 </div>)}

              {/* GEO and Data Teams in one column */}
              <div className="space-y-4">
                {/* GEO Team */}
                {groups.filter(group => group.title === "GEO").map(group => <div key={group.title} className="bg-card border border-border/20 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow pointer-events-auto h-[290px]">
                    <header className="mb-4 pointer-events-none">
                      <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                    </header>
                    <div className="flex justify-center pointer-events-none">
                      {"items" in group && group.items.map(item => <div key={`${group.title}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" onClick={e => {
                    e.stopPropagation();
                    onProfileClick?.(item.name);
                  }} role="button" tabIndex={0}>
                           <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden">
                            {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
                                {item.name.charAt(0)}
                              </div>}
                          </div>
                           <div className="mt-2">
                             <div className="text-sm font-medium text-foreground">{item.name}</div>
                             <div className="text-xs text-muted-foreground">{item.role}</div>
                           </div>
                        </div>)}
                    </div>
                  </div>)}

                {/* Data Team */}
                {groups.filter(group => group.title === "Data").map(group => <div key={group.title} className="bg-card border border-border/20 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow pointer-events-auto h-[295px]">
                    <header className="mb-4 pointer-events-none">
                      <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                    </header>
                    <div className="flex justify-center pointer-events-none">
                      {"items" in group && group.items.map(item => <div key={`${group.title}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" onClick={e => {
                    e.stopPropagation();
                    onProfileClick?.(item.name);
                  }} role="button" tabIndex={0}>
                           <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden">
                            {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
                                {item.name.charAt(0)}
                              </div>}
                          </div>
                           <div className="mt-2">
                             <div className="text-sm font-medium text-foreground">{item.name}</div>
                             <div className="text-xs text-muted-foreground">{item.role}</div>
                           </div>
                        </div>)}
                    </div>
                  </div>)}
              </div>

              {/* Intern Team */}
              {groups.filter(group => group.title === "Intern").map(group => <div key={group.title} className="bg-card border border-border/20 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow pointer-events-auto h-[600px]">
                  <header className="mb-4 pointer-events-none text-center">
                    <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                  </header>
                  <div className="grid grid-cols-2 gap-3 pointer-events-none">
                    {"items" in group && group.items.map(item => <div key={`${group.title}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" onClick={e => {
                  e.stopPropagation();
                  onProfileClick?.(item.name);
                }} role="button" tabIndex={0}>
                         <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden">
                          {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
                              {item.name.charAt(0)}
                            </div>}
                        </div>
                         <div className="mt-2">
                           <div className="text-sm font-medium text-foreground">{item.name}</div>
                           <div className="text-xs text-muted-foreground">{item.role}</div>
                         </div>
                      </div>)}
                  </div>
                </div>)}
            </div>

          </div>
        </div>
      </div>

      {/* Hover Popup - Text Only */}
      {hoveredProfile && (
        <div 
          className="fixed z-50 bg-card border border-border/20 rounded-xl p-6 shadow-xl max-w-sm animate-fade-in pointer-events-none"
          style={{
            left: hoverPosition.x,
            top: hoverPosition.y,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-foreground">{hoveredProfile.name}</h4>
              <p className="text-sm text-muted-foreground">{hoveredProfile.role}</p>
            </div>
            
            <div className="text-sm text-foreground leading-relaxed">
              {crewProfiles[hoveredProfile.name.toLowerCase()]?.description || 
               `${hoveredProfile.name}는 ${hoveredProfile.role} 역할을 담당하고 있습니다.`}
            </div>
          </div>
        </div>
      )}
    </section>;
};
export default FunctionMap;