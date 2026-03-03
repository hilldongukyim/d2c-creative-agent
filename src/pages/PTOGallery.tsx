import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Plus, Trash2, Send, Loader2, ArrowRight, Download, CheckCircle2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OUTPUT_SIZES, type SizeCategory, type LayoutDirection, type PositionOverride } from "@/lib/compositeTemplates";
import { cropTransparentPixels, createCompositeImage } from "@/lib/imageProcessing";
import { downloadAsZip } from "@/lib/zipGenerator";
import ProductImageSelector from "@/components/ProductImageSelector";
import BackgroundRemovalPreview, { type ProductStatus } from "@/components/BackgroundRemovalPreview";
import CompositeLayoutEditor from "@/components/CompositeLayoutEditor";
import BenFeedbackDialog from "@/components/BenFeedbackDialog";

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

type Step = 'welcome' | 'urls' | 'select' | 'bgremoval' | 'composite' | 'confirm' | 'download';

const PTOGallery = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [urls, setUrls] = useState<string[]>(['', '']);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [bgRemovedImages, setBgRemovedImages] = useState<string[]>([]);
  const [bgProcessing, setBgProcessing] = useState(false);
  const [bgStatus, setBgStatus] = useState('');
  const [productStatuses, setProductStatuses] = useState<ProductStatus[]>([]);
  const [bgCurrentIdx, setBgCurrentIdx] = useState(0);

  // Composite state
  const [confirmedLayouts, setConfirmedLayouts] = useState<Record<string, LayoutDirection>>({});
  const [confirmedOverrides, setConfirmedOverrides] = useState<Record<string, PositionOverride[]>>({});
  const [confirmedGeneratedMap, setConfirmedGeneratedMap] = useState<Record<string, string>>({});

  // Download state
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // Feedback
  const [showFeedback, setShowFeedback] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Welcome auto-advance
  useEffect(() => {
    if (step === 'welcome') {
      const timer = setTimeout(() => setStep('urls'), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [step]);

  // URL management
  const addUrl = () => { if (urls.length < 6) setUrls([...urls, '']); };
  const removeUrl = (idx: number) => { if (urls.length > 2) setUrls(urls.filter((_, i) => i !== idx)); };
  const updateUrl = (idx: number, value: string) => {
    const newUrls = [...urls];
    newUrls[idx] = value;
    setUrls(newUrls);
  };

  // Step: urls → select
  const handleSubmitUrls = async () => {
    setUrlError(null);
    const filledUrls = urls.filter((u) => u.trim());
    if (filledUrls.length < 2) { setUrlError('At least 2 product URLs are required.'); return; }
    for (let i = 0; i < filledUrls.length; i++) {
      if (!filledUrls[i].startsWith('https://www.lg.com/')) {
        setUrlError(`URL #${i + 1} must start with "https://www.lg.com/"`);
        return;
      }
    }

    const initialProducts: ProductData[] = filledUrls.map((url) => ({
      url, images: [], selectedIndex: 0, sizeCategory: 'M' as SizeCategory,
      productName: url, isLoading: true, error: null,
    }));
    setProducts(initialProducts);
    setStep('select');

    const promises = filledUrls.map(async (url, idx) => {
      try {
        const { data, error } = await supabase.functions.invoke('ben-extract-images', { body: { url } });
        if (error || !data?.success) return { idx, error: data?.error || 'Extraction failed' };
        return { idx, images: data.images || [], sizeCategory: data.sizeCategory || 'M', productName: data.productName || url };
      } catch { return { idx, error: 'Network error' }; }
    });

    const results = await Promise.all(promises);
    setProducts((prev) => {
      const updated = [...prev];
      for (const r of results) {
        if ('error' in r && r.error) {
          updated[r.idx] = { ...updated[r.idx], isLoading: false, error: r.error as string };
        } else {
          updated[r.idx] = {
            ...updated[r.idx], isLoading: false,
            images: (r as any).images, sizeCategory: (r as any).sizeCategory, productName: (r as any).productName,
          };
        }
      }
      return updated;
    });
  };

  // Step: select → bgremoval
  const handleProceedToBgRemoval = async () => {
    setBgProcessing(true);
    setBgStatus('Removing backgrounds...');
    setStep('bgremoval');

    const selectedImageUrls = products.map((p) => p.images[p.selectedIndex]?.url).filter(Boolean);
    const statuses: ProductStatus[] = selectedImageUrls.map(() => 'pending');
    setProductStatuses([...statuses]);
    setBgCurrentIdx(0);

    try {
      // Update statuses as we go
      statuses.forEach((_, i) => { statuses[i] = 'pending'; });
      statuses[0] = 'processing';
      setProductStatuses([...statuses]);

      const { data, error } = await supabase.functions.invoke('ben-process-images', {
        body: { imageUrls: selectedImageUrls },
      });

      if (error || !data?.success) {
        setBgStatus('Background removal failed. Using original images...');
        statuses.forEach((_, i) => { statuses[i] = 'failed'; });
        setProductStatuses([...statuses]);
        const cropped = await Promise.all(selectedImageUrls.map((url) => cropTransparentPixels(url)));
        setBgRemovedImages(cropped);
        setBgProcessing(false);
        return;
      }

      setBgStatus('Cropping transparent pixels...');
      statuses.forEach((_, i) => { statuses[i] = 'done'; });
      setProductStatuses([...statuses]);
      setBgCurrentIdx(selectedImageUrls.length);

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

  // Step: bgremoval → composite
  const handleGenerateComposites = () => setStep('composite');

  // Step: composite → confirm
  const handleCompositeConfirm = (
    layouts: Record<string, LayoutDirection>,
    overrides: Record<string, PositionOverride[]>,
    generatedMap: Record<string, string>
  ) => {
    setConfirmedLayouts(layouts);
    setConfirmedOverrides(overrides);
    setConfirmedGeneratedMap(generatedMap);
    setStep('confirm');
  };

  // Step: confirm → download
  const handleGenerateAndDownload = async () => {
    setStep('download');
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);

    // Regenerate all at full resolution
    const entries: { dataUrl: string; filename: string }[] = [];
    for (let i = 0; i < OUTPUT_SIZES.length; i++) {
      const size = OUTPUT_SIZES[i];
      const dir = confirmedLayouts[size.id] || 'horizontal';
      const ovr = confirmedOverrides[size.id];

      // Use cached if available, otherwise regenerate
      let dataUrl = confirmedGeneratedMap[size.id];
      if (!dataUrl) {
        dataUrl = await createCompositeImage(
          size, bgRemovedImages, products.map((p) => p.sizeCategory), dir, ovr
        );
      }

      const folder = size.category === 'gallery' ? 'Gallery_PBP' : 'Basic';
      entries.push({
        dataUrl,
        filename: `${folder}/${size.id}_${size.width}x${size.height}.png`,
      });
      setDownloadProgress(i + 1);
    }

    await downloadAsZip(entries);
    setIsDownloading(false);
    setDownloadComplete(true);
  };

  const handleDownloadAgain = () => handleGenerateAndDownload();

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
    setProductStatuses([]);
    setConfirmedLayouts({});
    setConfirmedOverrides({});
    setConfirmedGeneratedMap({});
    setDownloadProgress(0);
    setDownloadComplete(false);
    setIsDownloading(false);
  };

  const allExtracted = products.length > 0 && products.every((p) => !p.isLoading);
  const hasValidImages = products.some((p) => p.images.length > 0);

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/lovable-uploads/486a0909-b1cd-4891-9d37-db02a935a89f.png)',
        backgroundSize: 'cover', backgroundPosition: '90% center', backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Home
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
            {/* Welcome */}
            {step === 'welcome' && (
              <div className="bg-secondary rounded-lg p-3 max-w-[85%] animate-fade-in">
                <p className="text-sm">Hi! I'm Ben 🐕 I'll help you create PTO gallery images for LG.com. Please enter 2-6 product URLs to get started.</p>
              </div>
            )}

            {/* Step: URL Input */}
            {step !== 'welcome' && (
              <>
                <div className="bg-secondary rounded-lg p-3 max-w-[85%]">
                  <p className="text-sm">Please paste the PDP URLs for your products (2-6 URLs).</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">e.g. https://www.lg.com/es/tv-y-barras-de-sonido/oled-evo/...</p>
                </div>

                {step === 'urls' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="space-y-2">
                      {urls.map((url, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                          <Input value={url} onChange={(e) => updateUrl(idx, e.target.value)} placeholder="https://www.lg.com/..." className="flex-1" />
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
                        <Plus className="h-3 w-3 mr-1" />Add URL ({urls.length}/6)
                      </Button>
                    )}

                    {urlError && <p className="text-xs text-destructive">{urlError}</p>}

                    <Button onClick={handleSubmitUrls} disabled={urls.filter((u) => u.trim()).length < 2} className="w-full">
                      <Send className="h-4 w-4 mr-2" />Extract Images
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Step: Image Selection */}
            {step === 'select' && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-secondary rounded-lg p-3 max-w-[85%]">
                  <p className="text-sm">Select the image you want to use for each product.</p>
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
                    <ArrowLeft className="h-3 w-3 mr-1" />Back
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleProceedToBgRemoval} disabled={!allExtracted || !hasValidImages}>
                    <ArrowRight className="h-3 w-3 mr-1" />Remove Backgrounds
                  </Button>
                </div>
              </div>
            )}

            {/* Step: BG Removal */}
            {step === 'bgremoval' && (
              <div className="animate-fade-in">
                <BackgroundRemovalPreview
                  images={bgRemovedImages}
                  productNames={products.map((p) => p.productName)}
                  isProcessing={bgProcessing}
                  processingStatus={bgStatus}
                  productStatuses={productStatuses}
                  currentIndex={bgCurrentIdx}
                  totalCount={products.length}
                  onConfirm={handleGenerateComposites}
                  onBack={() => setStep('select')}
                />
              </div>
            )}

            {/* Step: Composite Layout */}
            {step === 'composite' && bgRemovedImages.length > 0 && (
              <div className="animate-fade-in">
                <CompositeLayoutEditor
                  images={bgRemovedImages}
                  sizeCategories={products.map((p) => p.sizeCategory)}
                  productUrls={products.map((p) => p.url)}
                  onConfirm={handleCompositeConfirm}
                  onBack={() => setStep('bgremoval')}
                />
              </div>
            )}

            {/* Step: Confirmation */}
            {step === 'confirm' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-secondary rounded-lg p-3 max-w-[85%]">
                  <p className="text-sm">Everything looks good! Ready to generate and download?</p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold mb-3">📦 Summary</h3>
                  <p className="text-xs text-muted-foreground mb-2">{products.length} products selected • 9 images will be generated</p>

                  <div className="grid grid-cols-3 gap-2">
                    {OUTPUT_SIZES.map((size) => (
                      <div key={size.id} className="text-center">
                        {confirmedGeneratedMap[size.id] && (
                          <img src={confirmedGeneratedMap[size.id]} alt={size.id} className="w-full rounded border border-border mb-1" />
                        )}
                        <p className="text-[10px] text-muted-foreground">{size.id} ({size.width}×{size.height})</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep('composite')}>
                    <ArrowLeft className="h-3 w-3 mr-1" />Back to Edit
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleGenerateAndDownload}>
                    <Download className="h-4 w-4 mr-1" />Generate & Download ZIP
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Download */}
            {step === 'download' && (
              <div className="space-y-4 animate-fade-in">
                {isDownloading && (
                  <div className="rounded-lg border border-border bg-card p-6 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-sm font-medium">Generating images...</p>
                    <Progress value={(downloadProgress / OUTPUT_SIZES.length) * 100} className="h-2 mt-3" />
                    <p className="text-xs text-muted-foreground mt-1">{downloadProgress}/{OUTPUT_SIZES.length}</p>
                  </div>
                )}

                {downloadComplete && (
                  <div className="rounded-lg border border-border bg-card p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-sm font-semibold">Download Complete! ✅</p>
                    <p className="text-xs text-muted-foreground mt-1">Your ZIP file with 9 images has been downloaded.</p>

                    <div className="flex flex-col gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={handleDownloadAgain}>
                        <Download className="h-3 w-3 mr-1" />Download Again
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowFeedback(true)}>
                        <MessageCircle className="h-3 w-3 mr-1" />Leave Feedback
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        Create Another PTO Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <BenFeedbackDialog
        open={showFeedback}
        onOpenChange={setShowFeedback}
        crewName="Ben"
        productUrls={products.map((p) => p.url)}
      />
    </div>
  );
};

export default PTOGallery;
