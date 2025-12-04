import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download } from "lucide-react";

interface FormData {
  mainProductUrl: string;
  secondProductUrl: string;
  mainEnergyLabel?: string;
  secondEnergyLabel?: string;
}

interface ConfirmationWithScreenshotsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onGoBack: () => void;
  onSubmit: () => void;
}

const ConfirmationWithScreenshots = ({ 
  formData, 
  onGoBack, 
  onSubmit 
}: ConfirmationWithScreenshotsProps) => {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [secondImage, setSecondImage] = useState<string | null>(null);
  const [isLoadingMain, setIsLoadingMain] = useState(true);
  const [isLoadingSecond, setIsLoadingSecond] = useState(true);
  const [mainError, setMainError] = useState<string | null>(null);
  const [secondError, setSecondError] = useState<string | null>(null);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [pcImage, setPcImage] = useState<string | null>(null);
  const [mobileImage, setMobileImage] = useState<string | null>(null);

  useEffect(() => {
    const extractImage = async (url: string, setImage: (url: string | null) => void, setLoading: (loading: boolean) => void, setError: (error: string | null) => void) => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase.functions.invoke('ben-extract-images', {
          body: { url },
        });

        if (error) {
          console.error('Error extracting image:', error);
          setError('Failed to extract image');
          return;
        }

        if (data.success && data.imageUrl) {
          setImage(data.imageUrl);
        } else {
          setError('No product image found');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to extract image');
      } finally {
        setLoading(false);
      }
    };

    if (formData.mainProductUrl) {
      extractImage(formData.mainProductUrl, setMainImage, setIsLoadingMain, setMainError);
    }
    if (formData.secondProductUrl) {
      extractImage(formData.secondProductUrl, setSecondImage, setIsLoadingSecond, setSecondError);
    }
  }, [formData.mainProductUrl, formData.secondProductUrl]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Crop transparent pixels from image and return trimmed base64
  const cropTransparentPixels = async (imageSrc: string): Promise<string> => {
    const img = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    
    // Find bounding box of non-transparent pixels
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 10) { // threshold for non-transparent
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    // If no visible pixels found, return original
    if (minX >= maxX || minY >= maxY) {
      return imageSrc;
    }
    
    // Add small padding (2px)
    const padding = 2;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width - 1, maxX + padding);
    maxY = Math.min(canvas.height - 1, maxY + padding);
    
    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
    
    // Create cropped canvas
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext('2d')!;
    
    croppedCtx.drawImage(
      canvas,
      minX, minY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
    
    return croppedCanvas.toDataURL('image/png');
  };

  const createCompositeImage = async (
    mainImgSrc: string,
    secondImgSrc: string,
    width: number,
    height: number
  ): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Load images
    const [mainImg, secondImg] = await Promise.all([
      loadImage(mainImgSrc),
      loadImage(secondImgSrc),
    ]);
    
    // Layout settings - maximize image size while keeping + visible
    const isPC = width === 2010;
    const plusSize = isPC ? 240 : 60;
    const margin = isPC ? 20 : 8; // minimal outer margin
    const plusGap = isPC ? 15 : 5; // minimal gap between image and + sign
    
    // Calculate available space for each image
    const plusAreaWidth = plusSize + plusGap * 2;
    const availableWidth = width - margin * 2 - plusAreaWidth;
    const imgAreaWidth = availableWidth / 2;
    const imgAreaHeight = height - margin * 2;
    
    // Calculate aspect ratios and scale to fit
    const mainRatio = mainImg.width / mainImg.height;
    const secondRatio = secondImg.width / secondImg.height;
    
    let mainDrawWidth = imgAreaWidth;
    let mainDrawHeight = mainDrawWidth / mainRatio;
    if (mainDrawHeight > imgAreaHeight) {
      mainDrawHeight = imgAreaHeight;
      mainDrawWidth = mainDrawHeight * mainRatio;
    }
    
    let secondDrawWidth = imgAreaWidth;
    let secondDrawHeight = secondDrawWidth / secondRatio;
    if (secondDrawHeight > imgAreaHeight) {
      secondDrawHeight = imgAreaHeight;
      secondDrawWidth = secondDrawHeight * secondRatio;
    }
    
    // Position images - left image right-aligned in its area, right image left-aligned
    const leftAreaEnd = margin + imgAreaWidth;
    const rightAreaStart = width - margin - imgAreaWidth;
    
    const mainX = leftAreaEnd - mainDrawWidth; // right-align in left area
    const mainY = (height - mainDrawHeight) / 2;
    
    const secondX = rightAreaStart; // left-align in right area
    const secondY = (height - secondDrawHeight) / 2;
    
    // Draw images
    ctx.drawImage(mainImg, mainX, mainY, mainDrawWidth, mainDrawHeight);
    ctx.drawImage(secondImg, secondX, secondY, secondDrawWidth, secondDrawHeight);
    
    // Draw + sign in center
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${plusSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', width / 2, height / 2);
    
    return canvas.toDataURL('image/png');
  };

  const handleConfirmAndProcess = async () => {
    if (!mainImage || !secondImage) return;
    
    setIsProcessing(true);
    setProcessingStatus('Removing backgrounds...');
    
    try {
      // Step 1: Remove backgrounds using Fotor API
      const { data, error } = await supabase.functions.invoke('ben-process-images', {
        body: { 
          mainImageUrl: mainImage,
          secondImageUrl: secondImage,
        },
      });

      if (error || !data.success) {
        console.error('Error processing images:', error || data.error);
        setProcessingStatus('Failed to remove backgrounds. Using original images...');
        // Fall back to original images
        await createFinalImages(mainImage, secondImage);
        return;
      }

      setProcessingStatus('Creating gallery images...');
      
      // Step 2: Create composite images with background-removed images
      await createFinalImages(data.mainImage, data.secondImage);
      
    } catch (err) {
      console.error('Error:', err);
      setProcessingStatus('Error occurred. Using original images...');
      // Fall back to original images
      await createFinalImages(mainImage, secondImage);
    }
  };

  const createFinalImages = async (mainSrc: string, secondSrc: string) => {
    try {
      // Crop transparent pixels from both images first
      setProcessingStatus('Cropping transparent areas...');
      const [croppedMain, croppedSecond] = await Promise.all([
        cropTransparentPixels(mainSrc),
        cropTransparentPixels(secondSrc)
      ]);
      
      // Create PC version (2010x1334, horizontal)
      setProcessingStatus('Creating PC version...');
      const pcDataUrl = await createCompositeImage(croppedMain, croppedSecond, 2010, 1334);
      setPcImage(pcDataUrl);
      
      // Create Mobile version (450x450, horizontal)
      setProcessingStatus('Creating Mobile version...');
      const mobileDataUrl = await createCompositeImage(croppedMain, croppedSecond, 450, 450);
      setMobileImage(mobileDataUrl);
      
      setProcessingStatus('Complete!');
      setIsProcessing(false);
    } catch (err) {
      console.error('Error creating composite images:', err);
      setProcessingStatus('Failed to create images');
      setIsProcessing(false);
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show download UI if images are ready
  if (pcImage && mobileImage) {
    return (
      <div className="flex gap-3 mt-4 animate-fade-in">
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 max-w-[95%] w-full">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4">
            ✅ Gallery Images Ready!
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">PC Version (2010×1334)</p>
              <div className="border border-border rounded-lg overflow-hidden bg-white">
                <img src={pcImage} alt="PC Gallery" className="w-full h-auto" />
              </div>
              <Button 
                onClick={() => downloadImage(pcImage, 'gallery-pc.png')}
                className="w-full"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PC
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Mobile Version (450×450)</p>
              <div className="border border-border rounded-lg overflow-hidden bg-white">
                <img src={mobileImage} alt="Mobile Gallery" className="w-full h-auto" />
              </div>
              <Button 
                onClick={() => downloadImage(mobileImage, 'gallery-mobile.png')}
                className="w-full"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Mobile
              </Button>
            </div>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => {
              setPcImage(null);
              setMobileImage(null);
              onSubmit();
            }}
            className="w-full"
          >
            Create Another Gallery
          </Button>
        </div>
      </div>
    );
  }

  // Show processing state
  if (isProcessing) {
    return (
      <div className="flex gap-3 mt-4 animate-fade-in">
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6 max-w-[95%] w-full text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg font-medium">{processingStatus}</p>
          <p className="text-sm text-muted-foreground mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mt-4 animate-fade-in">
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 max-w-[95%] w-full">
        <div className="space-y-3 text-sm">
          <div><strong>Main Product URL:</strong> <span className="text-xs text-muted-foreground break-all">{formData.mainProductUrl}</span></div>
          <div><strong>Second Product URL:</strong> <span className="text-xs text-muted-foreground break-all">{formData.secondProductUrl}</span></div>
        </div>

        {/* Image Previews */}
        <div className="mt-4">
          <p className="text-sm font-medium mb-3">Product Image Preview:</p>
          <div className="grid grid-cols-2 gap-4">
            {/* Main Product Image */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Main Product (Left)</p>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center border border-border">
                {isLoadingMain ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Extracting...</span>
                  </div>
                ) : mainError ? (
                  <span className="text-xs text-muted-foreground text-center px-2">{mainError}</span>
                ) : mainImage ? (
                  <img 
                    src={mainImage} 
                    alt="Main product" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
            </div>

            {/* Second Product Image */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Second Product (Right)</p>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center border border-border">
                {isLoadingSecond ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Extracting...</span>
                  </div>
                ) : secondError ? (
                  <span className="text-xs text-muted-foreground text-center px-2">{secondError}</span>
                ) : secondImage ? (
                  <img 
                    src={secondImage} 
                    alt="Second product" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Is this information correct? Please confirm to proceed.
        </p>
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline"
            size="sm"
            onClick={onGoBack}
          >
            Edit Information
          </Button>
          <Button 
            size="sm"
            onClick={handleConfirmAndProcess}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            disabled={isLoadingMain || isLoadingSecond || !mainImage || !secondImage}
          >
            Confirm & Proceed
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationWithScreenshots;
