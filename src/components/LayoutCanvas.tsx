import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { type OutputSize, type SizeCategory, type LayoutDirection, type PositionOverride } from "@/lib/compositeTemplates";
import { generateCompositeCanvas, type CompositeProduct } from "@/lib/imageProcessing";
import { downloadSingleImage, getDateString } from "@/lib/zipGenerator";

interface LayoutCanvasProps {
  outputSize: OutputSize;
  images: string[];
  sizeCategories: SizeCategory[];
  direction?: LayoutDirection;
  overrides?: PositionOverride[];
  onGenerated: (id: string, dataUrl: string) => void;
}

const LayoutCanvas = ({ outputSize, images, sizeCategories, direction = 'horizontal', overrides, onGenerated }: LayoutCanvasProps) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const renderKey = useRef(0);

  useEffect(() => {
    const key = ++renderKey.current;
    setDataUrl(null);

    const products: CompositeProduct[] = images.map((dataUrl, i) => ({
      dataUrl,
      sizeCategory: sizeCategories[i] || 'M',
    }));

    generateCompositeCanvas(
      outputSize.width, outputSize.height, products, direction, overrides
    ).then((canvas) => {
      if (renderKey.current === key) {
        const url = canvas.toDataURL('image/png');
        setDataUrl(url);
        onGenerated(outputSize.id, url);
      }
    });
  }, [outputSize, images, sizeCategories, direction, overrides, onGenerated]);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold">{outputSize.id}</p>
          <p className="text-[10px] text-muted-foreground">{outputSize.name}</p>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {outputSize.width}×{outputSize.height}
        </span>
      </div>

      <div className="border border-border rounded overflow-hidden bg-white mb-2">
        {dataUrl ? (
          <img src={dataUrl} alt={outputSize.id} className="w-full h-auto" />
        ) : (
          <div className="aspect-video flex items-center justify-center text-xs text-muted-foreground">
            Generating...
          </div>
        )}
      </div>

      {dataUrl && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() =>
            downloadSingleImage(dataUrl, `PTO_${getDateString()}_${outputSize.id}.png`)
          }
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
      )}
    </div>
  );
};

export default LayoutCanvas;
