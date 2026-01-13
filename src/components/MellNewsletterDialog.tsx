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
    title: "🚀 Twin Crew 공식 런칭 & 첫 번째 크루 Ben 소개",
    category: "Announcement",
    summary: "AI Twin Crew가 공식 런칭되었습니다. 첫 번째 크루 멤버 Ben을 소개합니다!",
    content: `안녕하세요 팀원 여러분!

지난 GEM(Global Employee Meeting)에서 잠시 공유드렸던 **Twin Crew**를 기억하시나요?

<video_embed>https://f.io/b45ENHeR</video_embed>

약속드린 대로, 우리는 여러분의 일상 업무에서 발생하는 **pain point를 해결**하기 위한 AI 에이전트들을 개발하고 있습니다.

**🎯 Twin Crew의 목표**
반복적인 작업을 효율적으로 처리하는 다양한 "Crew" 멤버들을 배치하여, 여러분이 **고부가가치 창의적 전략**에 집중할 수 있도록 돕는 것입니다.

---

**#1. Meet Ben: PTO 모델 이미지 전문가**
👉 [Ben과 함께하기](https://twin-crew.lge.com/pto-gallery)

Ben은 **LG.COM에 최적화된 PTO 모델 이미지**를 생성하는 AI 에이전트입니다.

• **효율성**: 기존 디자인 프로세스의 비용과 리드타임에서 벗어나세요.
• **표준화**: Ben은 LG.com에 완벽하게 맞는 사이즈와 포맷의 이미지를 즉시 생성합니다.

---

**⚠️ 사용 및 예산 관련 중요 공지**

Twin Crew는 실시간 비용이 발생하는 상용 AI 시스템으로 운영됩니다. 현재 HQ에서 초기 롤아웃을 지원하기 위해 **제한된 예산을 스폰서**하고 있습니다.

• **업무용으로만 사용**: 공식 업무에만 Ben을 사용해 주세요.
• **예산 한도**: 과도하거나 비필수적인 사용으로 할당된 예산이 소진되면, 서비스가 **사전 통보 없이 일시 중단**될 수 있습니다.
• **피드백 환영**: Ben이 막 롤아웃되어 아직 최적화가 완료되지 않았을 수 있습니다. 이슈나 추가 요청이 있으시면 donguk.yim@lge.com으로 연락해 주세요.

**더 많은 Twin Crew 멤버들이 곧 합류할 예정입니다! Stay tuned! 🎉**`
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
                          {newsletter.content.split("\n\n").map((paragraph, i) => {
                            // Check for video embed tag
                            const videoMatch = paragraph.match(/<video_embed>(.*?)<\/video_embed>/);
                            if (videoMatch) {
                              const videoUrl = videoMatch[1];
                              return (
                                <div key={i} className="mb-4">
                                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black/20 border border-border/50">
                                    <iframe
                                      src={videoUrl}
                                      className="absolute inset-0 w-full h-full"
                                      allow="autoplay; fullscreen"
                                      allowFullScreen
                                    />
                                  </div>
                                  <a 
                                    href={videoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline mt-2 inline-block"
                                  >
                                    🎬 영상이 보이지 않으면 클릭하세요
                                  </a>
                                </div>
                              );
                            }
                            
                            return (
                              <p
                                key={i}
                                className="text-sm text-muted-foreground mb-3 last:mb-0 whitespace-pre-line"
                                dangerouslySetInnerHTML={{
                                  __html: paragraph
                                    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>")
                                    .replace(/- (.*)/g, "<span class='block ml-2'>• $1</span>")
                                    .replace(/• (.*)/g, "<span class='block ml-2'>• $1</span>")
                                    .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline'>$1</a>")
                                    .replace(/👉 (.*)/g, "<span class='block'>👉 $1</span>")
                                    .replace(/---/g, "<hr class='my-3 border-border/30' />")
                                }}
                              />
                            );
                          })}
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
