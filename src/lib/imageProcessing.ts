import { layoutProducts, type SizeCategory, type OutputSize, type LayoutDirection, type PositionOverride } from './compositeTemplates';

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

export async function createCompositeImage(
  outputSize: OutputSize,
  images: string[],
  sizeCategories: SizeCategory[],
  direction: LayoutDirection = 'horizontal',
  overrides?: PositionOverride[]
): Promise<string> {
  const { width, height } = outputSize;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const placements = layoutProducts(width, height, images.length, sizeCategories, direction, overrides);
  const loadedImages = await Promise.all(images.map(loadImage));

  for (let i = 0; i < loadedImages.length; i++) {
    const img = loadedImages[i];
    const p = placements[i];
    if (!p) continue;

    const scaledMaxW = p.maxWidth * p.scale;
    const scaledMaxH = p.maxHeight * p.scale;

    const ratio = img.width / img.height;
    let drawW = scaledMaxW;
    let drawH = drawW / ratio;
    if (drawH > scaledMaxH) {
      drawH = scaledMaxH;
      drawW = drawH * ratio;
    }

    // Center within placement cell
    const drawX = p.x + (p.maxWidth - drawW) / 2;
    const drawY = p.y + (p.maxHeight - drawH) / 2;

    // Shadow for diagonal back product
    if (direction === 'diagonal' && i === 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } else {
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  }

  return canvas.toDataURL('image/png');
}
