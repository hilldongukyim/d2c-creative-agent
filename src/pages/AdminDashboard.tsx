import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, MousePointer, Eye, LogOut, Search, RefreshCw, Heart, MessageSquare } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface AnalyticsEvent {
  id: string;
  created_at: string | null;
  event_type: string;
  page_path: string;
  element_text: string | null;
  element_type: string | null;
  metadata: Json | null;
  session_id: string | null;
}

interface CrewLike {
  id: string;
  crew_name: string;
  created_at: string;
}

interface CrewReview {
  id: string;
  crew_name: string;
  reviewer_name: string;
  review_text: string;
  created_at: string;
}

const getEmail = (event: AnalyticsEvent): string => {
  if (event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata)) {
    const m = event.metadata as Record<string, Json>;
    if (typeof m.user_email === "string") return m.user_email;
  }
  return "anonymous";
};

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false });
};

const parseLikeKey = (key: string) => {
  const idx = key.indexOf("|");
  if (idx === -1) return { crew: key, email: "unknown" };
  return { crew: key.slice(0, idx), email: key.slice(idx + 1) };
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [likes, setLikes] = useState<CrewLike[]>([]);
  const [reviews, setReviews] = useState<CrewReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [feedbackTab, setFeedbackTab] = useState<"likes" | "reviews">("likes");

  useEffect(() => {
    if (!sessionStorage.getItem("admin_auth")) {
      navigate("/admin");
    }
  }, [navigate]);

  const fetchAll = async () => {
    setLoading(true);
    const [eventsRes, likesRes, reviewsRes] = await Promise.all([
      supabase
        .from("analytics_events")
        .select("id, created_at, event_type, page_path, element_text, element_type, metadata, session_id")
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase
        .from("crew_likes")
        .select("id, crew_name, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("crew_reviews")
        .select("id, crew_name, reviewer_name, review_text, created_at")
        .order("created_at", { ascending: false }),
    ]);
    setEvents((eventsRes.data as AnalyticsEvent[]) || []);
    setLikes((likesRes.data as CrewLike[]) || []);
    setReviews((reviewsRes.data as CrewReview[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const userStats = useMemo(() => {
    const map = new Map<string, { visits: number; clicks: number; first: string; last: string }>();
    for (const e of events) {
      const email = getEmail(e);
      const existing = map.get(email) || { visits: 0, clicks: 0, first: e.created_at || "", last: e.created_at || "" };
      if (e.event_type === "page_view") existing.visits++;
      if (e.event_type === "click" || e.event_type === "button_click" || e.event_type === "crew_profile_click") existing.clicks++;
      if (e.created_at && e.created_at < existing.first) existing.first = e.created_at;
      if (e.created_at && e.created_at > existing.last) existing.last = e.created_at;
      map.set(email, existing);
    }
    return Array.from(map.entries())
      .map(([email, stats]) => ({ email, ...stats }))
      .sort((a, b) => b.last.localeCompare(a.last));
  }, [events]);

  const filteredUsers = useMemo(
    () => userStats.filter(u => u.email.includes(search.toLowerCase())),
    [userStats, search]
  );

  const detailEvents = useMemo(() => {
    if (!selectedEmail) return [];
    return events.filter(e => getEmail(e) === selectedEmail);
  }, [selectedEmail, events]);

  // Group likes by crew name (parse composite key crew|email)
  const likesByCrew = useMemo(() => {
    const map = new Map<string, { email: string; created_at: string }[]>();
    for (const like of likes) {
      const { crew, email } = parseLikeKey(like.crew_name);
      const arr = map.get(crew) || [];
      arr.push({ email, created_at: like.created_at });
      map.set(crew, arr);
    }
    return Array.from(map.entries())
      .map(([crew, items]) => ({ crew, count: items.length, items }))
      .sort((a, b) => b.count - a.count);
  }, [likes]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    navigate("/admin");
  };

  const totalUsers = new Set(events.map(getEmail)).size;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEvents = events.filter(e => e.created_at?.startsWith(todayStr)).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">Twin Crew Portal · Analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Unique Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Eye className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{events.filter(e => e.event_type === "page_view").length}</p>
                <p className="text-sm text-muted-foreground">Total Page Views</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{likes.length}</p>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <MousePointer className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{todayEvents}</p>
                <p className="text-sm text-muted-foreground">Events Today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics: Users + Event Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Users</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[480px] overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-muted-foreground p-4">Loading...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4">No users found.</p>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.email}
                      onClick={() => setSelectedEmail(user.email === selectedEmail ? null : user.email)}
                      className={`px-4 py-3 border-b border-border cursor-pointer hover:bg-muted/40 transition-colors ${selectedEmail === user.email ? "bg-muted/60" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate max-w-[200px]">{user.email}</span>
                        <div className="flex gap-1.5 shrink-0">
                          <Badge variant="outline" className="text-xs px-1.5">
                            <Eye className="h-3 w-3 mr-1" />{user.visits}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5">
                            <MousePointer className="h-3 w-3 mr-1" />{user.clicks}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Last: {fmtDate(user.last)}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {selectedEmail ? (
                  <span className="flex items-center gap-2">
                    Activity Log
                    <span className="text-xs font-normal text-muted-foreground truncate max-w-[200px]">
                      — {selectedEmail}
                    </span>
                  </span>
                ) : "Recent Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[480px] overflow-y-auto">
                {(selectedEmail ? detailEvents : events.slice(0, 100)).map(event => (
                  <div key={event.id} className="px-4 py-2.5 border-b border-border/50 hover:bg-muted/20">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge
                        variant={event.event_type === "page_view" ? "secondary" : "outline"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {event.event_type}
                      </Badge>
                      {!selectedEmail && (
                        <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {getEmail(event)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground">{event.page_path}</p>
                    {event.element_text && (
                      <p className="text-xs text-muted-foreground">↳ {event.element_text}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{fmtDate(event.created_at)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crew Feedback */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Crew Feedback</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={feedbackTab === "likes" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setFeedbackTab("likes")}
                >
                  <Heart className="h-3 w-3" /> Likes ({likes.length})
                </Button>
                <Button
                  variant={feedbackTab === "reviews" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setFeedbackTab("reviews")}
                >
                  <MessageSquare className="h-3 w-3" /> Reviews ({reviews.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {feedbackTab === "likes" ? (
              <div className="max-h-[400px] overflow-y-auto">
                {likesByCrew.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4">No likes yet.</p>
                ) : (
                  likesByCrew.map(({ crew, count, items }) => (
                    <div key={crew} className="px-4 py-3 border-b border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold capitalize">{crew}</span>
                        <Badge variant="outline" className="text-xs gap-1">
                          <Heart className="h-3 w-3 fill-red-500 text-red-500" /> {count}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {items.map((item, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {item.email}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4">No reviews yet.</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold capitalize bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {review.crew_name}
                        </span>
                        <span className="text-xs font-medium text-foreground">{review.reviewer_name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{fmtDate(review.created_at)}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{review.review_text}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
