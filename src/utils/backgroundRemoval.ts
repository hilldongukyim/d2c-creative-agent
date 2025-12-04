import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let model: any = null;
let processor: any = null;

const loadModel = async () => {
  if (!model || !processor) {
    console.log('Loading RMBG model...');
    
    // Try WebGPU first, fallback to WASM
    let device: 'webgpu' | 'wasm' = 'wasm';
    try {
      if ('gpu' in navigator) {
        const gpu = await (navigator as any).gpu?.requestAdapter();
        if (gpu) {
          device = 'webgpu';
          console.log('Using WebGPU');
        }
      }
    } catch (e) {
      console.log('WebGPU not available, using WASM');
    }

    model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
      device,
      dtype: 'fp32',
    });
    processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');
    console.log('Model loaded successfully');
  }
  return { model, processor };
};

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
    const { model, processor } = await loadModel();
    
    // Load image using RawImage
    const image = await RawImage.fromURL(imageElement.src);
    console.log('Image loaded:', image.width, 'x', image.height);
    
    // Preprocess image
    const { pixel_values } = await processor(image);
    console.log('Image preprocessed');
    
    // Predict mask
    const { output } = await model({ input: pixel_values });
    console.log('Mask predicted');
    
    // Post-process mask
    const maskData = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);
    
    // Create output canvas
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;
    
    // Draw original image
    ctx.drawImage(imageElement, 0, 0);
    
    // Get image data and apply mask
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < maskData.data.length; i++) {
      data[i * 4 + 3] = maskData.data[i]; // Apply mask to alpha channel
    }
    
    ctx.putImageData(imageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
