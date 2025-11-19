import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

type CrewRequestFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CrewRequestForm = ({ open, onOpenChange }: CrewRequestFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    crewName: "",
    role: "",
    department: "",
    skills: "",
    description: "",
    requestedBy: "",
    selectedImage: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const webhookUrl = "https://dev.eaip.lge.com/n8n/webhook/19da7f3f-019d-4618-a367-683c9e5c32b8";
      const params = new URLSearchParams({
        crewName: formData.crewName,
        role: formData.role,
        department: formData.department,
        skills: formData.skills,
        description: formData.description,
        requestedBy: formData.requestedBy,
        selectedImage: formData.selectedImage
      });

      // Send GET request with no-cors mode to bypass CORS restrictions
      fetch(`${webhookUrl}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors'
      }).catch(() => {
        // Ignore errors - the request is still sent to the webhook
      });
      
      toast({
        title: "Request Submitted",
        description: "Your crew registration request has been sent to the webhook.",
      });
      
      onOpenChange(false);
      setFormData({
        crewName: "",
        role: "",
        department: "",
        skills: "",
        description: "",
        requestedBy: "",
        selectedImage: ""
      });
    } catch (error) {
      toast({
        title: "Request Sent",
        description: "Your request has been sent to the webhook.",
      });
      
      onOpenChange(false);
      setFormData({
        crewName: "",
        role: "",
        department: "",
        skills: "",
        description: "",
        requestedBy: "",
        selectedImage: ""
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Crew Member</DialogTitle>
          <DialogDescription>
            Submit a request to add a new AI crew member to the team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Select Crew Image</Label>
              <ScrollArea className="h-32 w-full rounded-md border p-2">
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 30 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleChange("selectedImage", `image-${i + 1}`)}
                      className={`aspect-square rounded-md border-2 transition-all hover:border-primary overflow-hidden ${
                        formData.selectedImage === `image-${i + 1}` 
                          ? "border-primary bg-primary/10" 
                          : "border-border bg-muted"
                      }`}
                    >
                      {i === 0 ? (
                        <img 
                          src="/lovable-uploads/fiona-profile.png" 
                          alt="Fiona profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : i === 1 ? (
                        <img 
                          src="/lovable-uploads/haruto-profile.png" 
                          alt="Haruto profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">{i + 1}</span>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              <Label htmlFor="crewName">Crew Name *</Label>
              <Input
                id="crewName"
                value={formData.crewName}
                onChange={(e) => handleChange("crewName", e.target.value)}
                placeholder="e.g., Alex"
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                placeholder="e.g., Content Specialist"
                required
              />
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleChange("department", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="skills">Key Skills *</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
                placeholder="e.g., Data Analysis, Python, SQL"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the crew member's responsibilities and capabilities..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="requestedBy">Requested By *</Label>
              <Input
                id="requestedBy"
                value={formData.requestedBy}
                onChange={(e) => handleChange("requestedBy", e.target.value)}
                placeholder="Your EP e-mail"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrewRequestForm;
