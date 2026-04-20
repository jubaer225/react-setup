const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export function buildImageUrl(publicId, options = {}) {
  if (!cloudName || !publicId) return "";

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "webp",
  } = options;

  let transformations = `f_${format},q_${quality}`;

  if (width) transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;
  if (crop) transformations += `,c_${crop}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}
