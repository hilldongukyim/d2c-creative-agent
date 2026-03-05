import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Plus, Minus, Trash2, Send, Loader2, ArrowRight, Download, CheckCircle2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OUTPUT_SIZES, type SizeCategory, type LayoutDirection, type PositionOverride } from "@/lib/compositeTemplates";
import { cropTransparentPixels, generateCompositeCanvas, type CompositeProduct } from "@/lib/imageProcessing";
import { downloadAsZip } from "@/lib/zipGenerator";
import ProductImageSelector from "@/components/ProductImageSelector";
import { type ProductStatus } from "@/components/BackgroundRemovalPreview";
import CompositeLayoutEditor from "@/components/CompositeLayoutEditor";
import BenFeedbackDialog from "@/components/BenFeedbackDialog";

const benProfile = "/lovable-uploads/ben-profile-v2.png";

interface ProductData {
  url: string;
  images: { url: string; index: number }[];
  sizeCategory: SizeCategory;
  productName: string;
  isLoading: boolean;
  error: string | null;
  confirmed: boolean;
}

type Step = 'welcome' | 'urls' | 'select' | 'bgremoval' | 'composite' | 'confirm' | 'download';

const PTOGallery = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [urls, setUrls] = useState<string[]>(['', '']);
  const [urlQtys, setUrlQtys] = useState<number[]>([1, 1]);
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
  const totalProducts = urlQtys.reduce((sum, q) => sum + q, 0);
  const addUrl = () => { if (urls.length < 6) { setUrls([...urls, '']); setUrlQtys([...urlQtys, 1]); } };
  const removeUrl = (idx: number) => {
    if (urls.length > 2) {
      setUrls(urls.filter((_, i) => i !== idx));
      setUrlQtys(urlQtys.filter((_, i) => i !== idx));
    }
  };
  const updateUrl = (idx: number, value: string) => {
    const newUrls = [...urls];
    newUrls[idx] = value;
    setUrls(newUrls);
  };
  const updateQty = (idx: number, delta: number) => {
    setUrlQtys((prev) => {
      const next = [...prev];
      const newVal = next[idx] + delta;
      const otherTotal = prev.reduce((s, q, i) => i === idx ? s : s + q, 0);
      if (newVal < 1 || otherTotal + newVal > 6) return prev;
      next[idx] = newVal;
      return next;
    });
  };

  // Step: urls → select
  const handleSubmitUrls = async () => {
    setUrlError(null);
    const filledEntries: { url: string; qty: number }[] = [];
    for (let i = 0; i < urls.length; i++) {
      if (urls[i].trim()) filledEntries.push({ url: urls[i].trim(), qty: urlQtys[i] });
    }
    const expandedTotal = filledEntries.reduce((s, e) => s + e.qty, 0);
    if (expandedTotal < 2) { setUrlError('At least 2 products are required.'); return; }
    if (expandedTotal > 6) { setUrlError('Maximum 6 products allowed.'); return; }
    for (let i = 0; i < filledEntries.length; i++) {
      if (!filledEntries[i].url.startsWith('https://www.lg.com/')) {
        setUrlError(`URL #${i + 1} must start with "https://www.lg.com/"`);
        return;
      }
    }

    // Expand: each unique URL is extracted once, then duplicated by qty
    const uniqueUrls = [...new Set(filledEntries.map((e) => e.url))];
    // Build qty map
    const qtyMap: Record<string, number> = {};
    filledEntries.forEach((e) => { qtyMap[e.url] = (qtyMap[e.url] || 0) + e.qty; });

    // Create expanded product list
    const expandedProducts: ProductData[] = [];
    filledEntries.forEach((entry) => {
      for (let q = 0; q < entry.qty; q++) {
        expandedProducts.push({
          url: entry.url, images: [], sizeCategory: 'M' as SizeCategory,
          productName: entry.url, isLoading: true, error: null, confirmed: false,
        });
      }
    });
    setProducts(expandedProducts);
    setStep('select');

    // Extract each unique URL once
    const extractionResults = await Promise.all(
      uniqueUrls.map(async (url) => {
        try {
          const { data, error } = await supabase.functions.invoke('ben-extract-images', { body: { url } });
          if (error || !data?.success) return { url, error: data?.error || 'Extraction failed' };
          return { url, images: data.images || [], sizeCategory: data.sizeCategory || 'M', productName: data.productName || url };
        } catch { return { url, error: 'Network error' }; }
      })
    );

    const resultMap: Record<string, any> = {};
    extractionResults.forEach((r) => { resultMap[r.url] = r; });

    setProducts((prev) => {
      const updated = [...prev];
      for (let i = 0; i < updated.length; i++) {
        const r = resultMap[updated[i].url];
        if (r?.error) {
          updated[i] = { ...updated[i], isLoading: false, error: r.error };
        } else {
          updated[i] = {
            ...updated[i], isLoading: false,
            images: r.images, sizeCategory: r.sizeCategory, productName: r.productName,
          };
        }
      }
      return updated;
    });
  };

  // Step: select → bgremoval → auto-advance to composite
  const handleProceedToBgRemoval = async () => {
    setBgProcessing(true);
    setBgStatus('Removing backgrounds...');
    setStep('bgremoval');

    const selectedImageUrls = products.map((p) => p.images[0]?.url).filter(Boolean);
    const statuses: ProductStatus[] = selectedImageUrls.map(() => 'pending');
    setProductStatuses([...statuses]);
    setBgCurrentIdx(0);

    try {
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
        // Auto-advance to composite even on fallback
        setStep('composite');
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
      // Auto-advance directly to composite layout editor
      setStep('composite');
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
        const compositeProducts: CompositeProduct[] = bgRemovedImages.map((du, idx) => ({
          dataUrl: du,
          sizeCategory: products[idx]?.sizeCategory || 'M',
        }));
        const canvas = await generateCompositeCanvas(
          size.width, size.height, compositeProducts, dir, ovr
        );
        dataUrl = canvas.toDataURL('image/png');
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

  const handleConfirmProduct = useCallback((productIdx: number) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[productIdx] = { ...updated[productIdx], confirmed: true };
      return updated;
    });
  }, []);

  const handleRetryProduct = useCallback(async (productIdx: number) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[productIdx] = { ...updated[productIdx], isLoading: true, error: null, images: [], confirmed: false };
      return updated;
    });
    const url = products[productIdx].url;
    try {
      const { data, error } = await supabase.functions.invoke('ben-extract-images', { body: { url } });
      if (error || !data?.success) {
        setProducts((prev) => {
          const updated = [...prev];
          updated[productIdx] = { ...updated[productIdx], isLoading: false, error: data?.error || 'Extraction failed' };
          return updated;
        });
        return;
      }
      setProducts((prev) => {
        const updated = [...prev];
        updated[productIdx] = {
          ...updated[productIdx], isLoading: false,
          images: data.images || [], sizeCategory: data.sizeCategory || 'M', productName: data.productName || url,
        };
        return updated;
      });
    } catch {
      setProducts((prev) => {
        const updated = [...prev];
        updated[productIdx] = { ...updated[productIdx], isLoading: false, error: 'Network error' };
        return updated;
      });
    }
  }, [products]);

  const handleReset = () => {
    setStep('urls');
    setUrls(['', '']);
    setUrlQtys([1, 1]);
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
  const allConfirmed = allExtracted && hasValidImages && products.every((p) => p.confirmed || p.error || p.images.length === 0);

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
                        <div key={idx} className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                            <Input value={url} onChange={(e) => updateUrl(idx, e.target.value)} placeholder="https://www.lg.com/..." className="flex-1" />
                            {urls.length > 2 && (
                              <Button variant="ghost" size="icon" onClick={() => removeUrl(idx)} className="shrink-0 h-8 w-8">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 ml-7">
                            <span className="text-[10px] text-muted-foreground">Qty:</span>
                            <Button
                              variant="outline" size="icon"
                              className="h-5 w-5 shrink-0"
                              onClick={() => updateQty(idx, -1)}
                              disabled={urlQtys[idx] <= 1}
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </Button>
                            <span className="text-xs font-medium w-4 text-center">{urlQtys[idx]}</span>
                            <Button
                              variant="outline" size="icon"
                              className="h-5 w-5 shrink-0"
                              onClick={() => updateQty(idx, 1)}
                              disabled={totalProducts >= 6}
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </Button>
                            {urlQtys[idx] > 1 && (
                              <span className="text-[10px] text-muted-foreground">
                                Same product ×{urlQtys[idx]}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {urls.length < 6 && totalProducts < 6 && (
                        <Button variant="outline" size="sm" onClick={addUrl} className="text-xs">
                          <Plus className="h-3 w-3 mr-1" />Add URL
                        </Button>
                      )}
                      <span className="text-[10px] text-muted-foreground">Total: {totalProducts}/6 products</span>
                    </div>

                    {urlError && <p className="text-xs text-destructive">{urlError}</p>}

                    <Button onClick={handleSubmitUrls} disabled={totalProducts < 2 || urls.every((u) => !u.trim())} className="w-full">
                      <Send className="h-4 w-4 mr-2" />Extract Images ({totalProducts} products)
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Step: Image Confirmation */}
            {step === 'select' && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-secondary rounded-lg p-3 max-w-[85%]">
                  <p className="text-sm">I found the product images! Please confirm each one is correct, or click "Wrong image" to retry.</p>
                </div>

                <div className={`grid gap-3 ${products.length <= 2 ? 'grid-cols-2' : products.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {products.map((product, idx) => (
                    <ProductImageSelector
                      key={idx}
                      images={product.images}
                      productName={product.productName}
                      sizeCategory={product.sizeCategory}
                      isLoading={product.isLoading}
                      error={product.error}
                      confirmed={product.confirmed}
                      onConfirm={() => handleConfirmProduct(idx)}
                      onRetry={() => handleRetryProduct(idx)}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep('urls')}>
                    <ArrowLeft className="h-3 w-3 mr-1" />Back
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleProceedToBgRemoval} disabled={!allConfirmed}>
                    <ArrowRight className="h-3 w-3 mr-1" />Remove Backgrounds
                  </Button>
                </div>
              </div>
            )}

            {/* Step: BG Removal (processing only — auto-advances to composite) */}
            {step === 'bgremoval' && (
              <div className="animate-fade-in">
                <div className="rounded-lg bg-card border border-border p-6">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-sm font-medium text-center">{bgStatus || 'Processing...'}</p>
                  {products.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <Progress value={(bgCurrentIdx / products.length) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        Processing product {bgCurrentIdx} of {products.length}...
                      </p>
                    </div>
                  )}
                  {productStatuses.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {products.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {productStatuses[idx] === 'done' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : productStatuses[idx] === 'processing' ? (
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground truncate">{p.productName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
