// Layout template definitions for all 9 output sizes

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
export type LayoutDirection = 'horizontal' | 'vertical' | 'diagonal';

// Raw scale ratios
const RAW_SCALES: Record<SizeCategory, number> = { L: 1.0, M: 0.75, S: 0.55 };

// Normalize so the largest present category = 1.0
export function getScaleRatio(size: SizeCategory, allCategories: SizeCategory[]): number {
  const present = new Set(allCategories);
  let maxRaw = 0;
  present.forEach((c) => { if (RAW_SCALES[c] > maxRaw) maxRaw = RAW_SCALES[c]; });
  if (maxRaw === 0) return 1.0;
  return RAW_SCALES[size] / maxRaw;
}

export interface ProductPlacement {
  x: number;
  y: number;
  maxWidth: number;
  maxHeight: number;
  scale: number;
}

export interface PositionOverride {
  dx: number; // ratio offset (-1 to 1)
  dy: number;
  scale: number; // multiplier (0.5 to 1.5)
}

// Detect layout type from URLs
export function detectLayoutType(urls: string[]): LayoutDirection {
  const tvKeywords = ['tv', 'oled', 'qned', 'nanocell'];
  const soundbarKeywords = ['soundbar', 'soundsuite'];
  const lower = urls.map((u) => u.toLowerCase());

  const hasTv = lower.some((u) => tvKeywords.some((k) => u.includes(k)));
  const hasSoundbar = lower.some((u) => soundbarKeywords.some((k) => u.includes(k)));
  if (hasTv && hasSoundbar) return 'vertical';

  const monitorUrls = lower.filter((u) => u.includes('monitor'));
  if (monitorUrls.length >= 2) {
    // Check same model by extracting model numbers
    const models = monitorUrls.map((u) => {
      const match = u.match(/\/([a-z0-9]+-?[a-z0-9]+)\/?/i);
      return match ? match[1] : '';
    });
    if (models[0] && models.every((m) => m === models[0])) return 'diagonal';
  }

  return 'horizontal';
}

// Calculate product placements
export function layoutProducts(
  canvasWidth: number,
  canvasHeight: number,
  count: number,
  sizeCategories: SizeCategory[],
  direction: LayoutDirection = 'horizontal',
  overrides?: PositionOverride[]
): ProductPlacement[] {
  // Diagonal: special 2-product overlap
  if (direction === 'diagonal' && count === 2) {
    return layoutDiagonal(canvasWidth, canvasHeight, sizeCategories);
  }

  // Vertical: always stack top-to-bottom
  if (direction === 'vertical') {
    return layoutVertical(canvasWidth, canvasHeight, count, sizeCategories);
  }

  // Horizontal: default layout
  const placements = layoutHorizontal(canvasWidth, canvasHeight, count, sizeCategories);

  // Apply overrides if present
  if (overrides) {
    return placements.map((p, i) => {
      const o = overrides[i];
      if (!o) return p;
      return {
        ...p,
        x: p.x + o.dx * canvasWidth,
        y: p.y + o.dy * canvasHeight,
        scale: p.scale * o.scale,
      };
    });
  }

  return placements;
}

