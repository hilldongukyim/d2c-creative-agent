import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Send, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type SizeCategory } from "@/lib/compositeTemplates";
import { cropTransparentPixels } from "@/lib/imageProcessing";
import ProductImageSelector from "@/components/ProductImageSelector";
import BackgroundRemovalPreview from "@/components/BackgroundRemovalPreview";
import CompositeLayoutEditor from "@/components/CompositeLayoutEditor";

const benProfile = "/lovable-uploads/ben-profile-v2.png";

interface ProductData {
  url: string;
  images: { url: string; index: number }[];
  selectedIndex: number;
  sizeCategory: SizeCategory;
  productName: string;
  isLoading: boolean;
  error: string | null;
}

type Step = 'urls' | 'select' | 'bgremoval' | 'composite';

const PTOGallery = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('urls');
  const [urls, setUrls] = useState<string[]>(['', '']);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [bgRemovedImages, setBgRemovedImages] = useState<string[]>([]);
  const [bgProcessing, setBgProcessing] = useState(false);
  const [bgStatus, setBgStatus] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [step]);

  // URL management
  const addUrl = () => {
    if (urls.length < 6) setUrls([...urls, '']);
  };

  const removeUrl = (idx: number) => {
    if (urls.length > 2) setUrls(urls.filter((_, i) => i !== idx));
  };

  const updateUrl = (idx: number, value: string) => {
    const newUrls = [...urls];
    newUrls[idx] = value;
    setUrls(newUrls);
  };

  // Step 1 → Step 2
  const handleSubmitUrls = async () => {
    setUrlError(null);
    const filledUrls = urls.filter((u) => u.trim());
    if (filledUrls.length < 2) {
      setUrlError('At least 2 product URLs are required.');
      return;
    }
    for (let i = 0; i < filledUrls.length; i++) {
      if (!filledUrls[i].startsWith('https://www.lg.com/')) {
        setUrlError(`URL #${i + 1} must start with "https://www.lg.com/"`);
        return;
      }
    }

    // Initialize products and extract images in parallel
    const initialProducts: ProductData[] = filledUrls.map((url) => ({
      url,
      images: [],
      selectedIndex: 0,
      sizeCategory: 'M' as SizeCategory,
      productName: url,
      isLoading: true,
      error: null,
    }));
    setProducts(initialProducts);
    setStep('select');

    // Extract in parallel
    const promises = filledUrls.map(async (url, idx) => {
      try {
        const { data, error } = await supabase.functions.invoke('ben-extract-images', {
          body: { url },
        });
        if (error || !data?.success) {
          return { idx, error: data?.error || 'Extraction failed' };
        }
        return {
          idx,
          images: data.images || [],
          sizeCategory: data.sizeCategory || 'M',
          productName: data.productName || url,
        };
      } catch {
        return { idx, error: 'Network error' };
      }
    });

    const results = await Promise.all(promises);
    setProducts((prev) => {
      const updated = [...prev];
      for (const r of results) {
        if ('error' in r && r.error) {
          updated[r.idx] = { ...updated[r.idx], isLoading: false, error: r.error as string };
        } else {
          updated[r.idx] = {
            ...updated[r.idx],
            isLoading: false,
            images: (r as any).images,
            sizeCategory: (r as any).sizeCategory,
            productName: (r as any).productName,
          };
        }
      }
      return updated;
    });
  };

  // Step 2 → Step 3
  const handleProceedToBgRemoval = async () => {
    setBgProcessing(true);
    setBgStatus('Removing backgrounds...');
    setStep('bgremoval');

    const selectedImageUrls = products.map((p) => p.images[p.selectedIndex]?.url).filter(Boolean);

    try {
      const { data, error } = await supabase.functions.invoke('ben-process-images', {
        body: { imageUrls: selectedImageUrls },
      });

      if (error || !data?.success) {
        console.error('BG removal error:', error || data?.error);
        setBgStatus('Background removal failed. Using original images...');
        // Fallback: crop originals
        const cropped = await Promise.all(selectedImageUrls.map((url) => cropTransparentPixels(url)));
        setBgRemovedImages(cropped);
        setBgProcessing(false);
        return;
      }

      setBgStatus('Cropping transparent pixels...');
      const cropped = await Promise.all(
        data.processedImages.map((img: { base64: string }) => cropTransparentPixels(img.base64))
      );
      setBgRemovedImages(cropped);
      setBgProcessing(false);
    } catch (err) {
      console.error('Error:', err);
      setBgStatus('Error occurred.');
      setBgProcessing(false);
    }
  };

  // Step 3 → Step 4
  const handleGenerateComposites = () => {
    setStep('composite');
  };

  const handleSelectImage = useCallback((productIdx: number, imageIdx: number) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[productIdx] = { ...updated[productIdx], selectedIndex: imageIdx };
      return updated;
    });
  }, []);

  const handleReset = () => {
    setStep('urls');
    setUrls(['', '']);
    setProducts([]);
    setBgRemovedImages([]);
    setBgProcessing(false);
    setBgStatus('');
    setUrlError(null);
  };

  const allExtracted = products.length > 0 && products.every((p) => !p.isLoading);
  const hasValidImages = products.some((p) => p.images.length > 0);

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/lovable-uploads/486a0909-b1cd-4891-9d37-db02a935a89f.png)',
        backgroundSize: 'cover',
        backgroundPosition: '90% center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 h-[700px] flex flex-col relative z-10">
          {/* Ben's Profile */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30">
              <img src={benProfile} alt="Ben" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Ben</h3>
              <p className="text-sm text-muted-foreground">PTO Gallery Creator</p>
            </div>
          </div>

          {/* Content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ scrollBehavior: 'smooth' }}>
            {/* Ben's greeting */}
            <div className="bg-secondary rounded-lg p-3 max-w-[85%]">
              <p className="text-sm">Hello! I'm Ben 🐕 I'll help you create PTO gallery images. Paste 2-6 LG product PDP URLs and I'll do the rest! 😊</p>
            </div>

            {/* Step 1: URL Input */}
            {step === 'urls' && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-secondary rounded-lg p-3 max-w-[85%]">
                  <p className="text-sm">Please paste the PDP URLs for your products (2-6 URLs).</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">e.g. https://www.lg.com/es/tv-y-barras-de-sonido/oled-evo/...</p>
                </div>

                <div className="space-y-2">
                  {urls.map((url, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                      <Input
                        value={url}
                        onChange={(e) => updateUrl(idx, e.target.value)}
                        placeholder="https://www.lg.com/..."
                        className="flex-1"
                      />
                      {urls.length > 2 && (
                        <Button variant="ghost" size="icon" onClick={() => removeUrl(idx)} className="shrink-0 h-8 w-8">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {urls.length < 6 && (
                  <Button variant="outline" size="sm" onClick={addUrl} className="text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add URL ({urls.length}/6)
                  </Button>
                )}

                {urlError && (
                  <p className="text-xs text-destructive">{urlError}</p>
                )}

                <Button
                  onClick={handleSubmitUrls}
                  disabled={urls.filter((u) => u.trim()).length < 2}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Extract Images
                </Button>
              </div>
            )}

            {/* Step 2: Image Selection */}
            {step === 'select' && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-secondary rounded-lg p-3 max-w-[85%]">
                  <p className="text-sm">Select the image you want to use for each product. Click a thumbnail to change your selection.</p>
                </div>

                <div className={`grid gap-3 ${products.length <= 2 ? 'grid-cols-2' : products.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {products.map((product, idx) => (
                    <ProductImageSelector
                      key={idx}
                      images={product.images}
                      selectedIndex={product.selectedIndex}
                      onSelect={(imgIdx) => handleSelectImage(idx, imgIdx)}
                      productName={product.productName}
                      sizeCategory={product.sizeCategory}
                      isLoading={product.isLoading}
                      error={product.error}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep('urls')}>
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Back
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleProceedToBgRemoval}
                    disabled={!allExtracted || !hasValidImages}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Remove Backgrounds
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: BG Removal Preview */}
            {step === 'bgremoval' && (
              <div className="animate-fade-in">
                <BackgroundRemovalPreview
                  images={bgRemovedImages}
                  productNames={products.map((p) => p.productName)}
                  isProcessing={bgProcessing}
                  processingStatus={bgStatus}
                  onConfirm={handleGenerateComposites}
                  onBack={() => setStep('select')}
                />
              </div>
            )}

            {/* Step 4: Composite Output */}
            {step === 'composite' && bgRemovedImages.length > 0 && (
              <div className="animate-fade-in">
                <CompositeLayoutEditor
                  images={bgRemovedImages}
                  sizeCategories={products.map((p) => p.sizeCategory)}
                  productUrls={products.map((p) => p.url)}
                  onReset={handleReset}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PTOGallery;
