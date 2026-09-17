// Cloudinary upload utility & Image Performance Optimizer
// Cloud: zuxwe5gl | Preset: podcast_cancer (unsigned)

const CLOUDINARY_CLOUD = 'zuxwe5gl';
const CLOUDINARY_PRESET = 'podcast_cancer';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

/**
 * Transforma dinámicamente URLs de Cloudinary o Unsplash al vuelo:
 * Inyecta auto-formato (WebP/AVIF), auto-calidad y limitador de resolución
 * para reducir el peso hasta un 90% y asegurar transiciones a 60 FPS.
 */
export function optimizeImageUrl(url: string | undefined | null, maxWidth = 1280): string {
  if (!url) return '';

  // 1. Optimización en Cloudinary
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto') || url.includes('/upload/c_limit')) {
      return url;
    }
    const transform = `f_auto,q_auto:good,w_${maxWidth},c_limit`;
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  // 2. Optimización en Unsplash
  if (url.includes('images.unsplash.com')) {
    if (url.includes('auto=format')) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}auto=format&fit=crop&w=${maxWidth}&q=80`;
  }

  return url;
}

/**
 * Pre-comprime imágenes en el navegador antes de subirlas a la nube
 * evitando subir archivos gigantes de 10-20MB.
 */
async function compressImageFile(file: File, maxDim = 1920, quality = 0.85): Promise<File | Blob> {
  // Ignorar SVGs y GIFs animados para no romper animaciones
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function uploadToCloudinary(
  file: File,
  folder: 'art' | 'supplements' | 'news' = 'art'
): Promise<string> {
  // Pre-comprimir si es pesada
  const fileToUpload = await compressImageFile(file);

  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('upload_preset', CLOUDINARY_PRESET);
  formData.append('folder', `podcast-cancer/${folder}`);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudinary error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  // Retornar la URL ya enriquecida con transformación para máximo rendimiento
  return optimizeImageUrl(data.secure_url as string, 1280);
}

