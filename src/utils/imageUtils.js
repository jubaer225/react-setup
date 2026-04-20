import { buildImageUrl } from "./cloudnary";

const isHttpUrl = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value);

export function buildProductImageUrl(image, options = {}) {
  if (!image) return "";

  if (typeof image === "string") {
    return isHttpUrl(image) ? image : buildImageUrl(image, options);
  }

  if (typeof image === "object") {
    if (image.url && isHttpUrl(image.url)) {
      return image.url;
    }

    const publicId = image.publicId || image.public_id;
    if (publicId) {
      return buildImageUrl(publicId, options);
    }
  }

  return "";
}
