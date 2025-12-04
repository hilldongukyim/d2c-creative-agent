import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal with imgly...');
    
    // Convert image element to blob
    const response = await fetch(imageElement.src);
    const imageBlob = await response.blob();
    
    console.log('Image blob size:', imageBlob.size);
    
    // Remove background using imgly
    const resultBlob = await imglyRemoveBackground(imageBlob, {
      progress: (key, current, total) => {
        console.log(`Progress: ${key} - ${current}/${total}`);
      },
    });
    
    console.log('Background removal complete');
    return resultBlob;
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