function layoutHorizontal(
  canvasWidth: number,
  canvasHeight: number,
  count: number,
  sizeCategories: SizeCategory[]
): ProductPlacement[] {
  const isPortrait = canvasHeight > canvasWidth;
  const margin = Math.max(canvasWidth, canvasHeight) * 0.05;
  const usableW = canvasWidth - margin * 2;
  const usableH = canvasHeight - margin * 2;
  const gap = Math.min(usableW, usableH) * 0.03;
  const placements: ProductPlacement[] = [];

  if (count === 2) {
    if (isPortrait) {
      const cellH = (usableH - gap) / 2;
      for (let i = 0; i < 2; i++) {
        placements.push({
          x: margin, y: margin + i * (cellH + gap),
          maxWidth: usableW, maxHeight: cellH,
          scale: getScaleRatio(sizeCategories[i], sizeCategories),
        });
      }
    } else {
      const cellW = (usableW - gap) / 2;
      for (let i = 0; i < 2; i++) {
        placements.push({
          x: margin + i * (cellW + gap), y: margin,
          maxWidth: cellW, maxHeight: usableH,
          scale: getScaleRatio(sizeCategories[i], sizeCategories),
        });
      }
    }
  } else if (count === 3) {
    if (isPortrait) {
      const topH = usableH * 0.55;
      const botH = usableH * 0.45 - gap;
      const cellW = (usableW - gap) / 2;
      placements.push({ x: margin, y: margin, maxWidth: usableW, maxHeight: topH, scale: getScaleRatio(sizeCategories[0], sizeCategories) });
      for (let i = 0; i < 2; i++) {
        placements.push({ x: margin + i * (cellW + gap), y: margin + topH + gap, maxWidth: cellW, maxHeight: botH, scale: getScaleRatio(sizeCategories[i + 1], sizeCategories) });
      }
    } else {
      const leftW = usableW * 0.55;
      const rightW = usableW * 0.45 - gap;
      const cellH = (usableH - gap) / 2;
      placements.push({ x: margin, y: margin, maxWidth: leftW, maxHeight: usableH, scale: getScaleRatio(sizeCategories[0], sizeCategories) });
      for (let i = 0; i < 2; i++) {
        placements.push({ x: margin + leftW + gap, y: margin + i * (cellH + gap), maxWidth: rightW, maxHeight: cellH, scale: getScaleRatio(sizeCategories[i + 1], sizeCategories) });
      }
    }
  } else if (count === 4) {
    const cellW = (usableW - gap) / 2;
    const cellH = (usableH - gap) / 2;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const idx = row * 2 + col;
        placements.push({ x: margin + col * (cellW + gap), y: margin + row * (cellH + gap), maxWidth: cellW, maxHeight: cellH, scale: getScaleRatio(sizeCategories[idx], sizeCategories) });
      }
    }
  } else if (count === 5) {
    const cellW3 = (usableW - gap * 2) / 3;
    const cellH = (usableH - gap) / 2;
    for (let i = 0; i < 3; i++) {
      placements.push({ x: margin + i * (cellW3 + gap), y: margin, maxWidth: cellW3, maxHeight: cellH, scale: getScaleRatio(sizeCategories[i], sizeCategories) });
    }
    const cellW2 = (usableW - gap) / 2;
    const offsetX = (usableW - (cellW2 * 2 + gap)) / 2;
    for (let i = 0; i < 2; i++) {
      placements.push({ x: margin + offsetX + i * (cellW2 + gap), y: margin + cellH + gap, maxWidth: cellW2, maxHeight: cellH, scale: getScaleRatio(sizeCategories[i + 3], sizeCategories) });
    }
  } else if (count === 6) {
    const cellW = (usableW - gap * 2) / 3;
    const cellH = (usableH - gap) / 2;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const idx = row * 3 + col;
        placements.push({ x: margin + col * (cellW + gap), y: margin + row * (cellH + gap), maxWidth: cellW, maxHeight: cellH, scale: getScaleRatio(sizeCategories[idx], sizeCategories) });
      }
    }
  }

  return placements;
}

function layoutVertical(
  canvasWidth: number,
  canvasHeight: number,
  count: number,
  sizeCategories: SizeCategory[]
): ProductPlacement[] {
  const margin = Math.max(canvasWidth, canvasHeight) * 0.05;
  const usableW = canvasWidth - margin * 2;
  const usableH = canvasHeight - margin * 2;
  const gap = Math.min(usableW, usableH) * 0.03;
  const cellH = (usableH - gap * (count - 1)) / count;
  const placements: ProductPlacement[] = [];

  for (let i = 0; i < count; i++) {
    placements.push({
      x: margin,
      y: margin + i * (cellH + gap),
      maxWidth: usableW,
      maxHeight: cellH,
      scale: getScaleRatio(sizeCategories[i], sizeCategories),
    });
  }

  return placements;
}

function layoutDiagonal(
  canvasWidth: number,
  canvasHeight: number,
  sizeCategories: SizeCategory[]
): ProductPlacement[] {
  const margin = Math.max(canvasWidth, canvasHeight) * 0.08;
  const usableW = canvasWidth - margin * 2;
  const usableH = canvasHeight - margin * 2;

  // Back product: top-left, slightly smaller
  const backScale = 0.85 * getScaleRatio(sizeCategories[0], sizeCategories);
  // Front product: bottom-right, full size
  const frontScale = 1.0 * getScaleRatio(sizeCategories[1], sizeCategories);

  return [
    {
      x: margin,
      y: margin,
      maxWidth: usableW * 0.75,
      maxHeight: usableH * 0.75,
      scale: backScale,
    },
    {
      x: margin + usableW * 0.25,
      y: margin + usableH * 0.25,
      maxWidth: usableW * 0.75,
      maxHeight: usableH * 0.75,
      scale: frontScale,
    },
  ];
}
