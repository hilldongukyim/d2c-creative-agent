import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface BackgroundRemovalPreviewProps {
  images: string[]; // base64 data URLs after BG removal
  productNames: string[];
  isProcessing: boolean;
  processingStatus: string;
  onConfirm: () => void;
  onBack: () => void;
}

const checkerboardStyle = {
  backgroundImage:
    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
};

const BackgroundRemovalPreview = ({
  images,
  productNames,
  isProcessing,
  processingStatus,
  onConfirm,
  onBack,
}: BackgroundRemovalPreviewProps) => {
  if (isProcessing) {
    return (
      <div className="rounded-lg bg-card border border-border p-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm font-medium">{processingStatus}</p>
        <p className="text-xs text-muted-foreground mt-1">Please wait...</p>
      </div>
    );
  }

  const cols = images.length <= 2 ? 2 : 3;

  return (
    <div className="rounded-lg bg-card border border-border p-4">
      <h3 className="text-sm font-semibold mb-3">🎨 Background Removed — Preview</h3>

      <div className={`grid gap-3 mb-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {images.map((src, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-xs text-muted-foreground truncate">{productNames[idx] || `Product ${idx + 1}`}</p>
            <div
              className="aspect-square rounded-lg overflow-hidden flex items-center justify-center border border-border"
              style={checkerboardStyle}
            >
              <img
                src={src}
                alt={`Product ${idx + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Backgrounds removed and cropped. Ready to generate composite images?
      </p>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button size="sm" onClick={onConfirm} className="flex-1">
          Confirm & Generate
        </Button>
      </div>
    </div>
  );
};

export default BackgroundRemovalPreview;
