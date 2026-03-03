

# Ben (PTO Gallery Creator) — Complete Rebuild Plan

## Summary
Complete rebuild of Ben's PTO Gallery page to support 2-6 product URLs, per-product image selection from gallery, background removal, composite layout generation across 9 output sizes, and ZIP download. All legacy code (n8n webhook, completion overlay, 2-image-only flow, "+" symbol) will be removed.

## Files to Delete
- `src/components/ConfirmationWithScreenshots.tsx` — replaced entirely by new components

## Files to Create

### 1. `src/lib/compositeTemplates.ts`
Layout template definitions for all 9 output sizes. Each template defines canvas dimensions and a `layoutProducts(count, images, sizeCategories)` function that returns draw coordinates. Templates handle 2-6 products with size-category-aware scaling (L/M/S ratios). No "+" symbol in any layout — products are arranged with even spacing on white backgrounds.

### 2. `src/lib/imageProcessing.ts`
Utility functions extracted from ConfirmationWithScreenshots:
- `cropTransparentPixels(imageSrc)` — bounding box crop (alpha > 20)
- `loadImage(src)` — cross-origin image loader
- `createCompositeImage(template, images, sizeCategories)` — canvas renderer using template definitions

### 3. `src/lib/zipGenerator.ts`
- Uses JSZip (new dependency) + file-saver (new dependency)
- Takes array of `{dataUrl, filename}`, packages into ZIP, triggers download
- Filename convention: `PTO_{date}_{sizeId}.png` (e.g., `PTO_250303_G-A.png`)

### 4. `src/components/ProductImageSelector.tsx`
- Receives `images[]` array from extract API + product URL
- Displays image grid with selectable thumbnails
- Shows selected image with blue border highlight
- Props: `images`, `selectedIndex`, `onSelect`, `productName`, `sizeCategory`

### 5. `src/components/BackgroundRemovalPreview.tsx`
- Shows all products (2-6) with checkerboard background after BG removal
- Grid layout: 2-3 columns depending on product count
- "Confirm & Generate" button to proceed to composite step

### 6. `src/components/CompositeLayoutEditor.tsx`
- Displays all 9 output sizes in a scrollable grid
- Each size rendered by `LayoutCanvas` component
- "Download All as ZIP" button at top
- Individual download buttons per size

### 7. `src/components/LayoutCanvas.tsx`
- Renders a single composite canvas for one output size
- Uses template from `compositeTemplates.ts`
- Displays size label and dimensions

### 8. `src/pages/PTOGallery.tsx` (complete rewrite)
Step-based UI flow:
1. **Step 1 — URL Input**: 2-6 URL input fields with add/remove buttons. Validate `https://www.lg.com/` prefix.
2. **Step 2 — Image Selection**: For each product, show gallery images from `ben-extract-images` and let user pick one. All extractions run in parallel.
3. **Step 3 — Background Removal**: Call `ben-process-images` with selected images. Show preview with checkerboard.
4. **Step 4 — Composite Output**: Generate all 9 sizes, display in grid, offer ZIP download.

Chat-style UI preserved with Ben's profile. Back navigation between steps. Feedback dialog retained.

## Edge Functions to Modify

### `supabase/functions/ben-extract-images/index.ts`
Key change: return ALL gallery images instead of just the top-priority one.
- Modify `extractFirstCarouselImage` → `extractAllCarouselImages` returning deduplicated array of `{url, priority, strategy}`
- All images get `convertToHighQualityUrl` applied
- Also extract `productName` from HTML `<title>` or `<h1>`
- Response: `{ success, images: [{url, index}], sizeCategory, productName }`

### `supabase/functions/ben-process-images/index.ts`
Key change: accept array of 2-6 image URLs instead of exactly 2.
- Request body: `{ imageUrls: string[] }` (array of 2-6 URLs)
- Process sequentially with 1-second delay between calls for rate limiting
- Response: `{ success, processedImages: [{originalUrl, base64, index}] }`
- Keep SSRF protection and fallback logic

## New Dependencies
- `jszip` — ZIP file generation
- `file-saver` — cross-browser file download

## Output Size Specifications (No "+" Symbol)

### Gallery Images (PBP)
| ID | Size | Use |
|----|------|-----|
| G-A | 2010x1334 | Default |
| G-B | 1100x730 | Gallery image (all) |
| G-C | 1600x1062 | Gallery zoom (Desktop) |
| G-D | 1044x1334 | Gallery zoom (Mobile) |
| G-E | 350x350 | Gallery thumbnail |

### Basic Images
| ID | Size | Use |
|----|------|-----|
| B-A | 450x450 | Default |
| B-B | 450x450 | Basic Large |
| B-C | 350x350 | Basic Medium |
| B-D | 165x165 | Basic Small |

Layout logic per product count:
- **2 products**: horizontal side-by-side (landscape canvases) or vertical stack (portrait canvases like G-D), products centered in each half
- **3 products**: largest product on left half, two smaller stacked on right half
- **4 products**: 2x2 grid
- **5 products**: top row 3, bottom row 2 centered
- **6 products**: 3x2 grid

Size-category scaling (L/M/S) ratios applied as before to maintain relative product proportions.

## Legacy Code Removal
- Remove n8n webhook URL and all references in PTOGallery.tsx
- Remove `handleSubmit()` GET call logic
- Remove completion overlay (video + "Perfect! I just started working!" message)
- Remove `ConfirmationWithScreenshots` component entirely
- Remove "+" symbol drawing from all composite logic

