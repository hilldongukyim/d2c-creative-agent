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
      description: "Vee는 모든 AI 에이전트들의 중앙 지휘 센터 역할을 담당합니다. 복잡한 업무 흐름을 조율하고 각 팀 간의 협업을 최적화합니다.",
      personality: "체계적이고 분석적이며, 전체적인 시각에서 문제를 해결하는 것을 선호합니다."
    },
    "candy": {
      description: "Candy는 DAM 팀의 리더로서 팀원들의 업무를 조율하고 전체적인 프로젝트 방향을 설정합니다. 뛰어난 커뮤니케이션 능력과 리더십으로 팀의 효율성을 극대화합니다.",
      personality: "카리스마가 있고 결단력이 강하며, 팀원들을 격려하고 동기부여하는 데 탁월합니다.",
      videoUrl: "/candy-video.mp4"
    },
    "maya": {
      description: "Maya는 계정 생성 전문가로서 신규 DAM 사용자 온보딩 프로세스를 담당합니다.",
      personality: "섬세하고 배려심이 깊으며, 사용자의 니즈를 정확히 파악하는 데 뛰어납니다."
    },
    "fiona": {
      description: "Fiona는 계정 삭제 및 정리 업무를 전담하며, 데이터 보안과 개인정보 보호 규정을 준수하여 안전한 계정 관리를 수행합니다.",
      personality: "신중하고 완벽주의적이며, 보안과 규정 준수에 대한 강한 책임감을 가지고 있습니다."
    },
    "boris": {
      description: "Boris는 프로모션 팀의 코디네이터로서 마케팅 캠페인 기획을 도우며, 전문화된 유관부서들을 연결시켜줍니다.",
      personality: "언제나 돕고자 하는 자세로, 신속하고 효율적인 커뮤니케이션을 좋아합니다."
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
      description: "Yumi는 LG전자 브랜드 템플릿인 EI-Form 디자이너로서, 브랜드 가이드라인을 준수하는 깔끔하면서 직관적인 디자인을 만들어냅니다.",
      personality: "요청 즉시 실행하며, 빠르고 효율적인 디자인에 관심을 가지고 있습니다."
    },
    "ben": {
      description: "Ben은 닷컴 PTO모델 갤러리 이미지를 제작합니다. 일관되면서 안정적인 퀄리티로 올바른 정보를 반영한 이미지를 생성합니다.",
      personality: "닷컴 갤러리 이미지 영역에 대해서 관심이 많으며, 지속적으로 학습중입니다."
    },
    "orin": {
      description: "Orin은 데이터 크롤러로서 웹상의 다양한 정보를 수집하고 정리합니다. 정확하고 신뢰할 수 있는 데이터를 확보하여 팀의 의사결정을 지원합니다.",
      personality: "꼼꼼하고 인내심이 강하며, 정보의 정확성과 신뢰성을 중시합니다."
    },
    "dan": {
      description: "Dan은 생성형AI가 검색 엔진이나 내부 검색 시슽메에서 더 잘 노출될 수 있도록, 이미지-비디오 컨텐츠의 최적의 메타정보를 제안합니다.",
      personality: "탐험적이고 호기심이 많으며, 웹서핑을 즐겨합니다."
    },
    "kai": {
      description: "Kai는 배경 제거 전문가로서 이미지 편집과 후처리 작업을 담당합니다. 정밀한 기술력으로 깔끔하고 전문적인 이미지를 만들어냅니다.",
      personality: "집중력이 뛰어나고 완벽주의적이며, 세밀한 작업을 좋아합니다."
    },
    "maple": {
      description: "Maple은 피드백 수집 전문가로서 동료들의 의견을 체계적으로 수집하고 분석합니다.",
      personality: "공감 능력이 뛰어나고 소통을 중시하며, 다른 사람의 의견을 경청하는 데 능숙합니다."
    },
    "mell": {
      description: "Mell은 메일링 전문가로서 이메일로 모든 최종 딜리버리 및 안내 사항을 신속하고 정확하게 전달합니다.",
      personality: "꼭 좋은 소식만 가져오진 않습니다. 그래도 정확한 소식을 들려줍니다."
    },
    "noa": {
      description: "Noa는 카피라이팅 전문가로서 매력적이고 효과적인 텍스트 콘텐츠를 작성합니다. 브랜드 보이스를 반영한 일관성 있는 메시지를 만들어냅니다.",
      personality: "전세계 언어에 능통하며, 창의적인 광고 카피 감각이 뛰어납니다."
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
  const divisions = [
    {
      name: "Marketing",
      teams: [
        {
          title: "DAM",
          items: [
            {
              name: "Candy",
              role: "Team Leader & Coordinator",
              imageSrc: "/lovable-uploads/12ea1acb-6641-4e73-85ef-14b102b12d30.png"
            },
            {
              name: "Maya",
              role: "Account Create",
              imageSrc: "/lovable-uploads/d67ab42c-85c8-480e-b65e-66a15abe8586.png"
            },
            {
              name: "On Hiring",
              role: "Account Delete",
              imageSrc: ""
            }
          ]
        },
        {
          title: "Content",
          items: [
            {
              name: "Yumi",
              role: "El-Form Designer",
              imageSrc: profiles.yumi
            },
            {
              name: "Ben",
              role: "PTO Image Creator",
              imageSrc: profiles.ben
            }
          ]
        },
        {
          title: "GEO",
          items: [
            {
              name: "Dan",
              role: "GEO Specialist",
              imageSrc: "/lovable-uploads/94ff046a-059b-4866-bbb8-94ce2f9e6716.png"
            }
          ]
        }
      ]
    },
    {
      name: "Platform",
      teams: [
        {
          title: "Platform Team",
          items: [
            {
              name: "Boris",
              role: "Team Leader & Promotion Initiator",
              imageSrc: "/lovable-uploads/a3da050e-3de8-404c-8ab2-868f2e319ec8.png"
            },
            {
              name: "Ollie",
              role: "Sales Analyst",
              imageSrc: "/lovable-uploads/a2300ba9-4de6-4adc-88fd-b80baa1bdff7.png"
            },
            {
              name: "Ravi",
              role: "Promotion Configurator",
              imageSrc: "/lovable-uploads/d18ff2c4-e8c7-4c44-b38c-74bb66e23393.png"
            }
          ]
        }
      ]
    },
    {
      name: "Data",
      teams: [
        {
          title: "Data Team",
          items: [
            {
              name: "Orin",
              role: "Data Crawler",
              imageSrc: "/lovable-uploads/1e050018-12f0-4df5-a7ae-c92735447a6d.png"
            }
          ]
        }
      ]
    }
  ];

  const internTeam = {
    title: "Intern",
    items: [
      {
        name: "Kai",
        role: "Background Remover",
        imageSrc: "/lovable-uploads/84e535ab-1fa5-418e-93aa-73fa3b361219.png"
      },
      {
        name: "Maple",
        role: "Feedback Taker",
        imageSrc: "/lovable-uploads/5c13c299-f9c2-46a9-9b91-4695964179a5.png"
      },
      {
        name: "Mell",
        role: "Mailing",
        imageSrc: "/lovable-uploads/5a6db127-b9e3-4f85-afbb-11b477555583.png"
      },
      {
        name: "Noa",
        role: "Copy Writing",
        imageSrc: "/lovable-uploads/0fbe5af8-19f4-4ff0-8c9f-3f1a2c010572.png"
      }
    ]
  };
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
                 
                <div className="text-center">
                  
                  
                </div>
              </div>
            </div>
          </div>
          
          {/* Organizational Chart */}
          <div className="space-y-8">
            {/* Division Headers */}
            <div className="grid grid-cols-3 gap-8 mb-8">
              {divisions.map(division => (
                <div key={division.name} className="text-center">
                  <h3 className="text-foreground font-semibold text-base mb-6">
                    {division.name}
                  </h3>
                  
                  {/* Teams under each division */}
                  <div className="grid gap-4">
                    {division.teams.map(team => (
                      <div key={team.title} className="bg-card border-2 border-border rounded-xl p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">
                          {team.title}
                        </h4>
                        {team.title === "DAM" ? (
                          <div className="space-y-3">
                            {/* First row - Candy only */}
                            <div className="flex justify-center">
                              {team.items.slice(0, 1).map(item => (
                                <div
                                  key={`${team.title}-${item.name}`}
                                  data-profile-name={item.name.toLowerCase()}
                                  className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1"
                                  onMouseEnter={e => handleMouseEnter(e, item.name, item.role)}
                                  onMouseLeave={handleMouseLeave}
                                  onClick={e => {
                                    e.stopPropagation();
                                    onProfileClick?.(item.name);
                                  }}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <div className={`relative h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden ${item.name === "Candy" || item.name === "Boris" ? "border-2 border-red-500" : ""}`}>
                                    {item.imageSrc ? (
                                      <img
                                        src={item.imageSrc}
                                        alt={`${item.name} profile image`}
                                        className={`h-full w-full object-cover transition-transform duration-300 ${
                                          hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''
                                        }`}
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-foreground/80 text-sm font-medium" style={{ backgroundColor: '#6B6B6B' }}>
                                        {item.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    <div className="text-xs font-medium text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.role.includes("&") ? (
                                        item.role.split("&").map((part, index) => (
                                          <div key={index}>{part.trim()}</div>
                                        ))
                                      ) : (
                                        item.role
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Second row - Maya and On Hiring */}
                            <div className="flex justify-center gap-3">
                              {team.items.slice(1).map(item => (
                                <div
                                  key={`${team.title}-${item.name}`}
                                  data-profile-name={item.name.toLowerCase()}
                                  className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1"
                                  onMouseEnter={e => handleMouseEnter(e, item.name, item.role)}
                                  onMouseLeave={handleMouseLeave}
                                  onClick={e => {
                                    e.stopPropagation();
                                    onProfileClick?.(item.name);
                                  }}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <div className={`relative h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden ${item.name === "Candy" || item.name === "Boris" ? "border-2 border-red-500" : ""}`}>
                                    {item.imageSrc ? (
                                      <img
                                        src={item.imageSrc}
                                        alt={`${item.name} profile image`}
                                        className={`h-full w-full object-cover transition-transform duration-300 ${
                                          hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''
                                        }`}
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-foreground/80 text-sm font-medium" style={{ backgroundColor: '#6B6B6B' }}>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    <div className="text-xs font-medium text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.role.includes("&") ? (
                                        item.role.split("&").map((part, index) => (
                                          <div key={index}>{part.trim()}</div>
                                        ))
                                      ) : (
                                        item.role
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap justify-center gap-3">
                            {team.items.map(item => (
                              <div
                                key={`${team.title}-${item.name}`}
                                data-profile-name={item.name.toLowerCase()}
                                className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1"
                                onMouseEnter={e => handleMouseEnter(e, item.name, item.role)}
                                onMouseLeave={handleMouseLeave}
                                onClick={e => {
                                  e.stopPropagation();
                                  onProfileClick?.(item.name);
                                }}
                                role="button"
                                tabIndex={0}
                              >
                                <div className={`relative h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden ${item.name === "Candy" || item.name === "Boris" ? "border-2 border-red-500" : ""}`}>
                                  {item.imageSrc ? (
                                    <img
                                      src={item.imageSrc}
                                      alt={`${item.name} profile image`}
                                      className={`h-full w-full object-cover transition-transform duration-300 ${
                                        hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''
                                      }`}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-foreground/80 text-sm font-medium" style={{ backgroundColor: '#6B6B6B' }}>
                                      {item.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-foreground">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.role.includes("&") ? (
                                      item.role.split("&").map((part, index) => (
                                        <div key={index}>{part.trim()}</div>
                                      ))
                                    ) : (
                                      item.role
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Intern Team - Independent Section */}
            <div className="border-t pt-8">
              <div className="text-center mb-6">
                <div className="text-foreground rounded-lg px-6 py-3 font-bold text-lg inline-block">
                  {internTeam.title}
                </div>
              </div>
              <div className="bg-card border border-border/20 rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {internTeam.items.map(item => (
                    <div
                      key={`intern-${item.name}`}
                      data-profile-name={item.name.toLowerCase()}
                      className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1"
                      onMouseEnter={e => handleMouseEnter(e, item.name, item.role, "Intern")}
                      onMouseLeave={handleMouseLeave}
                      onClick={e => {
                        e.stopPropagation();
                        onProfileClick?.(item.name);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden">
                        <img
                          src={item.imageSrc}
                          alt={`${item.name} profile image`}
                          className={`h-full w-full object-cover transition-transform duration-300 ${
                            hoveredProfile?.name.toLowerCase() === item.name.toLowerCase() ? 'scale-125' : ''
                          }`}
                          loading="lazy"
                        />
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.role}</div>
                      </div>
                    </div>
                  ))}
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
                <strong>약력:</strong> {crewProfiles[hoveredProfile.name.toLowerCase()]?.description || `${hoveredProfile.name}는 ${hoveredProfile.role} 역할을 담당하고 있습니다.`}
              </div>
              
              {crewProfiles[hoveredProfile.name.toLowerCase()]?.personality && <div className="text-sm text-foreground leading-relaxed">
                  <strong>성향:</strong> {crewProfiles[hoveredProfile.name.toLowerCase()].personality}
                </div>}
            </div>
          </div>
        </div>}
    </section>;
};
export default FunctionMap;