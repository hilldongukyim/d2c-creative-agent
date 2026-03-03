import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Settings2 } from "lucide-react";
import { OUTPUT_SIZES, detectLayoutType, type SizeCategory, type LayoutDirection, type PositionOverride } from "@/lib/compositeTemplates";
import LayoutCanvas from "./LayoutCanvas";
import LayoutPositionEditor from "./LayoutPositionEditor";

interface CompositeLayoutEditorProps {
  images: string[];
  sizeCategories: SizeCategory[];
  productUrls: string[];
  onConfirm: (
    layouts: Record<string, LayoutDirection>,
    overrides: Record<string, PositionOverride[]>,
    generatedMap: Record<string, string>
  ) => void;
  onBack: () => void;
}

const CompositeLayoutEditor = ({
  images,
  sizeCategories,
  productUrls,
  onConfirm,
  onBack,
}: CompositeLayoutEditorProps) => {
  const detectedLayout = useMemo(() => detectLayoutType(productUrls), [productUrls]);
  const [layouts, setLayouts] = useState<Record<string, LayoutDirection>>(() => {
    const map: Record<string, LayoutDirection> = {};
    OUTPUT_SIZES.forEach((s) => { map[s.id] = detectedLayout; });
    return map;
  });
  const [overrides, setOverrides] = useState<Record<string, PositionOverride[]>>({});
  const [editingSize, setEditingSize] = useState<string | null>(null);
  const generatedMap = useRef<Record<string, string>>({});
  const [readyCount, setReadyCount] = useState(0);

  const handleGenerated = useCallback((id: string, dataUrl: string) => {
    generatedMap.current[id] = dataUrl;
    setReadyCount((c) => c + 1);
  }, []);

  const toggleLayout = (sizeId: string, dir: LayoutDirection) => {
    setLayouts((prev) => ({ ...prev, [sizeId]: dir }));
    // Reset ready count to force re-render
    setReadyCount(0);
    generatedMap.current = {};
  };

  const handleSaveOverrides = (sizeId: string, newOverrides: PositionOverride[], applyToAll: boolean) => {
    if (applyToAll) {
      const map: Record<string, PositionOverride[]> = {};
      OUTPUT_SIZES.forEach((s) => { map[s.id] = newOverrides; });
      setOverrides(map);
    } else {
      setOverrides((prev) => ({ ...prev, [sizeId]: newOverrides }));
    }
    setReadyCount(0);
    generatedMap.current = {};
  };

  const allReady = readyCount >= OUTPUT_SIZES.length;
  const gallerySizes = OUTPUT_SIZES.filter((s) => s.category === 'gallery');
  const basicSizes = OUTPUT_SIZES.filter((s) => s.category === 'basic');

  const editingSizeObj = editingSize ? OUTPUT_SIZES.find((s) => s.id === editingSize) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          📐 Layout Preview ({readyCount}/{OUTPUT_SIZES.length})
        </h3>
        {detectedLayout !== 'horizontal' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
            Auto: {detectedLayout}
          </span>
        )}
      </div>

      {/* Gallery sizes */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Gallery Images (PBP)</p>
        <div className="grid grid-cols-2 gap-3">
          {gallerySizes.map((size) => (
            <SizeCard
              key={`${size.id}-${layouts[size.id]}-${JSON.stringify(overrides[size.id])}`}
              size={size}
              images={images}
              sizeCategories={sizeCategories}
              direction={layouts[size.id]}
              overrides={overrides[size.id]}
              onGenerated={handleGenerated}
              onToggleLayout={(dir) => toggleLayout(size.id, dir)}
              onEditPositions={() => setEditingSize(size.id)}
            />
          ))}
        </div>
      </div>

      {/* Basic sizes */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Basic Images</p>
        <div className="grid grid-cols-2 gap-3">
          {basicSizes.map((size) => (
            <SizeCard
              key={`${size.id}-${layouts[size.id]}-${JSON.stringify(overrides[size.id])}`}
              size={size}
              images={images}
              sizeCategories={sizeCategories}
              direction={layouts[size.id]}
              overrides={overrides[size.id]}
              onGenerated={handleGenerated}
              onToggleLayout={(dir) => toggleLayout(size.id, dir)}
              onEditPositions={() => setEditingSize(size.id)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>Back</Button>
        <Button
          size="sm"
          className="flex-1"
          disabled={!allReady}
          onClick={() => onConfirm(layouts, overrides, generatedMap.current)}
        >
          <ArrowRight className="h-3 w-3 mr-1" />
          Continue to Confirmation
        </Button>
      </div>

      {/* Position Editor */}
      {editingSizeObj && (
        <LayoutPositionEditor
          open={!!editingSize}
          onOpenChange={(open) => !open && setEditingSize(null)}
          outputSize={editingSizeObj}
          images={images}
          sizeCategories={sizeCategories}
          overrides={overrides[editingSize!] || []}
          onSave={(o, applyAll) => handleSaveOverrides(editingSize!, o, applyAll)}
        />
      )}
    </div>
  );
};

// Per-size card sub-component
function SizeCard({
  size,
  images,
  sizeCategories,
  direction,
  overrides,
  onGenerated,
  onToggleLayout,
  onEditPositions,
}: {
  size: typeof OUTPUT_SIZES[0];
  images: string[];
  sizeCategories: SizeCategory[];
  direction: LayoutDirection;
  overrides?: PositionOverride[];
  onGenerated: (id: string, dataUrl: string) => void;
  onToggleLayout: (dir: LayoutDirection) => void;
  onEditPositions: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <LayoutCanvas
        outputSize={size}
        images={images}
        sizeCategories={sizeCategories}
        direction={direction}
        overrides={overrides}
        onGenerated={onGenerated}
      />
      <div className="flex items-center gap-1">
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            className={`px-2 py-0.5 text-[10px] transition-colors ${direction === 'horizontal' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            onClick={() => onToggleLayout('horizontal')}
          >H</button>
          <button
            className={`px-2 py-0.5 text-[10px] transition-colors ${direction === 'vertical' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            onClick={() => onToggleLayout('vertical')}
          >V</button>
        </div>
        <button
          className="p-0.5 rounded hover:bg-muted text-muted-foreground"
          onClick={onEditPositions}
          title="Edit positions"
        >
          <Settings2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default CompositeLayoutEditor;
