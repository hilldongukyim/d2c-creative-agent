import { layoutProducts, getScaleRatio, type SizeCategory, type LayoutDirection, type PositionOverride } from './compositeTemplates';

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function cropTransparentPixels(imageSrc: string): Promise<string> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
  let hasVisible = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] > 20) {
        hasVisible = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasVisible || minX >= maxX || minY >= maxY) return imageSrc;

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const cropped = document.createElement('canvas');
  cropped.width = cropW;
  cropped.height = cropH;
  cropped.getContext('2d')!.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
  return cropped.toDataURL('image/png');
}

// Calculate scaled product dimensions based on size category
export function scaleProductImage(
  imgWidth: number,
  imgHeight: number,
  sizeCategory: SizeCategory,
  canvasWidth: number,
  canvasHeight: number,
  maxW: number, // fraction
  maxH: number, // fraction
  allCategories: SizeCategory[]
): { width: number; height: number } {
  const categoryScale = getScaleRatio(sizeCategory, allCategories);
  const availW = canvasWidth * maxW * categoryScale;
  const availH = canvasHeight * maxH * categoryScale;

  const ratio = imgWidth / imgHeight;
  let w = availW;
  let h = w / ratio;
  if (h > availH) {
    h = availH;
    w = h * ratio;
  }
  return { width: w, height: h };
}

export interface CompositeProduct {
  dataUrl: string;
  sizeCategory: SizeCategory;
  customScale?: number; // multiplier, default 1.0
}

// Determine internal render scale for small outputs to avoid pixelation
function getInternalScale(w: number, h: number): number {
  const minDim = Math.min(w, h);
  // Keep internal scale modest to avoid excessive downscale blur
  if (minDim <= 200) return 3;
  if (minDim <= 400) return 2;
  return 1;
}

// Progressive downscale: halve dimensions step by step for better quality
function progressiveDownscale(
  source: HTMLCanvasElement,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  let current = source;
  let cw = current.width;
  let ch = current.height;

  // Step down by half each iteration until within 2x of target
  while (cw / 2 >= targetW && ch / 2 >= targetH) {
    const half = document.createElement('canvas');
    half.width = Math.round(cw / 2);
    half.height = Math.round(ch / 2);
    const hCtx = half.getContext('2d')!;
    hCtx.imageSmoothingEnabled = true;
    hCtx.imageSmoothingQuality = 'high';
    hCtx.drawImage(current, 0, 0, half.width, half.height);
    current = half;
    cw = half.width;
    ch = half.height;
  }

  // Final step to exact target size
  if (cw !== targetW || ch !== targetH) {
    const final = document.createElement('canvas');
    final.width = targetW;
    final.height = targetH;
    const fCtx = final.getContext('2d')!;
    fCtx.imageSmoothingEnabled = true;
    fCtx.imageSmoothingQuality = 'high';
    fCtx.drawImage(current, 0, 0, targetW, targetH);
    return final;
  }
  return current;
}

// Generate composite canvas — returns HTMLCanvasElement at target dimensions
export async function generateCompositeCanvas(
  canvasWidth: number,
  canvasHeight: number,
  products: CompositeProduct[],
  direction: LayoutDirection = 'horizontal',
  overrides?: PositionOverride[]
): Promise<HTMLCanvasElement> {
  const scale = getInternalScale(canvasWidth, canvasHeight);
  const rW = canvasWidth * scale;
  const rH = canvasHeight * scale;

  const hires = document.createElement('canvas');
  hires.width = rW;
  hires.height = rH;
  const ctx = hires.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, rW, rH);

  const isPortrait = canvasHeight > canvasWidth;
  const allCategories = products.map((p) => p.sizeCategory);
  const template = layoutProducts(products.length, allCategories, direction, isPortrait);
  const loadedImages = await Promise.all(products.map((p) => loadImage(p.dataUrl)));

  for (let i = 0; i < loadedImages.length; i++) {
    const img = loadedImages[i];
    const pos = template.positions[i];
    if (!pos) continue;

    const product = products[i];
    const customScale = product.customScale ?? 1.0;

    let fx = pos.x;
    let fy = pos.y;
    let overrideScale = 1.0;
    if (overrides?.[i]) {
      fx += overrides[i].dx;
      fy += overrides[i].dy;
      overrideScale = overrides[i].scale;
    }

    const cellX = fx * rW;
    const cellY = fy * rH;
    const cellW = pos.maxW * rW;
    const cellH = pos.maxH * rH;

    const scaled = scaleProductImage(
      img.width, img.height,
      product.sizeCategory,
      rW, rH,
      pos.maxW, pos.maxH,
      allCategories
    );
    const drawW = scaled.width * customScale * overrideScale;
    const drawH = scaled.height * customScale * overrideScale;

    const drawX = cellX + (cellW - drawW) / 2;
    const drawY = cellY + (cellH - drawH) / 2;

    if (direction === 'diagonal' && i === 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 20 * scale;
      ctx.shadowOffsetX = 8 * scale;
      ctx.shadowOffsetY = 8 * scale;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } else {
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  }

  // Downscale to target dimensions using progressive method
  if (scale === 1) return hires;

  return progressiveDownscale(hires, canvasWidth, canvasHeight);
}
