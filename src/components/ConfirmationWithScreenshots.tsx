import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
            onClick={onSubmit}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            disabled={isLoadingMain || isLoadingSecond}
          >
            Confirm & Proceed
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationWithScreenshots;
