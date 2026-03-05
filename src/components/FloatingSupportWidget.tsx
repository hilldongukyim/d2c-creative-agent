import React, { useState, useRef, useEffect } from "react";
import { Headset, X, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const agents = [
    {
      id: "mochi",
      name: "Mochi",
      role: "Request Handler",
      desc: "업무 요청을 접수하고 적합한 크루에게 연결해드려요",
      image: "/lovable-uploads/mochi-profile.png",
      active: true,
      onClick: () => { onMochiClick(); setIsOpen(false); },
    },
    {
      id: "mell",
      name: "Mell",
      role: "Newsletter Manager",
      desc: "뉴스레터 구독 및 발송 관련 문의를 도와드려요",
      image: "/lovable-uploads/mell-profile.png",
      active: true,
      onClick: () => { onMellClick(); setIsOpen(false); },
    },
    {
      id: "fiona",
      name: "Fiona",
      role: "Admin Dashboard",
      desc: "관리자 전용",
      image: "/lovable-uploads/fiona-admin-profile.png",
      active: false,
      locked: true,
      onClick: () => {},
    },
  ];

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      <div
        className={`bg-card border border-border rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-out origin-bottom-right ${
          isOpen ? "opacity-100 scale-100 max-h-[400px] mb-2" : "opacity-0 scale-95 max-h-0 pointer-events-none"
        }`}
        style={{ width: 300 }}
      >
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Support Team</h3>
          <p className="text-xs text-muted-foreground">도움이 필요하신가요?</p>
        </div>
        <div className="p-3 space-y-2">
          {agents.map((agent) => (
            <TooltipProvider key={agent.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={agent.locked ? undefined : agent.onClick}
                    disabled={agent.locked}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      agent.locked
                        ? "opacity-50 cursor-not-allowed bg-muted/30"
                        : "hover:bg-muted/50 cursor-pointer"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={agent.image}
                          alt={agent.name}
                          className={`h-full w-full object-cover ${agent.locked ? "grayscale" : ""}`}
                        />
                      </div>
                      {agent.active && !agent.locked && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-card" />
                      )}
                      {agent.locked && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-muted-foreground/50 rounded-full border-2 border-card flex items-center justify-center">
                          <Lock className="h-1.5 w-1.5 text-card" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        {agent.name}
                        {agent.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{agent.desc}</div>
                    </div>
                  </button>
                </TooltipTrigger>
                {agent.locked && (
                  <TooltipContent side="left">
                    <p>관리자 전용</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        aria-label="Support"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Headset className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default FloatingSupportWidget;
