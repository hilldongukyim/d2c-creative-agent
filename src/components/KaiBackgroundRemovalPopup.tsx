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

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
            {/* Speech Bubble */}
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-md shadow-xl">
              {/* Speech bubble tail */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white/95" />
              
              <p className="text-gray-800 text-center text-lg font-medium leading-relaxed">
                안녕하세요! 👋<br />
                배경을 제거하고 싶은 이미지를<br />
                아래 버튼을 눌러 업로드해 주세요!<br />
                <span className="text-sm text-gray-600 mt-2 block">
                  배경이 제거된 PNG 이미지를<br />
                  이메일로 보내드릴게요 ✨
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
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg px-8 py-6 text-lg font-semibold rounded-xl transition-all hover:scale-105"
            >
              <Upload className="w-5 h-5 mr-2" />
              이미지 업로드하기
            </Button>

            {/* Selected file indicator */}
            {selectedFile && (
              <div className="mt-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                <p className="text-gray-700 text-sm">
                  선택된 파일: <span className="font-medium">{selectedFile.name}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KaiBackgroundRemovalPopup;
