import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, MessageSquare, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FloatingSupportWidgetProps {
  onMochiClick: () => void;
  onMellClick: () => void;
  onFionaClick: () => void;
}

const ADMIN_PASSWORD = "twin2025!";
const REQUIRED_CLICKS = 5;
const CLICK_TIMEOUT = 2000;

const FloatingSupportWidget: React.FC<FloatingSupportWidgetProps> = ({
  onMochiClick,
  onMellClick,
  onFionaClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fionaClickCount, setFionaClickCount] = useState(0);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowPasswordInput(false);
        setFionaClickCount(0);
        setPassword("");
        setPasswordError(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleFionaClick = useCallback(() => {
    const newCount = fionaClickCount + 1;
    setFionaClickCount(newCount);

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setFionaClickCount(0);
    }, CLICK_TIMEOUT);

    if (newCount >= REQUIRED_CLICKS) {
      setShowPasswordInput(true);
      setFionaClickCount(0);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    }
  }, [fionaClickCount]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setShowPasswordInput(false);
      setPassword("");
      setPasswordError(false);
      setIsOpen(false);
      onFionaClick();
    } else {
      setPasswordError(true);
      setPassword("");
    }
  };

  const agents = [
    {
      id: "mochi",
      name: "Mochi",
      role: "Request Handler",
      subtitle: "Receives work requests and connects you with the right crew member",
      image: "/lovable-uploads/mochi-profile.png",
      icon: MessageSquare,
      locked: false,
      onClick: () => { onMochiClick(); setIsOpen(false); },
    },
    {
      id: "mell",
      name: "Mell",
      role: "Newsletter Manager",
      subtitle: "Handles newsletter subscriptions and distribution inquiries",
      image: "/lovable-uploads/mell-profile.png",
      icon: Mail,
      locked: false,
      onClick: () => { onMellClick(); setIsOpen(false); },
    },
    {
      id: "fiona",
      name: "Fiona",
      role: "Admin Dashboard",
      subtitle: "Admin Only",
      image: "/lovable-uploads/fiona-admin-profile.png",
      icon: Lock,
      locked: true,
      onClick: handleFionaClick,
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
          <p className="text-xs text-muted-foreground mt-0.5">Need help?</p>
        </div>

        <div className="p-3 space-y-2">
          {agents.map((agent) => (
            <div key={agent.id}>
              <div
                onClick={agent.onClick}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  agent.locked
                    ? "opacity-50 cursor-pointer select-none"
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

              {/* Password input - shown after 5 clicks on Fiona */}
              {agent.id === "fiona" && showPasswordInput && (
                <form onSubmit={handlePasswordSubmit} className="px-3 pb-2 pt-1 space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
                    className={`h-8 text-xs ${passwordError ? "border-destructive" : ""}`}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-[11px] text-destructive">Incorrect password</p>
                  )}
                  <Button type="submit" size="sm" className="w-full h-7 text-xs">
                    Access Dashboard
                  </Button>
                </form>
              )}
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
