import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Link2, Loader2, Image, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

interface PageContent {
  texts: string[];
  images: { src: string; alt: string }[];
  title: string;
  description: string;
}

const MaplePDP = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a PDP URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPageContent(null);
    setPreviewUrl(null);

    try {
      // Set preview URL for iframe
      setPreviewUrl(url);

      // Simulate content extraction (in production, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock data for demonstration
      setPageContent({
        title: "Product Detail Page Analysis",
        description: "Content extracted from the provided PDP URL",
        texts: [
          "Product specifications and features",
          "Customer reviews and ratings",
          "Price and availability information",
          "Related products and recommendations",
          "Shipping and return policies"
        ],
        images: [
          { src: "/placeholder.svg", alt: "Product main image" },
          { src: "/placeholder.svg", alt: "Product gallery image" },
          { src: "/placeholder.svg", alt: "Product detail shot" }
        ]
      });

      toast({
        title: "Analysis Complete",
        description: "PDP content has been extracted and summarized.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the provided URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <Logo />
          <div className="w-20" />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="/lovable-uploads/maple-profile.png"
              alt="Maple"
              className="w-16 h-16 rounded-full border-2 border-slate-200 shadow-md"
            />
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Maple's PDP Analyzer
              </h1>
              <p className="text-slate-500">Product Detail Page Content Extraction</p>
            </div>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Submit a Product Detail Page URL and Maple will analyze the page content,
            extract text and images, and provide a comprehensive summary with preview.
          </p>
        </div>

        {/* URL Input Section */}
        <Card className="mb-8 border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="url"
                  placeholder="Enter PDP URL (e.g., https://www.lg.com/us/product/...)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-slate-400"
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze PDP"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {(pageContent || previewUrl) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Summary */}
            <div className="space-y-6">
              {/* Text Content */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Text Content Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pageContent ? (
                    <ul className="space-y-2">
                      {pageContent.texts.map((text, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-slate-600"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                          {text}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Image Content */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                    <Image className="w-5 h-5 text-green-500" />
                    Extracted Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pageContent ? (
                    <div className="grid grid-cols-3 gap-3">
                      {pageContent.images.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden"
                        >
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  )}
                  {pageContent && (
                    <p className="text-sm text-slate-500 mt-3">
                      {pageContent.images.length} images found on page
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Page Preview */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                  <Eye className="w-5 h-5 text-purple-500" />
                  Page Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewUrl ? (
                  <div className="relative bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <div className="aspect-[9/16] md:aspect-[3/4]">
                      <iframe
                        src={previewUrl}
                        title="PDP Preview"
                        className="w-full h-full"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4">
                      <p className="text-white text-sm truncate">{previewUrl}</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center">
                    <p className="text-slate-400 text-center px-4">
                      Enter a URL above to see the page preview
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!pageContent && !previewUrl && !isLoading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Link2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              Ready to Analyze
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Paste a Product Detail Page URL above and click "Analyze PDP" to extract
              and summarize the page content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaplePDP;
