import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, RotateCcw, Mic, ListChecks, Monitor, Smartphone, Download, X, Play, Pause, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PodcastSegment {
  imageUrl: string;
  text: string;
  estimatedDuration: number;
}

interface Message {
  role: "user" | "assistant" | "options";
  content: string;
  url?: string;
  screenshot?: string;
  audioBase64?: string;
  script?: string;
  segments?: PodcastSegment[];
  videoBlob?: Blob;
}

type AnalysisOption = "podcast" | "video-podcast" | "audit" | "screenshot-pc" | "screenshot-mobile";

const MaplePDP = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text.trim());
      return true;
    } catch {
      return false;
    }
  };

  const fetchPageContent = async (url: string, mode: string = "content"): Promise<{ content?: string; screenshot?: string }> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maple-scrape`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ url, mode }),
      }
    );

    if (!response.ok) throw new Error("Failed to scrape page");

    const data = await response.json();
    if (!data.success) throw new Error(data.error || "Scrape failed");

    return { content: data.content?.slice(0, 15000), screenshot: data.screenshot };
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  const createVideoFromSegments = async (
    segments: PodcastSegment[],
    audioBase64: string
  ): Promise<Blob> => {
    setVideoGenerationProgress("이미지 로딩 중...");
    
    // Create canvas for video frames
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d")!;
    
    // Load all images
    const loadedImages: (HTMLImageElement | null)[] = [];
    for (const segment of segments) {
      try {
        const img = await loadImage(segment.imageUrl);
        loadedImages.push(img);
      } catch (e) {
        console.warn("Failed to load image:", segment.imageUrl);
        loadedImages.push(null);
      }
    }

    setVideoGenerationProgress("오디오 처리 중...");

    // Create audio element to get duration
    const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
    await new Promise<void>((resolve) => {
      audio.onloadedmetadata = () => resolve();
    });
    const totalDuration = audio.duration;

    // Calculate actual durations proportionally
    const totalEstimated = segments.reduce((sum, s) => sum + s.estimatedDuration, 0);
    const segmentDurations = segments.map(s => (s.estimatedDuration / totalEstimated) * totalDuration);

    setVideoGenerationProgress("비디오 생성 중...");

    // Create MediaRecorder
    const stream = canvas.captureStream(30);
    
    // Add audio track
    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaElementSource(audio);
    const destination = audioContext.createMediaStreamDestination();
    audioSource.connect(destination);
    audioSource.connect(audioContext.destination);
    
    destination.stream.getAudioTracks().forEach(track => {
      stream.addTrack(track);
    });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 5000000,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        audioContext.close();
        resolve(blob);
      };

      mediaRecorder.onerror = (e) => reject(e);
      mediaRecorder.start();
      audio.play();

      let currentSegment = 0;
      let segmentStartTime = 0;
      
      const drawFrame = () => {
        const currentTime = audio.currentTime;
        
        // Determine current segment
        let elapsed = 0;
        for (let i = 0; i < segmentDurations.length; i++) {
          if (currentTime < elapsed + segmentDurations[i]) {
            if (currentSegment !== i) {
              currentSegment = i;
              segmentStartTime = elapsed;
            }
            break;
          }
          elapsed += segmentDurations[i];
        }

        const img = loadedImages[currentSegment];
        
        // Clear and fill background
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (img) {
          // Calculate aspect-fit dimensions
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (canvas.width - scaledWidth) / 2;
          const y = (canvas.height - scaledHeight) / 2;
          
          // Apply subtle zoom effect
          const progress = (currentTime - segmentStartTime) / segmentDurations[currentSegment];
          const zoomFactor = 1 + progress * 0.05; // 5% zoom over segment duration
          
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(zoomFactor, zoomFactor);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          ctx.restore();
        }

        // Add segment text at bottom
        const segment = segments[currentSegment];
        if (segment) {
          // Semi-transparent background for text
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
          
          // Text
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 28px 'Noto Sans KR', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          // Word wrap
          const words = segment.text.split(' ');
          const lines: string[] = [];
          let currentLine = '';
          const maxWidth = canvas.width - 100;
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            if (ctx.measureText(testLine).width > maxWidth) {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          
          const lineHeight = 36;
          const startY = canvas.height - 60 - ((lines.length - 1) * lineHeight / 2);
          lines.slice(0, 2).forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
          });
        }

        if (!audio.ended && !audio.paused) {
          requestAnimationFrame(drawFrame);
        } else {
          setTimeout(() => {
            mediaRecorder.stop();
          }, 500);
        }
      };

      drawFrame();
    });
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    if (!isValidUrl(trimmedInput)) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Please enter a valid URL.\nExample: https://www.lg.com/us/product/..." },
      ]);
      return;
    }

    // Show options for valid URL
    setPendingUrl(trimmedInput);
    setMessages((prev) => [
      ...prev,
      { role: "options", content: "What would you like me to do with this page?", url: trimmedInput },
    ]);
  };

  const handleOptionSelect = async (option: AnalysisOption) => {
    if (!pendingUrl || isLoading) return;
    
    const url = pendingUrl;
    setPendingUrl(null);
    setIsLoading(true);

    // Remove options message
    setMessages((prev) => prev.filter((m) => m.role !== "options"));

    try {
      if (option === "screenshot-pc" || option === "screenshot-mobile") {
        setMessages((prev) => [...prev, { role: "assistant", content: `Taking ${option === "screenshot-pc" ? "PC" : "Mobile (iPhone)"} screenshot... 📸` }]);
        
        const { screenshot } = await fetchPageContent(url, option);
        
        if (screenshot) {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: `Here's the ${option === "screenshot-pc" ? "PC" : "Mobile"} screenshot:`,
              screenshot: screenshot,
            };
            return newMessages;
          });
        } else {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: "assistant", content: "Failed to capture screenshot. Please try again." };
            return newMessages;
          });
        }
      } else if (option === "video-podcast") {
        // Video Podcast with synced images
        setMessages((prev) => [...prev, { role: "assistant", content: "비디오 팟캐스트 생성 중... 🎬\n제품 이미지를 분석하고 스크립트를 작성합니다..." }]);

        const { content: htmlContent } = await fetchPageContent(url, "content");
        
        if (!htmlContent) {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: "assistant", content: "Unable to fetch page content. Please try again." };
            return newMessages;
          });
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maple-pdp-analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ url, htmlContent, analysisType: "video-podcast" }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Video podcast generation failed");
        }

        const data = await response.json();
        
        if (data.success && data.audioBase64 && data.segments) {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: "비디오를 합성하는 중... 🎥",
            };
            return newMessages;
          });

          // Generate video client-side
          try {
            const videoBlob = await createVideoFromSegments(data.segments, data.audioBase64);
            setVideoGenerationProgress(null);

            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                role: "assistant",
                content: "🎬 비디오 팟캐스트가 완성되었습니다!",
                audioBase64: data.audioBase64,
                segments: data.segments,
                script: data.fullScript,
                videoBlob: videoBlob,
              };
              return newMessages;
            });
          } catch (videoError) {
            console.error("Video generation error:", videoError);
            setVideoGenerationProgress(null);
            // Fallback to audio-only
            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                role: "assistant",
                content: "🎙️ 비디오 생성에 실패했지만, 오디오 팟캐스트는 준비되었습니다:",
                audioBase64: data.audioBase64,
                script: data.fullScript,
              };
              return newMessages;
            });
          }
        } else {
          throw new Error("Failed to generate video podcast data");
        }
      } else if (option === "podcast") {
        // Podcast curation with audio (audio only)
        setMessages((prev) => [...prev, { role: "assistant", content: "Preparing your podcast curation... 🎙️\nAnalyzing product and generating voice..." }]);

        const { content: htmlContent } = await fetchPageContent(url, "content");
        
        if (!htmlContent) {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: "assistant", content: "Unable to fetch page content. Please try again." };
            return newMessages;
          });
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maple-pdp-analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ url, htmlContent, analysisType: "podcast" }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Podcast generation failed");
        }

        const data = await response.json();
        
        if (data.success && data.audioBase64) {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: "🎙️ Here's your podcast curation:",
              audioBase64: data.audioBase64,
              script: data.script,
            };
            return newMessages;
          });
        } else {
          throw new Error("Failed to generate podcast");
        }
      } else if (option === "audit") {
        // Content Audit (streaming text)
        setMessages((prev) => [...prev, { role: "assistant", content: "Auditing page content... 📋" }]);

        const { content: htmlContent } = await fetchPageContent(url, "content");
        
        if (!htmlContent) {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: "assistant", content: "Unable to fetch page content. Please try again." };
            return newMessages;
          });
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maple-pdp-analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ url, htmlContent, analysisType: "audit" }),
          }
        );

        if (!response.ok) throw new Error("Analysis failed");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        if (reader) {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: "assistant", content: "" };
            return newMessages;
          });

          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            let newlineIndex: number;
            while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, newlineIndex);
              buffer = buffer.slice(newlineIndex + 1);

              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") break;

              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: "assistant", content: assistantContent };
                    return newMessages;
                  });
                }
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "An error occurred. Please try again.", variant: "destructive" });
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === "assistant") {
          newMessages[newMessages.length - 1] = { role: "assistant", content: "An error occurred. Please try again." };
        } else {
          newMessages.push({ role: "assistant", content: "An error occurred. Please try again." });
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      setVideoGenerationProgress(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setPendingUrl(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentAudioIndex(null);
    setVideoGenerationProgress(null);
  };

  const handleDownloadScreenshot = (e: React.MouseEvent, screenshotUrl: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const link = document.createElement("a");
    link.href = screenshotUrl;
    link.download = `maple-screenshot-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePlayAudio = (audioBase64: string, index: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (currentAudioIndex === index && isPlaying) {
      setIsPlaying(false);
      setCurrentAudioIndex(null);
      return;
    }

    const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudioIndex(null);
    };
    
    audio.play();
    setIsPlaying(true);
    setCurrentAudioIndex(index);
  };

  const handleDownloadAudio = (audioBase64: string) => {
    const link = document.createElement("a");
    link.href = `data:audio/mpeg;base64,${audioBase64}`;
    link.download = `maple-podcast-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadVideo = (videoBlob: Blob) => {
    const url = URL.createObjectURL(videoBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `maple-video-podcast-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex flex-col">
      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setFullscreenImage(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 left-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={(e) => {
              handleDownloadScreenshot(e, fullscreenImage);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
          <img 
            src={fullscreenImage} 
            alt="Full size screenshot" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate("/home")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/maple-profile.png" alt="Maple" className="w-7 h-7 rounded-full" />
          <span className="font-semibold text-foreground">Maple</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleNewChat} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <img src="/lovable-uploads/maple-profile.png" alt="Maple" className="w-16 h-16 rounded-full mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">Maple PDP Curator</h1>
            <p className="text-muted-foreground text-center max-w-md">
              Enter a product page URL you want to analyze.<br />
              I'll create a video podcast with synced images! 🎬
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-6 px-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-6 ${message.role === "user" ? "flex justify-end" : ""}`}>
                {message.role === "assistant" ? (
                  <div className="flex gap-3">
                    <img src="/lovable-uploads/maple-profile.png" alt="Maple" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {message.content || <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                        {videoGenerationProgress && (
                          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {videoGenerationProgress}
                          </div>
                        )}
                      </div>
                      
                      {/* Video Player */}
                      {message.videoBlob && (
                        <div className="mt-4 space-y-3">
                          <video 
                            controls 
                            className="w-full rounded-lg border border-border"
                            src={URL.createObjectURL(message.videoBlob)}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleDownloadVideo(message.videoBlob!)}
                              className="flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download Video
                            </Button>
                            {message.audioBase64 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadAudio(message.audioBase64!)}
                                className="flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Audio Only
                              </Button>
                            )}
                          </div>
                          
                          {/* Script display */}
                          {message.script && (
                            <details className="mt-3">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View script
                              </summary>
                              <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {message.script}
                              </p>
                            </details>
                          )}
                        </div>
                      )}

                      {/* Audio Player (for audio-only podcast) */}
                      {message.audioBase64 && !message.videoBlob && (
                        <div className="mt-4 p-4 bg-secondary/50 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <Button
                              size="icon"
                              variant="default"
                              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
                              onClick={() => handlePlayAudio(message.audioBase64!, index)}
                            >
                              {currentAudioIndex === index && isPlaying ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5 ml-0.5" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">Product Curation</p>
                              <p className="text-xs text-muted-foreground">Tap to {currentAudioIndex === index && isPlaying ? "pause" : "play"}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadAudio(message.audioBase64!)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Script toggle/display */}
                          {message.script && (
                            <details className="mt-3">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View script
                              </summary>
                              <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {message.script}
                              </p>
                            </details>
                          )}
                        </div>
                      )}

                      {/* Screenshot */}
                      {message.screenshot && (
                        <div className="mt-3 space-y-2">
                          <div 
                            className="rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity inline-block"
                            onClick={() => setFullscreenImage(message.screenshot!)}
                          >
                            <img 
                              src={message.screenshot} 
                              alt="Page Screenshot" 
                              className="w-auto h-auto max-w-full"
                              style={{ maxHeight: "70vh" }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleDownloadScreenshot(e, message.screenshot!)}
                              className="flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download PNG
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFullscreenImage(message.screenshot!)}
                              className="text-muted-foreground"
                            >
                              View Full Size
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : message.role === "options" ? (
                  <div className="flex gap-3">
                    <img src="/lovable-uploads/maple-profile.png" alt="Maple" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-foreground mb-3">{message.content}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptionSelect("video-podcast")}
                          disabled={isLoading}
                          className="flex items-center gap-2 bg-primary/10 border-primary/20 hover:bg-primary/20"
                        >
                          <Video className="w-4 h-4" />
                          Video Podcast
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptionSelect("podcast")}
                          disabled={isLoading}
                          className="flex items-center gap-2"
                        >
                          <Mic className="w-4 h-4" />
                          Audio Only
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptionSelect("audit")}
                          disabled={isLoading}
                          className="flex items-center gap-2"
                        >
                          <ListChecks className="w-4 h-4" />
                          Content Audit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptionSelect("screenshot-pc")}
                          disabled={isLoading}
                          className="flex items-center gap-2"
                        >
                          <Monitor className="w-4 h-4" />
                          Screenshot (PC)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptionSelect("screenshot-mobile")}
                          disabled={isLoading}
                          className="flex items-center gap-2"
                        >
                          <Smartphone className="w-4 h-4" />
                          Screenshot (Mobile)
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary rounded-2xl px-4 py-2.5 max-w-[85%]">
                    <p className="text-foreground whitespace-pre-wrap break-all">{message.content}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-secondary rounded-2xl px-4 py-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a PDP URL..."
              className="flex-1 bg-transparent border-0 resize-none focus-visible:ring-0 p-0 min-h-[24px] max-h-[200px] text-foreground placeholder:text-muted-foreground"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-8 w-8 rounded-full bg-foreground hover:bg-foreground/90 disabled:bg-muted flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Maple creates video podcasts synced with product images 🎬</p>
        </div>
      </div>
    </div>
  );
};

export default MaplePDP;
