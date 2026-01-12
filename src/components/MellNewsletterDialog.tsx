import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, Mail, Calendar } from "lucide-react";

interface Newsletter {
  id: string;
  date: string;
  title: string;
  category: "Team Update" | "Announcement" | "Product News" | "Tips & Tricks";
  summary: string;
  content: string;
}

interface MellNewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const newsletters: Newsletter[] = [
  {
    id: "1",
    date: "2026-01-10",
    title: "New AI Crew Members Joining This Month",
    category: "Team Update",
    summary: "We're excited to announce new additions to our AI crew that will enhance our capabilities.",
    content: `We're thrilled to welcome new members to our AI Twin Crew family this month!

**New Additions:**
- **Mell** - Newsletter Manager: Keeping everyone informed with timely updates and announcements
- **Support Team Formation**: A new division dedicated to crew support and communication

These additions reflect our commitment to improving team communication and ensuring everyone stays up-to-date with the latest developments.

Stay tuned for more updates as we continue to grow and evolve our AI crew capabilities.`
  },
  {
    id: "2",
    date: "2026-01-05",
    title: "System Maintenance Completed Successfully",
    category: "Announcement",
    summary: "Our scheduled maintenance has been completed with improved performance across all systems.",
    content: `The scheduled system maintenance has been successfully completed ahead of schedule.

**What's Improved:**
- Faster response times across all AI crew interactions
- Enhanced stability for long-running tasks
- Improved data processing capabilities

**Impact:**
All systems are now operating at optimal performance. You may notice faster load times and smoother interactions with your AI crew members.

Thank you for your patience during the maintenance window.`
  },
  {
    id: "3",
    date: "2025-12-28",
    title: "Year-End Review: AI Crew Achievements 2025",
    category: "Product News",
    summary: "A look back at what our AI crew accomplished throughout the year.",
    content: `As we close out 2025, let's celebrate the incredible achievements of our AI Twin Crew!

**Key Milestones:**
- Processed over 10,000 content requests
- Launched 5 new AI crew members
- Achieved 98% user satisfaction rate
- Reduced average task completion time by 40%

**Top Performers:**
- Yumi: Led content creation initiatives
- Ben: Pioneered image processing workflows
- Kai: Revolutionized background removal capabilities

We're grateful for your continued support and look forward to an even more productive 2026!`
  },
  {
    id: "4",
    date: "2025-12-20",
    title: "How to Get the Most Out of Your AI Crew",
    category: "Tips & Tricks",
    summary: "Pro tips for maximizing productivity with your AI crew members.",
    content: `Want to supercharge your workflow? Here are some insider tips for working with your AI crew:

**Communication Tips:**
1. Be specific with your requests - the more detail, the better results
2. Use the search function to find the right crew member for your task
3. Check crew member profiles to understand their specialties

**Workflow Optimization:**
- Batch similar tasks together for efficiency
- Use Mochi to request new capabilities when needed
- Review completed work and provide feedback for continuous improvement

**Pro Tips:**
- Each crew member has a unique personality that influences their work style
- Don't hesitate to try different approaches with the same task
- Keep an eye on newsletters for new features and updates!`
  },
  {
    id: "5",
    date: "2025-12-15",
    title: "Introducing Enhanced Image Processing",
    category: "Product News",
    summary: "New image processing capabilities are now available across multiple crew members.",
    content: `We've rolled out significant upgrades to our image processing capabilities!

**New Features:**
- Higher resolution output support (up to 4K)
- Advanced background removal with edge refinement
- Batch processing for multiple images
- New lifestyle image generation styles

**Affected Crew Members:**
- Kai: Enhanced background removal precision
- Ben: Improved product image processing
- Anita: New lifestyle composition options

Try out these new features today and experience the difference in quality and speed!`
  }
];

const categoryColors: Record<Newsletter["category"], string> = {
  "Team Update": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Announcement": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Product News": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Tips & Tricks": "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const MellNewsletterDialog: React.FC<MellNewsletterDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/30">
              <img
                src="/lovable-uploads/mell-profile.png"
                alt="Mell"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Newsletters & Announcements
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Stay updated with the latest news from your AI crew
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(85vh-120px)]">
          <div className="p-6 space-y-4">
            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-border/50" />

              {newsletters.map((newsletter, index) => (
                <div key={newsletter.id} className="relative pl-8 pb-6 last:pb-0">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>

                  {/* Card */}
                  <div
                    className={`
                      bg-card border border-border/50 rounded-lg overflow-hidden
                      transition-all duration-200 hover:border-primary/30 hover:shadow-lg
                      ${expandedId === newsletter.id ? "ring-1 ring-primary/20" : ""}
                    `}
                  >
                    {/* Card Header */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => toggleExpand(newsletter.id)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(newsletter.date)}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${categoryColors[newsletter.category]}`}
                        >
                          {newsletter.category}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-foreground mb-2 leading-tight">
                        {newsletter.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {newsletter.summary}
                      </p>

                      <button
                        className="mt-3 text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                      >
                        {expandedId === newsletter.id ? (
                          <>
                            Show Less <ChevronUp className="h-3 w-3" />
                          </>
                        ) : (
                          <>
                            Read More <ChevronDown className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Expanded Content */}
                    {expandedId === newsletter.id && (
                      <div className="px-4 pb-4 pt-0 border-t border-border/30">
                        <div className="pt-4 prose prose-sm prose-invert max-w-none">
                          {newsletter.content.split("\n\n").map((paragraph, i) => (
                            <p
                              key={i}
                              className="text-sm text-muted-foreground mb-3 last:mb-0 whitespace-pre-line"
                              dangerouslySetInnerHTML={{
                                __html: paragraph
                                  .replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>")
                                  .replace(/- (.*)/g, "<span class='block ml-2'>• $1</span>")
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MellNewsletterDialog;
