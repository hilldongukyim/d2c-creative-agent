import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ZipEntry {
  dataUrl: string;
  filename: string; // supports paths like "Gallery_PBP/G-A_2010x1334.png"
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)![1];
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

export function getDateString(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

export async function downloadAsZip(entries: ZipEntry[], zipName?: string): Promise<void> {
  const zip = new JSZip();
  const date = getDateString();
  const rootFolder = `PTO_Gallery_${date}`;

  for (const entry of entries) {
    const blob = dataUrlToBlob(entry.dataUrl);
    zip.file(`${rootFolder}/${entry.filename}`, blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName || `${rootFolder}.zip`);
}

export function downloadSingleImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
