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
    
    // Always horizontal layout (side by side)
    const plusSize = width === 2010 ? 240 : 60; // 2x bigger for PC
    const gap = plusSize + 40; // Space for + sign
    const imgWidth = (width - gap) / 2;
    const imgHeight = height * 0.8;
    const mainX = 0;
    const secondX = width - imgWidth;
    const imgY = (height - imgHeight) / 2;
    
    // Calculate aspect ratios and scale
    const mainRatio = mainImg.width / mainImg.height;
    const secondRatio = secondImg.width / secondImg.height;
    
    let mainDrawWidth = imgWidth;
    let mainDrawHeight = mainDrawWidth / mainRatio;
    if (mainDrawHeight > imgHeight) {
      mainDrawHeight = imgHeight;
      mainDrawWidth = mainDrawHeight * mainRatio;
    }
    
    let secondDrawWidth = imgWidth;
    let secondDrawHeight = secondDrawWidth / secondRatio;
    if (secondDrawHeight > imgHeight) {
      secondDrawHeight = imgHeight;
      secondDrawWidth = secondDrawHeight * secondRatio;
    }
    
    // Draw images centered in their areas
    ctx.drawImage(
      mainImg,
      mainX + (imgWidth - mainDrawWidth) / 2,
      imgY + (imgHeight - mainDrawHeight) / 2,
      mainDrawWidth,
      mainDrawHeight
    );
    
    ctx.drawImage(
      secondImg,
      secondX + (imgWidth - secondDrawWidth) / 2,
      imgY + (imgHeight - secondDrawHeight) / 2,
      secondDrawWidth,
      secondDrawHeight
    );
    
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
      // Create PC version (2010x1334, horizontal)
      setProcessingStatus('Creating PC version...');
      const pcDataUrl = await createCompositeImage(mainSrc, secondSrc, 2010, 1334);
      setPcImage(pcDataUrl);
      
      // Create Mobile version (450x450, horizontal)
      setProcessingStatus('Creating Mobile version...');
      const mobileDataUrl = await createCompositeImage(mainSrc, secondSrc, 450, 450);
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
