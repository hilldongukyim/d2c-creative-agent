import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EmailGatePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("user_email")) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!/@(lge\.com|lgpartner\.com)$/.test(trimmed)) {
      setError("Access is restricted to @lge.com or @lgpartner.com email addresses.");
      return;
    }
    localStorage.setItem("user_email", trimmed);
    navigate("/home", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-accent/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm mx-4 space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-b from-gradient-title-start to-gradient-title-end bg-clip-text text-transparent">
            Twin Crew
          </h1>
          <p className="text-sm text-muted-foreground">A Team of Your Second Selves.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5 text-left">
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Welcome</p>
            <p className="text-sm text-muted-foreground">
              Enter your email to access the portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                autoFocus
                placeholder="donguk.yim@lge.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="h-10 placeholder:text-muted-foreground/40"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full h-10">Enter Portal</Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground/50">
          © 2026 D2C Overseas Sales &amp; Marketing Group
          <br />
          For access issues, contact{" "}
          <a
            href="mailto:donguk.yim@lge.com"
            className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
          >
            donguk.yim@lge.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default EmailGatePage;
