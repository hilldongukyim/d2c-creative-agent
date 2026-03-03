// Layout template definitions for all 9 output sizes
// No "+" symbol — products arranged with even spacing on white backgrounds

export interface OutputSize {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'gallery' | 'basic';
}

export const OUTPUT_SIZES: OutputSize[] = [
  { id: 'G-A', name: 'Default', width: 2010, height: 1334, category: 'gallery' },
  { id: 'G-B', name: 'Gallery image (all)', width: 1100, height: 730, category: 'gallery' },
  { id: 'G-C', name: 'Gallery zoom (Desktop)', width: 1600, height: 1062, category: 'gallery' },
  { id: 'G-D', name: 'Gallery zoom (Mobile)', width: 1044, height: 1334, category: 'gallery' },
  { id: 'G-E', name: 'Gallery thumbnail', width: 350, height: 350, category: 'gallery' },
  { id: 'B-A', name: 'Default', width: 450, height: 450, category: 'basic' },
  { id: 'B-B', name: 'Basic Large Image', width: 450, height: 450, category: 'basic' },
  { id: 'B-C', name: 'Basic Medium Image', width: 350, height: 350, category: 'basic' },
  { id: 'B-D', name: 'Basic Small Image', width: 165, height: 165, category: 'basic' },
];

export type SizeCategory = 'L' | 'M' | 'S';

// Scale ratios for different size category combinations
export function getScaleRatio(size: SizeCategory): number {
  const map: Record<SizeCategory, number> = { L: 1.0, M: 0.8, S: 0.6 };
  return map[size];
}

export interface ProductPlacement {
  x: number;
  y: number;
  maxWidth: number;
  maxHeight: number;
  scale: number; // from size category
}

// Calculate product placements for a given canvas size and product count
export function layoutProducts(
  canvasWidth: number,
  canvasHeight: number,
  count: number,
  sizeCategories: SizeCategory[]
): ProductPlacement[] {
  const isPortrait = canvasHeight > canvasWidth;
  const isSquare = canvasWidth === canvasHeight;
  const margin = Math.max(canvasWidth, canvasHeight) * 0.05; // 5% margin

  const usableW = canvasWidth - margin * 2;
  const usableH = canvasHeight - margin * 2;
  const gap = Math.min(usableW, usableH) * 0.03;

  const placements: ProductPlacement[] = [];

  if (count === 2) {
    if (isPortrait) {
      // Vertical stack for portrait
      const cellH = (usableH - gap) / 2;
      for (let i = 0; i < 2; i++) {
        placements.push({
          x: margin,
          y: margin + i * (cellH + gap),
          maxWidth: usableW,
          maxHeight: cellH,
          scale: getScaleRatio(sizeCategories[i]),
        });
      }
    } else {
      // Horizontal side-by-side
      const cellW = (usableW - gap) / 2;
      for (let i = 0; i < 2; i++) {
        placements.push({
          x: margin + i * (cellW + gap),
          y: margin,
          maxWidth: cellW,
          maxHeight: usableH,
          scale: getScaleRatio(sizeCategories[i]),
        });
      }
    }
  } else if (count === 3) {
    if (isPortrait) {
      // Top: 1 large, Bottom row: 2 smaller
      const topH = usableH * 0.55;
      const botH = usableH * 0.45 - gap;
      const cellW = (usableW - gap) / 2;
      placements.push({
        x: margin, y: margin, maxWidth: usableW, maxHeight: topH,
        scale: getScaleRatio(sizeCategories[0]),
      });
      for (let i = 0; i < 2; i++) {
        placements.push({
          x: margin + i * (cellW + gap),
          y: margin + topH + gap,
          maxWidth: cellW,
          maxHeight: botH,
          scale: getScaleRatio(sizeCategories[i + 1]),
        });
      }
    } else {
      // Left: 1 large, Right: 2 stacked
      const leftW = usableW * 0.55;
      const rightW = usableW * 0.45 - gap;
      const cellH = (usableH - gap) / 2;
      placements.push({
        x: margin, y: margin, maxWidth: leftW, maxHeight: usableH,
        scale: getScaleRatio(sizeCategories[0]),
      });
      for (let i = 0; i < 2; i++) {
        placements.push({
          x: margin + leftW + gap,
          y: margin + i * (cellH + gap),
          maxWidth: rightW,
          maxHeight: cellH,
          scale: getScaleRatio(sizeCategories[i + 1]),
        });
      }
    }
  } else if (count === 4) {
    // 2x2 grid
    const cellW = (usableW - gap) / 2;
    const cellH = (usableH - gap) / 2;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const idx = row * 2 + col;
        placements.push({
          x: margin + col * (cellW + gap),
          y: margin + row * (cellH + gap),
          maxWidth: cellW,
          maxHeight: cellH,
          scale: getScaleRatio(sizeCategories[idx]),
        });
      }
    }
  } else if (count === 5) {
    // Top row: 3, Bottom row: 2 centered
    const cellW3 = (usableW - gap * 2) / 3;
    const cellH = (usableH - gap) / 2;
    for (let i = 0; i < 3; i++) {
      placements.push({
        x: margin + i * (cellW3 + gap),
        y: margin,
        maxWidth: cellW3,
        maxHeight: cellH,
        scale: getScaleRatio(sizeCategories[i]),
      });
    }
    const cellW2 = (usableW - gap) / 2;
    const offsetX = (usableW - (cellW2 * 2 + gap)) / 2;
    for (let i = 0; i < 2; i++) {
      placements.push({
        x: margin + offsetX + i * (cellW2 + gap),
        y: margin + cellH + gap,
        maxWidth: cellW2,
        maxHeight: cellH,
        scale: getScaleRatio(sizeCategories[i + 3]),
      });
    }
  } else if (count === 6) {
    // 3x2 grid
    const cellW = (usableW - gap * 2) / 3;
    const cellH = (usableH - gap) / 2;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const idx = row * 3 + col;
        placements.push({
          x: margin + col * (cellW + gap),
          y: margin + row * (cellH + gap),
          maxWidth: cellW,
          maxHeight: cellH,
          scale: getScaleRatio(sizeCategories[idx]),
        });
      }
    }
  }

  return placements;
}
