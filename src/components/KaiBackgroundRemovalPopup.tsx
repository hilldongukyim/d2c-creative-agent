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
      <DialogContent className="max-w-4xl w-[95vw] h-[80vh] p-0 overflow-hidden border-none">
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
            <div className="flex flex-col items-center justify-center" style={{ marginTop: '-5%' }}>
              {/* Speech Bubble */}
              <div className="relative bg-black/80 backdrop-blur-sm rounded-lg p-5 mb-6 max-w-sm border border-green-400/50">
                <p className="text-green-400 text-center text-base font-mono leading-relaxed">
                  Hey there! 👋<br />
                  Upload an image you want<br />
                  the background removed from!<br />
                  <span className="text-sm text-green-300/80 mt-2 block">
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
                className="bg-green-400 text-black hover:bg-green-300 shadow-lg px-6 py-5 text-base font-mono font-semibold rounded-lg transition-all hover:scale-105 border-2 border-green-300"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Image
              </Button>

              {/* Selected file indicator */}
              {selectedFile && (
                <div className="mt-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-400/50">
                  <p className="text-green-400 text-sm font-mono">
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
