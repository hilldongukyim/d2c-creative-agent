import React, { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Send, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface KaiBackgroundRemovalPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KaiBackgroundRemovalPopup: React.FC<KaiBackgroundRemovalPopupProps> = ({
  open,
  onOpenChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleSubmit = async () => {
    if (!selectedFile || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const fullEmail = `${email.trim()}@lge.com`;
      const fileName = `${Date.now()}-${selectedFile.name}`;

      // Debug logging
      console.log("=== Kai Background Removal Request ===");
      console.log("Email:", fullEmail);
      console.log("File Name:", fileName);
      console.log("File Type:", selectedFile.type);

      // Upload image to Supabase storage
      console.log("Uploading image to storage...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kai-images')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('kai-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;
      console.log("Image uploaded, URL:", imageUrl);

      // Send request via Edge Function proxy (bypasses CORS)
      console.log("Sending request via Edge Function proxy...");
      const { data, error: invokeError } = await supabase.functions.invoke('kai-webhook-proxy', {
        body: {
          email: fullEmail,
          imageUrl: imageUrl,
          fileName: selectedFile.name,
        },
      });

      if (invokeError) {
        throw new Error(`Proxy error: ${invokeError.message}`);
      }

      console.log("Proxy response:", data);
      
      setIsSuccess(true);
      toast.success("Request sent successfully! Check your email soon.");
    } catch (error) {
      console.error("=== Request Error ===");
      console.error("Error details:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsSuccess(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReselect = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setEmail("");
    setIsSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vmin] w-[90vmin] h-[90vmin] p-0 overflow-hidden border-none aspect-square">
        {/* Background Image */}
        <div
          className="relative w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/lovable-uploads/kai-background-removal-bg.png')`,
          }}
        >
          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content - Positioned inside the monitor screen */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
            {/* Monitor content area - adjusted to fit inside the screen */}
            <div className="flex flex-col items-center justify-center" style={{ marginTop: '-25%', marginLeft: '-5%' }}>
              
              {!selectedFile ? (
                <>
                  {/* Speech Bubble - Initial State */}
                  <div className="relative bg-background/95 backdrop-blur-sm rounded-lg p-5 mb-6 max-w-sm border border-primary/30 shadow-lg">
                    <p className="text-foreground text-center text-base leading-relaxed">
                      Hey there! 👋<br />
                      Upload an image you want<br />
                      the background removed from!<br />
                      <span className="text-sm text-muted-foreground mt-2 block">
                        I'll send you a PNG with<br />
                        the background removed via email ✨
                      </span>
                    </p>
                  </div>

                  {/* Upload Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    onClick={handleUploadClick}
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg px-6 py-5 text-base font-semibold rounded-lg transition-all hover:scale-105"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Image
                  </Button>
                </>
              ) : isSuccess ? (
                <>
                  {/* Success State */}
                  <div className="bg-background/95 backdrop-blur-sm rounded-lg p-5 border border-primary/30 shadow-lg w-full max-w-sm text-center">
                    {/* Kai Profile Image */}
                    <div className="mb-4">
                      <img
                        src="/lovable-uploads/kai-profile.png"
                        alt="Kai"
                        className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-primary/30"
                      />
                    </div>
                    
                    {/* Success Message */}
                    <div className="mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-foreground text-base font-medium mb-1">
                        Got your request! 🎉
                      </p>
                      <p className="text-muted-foreground text-sm">
                        I'll remove the background<br />
                        and send it to your email soon ✨
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        className="flex-1 border-primary/30"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={handleReselect}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        New Image
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Preview State */}
                  <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-primary/30 shadow-lg w-full max-w-sm">
                    {/* Image Preview */}
                    <div className="mb-3">
                      <img
                        src={previewUrl || ""}
                        alt="Preview"
                        className="w-full h-32 object-contain rounded-md bg-muted/50"
                      />
                    </div>
                    
                    {/* Confirmation Message */}
                    <p className="text-foreground text-center text-sm mb-3">
                      Is this the correct image? 🤔<br />
                      <span className="text-muted-foreground text-xs">
                        Enter your ID to receive the result!
                      </span>
                    </p>

                    {/* Email Input with @lge.com suffix */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Input
                          type="text"
                          placeholder="your.id"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-background border-primary/30 text-foreground placeholder:text-muted-foreground rounded-r-none border-r-0"
                        />
                        <span className="bg-muted text-muted-foreground px-3 h-10 flex items-center text-sm border border-primary/30 rounded-r-md">
                          @lge.com
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleReselect}
                          variant="outline"
                          className="flex-1 border-primary/30"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Re-upload
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={!email.trim() || isSubmitting}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-1" />
                              Request
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hidden file input for reselect */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KaiBackgroundRemovalPopup;
