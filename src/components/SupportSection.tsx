import React from "react";
import { MessageSquare, History, Mail } from "lucide-react";

interface SupportSectionProps {
  onMochiRequestClick: () => void;
  onMochiHistoryClick: () => void;
  onMellClick: () => void;
}

const SupportSection: React.FC<SupportSectionProps> = ({
  onMochiRequestClick,
  onMochiHistoryClick,
  onMellClick,
}) => {
  const supportMembers = [
    {
      id: "mochi",
      name: "Mochi",
      role: "Request Handler",
      image: "/lovable-uploads/mochi-profile.png",
      icon: MessageSquare,
      iconColor: "bg-blue-500",
      actions: [
        { label: "Submit Request", onClick: onMochiRequestClick, primary: true },
        { label: "History", onClick: onMochiHistoryClick, primary: false, icon: History },
      ],
    },
    {
      id: "mell",
      name: "Mell",
      role: "Newsletter Manager",
      image: "/lovable-uploads/mell-profile.png",
      icon: Mail,
      iconColor: "bg-emerald-500",
      actions: [
        { label: "View Newsletters", onClick: onMellClick, primary: true },
      ],
    },
  ];

  return (
    <div className="mt-8 pt-8 border-t border-border/30">
      <div className="text-center mb-6">
        <h3 className="text-base font-semibold text-foreground mb-2">
          Support Team
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Get help with requests, announcements, and stay updated with the latest news.
        </p>
      </div>

      <div className="flex justify-center gap-8 md:gap-12">
        {supportMembers.map((member) => (
          <div key={member.id} className="flex flex-col items-center group">
            <div
              className="relative cursor-pointer"
              onClick={member.actions[0].onClick}
            >
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-colors">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              {/* Status indicator */}
              <span className="absolute bottom-0 right-0 z-10 h-4 w-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                <member.icon className="h-2.5 w-2.5 text-white" />
              </span>
            </div>
            
            <div className="mt-3 text-center">
              <div className="text-sm font-medium text-foreground">{member.name}</div>
              <div className="text-xs text-muted-foreground">{member.role}</div>
            </div>

            <div className="mt-3 flex gap-2">
              {member.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                    action.primary
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {action.icon && <action.icon className="h-3 w-3" />}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportSection;
