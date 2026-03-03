import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type OutputSize, type SizeCategory, type PositionOverride } from "@/lib/compositeTemplates";

interface LayoutPositionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outputSize: OutputSize;
  images: string[];
  sizeCategories: SizeCategory[];
  overrides: PositionOverride[];
  onSave: (overrides: PositionOverride[], applyToAll: boolean) => void;
}

const LayoutPositionEditor = ({
  open,
  onOpenChange,
  outputSize,
  images,
  sizeCategories,
  overrides,
  onSave,
}: LayoutPositionEditorProps) => {
  const [localOverrides, setLocalOverrides] = useState<PositionOverride[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number }>({ x: 0, y: 0, ox: 0, oy: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setLocalOverrides(
        overrides.length === images.length
          ? overrides.map((o) => ({ ...o }))
          : images.map(() => ({ dx: 0, dy: 0, scale: 1.0 }))
      );
    }
  }, [open, overrides, images.length]);

  const previewScale = Math.min(500 / outputSize.width, 400 / outputSize.height, 1);
  const pW = outputSize.width * previewScale;
  const pH = outputSize.height * previewScale;

  const handlePointerDown = useCallback((idx: number, e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(idx);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: localOverrides[idx]?.dx || 0,
      oy: localOverrides[idx]?.dy || 0,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [localOverrides]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging === null) return;
    const dx = (e.clientX - dragStart.current.x) / pW;
    const dy = (e.clientY - dragStart.current.y) / pH;
    setLocalOverrides((prev) => {
      const next = [...prev];
      next[dragging] = {
        ...next[dragging],
        dx: Math.max(-0.5, Math.min(0.5, dragStart.current.ox + dx)),
        dy: Math.max(-0.5, Math.min(0.5, dragStart.current.oy + dy)),
      };
      return next;
    });
  }, [dragging, pW, pH]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const updateScale = (idx: number, value: number) => {
    setLocalOverrides((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], scale: value };
      return next;
    });
  };

  const handleReset = () => {
    setLocalOverrides(images.map(() => ({ dx: 0, dy: 0, scale: 1.0 })));
  };

  const handleDone = () => {
    onSave(localOverrides, applyToAll);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-sm">
            Edit Positions — {outputSize.id} ({outputSize.width}×{outputSize.height})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Canvas preview */}
          <div
            ref={containerRef}
            className="relative mx-auto border border-border rounded bg-white overflow-hidden cursor-move"
            style={{ width: pW, height: pH }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: `${pW / 4}px ${pH / 4}px`,
              opacity: 0.3,
            }} />
            {/* Center guides */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px pointer-events-none" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)' }} />
            <div className="absolute top-1/2 left-0 right-0 h-px pointer-events-none" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)' }} />

            {/* Product elements */}
            {images.map((src, idx) => {
              const o = localOverrides[idx] || { dx: 0, dy: 0, scale: 1.0 };
              const cellW = pW / images.length;
              const baseX = cellW * idx + cellW / 2;
              const baseY = pH / 2;
              const tx = baseX + o.dx * pW;
              const ty = baseY + o.dy * pH;
              const s = o.scale * 0.6;

              return (
                <img
                  key={idx}
                  src={src}
                  alt={`Product ${idx + 1}`}
                  className="absolute select-none"
                  style={{
                    width: cellW * s,
                    maxHeight: pH * s,
                    objectFit: 'contain',
                    left: tx - (cellW * s) / 2,
                    top: ty - (pH * s) / 2,
                    cursor: dragging === idx ? 'grabbing' : 'grab',
                    outline: dragging === idx ? '2px solid hsl(var(--primary))' : '1px dashed hsl(var(--border))',
                    borderRadius: 4,
                  }}
                  onPointerDown={(e) => handlePointerDown(idx, e)}
                  draggable={false}
                />
              );
            })}
          </div>

          {/* Per-product scale sliders */}
          <div className="space-y-2">
            {images.map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0">Product {idx + 1}</span>
                <Slider
                  min={50}
                  max={150}
                  step={5}
                  value={[Math.round((localOverrides[idx]?.scale || 1) * 100)]}
                  onValueChange={([v]) => updateScale(idx, v / 100)}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {Math.round((localOverrides[idx]?.scale || 1) * 100)}%
                </span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Checkbox
                id="apply-all"
                checked={applyToAll}
                onCheckedChange={(v) => setApplyToAll(!!v)}
              />
              <label htmlFor="apply-all" className="text-xs text-muted-foreground cursor-pointer">
                Apply to All Sizes
              </label>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" onClick={handleDone}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LayoutPositionEditor;
