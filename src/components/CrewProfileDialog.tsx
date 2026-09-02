import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageSquare, Send, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { FlowStep } from "@/data/crewData";

interface CrewProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewName: string;
  crewRole: string;
  crewDescription: string;
  flowSteps?: FlowStep[];
  isComingSoon?: boolean;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

interface Review {
  id: string;
  reviewer_name: string;
  review_text: string;
  created_at: string;
}

const CrewProfileDialog: React.FC<CrewProfileDialogProps> = ({
  open,
  onOpenChange,
  crewName,
  crewRole,
  crewDescription,
  flowSteps,
  isComingSoon = false,
  ctaLabel,
  onCtaClick,
}) => {
  const userEmail = localStorage.getItem("user_email") || "anonymous";
  const likeKey = `${crewName.toLowerCase()}|${userEmail}`;

  const [likeCount, setLikeCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLikes();
      checkLiked();
      fetchReviews();
    }
  }, [open, crewName]);

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("crew_likes")
      .select("*", { count: "exact", head: true })
      .ilike("crew_name", `${crewName.toLowerCase()}|%`);
    setLikeCount(count || 0);
  };

  const checkLiked = async () => {
    const { count } = await supabase
      .from("crew_likes")
      .select("*", { count: "exact", head: true })
      .eq("crew_name", likeKey);
    setHasLiked((count || 0) > 0);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("crew_reviews")
      .select("*")
      .eq("crew_name", crewName.toLowerCase())
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const handleLike = async () => {
    setIsLiking(true);
    if (hasLiked) {
      const { error } = await supabase.from("crew_likes").delete().eq("crew_name", likeKey);
      if (!error) { setLikeCount(p => Math.max(0, p - 1)); setHasLiked(false); }
    } else {
      const { error } = await supabase.from("crew_likes").insert({ crew_name: likeKey });
      if (!error) { setLikeCount(p => p + 1); setHasLiked(true); }
    }
    setIsLiking(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast({ title: "Error", description: "Please write a review.", variant: "destructive" });
      return;
    }
    setIsSubmittingReview(true);
    const { error } = await supabase.from("crew_reviews").insert({
      crew_name: crewName.toLowerCase(),
      reviewer_name: userEmail,
      review_text: reviewText.trim(),
    });
    if (error) {
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    } else {
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      setReviewText("");
      setShowReviewForm(false);
      fetchReviews();
    }
    setIsSubmittingReview(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-3xl max-h-[88vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{crewName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* ── Left Panel ── */}
          <div className="md:w-52 shrink-0 flex flex-col items-center text-center px-6 py-6 border-b md:border-b-0 md:border-r border-border bg-muted/20">
            <h2 className="text-base font-bold text-foreground">{crewName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{crewRole}</p>

            {/* Status badges */}
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {isComingSoon && (
                <span className="bg-yellow-500 text-yellow-950 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              )}
            </div>

            <div className="flex-1" />

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full mt-4">
              {ctaLabel && onCtaClick && !isComingSoon && (
                <Button
                  onClick={() => { onOpenChange(false); onCtaClick(); }}
                  size="sm"
                  className="w-full gap-1.5"
                >
                  {ctaLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant={hasLiked ? "default" : "outline"}
                size="sm"
                className="w-full gap-1.5"
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className={`h-3.5 w-3.5 ${hasLiked ? "fill-white text-white" : likeCount > 0 ? "fill-red-500 text-red-500" : ""}`} />
                {hasLiked ? "Liked" : "Like"} {likeCount > 0 && `(${likeCount})`}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => setShowReviewForm(v => !v)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Write Review
              </Button>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-5">
              {/* Description */}
              <p className="text-sm text-foreground/80 leading-relaxed">
                {crewDescription}
              </p>

              {/* Noa notice */}
              {crewName.toLowerCase() === "noa" && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                    ⚠️ Important: Login is required. After logging in, please refer to the User Guide (PDF) to obtain the necessary permissions before use.
                  </p>
                </div>
              )}

              {/* UX Flow Steps */}
              {flowSteps && flowSteps.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    How to Use
                  </h3>
                  <div className="space-y-2">
                    {flowSteps.map((s) => (
                      <div key={s.step} className="flex gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                        <div className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {s.step}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{s.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="border-t pt-4 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Reviewing as <span className="font-medium text-foreground">{userEmail}</span>
                  </p>
                  <Textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Share your experience with this crew member..."
                    rows={3}
                  />
                  <Button type="submit" size="sm" className="w-full gap-2" disabled={isSubmittingReview}>
                    <Send className="h-4 w-4" />
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              )}

              {/* Reviews list */}
              {reviews.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Reviews ({reviews.length})
                  </h4>
                  <div className="space-y-3">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-medium">{review.reviewer_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CrewProfileDialog;
