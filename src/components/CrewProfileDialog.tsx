import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageSquare, Send, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CrewProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewName: string;
  crewRole: string;
  crewDescription: string;
  isComingSoon?: boolean;
  isUpgraded?: boolean;
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
  isComingSoon = false,
  isUpgraded = false,
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
      const { error } = await supabase
        .from("crew_likes")
        .delete()
        .eq("crew_name", likeKey);
      if (!error) {
        setLikeCount(prev => Math.max(0, prev - 1));
        setHasLiked(false);
      }
    } else {
      const { error } = await supabase
        .from("crew_likes")
        .insert({ crew_name: likeKey });
      if (!error) {
        setLikeCount(prev => prev + 1);
        setHasLiked(true);
      }
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
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{crewName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col items-center text-center px-2 pb-4 space-y-4">
            {/* Status badges */}
            {(isComingSoon || isUpgraded) && (
              <div className="flex gap-2 flex-wrap justify-center">
                {isComingSoon && (
                  <span className="bg-yellow-500 text-yellow-950 text-xs font-medium px-3 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
                {isUpgraded && (
                  <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Upgraded
                  </span>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground">{crewRole}</p>

            <p className="text-sm text-foreground/80 leading-relaxed text-left w-full whitespace-pre-line">
              {crewDescription}
            </p>

            {/* Noa notice */}
            {crewName.toLowerCase() === "noa" && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg w-full text-left">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                  ⚠️ Important: Login is required. After logging in, please refer to the User Guide (PDF) to obtain the necessary permissions before use.
                </p>
              </div>
            )}

            {/* CTA */}
            {ctaLabel && onCtaClick && !isComingSoon && (
              <Button
                onClick={() => { onOpenChange(false); onCtaClick(); }}
                className="gap-2"
                size="sm"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {/* Like + Review */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant={hasLiked ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart
                  className={`h-4 w-4 ${hasLiked ? "fill-white text-white" : likeCount > 0 ? "fill-red-500 text-red-500" : ""}`}
                />
                <span>{likeCount}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowReviewForm(v => !v)}
              >
                <MessageSquare className="h-4 w-4" />
                Write Review
              </Button>
            </div>

            {/* Review form */}
            {showReviewForm && (
              <form
                onSubmit={handleSubmitReview}
                className="w-full border-t pt-4 space-y-3 text-left"
              >
                <p className="text-xs text-muted-foreground">
                  Reviewing as{" "}
                  <span className="font-medium text-foreground">{userEmail}</span>
                </p>
                <Textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your experience with this crew member..."
                  rows={3}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="w-full gap-2"
                  disabled={isSubmittingReview}
                >
                  <Send className="h-4 w-4" />
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            )}

            {/* Reviews list */}
            {reviews.length > 0 && (
              <div className="w-full border-t pt-4 text-left">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
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
      </DialogContent>
    </Dialog>
  );
};

export default CrewProfileDialog;
