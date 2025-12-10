import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Download, Search, Sparkles, ZoomIn, Square, RectangleVertical, RectangleHorizontal, Film, RefreshCw, Camera, Smartphone, Pencil, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { QRCodeSVG } from "qrcode.react";

const AnitaLifestyle = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
  const [step, setStep] = useState<"input" | "select" | "result">("input");
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

  const handleExtractImages = async () => {
    if (!url) {
      toast.error("Please enter a PDP URL");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("anita-extract-carousel", {
        body: { url },
      });

      if (error) throw error;
      if (!data.success || !data.images || data.images.length === 0) {
        toast.error("No carousel images found on this page");
        return;
      }

      setCarouselImages(data.images);
      setProductName(data.productName || "product");
      setProductDimensions(data.productDimensions || null);
      setStep("select");
      
      const dimensionInfo = data.productDimensions?.raw ? ` (Size: ${data.productDimensions.raw})` : '';
      toast.success(`Found ${data.images.length} carousel images${dimensionInfo}`);
    } catch (error) {
      console.error("Error extracting images:", error);
      toast.error("Failed to extract images from URL");
    } finally {
      setIsLoading(false);
    }
  };

  // Extract country code from URL
  const extractCountryFromUrl = (pdpUrl: string): string | null => {
    try {
      const urlObj = new URL(pdpUrl);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      // LG URL pattern: lg.com/{country-code}/... (e.g., /us/, /kr/, /de/, /uk/, /fr/, /it/, /es/, /br/, /mx/, /au/, /in/, /jp/)
      if (pathParts.length > 0) {
        const countryCode = pathParts[0].toLowerCase();
        // Common country codes
        const countryMap: Record<string, string> = {
          'us': 'United States',
          'kr': 'South Korea',
          'de': 'Germany',
          'uk': 'United Kingdom',
          'gb': 'United Kingdom',
          'fr': 'France',
          'it': 'Italy',
          'es': 'Spain',
          'br': 'Brazil',
          'mx': 'Mexico',
          'au': 'Australia',
          'in': 'India',
          'jp': 'Japan',
          'cn': 'China',
          'tw': 'Taiwan',
          'hk': 'Hong Kong',
          'sg': 'Singapore',
          'my': 'Malaysia',
          'th': 'Thailand',
          'id': 'Indonesia',
          'ph': 'Philippines',
          'vn': 'Vietnam',
          'nl': 'Netherlands',
          'be': 'Belgium',
          'at': 'Austria',
          'ch': 'Switzerland',
          'pl': 'Poland',
          'se': 'Sweden',
          'no': 'Norway',
          'dk': 'Denmark',
          'fi': 'Finland',
          'pt': 'Portugal',
          'ru': 'Russia',
          'tr': 'Turkey',
          'ae': 'United Arab Emirates',
          'sa': 'Saudi Arabia',
          'za': 'South Africa',
          'ca': 'Canada',
          'ar': 'Argentina',
          'cl': 'Chile',
          'co': 'Colombia',
          'pe': 'Peru',
          'nz': 'New Zealand',
        };
        if (countryMap[countryCode]) {
          return countryMap[countryCode];
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleGenerateLifestyle = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsGenerating(true);
    // Reset previous generation results when re-generating
    setIsUpscaled(false);
    setGeneratedVideoUrl(null);
    
    try {
      // Extract country from the original URL
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
      setStep("result");
      toast.success("Lifestyle image generated!");
    } catch (error) {
      console.error("Error generating lifestyle image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate lifestyle image");
    } finally {
      setIsGenerating(false);
    }
  };

  const getDateString = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yy}${mm}${dd}`;
  };

  const getSizeString = () => {
    if (isUpscaled) return "3840x2160";
    switch (currentAspectRatio) {
      case "1:1": return "1080x1080";
      case "9:16": return "1080x1920";
      case "16:9": return "1920x1080";
      case "custom": return `${customWidth}x${customHeight}`;
      default: return "1920x1080";
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    const filename = `${getDateString()}_lifestyle_${productName}_${getSizeString()}.png`;
    link.download = filename;
    link.click();
    toast.success("Image downloaded!");
  };

  const handleUpscale = async () => {
    if (!generatedImage) return;

    setIsUpscaling(true);
    try {
      const { data, error } = await supabase.functions.invoke("anita-upscale", {
        body: { imageBase64: generatedImage },
      });

      if (error) throw error;
      if (!data.success || !data.imageBase64) {
        throw new Error(data.error || "Failed to upscale image");
      }

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setIsUpscaled(true);
      toast.success("Image upscaled to 4K!");
    } catch (error) {
      console.error("Error upscaling image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upscale image");
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setCarouselImages([]);
    setSelectedImage(null);
    setGeneratedImage(null);
    setGeneratedVideoUrl(null);
    setIsUpscaled(false);
    setStep("input");
    setCurrentAspectRatio("16:9");
    setSessionId(null);
    setShowQRDialog(false);
    setIsWaitingForMobile(false);
    setEditPrompt("");
  };

  const handleEditImage = async () => {
    if (!generatedImage || !editPrompt.trim()) {
      toast.error("Please enter an edit prompt");
      return;
    }

    setIsEditing(true);
    try {
      const { data, error } = await supabase.functions.invoke("anita-edit-lifestyle", {
        body: { imageBase64: generatedImage, editPrompt: editPrompt.trim() },
      });

      if (error) throw error;
      if (!data.success || !data.imageBase64) {
        throw new Error(data.error || "Failed to edit image");
      }

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setIsUpscaled(false);
      setGeneratedVideoUrl(null);
      setEditPrompt("");
      toast.success("Image edited successfully!");
    } catch (error) {
      console.error("Error editing image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to edit image");
    } finally {
      setIsEditing(false);
    }
  };

  // Generate session ID and setup Realtime listener for QR code flow
  const handleCameraClick = () => {
    if (!selectedImage) {
      toast.error("Please select a product image first");
      return;
    }

    if (isMobile) {
      // Mobile: directly open camera
      fileInputRef.current?.click();
    } else {
      // PC: show QR code dialog
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      setShowQRDialog(true);
      setIsWaitingForMobile(true);
    }
  };

  // Setup Realtime channel when QR dialog is shown
  useEffect(() => {
    if (!sessionId || !showQRDialog) return;

    const channel = supabase.channel(`anita-camera-${sessionId}`);

    channel
      .on("broadcast", { event: "mobile-ready" }, () => {
        console.log("Mobile device connected, sending product info");
        // Send product info to mobile
        channel.send({
          type: "broadcast",
          event: "product-info",
          payload: {
            productImageUrl: selectedImage,
            productName,
          },
        });
        toast.success("Mobile device connected!");
      })
      .on("broadcast", { event: "photo-result" }, (payload) => {
        console.log("Received photo result from mobile:", payload);
        const { imageBase64, productName: receivedProductName } = payload.payload;
        
        setGeneratedImage(`data:image/png;base64,${imageBase64}`);
        setCurrentAspectRatio("custom");
        setStep("result");
        setShowQRDialog(false);
        setIsWaitingForMobile(false);
        toast.success("Photo received from mobile!");
      })
      .subscribe((status) => {
        console.log("PC channel status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, showQRDialog, selectedImage, productName]);

  // Get QR code URL
  const getQRCodeUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/anita-camera/${sessionId}`;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedImage) return;

    // Reset input so same file can be selected again
    e.target.value = "";

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const backgroundImageBase64 = reader.result as string;
      
      setIsCompositing(true);
      setIsUpscaled(false);
      setGeneratedVideoUrl(null);
      
      try {
        const { data, error } = await supabase.functions.invoke("anita-photo-composite", {
          body: { 
            productImageUrl: selectedImage,
            backgroundImageBase64 
          },
        });

        if (error) throw error;
        if (!data.success || !data.imageBase64) {
          throw new Error(data.error || "Failed to composite image");
        }

        setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
        setCurrentAspectRatio("custom");
        setStep("result");
        toast.success("Product composited into your photo!");
      } catch (error) {
        console.error("Error compositing photo:", error);
        toast.error(error instanceof Error ? error.message : "Failed to composite image");
      } finally {
        setIsCompositing(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleGenerateVideo = async () => {
    if (!generatedImage) return;

    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke("anita-generate-video", {
        body: { imageBase64: generatedImage },
      });

      if (error) throw error;
      if (!data.success || !data.videoUrl) {
        throw new Error(data.error || "Failed to generate video");
      }

      setGeneratedVideoUrl(data.videoUrl);
      toast.success("Video generated!");
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate video");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!generatedVideoUrl) return;

    const link = document.createElement("a");
    link.href = generatedVideoUrl;
    const filename = `${getDateString()}_${productName}_video.mp4`;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Video download started!");
  };

  const handleResize = async (newRatio: "16:9" | "1:1" | "9:16" | "custom", width?: number, height?: number) => {
    if (!generatedImage) return;
    if (newRatio !== "custom" && newRatio === currentAspectRatio) return;

    setIsResizing(true);
    try {
      const body: any = { imageBase64: generatedImage };
      
      if (newRatio === "custom" && width && height) {
        body.customWidth = width;
        body.customHeight = height;
      } else {
        body.aspectRatio = newRatio;
      }

      const { data, error } = await supabase.functions.invoke("anita-resize-lifestyle", {
        body,
      });

      if (error) throw error;
      if (!data.success || !data.imageBase64) {
        throw new Error(data.error || "Failed to resize image");
      }

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setCurrentAspectRatio(newRatio);
      setIsUpscaled(false);
      
      const sizeLabel = newRatio === "custom" ? `${width}×${height}` : newRatio;
      toast.success(`Resized to ${sizeLabel}!`);
    } catch (error) {
      console.error("Error resizing image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to resize image");
    } finally {
      setIsResizing(false);
    }
  };

  const handleCustomResize = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (!width || !height || width < 100 || height < 100) {
      toast.error("Please enter valid dimensions (minimum 100px)");
      return;
    }
    if (width > 4096 || height > 4096) {
      toast.error("Maximum dimension is 4096px");
      return;
    }
    
    handleResize("custom", width, height);
  };

  const getAspectRatioLabel = () => {
    switch (currentAspectRatio) {
      case "1:1": return "1080×1080";
      case "9:16": return "1080×1920";
      case "16:9": return "1920×1080";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8D5E0] via-[#F0E6E8] to-[#E8D5E0] p-6">
      <Logo />

      <div className="absolute top-6 right-6 z-20">
        <Button
          onClick={() => navigate("/home")}
          variant="ghost"
          size="sm"
          className="hover:bg-white/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="max-w-4xl mx-auto pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="/lovable-uploads/anita-profile.png"
              alt="Anita"
              className="w-16 h-16 rounded-full border-2 border-white shadow-lg"
            />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-800">Anita</h1>
              <p className="text-sm text-gray-600">Lifestyle Artist</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-lg mx-auto">
            Transform your product images into stunning lifestyle scenes. Simply provide a PDP URL, select a product image, and let AI create a beautiful lifestyle composition.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["URL Input", "Select Image", "Result"].map((label, idx) => (
            <div key={label} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  idx === (step === "input" ? 0 : step === "select" ? 1 : 2)
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {idx + 1}
              </div>
              <span className="ml-2 text-sm text-gray-600 hidden sm:inline">{label}</span>
              {idx < 2 && <div className="w-8 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step: Input URL */}
        {step === "input" && (
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Enter PDP URL
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.lg.com/us/product..."
                  className="flex-1"
                />
                <Button
                  onClick={handleExtractImages}
                  disabled={isLoading || !url}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Extract</span>
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Paste a product detail page URL to extract carousel images
              </p>
            </div>
          </Card>
        )}

        {/* Step: Select Image */}
        {step === "select" && (
          <div className="space-y-4">
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Select a product image ({carouselImages.length} found)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-2">
                {carouselImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? "border-purple-500 ring-2 ring-purple-300"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-32 object-contain bg-white"
                    />
                    {selectedImage === img && (
                      <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Hidden file input for camera/gallery */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="outline" onClick={handleReset}>
                Start Over
              </Button>
              <Button
                onClick={handleGenerateLifestyle}
                disabled={!selectedImage || isGenerating || isCompositing}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Lifestyle
                  </>
                )}
              </Button>
              <Button
                onClick={handleCameraClick}
                disabled={!selectedImage || isGenerating || isCompositing}
                variant="outline"
                className="border-teal-300 text-teal-600 hover:bg-teal-50"
              >
                {isCompositing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Compositing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Use My Photo
                  </>
                )}
              </Button>
            </div>

            {isGenerating && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
                <p className="text-gray-600">Removing background and generating lifestyle scene...</p>
                <p className="text-sm text-gray-500 mt-2">This may take up to 30 seconds</p>
              </Card>
            )}

            {isCompositing && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-500" />
                <p className="text-gray-600">Removing product background and compositing into your photo...</p>
                <p className="text-sm text-gray-500 mt-2">This may take up to 60 seconds</p>
              </Card>
            )}
          </div>
        )}

        {/* Step: Result */}
        {step === "result" && generatedImage && (
          <div className="space-y-4">
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Generated Lifestyle Image {isUpscaled ? "(4K)" : `(${getAspectRatioLabel()})`}
              </h3>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={generatedImage}
                  alt="Generated lifestyle"
                  className="w-full h-auto"
                />
              </div>
            </Card>

            {(isUpscaling || isResizing) && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
                <p className="text-gray-600">
                  {isUpscaling ? "Upscaling to 4K resolution..." : "Resizing image..."}
                </p>
                <p className="text-sm text-gray-500 mt-2">This may take up to 30 seconds</p>
              </Card>
            )}

            {/* Edit Prompt Input */}
            <Card className="p-4 bg-white/80 backdrop-blur-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Edit Image</span>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Enter your edit request... (e.g., 'Change the background to a cozy winter scene', 'Add warm lighting', 'Make it more minimalist')"
                    className="flex-1 min-h-[60px] resize-none text-sm"
                    disabled={isEditing || isResizing || isUpscaling || isGenerating || isGeneratingVideo}
                  />
                  <Button
                    onClick={handleEditImage}
                    disabled={isEditing || isResizing || isUpscaling || isGenerating || isGeneratingVideo || !editPrompt.trim()}
                    className="bg-teal-500 hover:bg-teal-600 self-end"
                  >
                    {isEditing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500 text-center">Applying edit... This may take up to 30 seconds</p>
                )}
              </div>
            </Card>

            {/* Aspect Ratio Resize Options */}
            <Card className="p-4 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600">Resize to:</span>
                  <Button
                    variant={currentAspectRatio === "16:9" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleResize("16:9")}
                    disabled={isResizing || isUpscaling || currentAspectRatio === "16:9"}
                    className={currentAspectRatio === "16:9" ? "bg-purple-500 hover:bg-purple-600" : ""}
                  >
                    <RectangleHorizontal className="w-4 h-4 mr-1" />
                    16:9
                  </Button>
                  <Button
                    variant={currentAspectRatio === "1:1" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleResize("1:1")}
                    disabled={isResizing || isUpscaling || currentAspectRatio === "1:1"}
                    className={currentAspectRatio === "1:1" ? "bg-purple-500 hover:bg-purple-600" : ""}
                  >
                    <Square className="w-4 h-4 mr-1" />
                    1:1
                  </Button>
                  <Button
                    variant={currentAspectRatio === "9:16" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleResize("9:16")}
                    disabled={isResizing || isUpscaling || currentAspectRatio === "9:16"}
                    className={currentAspectRatio === "9:16" ? "bg-purple-500 hover:bg-purple-600" : ""}
                  >
                    <RectangleVertical className="w-4 h-4 mr-1" />
                    9:16
                  </Button>
                </div>
                
                {/* Custom Size Input */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Custom:</span>
                  <Input
                    type="number"
                    placeholder="Width"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-24 h-8 text-sm"
                    min={100}
                    max={4096}
                  />
                  <span className="text-gray-400">×</span>
                  <Input
                    type="number"
                    placeholder="Height"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-24 h-8 text-sm"
                    min={100}
                    max={4096}
                  />
                  <span className="text-xs text-gray-400">px</span>
                  <Button
                    size="sm"
                    onClick={handleCustomResize}
                    disabled={isResizing || isUpscaling || !customWidth || !customHeight}
                    variant="outline"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </Card>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="outline" onClick={handleReset}>
                Create Another
              </Button>
              <Button
                onClick={handleGenerateLifestyle}
                disabled={isGenerating || isUpscaling || isResizing || isGeneratingVideo}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Re-generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-generate
                  </>
                )}
              </Button>
              {!isUpscaled && (
                <Button
                  onClick={handleUpscale}
                  disabled={isUpscaling || isResizing || isGeneratingVideo || isGenerating}
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  {isUpscaling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Upscaling...
                    </>
                  ) : (
                    <>
                      <ZoomIn className="w-4 h-4 mr-2" />
                      Upscale to 4K
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleDownload}
                disabled={isResizing || isUpscaling || isGeneratingVideo || isGenerating}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleGenerateVideo}
                disabled={isResizing || isUpscaling || isGeneratingVideo || isGenerating}
                variant="outline"
                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>
            </div>

            {/* Video Generation Progress */}
            {isGeneratingVideo && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
                <p className="text-gray-600">Generating 5-second video with camera motion...</p>
                <p className="text-sm text-gray-500 mt-2">This may take up to 5 minutes</p>
              </Card>
            )}

            {/* Video Preview */}
            {generatedVideoUrl && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Generated Video (5 seconds)</h3>
                <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={handleDownloadVideo}
                    className="bg-indigo-500 hover:bg-indigo-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* QR Code Dialog for PC users */}
      <Dialog open={showQRDialog} onOpenChange={(open) => {
        setShowQRDialog(open);
        if (!open) {
          setIsWaitingForMobile(false);
          setSessionId(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Scan with your phone
            </DialogTitle>
            <DialogDescription>
              Scan this QR code with your phone camera to take a photo
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {sessionId && (
              <div className="p-4 bg-white rounded-lg border">
                <QRCodeSVG
                  value={getQRCodeUrl()}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
            )}
            {isWaitingForMobile && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for mobile device...
              </div>
            )}
            <p className="text-xs text-gray-500 text-center">
              Open your camera app and point it at the QR code.<br />
              The photo you take will appear here automatically.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnitaLifestyle;
