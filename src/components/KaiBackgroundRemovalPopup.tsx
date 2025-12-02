import React, { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface KaiBackgroundRemovalPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KaiBackgroundRemovalPopup: React.FC<KaiBackgroundRemovalPopupProps> = ({
  open,
  onOpenChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // TODO: Handle file upload logic here
      console.log("Selected file:", file.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
              {/* Speech Bubble */}
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

              {/* Selected file indicator */}
              {selectedFile && (
                <div className="mt-4 bg-background/95 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary/30">
                  <p className="text-foreground text-sm">
                    Selected: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KaiBackgroundRemovalPopup;
