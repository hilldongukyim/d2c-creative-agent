import React, { useEffect, useRef } from "react";

type ProfileMap = { yumi: string; ben: string };

type ProfileItem = { name: string; role: string; imageSrc: string };
type Group =
  | { title: string; items: ProfileItem[] }
  | { title: string; sections: { subtitle: string; items: ProfileItem[] }[] };

type FunctionMapProps = {
  profiles: ProfileMap;
  onProfileClick?: (name: string) => void;
  highlightName?: string;
};

const FunctionMap: React.FC<FunctionMapProps> = ({ profiles, onProfileClick, highlightName }) => {
  const groups: Group[] = [
    {
      title: "DAM",
      sections: [
        {
          subtitle: "Team Leader",
          items: [
            { name: "Candy", role: "Team Leader & Coordinator", imageSrc: "/lovable-uploads/12ea1acb-6641-4e73-85ef-14b102b12d30.png" },
          ],
        },
        {
          subtitle: "Team Members",
          items: [
            { name: "Maya", role: "Account Create", imageSrc: "/lovable-uploads/d67ab42c-85c8-480e-b65e-66a15abe8586.png" },
            { name: "Fiona", role: "Communication", imageSrc: "/lovable-uploads/f3264e74-893f-4cb0-9ec7-91b84b56c631.png" },
          ],
        },
      ],
    },
    {
      title: "Promotion",
      sections: [
        {
          subtitle: "Team Leader",
          items: [
            { name: "Boris", role: "Team Leader & Promotion Initiator", imageSrc: "/lovable-uploads/a3da050e-3de8-404c-8ab2-868f2e319ec8.png" },
          ],
        },
        {
          subtitle: "Analytics",
          items: [
            { name: "Ollie", role: "Sales Analyst", imageSrc: "/lovable-uploads/a2300ba9-4de6-4adc-88fd-b80baa1bdff7.png" },
            { name: "Ravi", role: "Promotion Configurator", imageSrc: "/lovable-uploads/d18ff2c4-e8c7-4c44-b38c-74bb66e23393.png" },
          ],
        },
        {
          subtitle: "Content Creation",
          items: [
            { name: "Yumi", role: "El-Form Designer", imageSrc: profiles.yumi },
            { name: "Ben", role: "PTO Image Creator", imageSrc: profiles.ben },
            { name: "Fern", role: "Other Variation", imageSrc: "/lovable-uploads/66fb2463-85b8-437c-9a16-afdb1c8b3861.png" },
            { name: "Pip", role: "Designer", imageSrc: "/lovable-uploads/cf830101-de14-48d2-a5f5-23a3f692a0f0.png" },
          ],
        },
      ],
    },
     {
       title: "Intern",
       items: [
         { name: "Kai", role: "Background Remover", imageSrc: "/lovable-uploads/84e535ab-1fa5-418e-93aa-73fa3b361219.png" },
         { name: "Maple", role: "Feedback Taker", imageSrc: "/lovable-uploads/5c13c299-f9c2-46a9-9b91-4695964179a5.png" },
         { name: "Penny", role: "Mailing", imageSrc: "/lovable-uploads/5a6db127-b9e3-4f85-afbb-11b477555583.png" },
         { name: "Noa", role: "Copy Writing", imageSrc: "/lovable-uploads/0fbe5af8-19f4-4ff0-8c9f-3f1a2c010572.png" },
       ],
    },
  ];

  const containerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!highlightName) return;
    const selector = `[data-profile-name="${highlightName.toLowerCase()}"]`;
    const el = containerRef.current?.querySelector(selector);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('pulse', 'bg-muted/40');
      window.setTimeout(() => {
        el.classList.remove('pulse', 'bg-muted/40');
      }, 1500);
    }
  }, [highlightName]);

  return (
    <section ref={containerRef} aria-label="Agent functions map" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Super Agent as first item */}
        <div className="xl:col-span-3 md:col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6">
          {/* Super Agent Section */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-foreground mb-1">Super Agent</h3>
            <p className="text-xs text-muted-foreground mb-4">Central Command & Orchestration</p>
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="relative h-16 w-16 rounded-full overflow-hidden mb-3 ring-2 ring-primary/20">
                  <img
                    src="/lovable-uploads/721071c1-63ee-4bc4-b9d8-264657716340.png"
                    alt="Super Agent robot"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground mb-1">Vee</div>
                  <div className="text-xs text-muted-foreground">Central Command & Orchestration</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Teams Section */}
          <div className="grid gap-4 md:grid-cols-4">
            {groups.map((group) => (
              <div key={group.title} className="bg-card/50 rounded-lg p-3 pointer-events-auto">
                <header className="mb-4 pointer-events-none">
                  <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                </header>
                {"sections" in group ? (
                  <>
                    {group.sections.map((section) => (
                      <div key={section.subtitle} className="mb-5 last:mb-0 pointer-events-auto">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground pointer-events-none">
                          {section.subtitle}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 pointer-events-none">
                          {section.items.map((item) => (
                            <div
                              key={`${group.title}-${section.subtitle}-${item.name}`}
                              data-profile-name={item.name.toLowerCase()}
                              className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                onProfileClick?.(item.name);
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden">
                                {item.imageSrc ? (
                                  <img
                                    src={item.imageSrc}
                                    alt={`${item.name} profile image`}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
                                    {item.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="mt-2">
                                <div className="text-sm font-medium text-foreground">{item.name}</div>
                                <div className="text-xs text-muted-foreground">{item.role}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pointer-events-none">
                    {group.items.map((item) => (
                      <div
                        key={`${group.title}-${item.name}`}
                        data-profile-name={item.name.toLowerCase()}
                        className="group flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProfileClick?.(item.name);
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden">
                          {item.imageSrc ? (
                            <img
                              src={item.imageSrc}
                              alt={`${item.name} profile image`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center text-foreground/80 text-xl font-medium">
                              {item.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm font-medium text-foreground">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FunctionMap;
