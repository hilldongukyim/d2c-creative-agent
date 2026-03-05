import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, MessageSquare, Mail, Lock } from "lucide-react";

interface FloatingSupportWidgetProps {
  onMochiClick: () => void;
  onMellClick: () => void;
  onFionaClick: () => void;
}

const FloatingSupportWidget: React.FC<FloatingSupportWidgetProps> = ({
  onMochiClick,
  onMellClick,
  onFionaClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const agents = [
    {
      id: "mochi",
      name: "Mochi",
      role: "Request Handler",
      subtitle: "업무 요청을 접수하고 적합한 크루에게 연결해드려요",
      image: "/lovable-uploads/mochi-profile.png",
      icon: MessageSquare,
      status: "active" as const,
      locked: false,
      onClick: () => { onMochiClick(); setIsOpen(false); },
    },
    {
      id: "mell",
      name: "Mell",
      role: "Newsletter Manager",
      subtitle: "뉴스레터 구독 및 발송 관련 문의를 도와드려요",
      image: "/lovable-uploads/mell-profile.png",
      icon: Mail,
      status: "active" as const,
      locked: false,
      onClick: () => { onMellClick(); setIsOpen(false); },
    },
    {
      id: "fiona",
      name: "Fiona",
      role: "Admin Dashboard",
      subtitle: "관리자 전용",
      image: "/lovable-uploads/fiona-admin-profile.png",
      icon: Lock,
      status: "locked" as const,
      locked: true,
      onClick: () => {},
    },
  ];

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50">
      {/* Panel */}
      <div
        className={`absolute bottom-20 right-0 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Support Team</h3>
          <p className="text-xs text-muted-foreground mt-0.5">도움이 필요하신가요?</p>
        </div>

        <div className="p-3 space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={agent.locked ? undefined : agent.onClick}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                agent.locked
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-muted/40"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {agent.locked ? (
                  <span className="absolute bottom-0 right-0 z-10 h-4 w-4 bg-muted rounded-full border-2 border-background flex items-center justify-center">
                    <Lock className="h-2 w-2 text-muted-foreground" />
                  </span>
                ) : (
                  <span className="absolute bottom-0 right-0 z-10 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{agent.name}</div>
                <div className="text-xs text-muted-foreground">{agent.role}</div>
                <div className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{agent.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ backgroundColor: "#A50034" }}
        aria-label="Support"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
      <div className="text-center mt-1">
        <span className="text-[10px] font-medium text-muted-foreground">Support</span>
      </div>
    </div>
  );
};

export default FloatingSupportWidget;
