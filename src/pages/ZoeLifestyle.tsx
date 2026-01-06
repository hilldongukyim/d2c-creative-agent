import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Download, Search, Sparkles, ZoomIn, Square, RectangleVertical, RectangleHorizontal, Film, RefreshCw, Camera, Smartphone, Pencil, Send, MessageCircle, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { QRCodeSVG } from "qrcode.react";
import FeedbackDialog from "@/components/BenFeedbackDialog";

// Chat message type
interface ChatMessage {
  id: string;
  type: "zoe" | "user" | "system";
  content: string;
  component?: React.ReactNode;
  timestamp: Date;
}

// Typing animation hook
const useTypingAnimation = (text: string, speed: number = 30, enabled: boolean = true) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
};

// Zoe message bubble component
const ZoeMessage = ({ content, showTyping = true, onComplete }: { content: string; showTyping?: boolean; onComplete?: () => void }) => {
  const { displayedText, isComplete } = useTypingAnimation(content, 25, showTyping);

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className="flex gap-3 items-start">
      <img
        src="/lovable-uploads/zoe-profile.png"
        alt="Zoe"
        className="w-10 h-10 rounded-full border-2 border-white shadow-md flex-shrink-0"
      />
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[80%]">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{displayedText}</p>
      </div>
    </div>
  );
};

// User message bubble component
const UserMessage = ({ content }: { content: string }) => (
  <div className="flex justify-end">
    <div className="bg-purple-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm max-w-[80%]">
      <p className="text-sm leading-relaxed">{content}</p>
    </div>
  </div>
);

