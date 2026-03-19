import React, { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Lightbulb, MessageSquareWarning, ImagePlus, X } from "lucide-react";

export type RequestCategory = "development" | "inquiry";

export interface MochiRequest {
  id: string;
  category: RequestCategory;
  // Common fields
  name: string;
  email: string;
  // Development request fields
  team?: string;
  region?: string;
  painPoint?: string;
  improvementIdea?: string;
  // Inquiry fields
  targetAgent?: string;
  content?: string;
  attachedImages?: string[];
  submittedAt: Date;
}

interface MochiRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess?: (data: MochiRequest) => void;
}

// Only active crew members (not Coming Soon)
const crewMembers = [
  "Yumi", "Ben", "Mateo", "Maple", "Noa", "Luna", "Clara", 
  "Candy", "Anita", "Zoe", "Milo", "Ava", "Levi"
];

const MochiRequestDialog: React.FC<MochiRequestDialogProps> = ({
  open,
  onOpenChange,
  onSubmitSuccess,
}) => {
  const [category, setCategory] = useState<RequestCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    team: "",
    region: "",
    painPoint: "",
    improvementIdea: "",
    targetAgent: "",
    content: "",
  });
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setAttachedImages(prev => [...prev, base64]);
          };
          reader.readAsDataURL(file);
        }
        e.preventDefault();
      }
    }
  }, []);

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setCategory(null);
    setFormData({
      name: "",
      email: "",
      team: "",
      region: "",
      painPoint: "",
      improvementIdea: "",
      targetAgent: "",
      content: "",
    });
    setAttachedImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (category === "development") {
      if (!formData.name || !formData.team || !formData.region || !formData.email || !formData.painPoint) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    } else if (category === "inquiry") {
      if (!formData.name || !formData.email || !formData.targetAgent || !formData.content) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRequest: MochiRequest = {
      id: Date.now().toString(),
      category: category!,
      name: formData.name,
      email: formData.email,
      ...(category === "development" && {
        team: formData.team,
        region: formData.region,
        painPoint: formData.painPoint,
        improvementIdea: formData.improvementIdea,
      }),
      ...(category === "inquiry" && {
        targetAgent: formData.targetAgent,
        content: formData.content,
        attachedImages: attachedImages,
      }),
      submittedAt: new Date(),
    };

    onSubmitSuccess?.(newRequest);
    
    toast({
      title: "Request Submitted",
      description: category === "development" 
        ? "Thank you for your development request! We'll review it shortly."
        : "Thank you for your inquiry! We'll investigate and get back to you.",
    });

    resetForm();
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {!category ? "Choose Request Type" : category === "development" ? "Development Request" : "Issue / Inquiry"}
          </DialogTitle>
          <DialogDescription>
            {!category 
              ? "Select the type of request you want to submit to Mochi."
              : category === "development"
              ? "Submit your pain points or ideas for new AI crew members."
              : "Report an issue or ask a question about an existing crew member."
            }
          </DialogDescription>
        </DialogHeader>

        {!category ? (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => setCategory("development")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">New Development</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Request a new feature or crew member
                </div>
              </div>
            </button>

            <button
              onClick={() => setCategory("inquiry")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-orange-500 hover:bg-orange-500/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <MessageSquareWarning className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">Issue / Inquiry</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Report a problem or ask a question
                </div>
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setCategory(null)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Back to category selection
            </button>

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your.email@lge.com"
                  required
                />
              </div>
            </div>

            {/* Development Request Fields */}
            {category === "development" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="team">Team *</Label>
                    <Input
                      id="team"
                      value={formData.team}
                      onChange={(e) => handleChange("team", e.target.value)}
                      placeholder="Your team"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => handleChange("region", e.target.value)}
                      placeholder="Your region"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="painPoint">Pain Point *</Label>
                  <Textarea
                    id="painPoint"
                    value={formData.painPoint}
                    onChange={(e) => handleChange("painPoint", e.target.value)}
                    placeholder="Describe the challenge or issue you're facing in your work..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="improvementIdea">Improvement Idea (Optional)</Label>
                  <Textarea
                    id="improvementIdea"
                    value={formData.improvementIdea}
                    onChange={(e) => handleChange("improvementIdea", e.target.value)}
                    placeholder="If you have any ideas on how this could be improved, please share them here..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Inquiry Fields */}
            {category === "inquiry" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="targetAgent">Related Crew Member *</Label>
                  <Select 
                    value={formData.targetAgent} 
                    onValueChange={(value) => handleChange("targetAgent", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a crew member" />
                    </SelectTrigger>
                    <SelectContent>
                      {crewMembers.map((member) => (
                        <SelectItem key={member} value={member.toLowerCase()}>
                          {member}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Description *</Label>
                  <Textarea
                    ref={textareaRef}
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Describe the issue or your question in detail... (You can paste images directly here)"
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImagePlus className="w-4 h-4" />
                    Attached Images
                  </Label>
                  <div 
                    className="min-h-[80px] border-2 border-dashed border-border rounded-lg p-3 hover:border-muted-foreground/50 transition-colors"
                    onPaste={handlePaste}
                  >
                    {attachedImages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-4">
                        Paste images here (Ctrl+V / Cmd+V)
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {attachedImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={img} 
                              alt={`Attached ${idx + 1}`} 
                              className="w-16 h-16 object-cover rounded-md border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can paste screenshots or images directly into the form
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MochiRequestDialog;
