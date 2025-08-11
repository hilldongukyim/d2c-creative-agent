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
        { name: "Maya", role: "Account Create", imageSrc: "/lovable-uploads/d67ab42c-85c8-480e-b65e-66a15abe8586.png" },
        { name: "Theo", role: "Account Delete", imageSrc: "/lovable-uploads/2e6d7b60-abc9-4051-a585-fad42800aabb.png" },
        { name: "Fiona", role: "Communication", imageSrc: "/lovable-uploads/f3264e74-893f-4cb0-9ec7-91b84b56c631.png" },
      ],
    },
    {
      title: "Promotion Content",
      items: [
        { name: "Yumi", role: "El-Form Designer", imageSrc: profiles.yumi },
        { name: "Carmen", role: "Coordinator", imageSrc: "/lovable-uploads/c67db3d8-8cdc-426a-80e4-b8e7b6bf4604.png" },
        { name: "Pip", role: "Designer", imageSrc: "/lovable-uploads/cf830101-de14-48d2-a5f5-23a3f692a0f0.png" },
        { name: "Juno", role: "Criteo Variation", imageSrc: "/lovable-uploads/0984d14e-1c85-48e9-9be5-953e3bc72d9a.png" },
        { name: "Luna", role: "DV360 Variation", imageSrc: "/lovable-uploads/09ed6890-8a71-43b1-9f99-2029d69c3e6c.png" },
        { name: "Fern", role: "Other Variation", imageSrc: "/lovable-uploads/66fb2463-85b8-437c-9a16-afdb1c8b3861.png" },
      ],
    },
    {
      title: "Gallery Image",
      items: [
        { name: "Tango", role: "Gallery Resizing", imageSrc: "/lovable-uploads/c2f987d1-fdfb-4948-b854-092b9abd9f8c.png" },
        { name: "Ben", role: "PTO Image Creator", imageSrc: profiles.ben },
      ],
    },
    {
      title: "Promotion",
      items: [
        { name: "Boris", role: "Promotion Initiator", imageSrc: "/lovable-uploads/a3da050e-3de8-404c-8ab2-868f2e319ec8.png" },
        { name: "Ollie", role: "Sales Analyst", imageSrc: "/lovable-uploads/a2300ba9-4de6-4adc-88fd-b80baa1bdff7.png" },
        { name: "Ravi", role: "Promotion Configurator", imageSrc: "/lovable-uploads/d18ff2c4-e8c7-4c44-b38c-74bb66e23393.png" },
      ],
    },
    {
      title: "Intern",
      items: [
        { name: "Kai", role: "Background Remover", imageSrc: "/lovable-uploads/84e535ab-1fa5-418e-93aa-73fa3b361219.png" },
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
