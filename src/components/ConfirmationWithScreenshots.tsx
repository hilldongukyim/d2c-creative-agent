import { Button } from "@/components/ui/button";
import { Camera, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface FormData {
  email: string;
  country: string;
  mainProductUrl: string;
  secondProductUrl: string;
  screenshots?: {
    mainProductUrl?: string;
    secondProductUrl?: string;
  };
}

interface ConfirmationWithScreenshotsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onGoBack: () => void;
  onSubmit: () => void;
}

const ConfirmationWithScreenshots = ({ 
  formData, 
  setFormData, 
  onGoBack, 
  onSubmit 
}: ConfirmationWithScreenshotsProps) => {
  const [isCapturingMain, setIsCapturingMain] = useState(false);
  const [isCapturingSecond, setIsCapturingSecond] = useState(false);
  const [capturedMain, setCapturedMain] = useState(false);
  const [capturedSecond, setCapturedSecond] = useState(false);

  // Auto-capture screenshots when component mounts
  useEffect(() => {
    const captureScreenshots = async () => {
      if (formData.mainProductUrl && !formData.screenshots?.mainProductUrl) {
        setIsCapturingMain(true);
        try {
          // Simulate screenshot capture
          await new Promise(resolve => setTimeout(resolve, 2000));
          setFormData(prev => ({
            ...prev,
            screenshots: {
              ...prev.screenshots,
              mainProductUrl: formData.mainProductUrl
            }
          }));
          setCapturedMain(true);
        } catch (error) {
          console.error('Failed to capture main product screenshot:', error);
        } finally {
          setIsCapturingMain(false);
        }
      }

      if (formData.secondProductUrl && !formData.screenshots?.secondProductUrl) {
        setIsCapturingSecond(true);
        try {
          // Simulate screenshot capture
          await new Promise(resolve => setTimeout(resolve, 2000));
          setFormData(prev => ({
            ...prev,
            screenshots: {
              ...prev.screenshots,
              secondProductUrl: formData.secondProductUrl
            }
          }));
          setCapturedSecond(true);
        } catch (error) {
          console.error('Failed to capture second product screenshot:', error);
        } finally {
          setIsCapturingSecond(false);
        }
      }
    };

    captureScreenshots();
  }, [formData.mainProductUrl, formData.secondProductUrl, setFormData]);

  const allScreenshotsCaptured = capturedMain && capturedSecond;

  return (
    <div className="flex gap-3 mt-4 animate-fade-in">
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 max-w-[95%] w-full">
        <div className="space-y-4 text-sm">
          {/* Basic Information */}
          <div className="space-y-2">
            <div><strong>EP ID:</strong> {formData.email}</div>
            <div><strong>Country:</strong> {formData.country}</div>
          </div>

          {/* Product URLs with Screenshots */}
          <div className="space-y-4">
            <div className="border rounded-lg p-3 bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                <strong>Main Product URL:</strong>
                {isCapturingMain ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Capturing screenshot...</span>
                  </div>
                ) : capturedMain ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-xs">Screenshot captured</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Camera className="h-4 w-4" />
                    <span className="text-xs">Preparing...</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground break-all mb-2">
                {formData.mainProductUrl}
              </div>
              {capturedMain && (
                <div className="mt-2 p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                    <Camera className="h-8 w-8 mr-2" />
                    <span className="text-sm font-medium">Screenshot Preview</span>
                  </div>
                  <div className="text-xs text-center mt-1 text-gray-500">
                    Product page captured successfully
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-3 bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                <strong>Second Product URL:</strong>
                {isCapturingSecond ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Capturing screenshot...</span>
                  </div>
                ) : capturedSecond ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-xs">Screenshot captured</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Camera className="h-4 w-4" />
                    <span className="text-xs">Preparing...</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground break-all mb-2">
                {formData.secondProductUrl}
              </div>
              {capturedSecond && (
                <div className="mt-2 p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                    <Camera className="h-8 w-8 mr-2" />
                    <span className="text-sm font-medium">Screenshot Preview</span>
                  </div>
                  <div className="text-xs text-center mt-1 text-gray-500">
                    Product page captured successfully
                  </div>
                </div>
              )}
            </div>
          </div>

          {allScreenshotsCaptured && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ All screenshots captured! Please review the energy labels for each product and confirm to proceed.
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-3">
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
              disabled={!allScreenshotsCaptured}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:opacity-50"
            >
              {allScreenshotsCaptured ? "Confirm & Proceed" : "Capturing Screenshots..."}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationWithScreenshots;