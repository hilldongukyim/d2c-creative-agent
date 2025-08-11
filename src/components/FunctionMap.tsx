import React from "react";

type ProfileMap = { yumi: string; ben: string };

type FunctionMapProps = {
  profiles: ProfileMap;
};

const FunctionMap: React.FC<FunctionMapProps> = ({ profiles }) => {
  const groups = [
    {
      title: "DAM",
      items: [
        { name: "Candy", role: "Coordinator", imageSrc: "/lovable-uploads/12ea1acb-6641-4e73-85ef-14b102b12d30.png" },
        { name: "Maya", role: "Account Create" },
        { name: "Theo", role: "Account Delete" },
        { name: "Fiona", role: "Communication" },
      ],
    },
    {
      title: "Promotion Content",
      items: [
        { name: "Yumi", role: "El-Form Designer", imageSrc: profiles.yumi },
        { name: "Carmen", role: "Coordinator" },
        { name: "Pip", role: "Designer" },
        { name: "Juno", role: "Criteo Variation" },
        { name: "Luna", role: "DV360 Variation" },
        { name: "Fern", role: "Other Variation" },
      ],
    },
    {
      title: "Gallery Image",
      items: [
        { name: "Tango", role: "Gallery Resizing" },
        { name: "Ben", role: "PTO Image Creator", imageSrc: profiles.ben },
      ],
    },
    {
      title: "Promotion",
      items: [
        { name: "Boris", role: "Promotion Initiator" },
        { name: "Ollie", role: "Sales Analyst" },
        { name: "Ravi", role: "Promotion Configurator" },
      ],
    },
    {
      title: "Intern",
      items: [
        { name: "Kai", role: "Background Remover" },
        { name: "Maple", role: "Feedback Taker" },
        { name: "Penny", role: "Mailing" },
        { name: "Noa", role: "Copy Writing" },
      ],
    },
  ];

  return (
    <section aria-label="Agent functions map" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <article key={group.title} className="rounded-xl border bg-card p-5 shadow-sm">
            <header className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
            </header>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {group.items.map((item) => (
                <div key={`${group.title}-${item.name}`} className="flex flex-col items-center text-center">
                  <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden ring-1 ring-muted-foreground/20">
                    {item.imageSrc ? (
                      <img
                        src={item.imageSrc}
                        alt={`${item.name} profile image`}
                        className="h-full w-full object-cover"
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
          </article>
        ))}
      </div>
    </section>
  );
};

export default FunctionMap;
