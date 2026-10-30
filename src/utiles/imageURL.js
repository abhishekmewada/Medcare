const IMAGE_BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

export const getImageUrl = (image) => {
  if (!image) return "";

  // Already a complete URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  // Handle relative image paths
  return `${IMAGE_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};