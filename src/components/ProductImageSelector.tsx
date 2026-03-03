import { Loader2 } from "lucide-react";

interface ProductImage {
  url: string;
  index: number;
}

interface ProductImageSelectorProps {
  images: ProductImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  productName: string;
  sizeCategory: string;
  isLoading: boolean;
  error: string | null;
}

const ProductImageSelector = ({
  images,
  selectedIndex,
  onSelect,
  productName,
  sizeCategory,
  isLoading,
  error,
}: ProductImageSelectorProps) => {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Extracting images...</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{productName}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <p className="text-sm text-destructive font-medium">Failed to extract images</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{productName}</p>
        <p className="text-xs text-destructive/70 mt-1">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">No images found</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{productName}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium truncate flex-1 mr-2">{productName}</p>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
          Size: {sizeCategory}
        </span>
      </div>

      {/* Selected image preview */}
      <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center border border-border mb-3">
        <img
          src={images[selectedIndex]?.url}
          alt="Selected product"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Thumbnail grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-1.5">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`aspect-square rounded border-2 overflow-hidden transition-all ${
                idx === selectedIndex
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <img
                src={img.url}
                alt={`Option ${idx + 1}`}
                className="w-full h-full object-contain bg-muted"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageSelector;
