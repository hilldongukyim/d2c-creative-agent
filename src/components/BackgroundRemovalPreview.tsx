import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export type ProductStatus = 'pending' | 'processing' | 'done' | 'failed';

interface BackgroundRemovalPreviewProps {
  images: string[];
  productNames: string[];
  isProcessing: boolean;
  processingStatus: string;
  productStatuses?: ProductStatus[];
  currentIndex?: number;
  totalCount?: number;
  onConfirm: () => void;
  onBack: () => void;
}

const checkerboardStyle = {
  backgroundImage:
    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
};

const StatusIcon = ({ status }: { status: ProductStatus }) => {
  switch (status) {
    case 'pending': return <Clock className="h-3 w-3 text-muted-foreground" />;
    case 'processing': return <Loader2 className="h-3 w-3 animate-spin text-primary" />;
    case 'done': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    case 'failed': return <XCircle className="h-3 w-3 text-destructive" />;
  }
};

const BackgroundRemovalPreview = ({
  images,
  productNames,
  isProcessing,
  processingStatus,
  productStatuses,
  currentIndex = 0,
  totalCount = 0,
  onConfirm,
  onBack,
}: BackgroundRemovalPreviewProps) => {
  if (isProcessing) {
    const progressPct = totalCount > 0 ? (currentIndex / totalCount) * 100 : 0;
    return (
      <div className="rounded-lg bg-card border border-border p-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm font-medium text-center">{processingStatus}</p>
        {totalCount > 0 && (
          <div className="mt-3 space-y-1">
            <Progress value={progressPct} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Processing product {currentIndex} of {totalCount}...
            </p>
          </div>
        )}
        {productStatuses && (
          <div className="mt-3 space-y-1">
            {productNames.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <StatusIcon status={productStatuses[idx] || 'pending'} />
                <span className="text-xs text-muted-foreground truncate">{name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const cols = images.length <= 2 ? 2 : 3;

  return (
    <div className="rounded-lg bg-card border border-border p-4">
      <h3 className="text-sm font-semibold mb-3">🎨 Background Removed — Preview</h3>

      <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {images.map((src, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-1">
              {productStatuses && <StatusIcon status={productStatuses[idx] || 'done'} />}
              <p className="text-xs text-muted-foreground truncate">{productNames[idx] || `Product ${idx + 1}`}</p>
            </div>
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
        <Button variant="outline" size="sm" onClick={onBack}>Back</Button>
        <Button size="sm" onClick={onConfirm} className="flex-1">
          Continue to Layout Preview
        </Button>
      </div>
    </div>
  );
};

export default BackgroundRemovalPreview;
