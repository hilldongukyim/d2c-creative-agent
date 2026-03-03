

# Ben PTO Gallery — Enhanced Frontend Workflow

## What Exists vs What's New

The current rebuild has a basic 4-step flow (urls → select → bgremoval → composite). The user's spec adds significant new features across the entire flow.

## Changes by File

### 1. `src/pages/PTOGallery.tsx` — Major rewrite
- Add `welcome` step with auto-advance (2s timeout)
- Add `confirm` and `download` steps (Steps 7-8)
- Track layout overrides per size (horizontal/vertical toggle state)
- Track custom position overrides per size (from drag editor)
- Detect TV+Soundbar combo and same-monitor combo from URLs for auto-layout
- ZIP generation with folder structure: `PTO_Gallery_{YYMMDD}/Gallery_PBP/` and `PTO_Gallery_{YYMMDD}/Basic/`
- Generation progress counter (1/9 through 9/9)
- Success screen with checkmark animation and "Download Again" button
- Step type expands: `'welcome' | 'urls' | 'select' | 'bgremoval' | 'composite' | 'confirm' | 'download'`

### 2. `src/components/CompositeLayoutEditor.tsx` — Major rewrite
- Add layout detection logic: `detectLayoutType(urls)` returns `'horizontal' | 'vertical' | 'diagonal'`
  - TV+Soundbar keywords → vertical
  - Same monitor model → diagonal (suggested, not forced)
  - Default → horizontal
- Per-size card: add `[Horizontal] [Vertical]` toggle buttons
- Per-size card: add "Edit Positions" button opening expanded editor modal
- Remove direct ZIP download (moved to Step 7/8)
- Pass layout overrides and position overrides to LayoutCanvas
- "Continue to Confirmation" button instead of download

### 3. `src/components/LayoutCanvas.tsx` — Moderate changes
- Accept optional `layoutDirection` prop (`'horizontal' | 'vertical' | 'diagonal'`)
- Accept optional `positionOverrides` prop (per-product x/y/scale adjustments)
- Re-render when layout direction or positions change (remove `generated.current` guard)
- Pass direction to `createCompositeImage`

### 4. `src/components/LayoutPositionEditor.tsx` — New file
- Modal/dialog component for expanded position editing
- Large-scale preview with light grid overlay
- Each product rendered as a draggable element (using pointer events + transform, no extra dependency)
- Per-product scale slider (50%-150%, default 100%)
- Snap-to-center and snap-to-edge visual guides
- "Reset to Default" button
- "Apply to All Sizes" checkbox
- "Done" button to close and save positions

### 5. `src/lib/compositeTemplates.ts` — Add layout direction support
- `layoutProducts` gains a `direction` parameter: `'horizontal' | 'vertical' | 'diagonal'`
- Horizontal: current default side-by-side logic
- Vertical: stack top-to-bottom regardless of canvas orientation
- Diagonal: 2-product overlap layout (back product offset top-left at 0.85 scale, front bottom-right at 1.0)
- Size category scaling: normalize so largest present category = 1.0 (currently hardcoded L=1.0)

### 6. `src/lib/imageProcessing.ts` — Add direction + position override support
- `createCompositeImage` accepts optional `direction` and `positionOverrides` params
- When overrides exist, use them instead of auto-calculated placements
- Add shadow rendering for diagonal layout (subtle drop shadow on front product)

### 7. `src/lib/zipGenerator.ts` — Folder structure
- Update `downloadAsZip` to support subfolder paths in filenames
- ZIP structure: `PTO_Gallery_{YYMMDD}/Gallery_PBP/G-A_2010x1334.png` etc.

### 8. `src/components/ProductImageSelector.tsx` — Minor UI polish
- Add colored size category badge: L (blue), M (green), S (orange) using bg-blue-100/bg-green-100/bg-orange-100

### 9. `src/components/BackgroundRemovalPreview.tsx` — Minor
- Add per-product processing status indicators (pending/processing/done/failed)
- Show progress bar with "Processing product X of Y..."

## Layout Detection Logic (in CompositeLayoutEditor)

```text
detectLayoutType(urls: string[]):
  tvKeywords = ['tv', 'oled', 'qned', 'nanocell']
  soundbarKeywords = ['soundbar', 'soundsuite']
  
  hasTv = urls.some(u => tvKeywords.some(k => u.includes(k)))
  hasSoundbar = urls.some(u => soundbarKeywords.some(k => u.includes(k)))
  
  if (hasTv && hasSoundbar) → 'vertical' (TV on top)
  
  monitorUrls = urls.filter(u => u.includes('monitor'))
  if (monitorUrls.length >= 2 && sameModel(monitorUrls)) → suggest 'diagonal'
  
  default → 'horizontal'
```

## Drag Implementation (LayoutPositionEditor)

Use native pointer events (pointerdown/pointermove/pointerup) with CSS transform for dragging. No additional dependency needed. Track `{dx, dy, scale}` offsets per product index, stored as percentage of canvas dimensions for cross-size applicability.

## Step Flow Summary

```text
welcome → urls → select → bgremoval → composite → confirm → download
  (2s)    (user)  (user)   (auto)      (user)     (user)    (auto)
```

## Technical Notes
- No new npm dependencies needed (drag via pointer events)
- Scale category normalization: if no L products, M becomes 1.0 base; if only S, S becomes 1.0
- Diagonal layout only available for exactly 2 products
- Position editor stores offsets as ratios so "Apply to All Sizes" works across different canvas dimensions

