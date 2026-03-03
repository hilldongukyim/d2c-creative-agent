import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, MessageCircle } from "lucide-react";
import { OUTPUT_SIZES, type SizeCategory } from "@/lib/compositeTemplates";
import { downloadAsZip, getDateString } from "@/lib/zipGenerator";
import LayoutCanvas from "./LayoutCanvas";
import BenFeedbackDialog from "./BenFeedbackDialog";

interface CompositeLayoutEditorProps {
  images: string[];
  sizeCategories: SizeCategory[];
  productUrls: string[];
  onReset: () => void;
}

const CompositeLayoutEditor = ({
  images,
  sizeCategories,
  productUrls,
  onReset,
}: CompositeLayoutEditorProps) => {
  const generatedMap = useRef<Record<string, string>>({});
  const [readyCount, setReadyCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleGenerated = useCallback((id: string, dataUrl: string) => {
    generatedMap.current[id] = dataUrl;
    setReadyCount((c) => c + 1);
  }, []);

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    const date = getDateString();
    const entries = Object.entries(generatedMap.current).map(([id, dataUrl]) => ({
      dataUrl,
      filename: `PTO_${date}_${id}.png`,
    }));
    await downloadAsZip(entries);
    setIsDownloading(false);
  };

  const allReady = readyCount >= OUTPUT_SIZES.length;

  const gallerySizes = OUTPUT_SIZES.filter((s) => s.category === 'gallery');
  const basicSizes = OUTPUT_SIZES.filter((s) => s.category === 'basic');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">✅ Composite Images ({readyCount}/{OUTPUT_SIZES.length})</h3>
        <Button
          size="sm"
          onClick={handleDownloadAll}
          disabled={!allReady || isDownloading}
        >
          <Download className="h-4 w-4 mr-1" />
          {isDownloading ? 'Packaging...' : 'Download All as ZIP'}
        </Button>
      </div>

      {/* Gallery sizes */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Gallery Images (PBP)</p>
        <div className="grid grid-cols-2 gap-3">
          {gallerySizes.map((size) => (
            <LayoutCanvas
              key={size.id}
              outputSize={size}
              images={images}
              sizeCategories={sizeCategories}
              onGenerated={handleGenerated}
            />
          ))}
        </div>
      </div>

      {/* Basic sizes */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Basic Images</p>
        <div className="grid grid-cols-2 gap-3">
          {basicSizes.map((size) => (
            <LayoutCanvas
              key={size.id}
              outputSize={size}
              images={images}
              sizeCategories={sizeCategories}
              onGenerated={handleGenerated}
            />
          ))}
        </div>
      </div>

      {/* Feedback & Reset */}
      <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
        <span className="text-sm text-muted-foreground">결과물이 마음에 드셨나요?</span>
        <Button variant="outline" size="sm" onClick={() => setShowFeedback(true)} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          피드백 남기기
        </Button>
      </div>

      <Button variant="outline" onClick={onReset} className="w-full">
        Create Another PTO Image
      </Button>

      <BenFeedbackDialog
        open={showFeedback}
        onOpenChange={setShowFeedback}
        crewName="Ben"
        productUrls={productUrls}
      />
    </div>
  );
};

export default CompositeLayoutEditor;