const AnitaLifestyle = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputType, setInputType] = useState<"url" | "select" | "action" | "edit" | null>(null);
  
  // Core state
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isCompositing, setIsCompositing] = useState(false);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isUpscaled, setIsUpscaled] = useState(false);
  const [currentAspectRatio, setCurrentAspectRatio] = useState<"16:9" | "1:1" | "9:16" | "custom">("16:9");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [productName, setProductName] = useState("");
  const [productDimensions, setProductDimensions] = useState<{ width?: string; height?: string; depth?: string; raw?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // QR code dialog state
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isWaitingForMobile, setIsWaitingForMobile] = useState(false);
  
  // Edit prompt state
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Feedback dialog state
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  // Initialize chat with greeting
  useEffect(() => {
    const greeting: ChatMessage = {
      id: "greeting",
      type: "zoe",
      content: "안녕하세요! 저는 Zoe예요. 🎨\n제품 이미지를 멋진 라이프스타일 이미지로 바꿔드릴게요.\n\n변환하고 싶은 제품의 PDP URL을 알려주시겠어요?",
      timestamp: new Date(),
    };
    setMessages([greeting]);
    
    // Show URL input after greeting animation
    setTimeout(() => {
      setShowInput(true);
      setInputType("url");
    }, 2000);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showInput]);

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  // Extract country code from URL
  const extractCountryFromUrl = (pdpUrl: string): string | null => {
    try {
      const urlObj = new URL(pdpUrl);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const countryCode = pathParts[0].toLowerCase();
        const countryMap: Record<string, string> = {
          'us': 'United States', 'kr': 'South Korea', 'de': 'Germany', 'uk': 'United Kingdom',
          'gb': 'United Kingdom', 'fr': 'France', 'it': 'Italy', 'es': 'Spain', 'br': 'Brazil',
          'mx': 'Mexico', 'au': 'Australia', 'in': 'India', 'jp': 'Japan', 'cn': 'China',
          'tw': 'Taiwan', 'hk': 'Hong Kong', 'sg': 'Singapore', 'my': 'Malaysia', 'th': 'Thailand',
          'id': 'Indonesia', 'ph': 'Philippines', 'vn': 'Vietnam', 'nl': 'Netherlands', 'be': 'Belgium',
          'at': 'Austria', 'ch': 'Switzerland', 'pl': 'Poland', 'se': 'Sweden', 'no': 'Norway',
          'dk': 'Denmark', 'fi': 'Finland', 'pt': 'Portugal', 'ru': 'Russia', 'tr': 'Turkey',
          'ae': 'United Arab Emirates', 'sa': 'Saudi Arabia', 'za': 'South Africa', 'ca': 'Canada',
          'ar': 'Argentina', 'cl': 'Chile', 'co': 'Colombia', 'pe': 'Peru', 'nz': 'New Zealand',
        };
        if (countryMap[countryCode]) return countryMap[countryCode];
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleUrlSubmit = async () => {
    if (!url) {
      toast.error("URL을 입력해주세요");
      return;
    }

    // Add user message
    addMessage({ type: "user", content: url });
    setShowInput(false);
    setInputType(null);

    // Add Zoe's response
    setTimeout(() => {
      addMessage({ type: "zoe", content: "좋아요! URL을 확인하고 있어요... 잠시만 기다려주세요. ✨" });
    }, 300);

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("anita-extract-carousel", {
        body: { url },
      });

      if (error) throw error;
      if (!data.success || !data.images || data.images.length === 0) {
        addMessage({ type: "zoe", content: "이런, 이 URL에서는 제품 이미지를 찾지 못했어요. 😅\n다른 URL을 알려주시겠어요?" });
        setShowInput(true);
        setInputType("url");
        return;
      }

      setCarouselImages(data.images);
      setProductName(data.productName || "product");
      setProductDimensions(data.productDimensions || null);

      const dimensionInfo = data.productDimensions?.raw ? `\n(제품 크기: ${data.productDimensions.raw})` : '';
      
      setTimeout(() => {
        addMessage({ 
          type: "zoe", 
          content: `${data.images.length}개의 제품 이미지를 찾았어요! 🎉${dimensionInfo}\n\n어떤 이미지로 라이프스타일 이미지를 만들어 드릴까요? 아래에서 선택해주세요!` 
        });
        
        setTimeout(() => {
          setShowInput(true);
          setInputType("select");
        }, 1500);
      }, 500);
      
    } catch (error) {
      console.error("Error extracting images:", error);
      addMessage({ type: "zoe", content: "URL 분석 중 오류가 발생했어요. 😢\n다른 URL로 다시 시도해볼까요?" });
      setShowInput(true);
      setInputType("url");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (img: string) => {
    setSelectedImage(img);
  };

  const handleImageConfirm = () => {
    if (!selectedImage) {
      toast.error("이미지를 선택해주세요");
      return;
    }

    // Add user selection message
    addMessage({ type: "user", content: "이 이미지로 할게요!" });
    setShowInput(false);
    setInputType(null);

    setTimeout(() => {
      addMessage({ 
        type: "zoe", 
        content: "좋은 선택이에요! 👍\n\n이제 어떻게 해드릴까요?\n• AI 라이프스타일 생성 - AI가 멋진 배경을 만들어드려요\n• 내 사진 사용 - 직접 찍은 사진에 합성해드려요" 
      });
      
      setTimeout(() => {
        setShowInput(true);
        setInputType("action");
      }, 1500);
    }, 300);
  };

  const handleGenerateLifestyle = async () => {
    addMessage({ type: "user", content: "AI 라이프스타일로 만들어주세요!" });
    setShowInput(false);
    setInputType(null);

    setTimeout(() => {
      addMessage({ type: "zoe", content: "알겠어요! AI가 열심히 그리고 있어요... 🎨\n약 30초 정도 걸려요. 잠시만 기다려주세요!" });
    }, 300);

    setIsGenerating(true);
    setIsUpscaled(false);
    setGeneratedVideoUrl(null);
    
    try {
      const country = extractCountryFromUrl(url);
      
      const { data, error } = await supabase.functions.invoke("anita-generate-lifestyle", {
        body: { imageUrl: selectedImage, aspectRatio: "16:9", country, productDimensions },
      });

      if (error) throw error;
      if (!data.success || !data.imageBase64) {
        throw new Error(data.error || "Failed to generate lifestyle image");
      }

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setCurrentAspectRatio("16:9");
      
      setTimeout(() => {
        addMessage({ 
          type: "zoe", 
          content: "완성됐어요! ✨\n어떠세요? 마음에 드시면 다운로드하시고, 수정이 필요하면 아래에서 원하시는 작업을 선택해주세요!" 
        });
        
        setTimeout(() => {
          setShowInput(true);
          setInputType("edit");
        }, 1500);
      }, 500);
      
    } catch (error) {
      console.error("Error generating lifestyle image:", error);
      addMessage({ type: "zoe", content: "이미지 생성 중 오류가 발생했어요. 😢\n다시 시도해볼까요?" });
      setShowInput(true);
      setInputType("action");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCameraClick = async () => {
    addMessage({ type: "user", content: "내 사진에 합성해주세요!" });
    setShowInput(false);
    
    if (isMobile) {
      fileInputRef.current?.click();
    } else {
      const newSessionId = Math.random().toString(36).substring(2, 15);
      setSessionId(newSessionId);
      setShowQRDialog(true);
      setIsWaitingForMobile(true);
      
      addMessage({ type: "zoe", content: "QR 코드를 스마트폰으로 스캔하시면, 카메라로 사진을 찍으실 수 있어요! 📱" });
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedImage) return;

    addMessage({ type: "zoe", content: "사진을 받았어요! 제품을 합성하고 있어요... 🔧\n약 1분 정도 걸릴 수 있어요." });
    
    setIsCompositing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const backgroundBase64 = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke("anita-photo-composite", {
          body: { 
            productImageUrl: selectedImage,
            backgroundImageBase64: backgroundBase64 
          },
        });

        if (error) throw error;
        if (!data.success || !data.imageBase64) {
          throw new Error(data.error || "Composite failed");
        }

        setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
        setCurrentAspectRatio("custom");
        
        addMessage({ type: "zoe", content: "합성 완료! 🎉\n제품이 사진에 자연스럽게 들어갔어요. 어떠세요?" });
        setShowInput(true);
        setInputType("edit");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error compositing:", error);
      addMessage({ type: "zoe", content: "합성 중 오류가 발생했어요. 😢\n다시 시도해볼까요?" });
      setShowInput(true);
      setInputType("action");
    } finally {
      setIsCompositing(false);
    }
  };

  // QR dialog subscription effect
  useEffect(() => {
    if (!sessionId || !showQRDialog) return;

    const channel = supabase.channel(`zoe-camera-${sessionId}`);

    channel
      .on("broadcast", { event: "photo-result" }, async (payload) => {
        const { compositeBase64 } = payload.payload;
        
        if (compositeBase64) {
          setGeneratedImage(`data:image/png;base64,${compositeBase64}`);
          setCurrentAspectRatio("custom");
          setShowQRDialog(false);
          setIsWaitingForMobile(false);
          
          addMessage({ type: "zoe", content: "모바일에서 촬영한 사진으로 합성을 완료했어요! 📱✨" });
          setShowInput(true);
          setInputType("edit");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, showQRDialog]);

  const handleUpscale = async () => {
    if (!generatedImage) return;
    
    addMessage({ type: "user", content: "4K로 업스케일 해주세요!" });
    setShowInput(false);
    
    addMessage({ type: "zoe", content: "4K 고화질로 업스케일하고 있어요... 🔍\n약 30초 정도 걸려요!" });
    
    setIsUpscaling(true);
    try {
      const { data, error } = await supabase.functions.invoke("anita-upscale", {
        body: { imageBase64: generatedImage },
      });

      if (error) throw error;
      if (!data.success || !data.imageBase64) {
        throw new Error(data.error || "Upscale failed");
      }

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setIsUpscaled(true);
      
      addMessage({ type: "zoe", content: "4K 업스케일 완료! 🎉\n이제 초고화질 이미지를 다운로드할 수 있어요." });
      setShowInput(true);
      setInputType("edit");
    } catch (error) {
      console.error("Error upscaling:", error);
      addMessage({ type: "zoe", content: "업스케일 중 오류가 발생했어요. 😢" });
      setShowInput(true);
      setInputType("edit");
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleResize = async (ratio: "16:9" | "1:1" | "9:16") => {
    if (!generatedImage || currentAspectRatio === ratio) return;
    
    const ratioLabels = { "16:9": "가로형 (16:9)", "1:1": "정사각형 (1:1)", "9:16": "세로형 (9:16)" };
    addMessage({ type: "user", content: `${ratioLabels[ratio]}으로 변경해주세요!` });
    setShowInput(false);
    
    addMessage({ type: "zoe", content: `${ratioLabels[ratio]}로 리사이징하고 있어요... 📐` });
    
    setIsResizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("anita-resize-lifestyle", {
        body: { imageBase64: generatedImage.split(',')[1], aspectRatio: ratio },
      });

      if (error) throw error;
      if (!data.success || !data.imageBase64) {
        throw new Error(data.error || "Resize failed");
      }

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setCurrentAspectRatio(ratio);
      setIsUpscaled(false);
      
      addMessage({ type: "zoe", content: "리사이징 완료! ✂️\n새로운 비율로 이미지를 만들었어요." });
      setShowInput(true);
      setInputType("edit");
    } catch (error) {
      console.error("Error resizing:", error);
      addMessage({ type: "zoe", content: "리사이징 중 오류가 발생했어요. 😢" });
      setShowInput(true);
      setInputType("edit");
    } finally {
      setIsResizing(false);
    }
  };

  const handleEditImage = async () => {
    if (!generatedImage || !editPrompt.trim()) return;
    
    addMessage({ type: "user", content: `이미지를 수정해주세요: "${editPrompt}"` });
    setShowInput(false);
    const currentPrompt = editPrompt;
    setEditPrompt("");
    
    addMessage({ type: "zoe", content: "요청하신 대로 이미지를 수정하고 있어요... ✏️\n약 30초 정도 걸려요!" });
    
    setIsEditing(true);
    try {
      const { data, error } = await supabase.functions.invoke("anita-edit-lifestyle", {
        body: { imageBase64: generatedImage, editPrompt: currentPrompt },
      });

      if (error) throw error;
      if (!data.success || !data.imageBase64) {
        throw new Error(data.error || "Edit failed");
      }

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setIsUpscaled(false);
      
      addMessage({ type: "zoe", content: "수정 완료! 🎨\n요청하신 대로 이미지를 변경했어요. 어떠세요?" });
      setShowInput(true);
      setInputType("edit");
    } catch (error) {
      console.error("Error editing:", error);
      addMessage({ type: "zoe", content: "이미지 수정 중 오류가 발생했어요. 😢\n다시 시도해볼까요?" });
      setShowInput(true);
      setInputType("edit");
    } finally {
      setIsEditing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedImage) return;
    
    addMessage({ type: "user", content: "동영상으로 만들어주세요!" });
    setShowInput(false);
    
    addMessage({ type: "zoe", content: "이미지를 동영상으로 변환하고 있어요... 🎬\n약 2-3분 정도 걸릴 수 있어요. 조금만 기다려주세요!" });
    
    setGeneratedVideoUrl(null);
    setIsGeneratingVideo(true);
    try {
      const { data, error } = await supabase.functions.invoke("anita-generate-video", {
        body: { imageBase64: generatedImage },
      });

      if (error) throw error;
      if (!data.success || !data.videoUrl) {
        throw new Error(data.error || "Video generation failed");
      }

      setGeneratedVideoUrl(data.videoUrl);
      
      addMessage({ type: "zoe", content: "동영상 생성 완료! 🎉\n아래에서 동영상을 확인하고 다운로드할 수 있어요." });
      setShowInput(true);
      setInputType("edit");
    } catch (error) {
      console.error("Error generating video:", error);
      addMessage({ type: "zoe", content: "동영상 생성 중 오류가 발생했어요. 😢\n나중에 다시 시도해주세요." });
      setShowInput(true);
      setInputType("edit");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleRegenerate = async () => {
    addMessage({ type: "user", content: "다른 스타일로 다시 만들어주세요!" });
    setShowInput(false);
    
    await handleGenerateLifestyle();
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const sizeStr = isUpscaled ? "3840x2160" : (currentAspectRatio === "1:1" ? "1080x1080" : currentAspectRatio === "9:16" ? "1080x1920" : "1920x1080");
    const safeName = productName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
    
    link.download = `Zoe_${safeName}_${dateStr}_${sizeStr}.png`;
    link.href = generatedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addMessage({ type: "zoe", content: "다운로드 완료! 📥\n다른 작업이 필요하시면 말씀해주세요." });
  };

  const handleDownloadVideo = () => {
    if (!generatedVideoUrl) return;
    
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const safeName = productName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
    
    link.download = `Zoe_${safeName}_${dateStr}_video.mp4`;
    link.href = generatedVideoUrl;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartOver = () => {
    setUrl("");
    setCarouselImages([]);
    setSelectedImage(null);
    setGeneratedImage(null);
    setGeneratedVideoUrl(null);
    setIsUpscaled(false);
    setMessages([]);
    setShowInput(false);
    setInputType(null);
    
    // Restart conversation
    setTimeout(() => {
      addMessage({
        type: "zoe",
        content: "새로운 이미지를 만들어볼까요? 🎨\n제품 PDP URL을 알려주세요!",
      });
      setTimeout(() => {
        setShowInput(true);
        setInputType("url");
      }, 1500);
    }, 300);
  };

  const getQRCodeUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/zoe-camera/${sessionId}`;
  };

  const isAnyLoading = isLoading || isGenerating || isUpscaling || isResizing || isEditing || isCompositing || isGeneratingVideo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8D5E0] via-[#F0E6E8] to-[#E8D5E0] flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <Button
            onClick={() => navigate("/home")}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/zoe-profile.png"
              alt="Zoe"
              className="w-8 h-8 rounded-full border-2 border-purple-200"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Zoe</p>
              <p className="text-xs text-gray-500">Lifestyle Artist</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFeedbackDialog(true)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pt-20 pb-32 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === "zoe" ? (
                <ZoeMessage content={msg.content} showTyping={false} />
              ) : msg.type === "user" ? (
                <UserMessage content={msg.content} />
              ) : null}
            </div>
          ))}
          
          {/* Loading indicator */}
          {isAnyLoading && (
            <div className="flex gap-3 items-start">
              <img
                src="/lovable-uploads/zoe-profile.png"
                alt="Zoe"
                className="w-10 h-10 rounded-full border-2 border-white shadow-md flex-shrink-0"
              />
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  <span className="text-sm text-gray-500">작업 중...</span>
                </div>
              </div>
            </div>
          )}

          {/* Generated Image Preview */}
          {generatedImage && !isGenerating && (
            <div className="flex gap-3 items-start">
              <img
                src="/lovable-uploads/zoe-profile.png"
                alt="Zoe"
                className="w-10 h-10 rounded-full border-2 border-white shadow-md flex-shrink-0"
              />
              <div className="bg-white rounded-2xl rounded-tl-sm p-2 shadow-sm max-w-[90%]">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="rounded-lg max-w-full h-auto"
                />
                {isUpscaled && (
                  <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">4K</span>
                )}
              </div>
            </div>
          )}

          {/* Generated Video Preview */}
          {generatedVideoUrl && !isGeneratingVideo && (
            <div className="flex gap-3 items-start">
              <img
                src="/lovable-uploads/zoe-profile.png"
                alt="Zoe"
                className="w-10 h-10 rounded-full border-2 border-white shadow-md flex-shrink-0"
              />
              <div className="bg-white rounded-2xl rounded-tl-sm p-2 shadow-sm max-w-[90%]">
                <video
                  src={generatedVideoUrl}
                  controls
                  className="rounded-lg max-w-full h-auto"
                />
                <Button
                  onClick={handleDownloadVideo}
                  size="sm"
                  className="mt-2 bg-indigo-500 hover:bg-indigo-600"
                >
                  <Download className="w-3 h-3 mr-1" />
                  동영상 다운로드
                </Button>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* URL Input */}
          {showInput && inputType === "url" && (
            <div className="flex gap-2">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="PDP URL을 입력해주세요..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button
                onClick={handleUrlSubmit}
                disabled={isLoading || !url}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          )}

          {/* Image Selection */}
          {showInput && inputType === "select" && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {carouselImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleImageSelect(img)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? "border-purple-500 ring-2 ring-purple-300" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-16 object-contain bg-white" />
                    {selectedImage === img && (
                      <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-purple-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button
                onClick={handleImageConfirm}
                disabled={!selectedImage}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                이 이미지로 선택
              </Button>
            </div>
          )}

          {/* Action Selection */}
          {showInput && inputType === "action" && (
            <div className="flex gap-2 flex-wrap justify-center">
              <Button onClick={handleGenerateLifestyle} disabled={isAnyLoading} className="bg-purple-500 hover:bg-purple-600">
                <Sparkles className="w-4 h-4 mr-2" />
                AI 라이프스타일 생성
              </Button>
              <Button onClick={handleCameraClick} disabled={isAnyLoading} variant="outline" className="border-teal-300 text-teal-600">
                <Camera className="w-4 h-4 mr-2" />
                내 사진 사용
              </Button>
            </div>
          )}

          {/* Edit Options */}
          {showInput && inputType === "edit" && (
            <div className="space-y-3">
              {/* Edit prompt */}
              <div className="flex gap-2">
                <Input
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="이미지 수정 요청을 입력하세요..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && editPrompt.trim() && handleEditImage()}
                />
                <Button
                  onClick={handleEditImage}
                  disabled={isAnyLoading || !editPrompt.trim()}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Quick actions */}
              <div className="flex gap-2 flex-wrap justify-center">
                <Button onClick={handleDownload} disabled={isAnyLoading} size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Download className="w-3 h-3 mr-1" />
                  다운로드
                </Button>
                {!isUpscaled && (
                  <Button onClick={handleUpscale} disabled={isAnyLoading} size="sm" variant="outline">
                    <ZoomIn className="w-3 h-3 mr-1" />
                    4K 업스케일
                  </Button>
                )}
                <Button onClick={handleRegenerate} disabled={isAnyLoading} size="sm" variant="outline">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  다시 생성
                </Button>
                <Button onClick={handleGenerateVideo} disabled={isAnyLoading} size="sm" variant="outline">
                  <Film className="w-3 h-3 mr-1" />
                  동영상
                </Button>
              </div>

              {/* Resize options */}
              <div className="flex gap-2 justify-center items-center">
                <span className="text-xs text-gray-500">비율:</span>
                <Button 
                  size="sm" 
                  variant={currentAspectRatio === "16:9" ? "default" : "outline"} 
                  onClick={() => handleResize("16:9")}
                  disabled={isAnyLoading || currentAspectRatio === "16:9"}
                  className={currentAspectRatio === "16:9" ? "bg-purple-500 text-xs h-7" : "text-xs h-7"}
                >
                  <RectangleHorizontal className="w-3 h-3 mr-1" />16:9
                </Button>
                <Button 
                  size="sm" 
                  variant={currentAspectRatio === "1:1" ? "default" : "outline"} 
                  onClick={() => handleResize("1:1")}
                  disabled={isAnyLoading || currentAspectRatio === "1:1"}
                  className={currentAspectRatio === "1:1" ? "bg-purple-500 text-xs h-7" : "text-xs h-7"}
                >
                  <Square className="w-3 h-3 mr-1" />1:1
                </Button>
                <Button 
                  size="sm" 
                  variant={currentAspectRatio === "9:16" ? "default" : "outline"} 
                  onClick={() => handleResize("9:16")}
                  disabled={isAnyLoading || currentAspectRatio === "9:16"}
                  className={currentAspectRatio === "9:16" ? "bg-purple-500 text-xs h-7" : "text-xs h-7"}
                >
                  <RectangleVertical className="w-3 h-3 mr-1" />9:16
                </Button>
              </div>

              {/* Start over */}
              <div className="flex justify-center">
                <Button onClick={handleStartOver} size="sm" variant="ghost" className="text-gray-500">
                  처음부터 다시 시작
                </Button>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              모바일로 사진 촬영
            </DialogTitle>
            <DialogDescription>
              QR 코드를 스마트폰으로 스캔하여 사진을 촬영하세요
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 p-4">
            {sessionId && (
              <div className="bg-white p-4 rounded-lg shadow-inner">
                <QRCodeSVG value={getQRCodeUrl()} size={200} />
              </div>
            )}
            {isWaitingForMobile && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                모바일 연결 대기 중...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
        crewName="Zoe"
        productUrls={[url].filter(Boolean)}
      />
    </div>
  );
};

export default AnitaLifestyle;