

# Refactor Image Processing & Layout Templates to Fractional Position System

## Summary
Refactor `compositeTemplates.ts` and `imageProcessing.ts` to use the user's specified fractional position template interface (0.0–1.0) and add the `scaleProductImage` utility function. This is a structural refactor — the layout logic results are equivalent but the data model changes from absolute pixels to canvas-relative fractions.

## Changes

### 1. `src/lib/compositeTemplates.ts`
- Replace `ProductPlacement` interface with fractional `LayoutTemplate`:
  ```typescript
  interface LayoutTemplate {
    positions: Array<{
      x: number;   // 0.0–1.0 fraction of canvas width
      y: number;   // 0.0–1.0 fraction of canvas height
      maxW: number; // fraction of canvas width
      maxH: number; // fraction of canvas height
    }>;
    safeMargin: number; // px
  }
  ```
- Rewrite `layoutHorizontal`, `layoutVertical`, `layoutDiagonal` to return `LayoutTemplate` objects with fractional values instead of absolute pixel coordinates
- `layoutProducts` returns `LayoutTemplate` instead of `ProductPlacement[]`
- Keep `detectLayoutType`, `getScaleRatio`, `PositionOverride`, `OutputSize`, `SizeCategory`, `LayoutDirection` exports unchanged

### 2. `src/lib/imageProcessing.ts`
- Add `scaleProductImage(croppedDataUrl, sizeCategory, canvasWidth, canvasHeight, productCount)` returning `{width, height}`
  - Calculates base max dimensions from canvas and product count
  - Applies L/M/S ratio (1.0 / 0.75 / 0.55)
  - Fits to allocated space preserving aspect ratio
- Rename `createCompositeImage` → `generateCompositeCanvas` with updated params matching spec:
  - `canvasWidth`, `canvasHeight`, `products[]` with `{dataUrl, sizeCategory, position, customScale}`, `layout` direction
  - Converts fractional positions to pixels at render time: `px = fraction * canvasWidth`
  - Returns `HTMLCanvasElement` (callers wrap with `.toDataURL()`)
- Keep `cropTransparentPixels` and `loadImage` unchanged

### 3. `src/components/LayoutCanvas.tsx`
- Update to call `generateCompositeCanvas` instead of `createCompositeImage`
- Convert result canvas to dataURL via `.toDataURL('image/png')`

### 4. `src/components/CompositeLayoutEditor.tsx`
- Update imports for renamed function
- No logic changes needed — just type alignment

### 5. `src/components/LayoutPositionEditor.tsx`
- Update to work with fractional position model (already stores ratios, just type updates)

