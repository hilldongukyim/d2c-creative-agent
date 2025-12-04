import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Download, Search, Sparkles, ZoomIn, Square, RectangleVertical, RectangleHorizontal, Film } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";

const AnitaLifestyle = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
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
      setStep("select");
      toast.success(`Found ${data.images.length} carousel images`);
    } catch (error) {
      console.error("Error extracting images:", error);
      toast.error("Failed to extract images from URL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLifestyle = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("anita-generate-lifestyle", {
        body: { imageUrl: selectedImage, aspectRatio: "16:9" },
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

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleReset}>
                Start Over
              </Button>
              <Button
                onClick={handleGenerateLifestyle}
                disabled={!selectedImage || isGenerating}
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
                    Generate Lifestyle Image
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
              {!isUpscaled && (
                <Button
                  onClick={handleUpscale}
                  disabled={isUpscaling || isResizing || isGeneratingVideo}
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
                disabled={isResizing || isUpscaling || isGeneratingVideo}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleGenerateVideo}
                disabled={isResizing || isUpscaling || isGeneratingVideo}
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
    </div>
  );
};

export default AnitaLifestyle;
