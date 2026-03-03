import { Loader2, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImage {
  url: string;
  index: number;
}

interface ProductImageSelectorProps {
  images: ProductImage[];
  productName: string;
  sizeCategory: string;
  isLoading: boolean;
  error: string | null;
  confirmed: boolean;
  onConfirm: () => void;
  onRetry: () => void;
}

const BADGE_STYLES: Record<string, string> = {
  L: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  M: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  S: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

const ProductImageSelector = ({
  images,
  productName,
  sizeCategory,
  isLoading,
  error,
  confirmed,
  onConfirm,
  onRetry,
}: ProductImageSelectorProps) => {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Extracting image...</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{productName}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <p className="text-sm text-destructive font-medium">Failed to extract image</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{productName}</p>
        <p className="text-xs text-destructive/70 mt-1">{error}</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 text-xs w-full">
          <RefreshCw className="h-3 w-3 mr-1" />Retry
        </Button>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">No images found</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{productName}</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 text-xs w-full">
          <RefreshCw className="h-3 w-3 mr-1" />Retry
        </Button>
      </div>
    );
  }

  const firstImage = images[0];

  return (
    <div className={`rounded-lg border bg-card p-4 transition-all ${confirmed ? 'border-green-500/50' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium truncate flex-1 mr-2">{productName}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${BADGE_STYLES[sizeCategory] || 'bg-muted text-muted-foreground'}`}>
          {sizeCategory}
        </span>
      </div>

      {/* Image preview */}
      <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center border border-border mb-3">
        <img
          src={firstImage.url}
          alt="Product"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Confirm / Retry buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-xs flex-1"
        >
          <RefreshCw className="h-3 w-3 mr-1" />Wrong image
        </Button>
        <Button
          variant={confirmed ? "secondary" : "default"}
          size="sm"
          onClick={onConfirm}
          disabled={confirmed}
          className="text-xs flex-1"
        >
          {confirmed ? <><Check className="h-3 w-3 mr-1" />Confirmed</> : <>
            <Check className="h-3 w-3 mr-1" />Confirm
          </>}
        </Button>
      </div>
    </div>
  );
};

export default ProductImageSelector;
