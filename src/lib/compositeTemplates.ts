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

// Fractional layout template — all values are 0.0–1.0 fractions of canvas dimensions
export interface LayoutTemplate {
  positions: Array<{
    x: number;      // fraction of canvas width (0.0 - 1.0)
    y: number;      // fraction of canvas height (0.0 - 1.0)
    maxW: number;   // max width as fraction of canvas width
    maxH: number;   // max height as fraction of canvas height
  }>;
  safeMargin: number; // fraction (e.g. 0.05 = 5%)
}

export interface PositionOverride {
  dx: number; // ratio offset (-0.5 to 0.5)
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

  // Diagonal only when exactly 2 products, both are monitors, AND same URL
  if (lower.length === 2) {
    const allMonitors = lower.every((u) => u.includes('monitor'));
    const sameUrl = lower[0] === lower[1];
    if (allMonitors && sameUrl) return 'diagonal';
  }

  return 'horizontal';
}

// Calculate fractional layout template
export function layoutProducts(
  count: number,
  sizeCategories: SizeCategory[],
  direction: LayoutDirection = 'horizontal',
  isPortrait: boolean = false
): LayoutTemplate {
  if (direction === 'diagonal' && count === 2) {
    return layoutDiagonal(sizeCategories);
  }
  if (direction === 'vertical') {
    return layoutVertical(count, sizeCategories);
  }
  return layoutHorizontal(count, sizeCategories, isPortrait);
}

function layoutHorizontal(
  count: number,
  sizeCategories: SizeCategory[],
  _isPortrait: boolean
): LayoutTemplate {
  const margin = 0.05;
  const gap = 0.03;
  const usableW = 1 - margin * 2;
  const usableH = 1 - margin * 2;
  const positions: LayoutTemplate['positions'] = [];

  if (count === 2) {
    const cellW = (usableW - gap) / 2;
    for (let i = 0; i < 2; i++) {
      positions.push({ x: margin + i * (cellW + gap), y: margin, maxW: cellW, maxH: usableH });
    }
  } else if (count === 3) {
    const leftW = usableW * 0.55;
    const rightW = usableW * 0.45 - gap;
    const cellH = (usableH - gap) / 2;
    positions.push({ x: margin, y: margin, maxW: leftW, maxH: usableH });
    for (let i = 0; i < 2; i++) {
      positions.push({ x: margin + leftW + gap, y: margin + i * (cellH + gap), maxW: rightW, maxH: cellH });
    }
  } else if (count === 4) {
    const cellW = (usableW - gap) / 2;
    const cellH = (usableH - gap) / 2;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        positions.push({ x: margin + col * (cellW + gap), y: margin + row * (cellH + gap), maxW: cellW, maxH: cellH });
      }
    }
  } else if (count === 5) {
    const cellW3 = (usableW - gap * 2) / 3;
    const cellH = (usableH - gap) / 2;
    for (let i = 0; i < 3; i++) {
      positions.push({ x: margin + i * (cellW3 + gap), y: margin, maxW: cellW3, maxH: cellH });
    }
    const cellW2 = (usableW - gap) / 2;
    const offsetX = (usableW - (cellW2 * 2 + gap)) / 2;
    for (let i = 0; i < 2; i++) {
      positions.push({ x: margin + offsetX + i * (cellW2 + gap), y: margin + cellH + gap, maxW: cellW2, maxH: cellH });
    }
  } else if (count === 6) {
    const cellW = (usableW - gap * 2) / 3;
    const cellH = (usableH - gap) / 2;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        positions.push({ x: margin + col * (cellW + gap), y: margin + row * (cellH + gap), maxW: cellW, maxH: cellH });
      }
    }
  }

  return { positions, safeMargin: margin };
}

function layoutVertical(
  count: number,
  _sizeCategories: SizeCategory[]
): LayoutTemplate {
  const margin = 0.05;
  const gap = 0.03;
  const usableW = 1 - margin * 2;
  const usableH = 1 - margin * 2;
  const cellH = (usableH - gap * (count - 1)) / count;
  const positions: LayoutTemplate['positions'] = [];

  for (let i = 0; i < count; i++) {
    positions.push({ x: margin, y: margin + i * (cellH + gap), maxW: usableW, maxH: cellH });
  }

  return { positions, safeMargin: margin };
}

function layoutDiagonal(
  _sizeCategories: SizeCategory[]
): LayoutTemplate {
  const margin = 0.08;
  const usableW = 1 - margin * 2;
  const usableH = 1 - margin * 2;

  return {
    positions: [
      { x: margin, y: margin, maxW: usableW * 0.75, maxH: usableH * 0.75 },
      { x: margin + usableW * 0.25, y: margin + usableH * 0.25, maxW: usableW * 0.75, maxH: usableH * 0.75 },
    ],
    safeMargin: margin,
  };
}
