import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageSquare, Send, User, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CrewProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewName: string;
  crewRole: string;
  crewImage: string;
  crewDescription: string;
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
  crewImage,
  crewDescription,
  isComingSoon = false,
  ctaLabel,
  onCtaClick,
}) => {
  const [likeCount, setLikeCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLiking, setIsLiking] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLikes();
      fetchReviews();
    }
  }, [open, crewName]);

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("crew_likes")
      .select("*", { count: "exact", head: true })
      .eq("crew_name", crewName.toLowerCase());
    setLikeCount(count || 0);
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
    const { error } = await supabase.from("crew_likes").insert({
      crew_name: crewName.toLowerCase(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add like. Please try again.",
        variant: "destructive",
      });
    } else {
      setLikeCount((prev) => prev + 1);
      toast({
        title: "Liked!",
        description: `You liked ${crewName}!`,
      });
    }
    setIsLiking(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewText.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    const { error } = await supabase.from("crew_reviews").insert({
      crew_name: crewName.toLowerCase(),
      reviewer_name: reviewerName.trim(),
      review_text: reviewText.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setReviewerName("");
      setReviewText("");
      setShowReviewForm(false);
      fetchReviews();
    }
    setIsSubmittingReview(false);
  };

  const handleCtaClick = () => {
    onOpenChange(false);
    onCtaClick?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">{crewName} Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center pb-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary/20">
              {crewImage ? (
                <img
                  src={crewImage}
                  alt={crewName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {crewName.charAt(0)}
                </div>
              )}
            </div>
            {isComingSoon && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-[10px] font-medium px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold mt-3">{crewName}</h3>
          <p className="text-sm text-muted-foreground">{crewRole}</p>
          <p className="text-sm text-foreground/80 mt-3 px-4 leading-relaxed">
            {crewDescription}
          </p>

          {/* CTA Button */}
          {ctaLabel && onCtaClick && !isComingSoon && (
            <Button
              onClick={handleCtaClick}
              className="mt-4 gap-2"
              size="sm"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {/* Like Button */}
          <div className="flex items-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={`h-4 w-4 ${likeCount > 0 ? "fill-red-500 text-red-500" : ""}`} />
              <span>{likeCount}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              <MessageSquare className="h-4 w-4" />
              Write Review
            </Button>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="border-t pt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="reviewer-name">Your Name</Label>
              <Input
                id="reviewer-name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-text">Review</Label>
              <Textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this crew member..."
                rows={3}
              />
            </div>
            <Button type="submit" size="sm" className="w-full gap-2" disabled={isSubmittingReview}>
              <Send className="h-4 w-4" />
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="border-t pt-4 flex-1 overflow-hidden">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Reviews ({reviews.length})
            </h4>
            <ScrollArea className="h-[150px] pr-4">
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{review.reviewer_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80">{review.review_text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CrewProfileDialog;
