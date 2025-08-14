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

  // Crew member profiles with descriptions and personality traits
  const crewProfiles: Record<string, {description: string, personality: string, videoUrl?: string}> = {
    "vee": {
      description: "Vee는 모든 AI 에이전트들의 중앙 지휘 센터 역할을 담당합니다. 복잡한 업무 흐름을 조율하고 각 팀 간의 협업을 최적화합니다.",
      personality: "체계적이고 분석적이며, 전체적인 시각에서 문제를 해결하는 것을 선호합니다."
    },
    "candy": {
      description: "Candy는 DAM 팀의 리더로서 팀원들의 업무를 조율하고 전체적인 프로젝트 방향을 설정합니다. 뛰어난 커뮤니케이션 능력과 리더십으로 팀의 효율성을 극대화합니다.",
      personality: "카리스마가 있고 결단력이 강하며, 팀원들을 격려하고 동기부여하는 데 탁월합니다.",
      videoUrl: "/candy-video.mp4"
    },
    "maya": {
      description: "Maya는 계정 생성 전문가로서 신규 사용자 온보딩 프로세스를 담당합니다. 사용자 경험을 최우선으로 하여 원활한 계정 생성 플로우를 구축합니다.",
      personality: "섬세하고 배려심이 깊으며, 사용자의 니즈를 정확히 파악하는 데 뛰어납니다."
    },
    "fiona": {
      description: "Fiona는 계정 삭제 및 정리 업무를 전담하며, 데이터 보안과 개인정보 보호 규정을 준수하여 안전한 계정 관리를 수행합니다.",
      personality: "신중하고 완벽주의적이며, 보안과 규정 준수에 대한 강한 책임감을 가지고 있습니다."
    },
    "boris": {
      description: "Boris는 프로모션 팀의 리더로서 마케팅 캠페인을 기획하고 실행합니다. 창의적인 아이디어와 데이터 기반 접근으로 효과적인 프로모션을 만들어냅니다.",
      personality: "창의적이고 열정적이며, 새로운 아이디어를 실험하는 것을 좋아합니다."
    },
    "ollie": {
      description: "Ollie는 판매 분석 전문가로서 시장 동향과 고객 행동을 분석합니다. 데이터를 통해 비즈니스 인사이트를 도출하고 전략적 의사결정을 지원합니다.",
      personality: "논리적이고 체계적이며, 숫자와 데이터에서 의미있는 패턴을 찾아내는 데 탁월합니다."
    },
    "ravi": {
      description: "Ravi는 프로모션 구성 전문가로서 다양한 마케팅 도구와 플랫폼을 설정하고 관리합니다. 기술적 구현을 통해 마케팅 아이디어를 현실화합니다.",
      personality: "기술적 사고를 가지고 있으며, 문제 해결에 대한 강한 집중력과 인내심을 보입니다."
    },
    "yumi": {
      description: "Yumi는 EL-Form 디자이너로서 사용자 친화적인 인터페이스와 양식을 설계합니다. UX/UI 전문성을 바탕으로 직관적이고 아름다운 디자인을 만들어냅니다.",
      personality: "예술적 감각이 뛰어나고 사용자 중심적 사고를 하며, 세부사항에 대한 높은 관심을 가지고 있습니다."
    },
    "ben": {
      description: "Ben은 PTO 이미지 크리에이터로서 다양한 비주얼 콘텐츠를 제작합니다. 브랜드 아이덴티티를 반영한 창의적이고 임팩트 있는 이미지를 생성합니다.",
      personality: "상상력이 풍부하고 트렌드에 민감하며, 시각적 스토리텔링에 대한 뛰어난 감각을 가지고 있습니다."
    },
    "orin": {
      description: "Orin은 데이터 크롤러로서 웹상의 다양한 정보를 수집하고 정리합니다. 정확하고 신뢰할 수 있는 데이터를 확보하여 팀의 의사결정을 지원합니다.",
      personality: "꼼꼼하고 인내심이 강하며, 정보의 정확성과 신뢰성을 중시합니다."
    },
    "dan": {
      description: "Dan은 GEO 전문가로서 지리적 정보와 위치 기반 서비스를 담당합니다. 공간 데이터 분석을 통해 지역별 맞춤 서비스를 제공합니다.",
      personality: "탐험적이고 호기심이 많으며, 공간적 사고와 지리적 통찰력이 뛰어납니다."
    },
    "kai": {
      description: "Kai는 배경 제거 전문가로서 이미지 편집과 후처리 작업을 담당합니다. 정밀한 기술력으로 깔끔하고 전문적인 이미지를 만들어냅니다.",
      personality: "집중력이 뛰어나고 완벽주의적이며, 세밀한 작업을 좋아합니다."
    },
    "maple": {
      description: "Maple은 피드백 수집 전문가로서 고객의 의견을 체계적으로 수집하고 분석합니다. 고객의 목소리를 듣고 서비스 개선에 반영합니다.",
      personality: "공감 능력이 뛰어나고 소통을 중시하며, 다른 사람의 의견을 경청하는 데 능숙합니다."
    },
    "penny": {
      description: "Penny는 메일링 전문가로서 이메일 마케팅과 고객 커뮤니케이션을 담당합니다. 효과적인 메시지 전달을 통해 고객과의 관계를 강화합니다.",
      personality: "친근하고 따뜻하며, 명확하고 설득력 있는 커뮤니케이션을 추구합니다."
    },
    "noa": {
      description: "Noa는 카피라이팅 전문가로서 매력적이고 효과적인 텍스트 콘텐츠를 작성합니다. 브랜드 보이스를 반영한 일관성 있는 메시지를 만들어냅니다.",
      personality: "창의적이고 언어적 감각이 뛰어나며, 감정을 움직이는 글쓰기에 재능이 있습니다."
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
                 <div className="relative h-16 w-16 rounded-full overflow-hidden mb-3 ring-2 ring-primary/20 cursor-pointer" 
                   onMouseEnter={(e) => handleMouseEnter(e, "Vee", "Central Command & Orchestration")}
                   onMouseLeave={handleMouseLeave}>
                   <img src="/lovable-uploads/721071c1-63ee-4bc4-b9d8-264657716340.png" alt="Super Agent robot" className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === "vee" ? 'scale-125' : ''}`} />
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
                                     {item.imageSrc ? (
                                       <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" />
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
                             {section.items.map(item => <div key={`${group.title}-${section.subtitle}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" 
                               onMouseEnter={(e) => handleMouseEnter(e, item.name, item.role)}
                               onMouseLeave={handleMouseLeave}
                               onClick={e => {
                       e.stopPropagation();
                       onProfileClick?.(item.name);
                     }} role="button" tabIndex={0}>
                                 <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden">
                                   {item.imageSrc ? (
                                     <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" />
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
                      
                      {/* Analytics and Content Creation sections with aligned tops */}
                      <div className="grid grid-cols-2 gap-3 items-start">
                        {group.sections.filter(section => section.subtitle !== "Team Leader").map(section => <div key={section.subtitle} className="pointer-events-auto">
                            <div className="h-8 flex items-center justify-center mb-3">
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center pointer-events-none">
                                {section.subtitle}
                              </h4>
                            </div>
                            <div className="space-y-4 pointer-events-none">
                               {section.items.map(item => <div key={`${group.title}-${section.subtitle}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" 
                                 onMouseEnter={(e) => handleMouseEnter(e, item.name, item.role)}
                                 onMouseLeave={handleMouseLeave}
                                 onClick={e => {
                         e.stopPropagation();
                         onProfileClick?.(item.name);
                       }} role="button" tabIndex={0}>
                                    <div className="relative h-16 w-16 md:h-18 md:w-18 rounded-full overflow-hidden">
                                     {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
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
                       {"items" in group && group.items.map(item => <div key={`${group.title}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" 
                         onMouseEnter={(e) => handleMouseEnter(e, item.name, item.role)}
                         onMouseLeave={handleMouseLeave}
                         onClick={e => {
                    e.stopPropagation();
                    onProfileClick?.(item.name);
                  }} role="button" tabIndex={0}>
                           <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden">
                            {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
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
                      {"items" in group && group.items.map(item => <div key={`${group.title}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" 
                        onMouseEnter={(e) => handleMouseEnter(e, item.name, item.role)}
                        onMouseLeave={handleMouseLeave}
                        onClick={e => {
                    e.stopPropagation();
                    onProfileClick?.(item.name);
                  }} role="button" tabIndex={0}>
                           <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden">
                           {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
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
                     {"items" in group && group.items.map(item => <div key={`${group.title}-${item.name}`} data-profile-name={item.name.toLowerCase()} className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto" 
                       onMouseEnter={(e) => handleMouseEnter(e, item.name, item.role)}
                       onMouseLeave={handleMouseLeave}
                       onClick={e => {
                   e.stopPropagation();
                   onProfileClick?.(item.name);
                 }} role="button" tabIndex={0}>
                          <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden">
                           {item.imageSrc ? <img src={item.imageSrc} alt={`${item.name} profile image`} className={`h-full w-full object-cover transition-transform duration-300 ${hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''}`} loading="lazy" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
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
            <div className="space-y-3">
              <div className="text-sm text-foreground leading-relaxed">
                <strong>약력:</strong> {crewProfiles[hoveredProfile.name.toLowerCase()]?.description || 
                 `${hoveredProfile.name}는 ${hoveredProfile.role} 역할을 담당하고 있습니다.`}
              </div>
              
              {crewProfiles[hoveredProfile.name.toLowerCase()]?.personality && (
                <div className="text-sm text-foreground leading-relaxed">
                  <strong>성향:</strong> {crewProfiles[hoveredProfile.name.toLowerCase()].personality}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>;
};
export default FunctionMap;