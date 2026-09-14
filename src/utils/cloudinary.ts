// Cloudinary upload utility
// Cloud: zuxwe5gl | Preset: podcast_cancer (unsigned)

const CLOUDINARY_CLOUD = 'zuxwe5gl';
const CLOUDINARY_PRESET = 'podcast_cancer';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

export async function uploadToCloudinary(
  file: File,
  folder: 'art' | 'supplements' | 'news' = 'art'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
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
  return data.secure_url as string;
}
