import React, { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Send, RefreshCw } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleSubmit = () => {
    if (selectedFile && email) {
      console.log("Submitting:", { file: selectedFile.name, email });
      // TODO: Implement background removal and email sending
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReselect = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setEmail("");
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
                        Enter your email to receive the result!
                      </span>
                    </p>

                    {/* Email Input */}
                    <div className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background border-primary/30 text-foreground placeholder:text-muted-foreground"
                      />
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
                          disabled={!email}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Request
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
