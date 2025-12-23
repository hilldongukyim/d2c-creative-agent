import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BenFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainProductUrl: string;
  secondProductUrl: string;
}

const BenFeedbackDialog = ({
  open,
  onOpenChange,
  mainProductUrl,
  secondProductUrl,
}: BenFeedbackDialogProps) => {
  const [feedbackType, setFeedbackType] = useState<'like' | 'dislike' | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedbackType) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('ben-feedback-email', {
        body: {
          feedbackType,
          comment: feedbackType === 'dislike' ? comment : '',
          mainProductUrl,
          secondProductUrl,
        },
      });

      if (error) {
        console.error('Error sending feedback:', error);
        toast.error('피드백 전송에 실패했습니다.');
        return;
      }

      setSubmitted(true);
      toast.success('피드백이 전송되었습니다. 감사합니다!');
      
      setTimeout(() => {
        onOpenChange(false);
        // Reset state after dialog closes
        setTimeout(() => {
          setFeedbackType(null);
          setComment("");
          setSubmitted(false);
        }, 300);
      }, 1500);
    } catch (err) {
      console.error('Error:', err);
      toast.error('피드백 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    setFeedbackType('like');
  };

  const handleDislike = () => {
    setFeedbackType('dislike');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Ben의 결과물은 어떠셨나요?
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-lg font-medium text-green-600">감사합니다!</p>
            <p className="text-sm text-muted-foreground">피드백이 전송되었습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Feedback buttons */}
            <div className="flex justify-center gap-6 py-4">
              <button
                onClick={handleLike}
                className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                  feedbackType === 'like'
                    ? 'bg-green-100 dark:bg-green-900/40 ring-2 ring-green-500'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <ThumbsUp
                  className={`h-10 w-10 mb-2 ${
                    feedbackType === 'like' ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                />
                <span className={`text-sm font-medium ${
                  feedbackType === 'like' ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  좋아요
                </span>
              </button>

              <button
                onClick={handleDislike}
                className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                  feedbackType === 'dislike'
                    ? 'bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <ThumbsDown
                  className={`h-10 w-10 mb-2 ${
                    feedbackType === 'dislike' ? 'text-red-600' : 'text-muted-foreground'
                  }`}
                />
                <span className={`text-sm font-medium ${
                  feedbackType === 'dislike' ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  아쉬워요
                </span>
              </button>
            </div>

            {/* Comment textarea - only show when dislike is selected */}
            {feedbackType === 'dislike' && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-sm font-medium">
                  어떤 점이 아쉬우셨나요?
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="개선이 필요한 부분을 알려주세요..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}

            {/* Submit button */}
            {feedbackType && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (feedbackType === 'dislike' && !comment.trim())}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    피드백 보내기
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BenFeedbackDialog;
