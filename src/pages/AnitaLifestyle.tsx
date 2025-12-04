import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Download, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";

const AnitaLifestyle = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "select" | "result">("input");

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
        body: { imageUrl: selectedImage },
      });

      if (error) throw error;
      if (!data.success || !data.imageBase64) {
        throw new Error(data.error || "Failed to generate lifestyle image");
      }

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setStep("result");
      toast.success("Lifestyle image generated!");
    } catch (error) {
      console.error("Error generating lifestyle image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate lifestyle image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "anita-lifestyle-image.png";
    link.click();
    toast.success("Image downloaded!");
  };

  const handleReset = () => {
    setUrl("");
    setCarouselImages([]);
    setSelectedImage(null);
    setGeneratedImage(null);
    setStep("input");
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
                Generated Lifestyle Image (1920×1080)
              </h3>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={generatedImage}
                  alt="Generated lifestyle"
                  className="w-full h-auto"
                />
              </div>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleReset}>
                Create Another
              </Button>
              <Button
                onClick={handleDownload}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnitaLifestyle;
