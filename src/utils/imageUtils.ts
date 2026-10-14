/**
 * Image & Cloud Link Utilities for obeecreatives Content Tracker
 * Handles:
 * - Smart Google Drive URL to High-Speed CDN conversion (w800)
 * - Google Drive Folder detection & warnings
 * - Canva, CapCut, and Figma link detection
 * - Client-side high efficiency WebP image compression (<50KB)
 */

export interface LinkAnalysis {
  type: 'gdrive_file' | 'gdrive_folder' | 'canva' | 'capcut' | 'figma' | 'direct_image' | 'unknown';
  label: string;
  isEmbeddableImage: boolean;
  convertedUrl: string;
  originalUrl: string;
  warning?: string;
  fileId?: string;
}

/**
 * Extracts Google Drive File ID from various Drive URL formats
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;

  // Format: https://drive.google.com/file/d/FILE_ID/view...
  const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // Format: https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Format: https://lh3.googleusercontent.com/d/FILE_ID...
  const matchLh3 = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (matchLh3 && matchLh3[1]) return matchLh3[1];

  // Format: https://drive.google.com/thumbnail?id=FILE_ID...
  const matchThumb = url.match(/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  if (matchThumb && matchThumb[1]) return matchThumb[1];

  return null;
}

/**
 * Checks if a Google Drive link is a Folder link (not a file)
 */
export function isGoogleDriveFolder(url: string): boolean {
  if (!url) return false;
  return /drive\.google\.com\/(?:drive\/)?folders\/([a-zA-Z0-9_-]+)/.test(url);
}

/**
 * Converts a Google Drive link to the fast Google High-Speed CDN URL
 */
export function convertGoogleDriveToCdn(url: string, width = 800): string {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
  }
  return url;
}

/**
 * Analyzes an asset URL to determine provider, validity, and optimal presentation
 */
export function analyzeAssetUrl(rawUrl: string): LinkAnalysis {
  const url = (rawUrl || '').trim();

  if (!url) {
    return {
      type: 'unknown',
      label: 'Kosong',
      isEmbeddableImage: false,
      convertedUrl: '',
      originalUrl: '',
    };
  }

  // 1. Google Drive Folder
  if (isGoogleDriveFolder(url)) {
    return {
      type: 'gdrive_folder',
      label: 'Google Drive Folder',
      isEmbeddableImage: false,
      convertedUrl: url,
      originalUrl: url,
      warning:
        'Link yang Anda tempel adalah Folder Google Drive. Untuk sampul gambar, silakan buka folder dan salin link file gambarnya.',
    };
  }

  // 2. Google Drive File
  const gdriveId = extractGoogleDriveFileId(url);
  if (gdriveId) {
    const cdnUrl = `https://lh3.googleusercontent.com/d/${gdriveId}=w800`;
    return {
      type: 'gdrive_file',
      label: 'Google Drive CDN (w800)',
      isEmbeddableImage: true,
      convertedUrl: cdnUrl,
      originalUrl: url,
      fileId: gdriveId,
    };
  }

  // 3. Canva Link
  if (/canva\.com\/(?:design|join|p)\//i.test(url)) {
    return {
      type: 'canva',
      label: 'Canva Design Link',
      isEmbeddableImage: false,
      convertedUrl: url,
      originalUrl: url,
    };
  }

  // 4. CapCut Link
  if (/capcut\.com\//i.test(url) || /capcut\.net\//i.test(url)) {
    return {
      type: 'capcut',
      label: 'CapCut Project Link',
      isEmbeddableImage: false,
      convertedUrl: url,
      originalUrl: url,
    };
  }

  // 5. Figma Link
  if (/figma\.com\/(?:file|design|proto)\//i.test(url)) {
    return {
      type: 'figma',
      label: 'Figma Project',
      isEmbeddableImage: false,
      convertedUrl: url,
      originalUrl: url,
    };
  }

  // 6. Direct Image (WebP, JPG, PNG, GIF, SVG, or data URI)
  if (
    url.startsWith('data:image/') ||
    /\.(webp|jpg|jpeg|png|gif|svg|avif)(?:\?.*)?$/i.test(url) ||
    url.includes('images.unsplash.com') ||
    url.includes('imgur.com') ||
    url.includes('postimg.cc') ||
    url.includes('cloudinary.com')
  ) {
    return {
      type: 'direct_image',
      label: 'Direct Image (WebP / JPG / PNG)',
      isEmbeddableImage: true,
      convertedUrl: url,
      originalUrl: url,
    };
  }

  // 7. General Web URL (can be tested as image)
  if (/^https?:\/\//i.test(url)) {
    return {
      type: 'unknown',
      label: 'Web Link',
      isEmbeddableImage: true, // We can try rendering it as image
      convertedUrl: url,
      originalUrl: url,
    };
  }

  return {
    type: 'unknown',
    label: 'Format Belum Dikenali',
    isEmbeddableImage: false,
    convertedUrl: url,
    originalUrl: url,
  };
}

/**
 * Compresses an uploaded image file into lightweight WebP format
 * Max dimensions default to 800x800, quality 0.75-0.8 (typically produces 20-45 KB)
 */
export function compressImageToWebP(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<{ base64: string; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw image smoothed
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP (fallback to jpeg if WebP isn't supported)
        let base64 = canvas.toDataURL('image/webp', quality);
        if (!base64.startsWith('data:image/webp')) {
          base64 = canvas.toDataURL('image/jpeg', quality);
        }

        // Approximate size in bytes: Base64 length * (3/4)
        const compressedSize = Math.round((base64.length * 3) / 4);

        resolve({
          base64,
          originalSize,
          compressedSize,
        });
      };

      img.onerror = () => {
        reject(new Error('Gagal memproses file gambar.'));
      };

      if (typeof readerEvent.target?.result === 'string') {
        img.src = readerEvent.target.result;
      } else {
        reject(new Error('Format file tidak didukung.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file gambar.'));
    };

    reader.readAsDataURL(file);
  });
}
