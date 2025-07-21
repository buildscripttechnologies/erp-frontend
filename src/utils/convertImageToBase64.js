// convertImageToBase64.js
export const getBase64ImageWithSize = async (url, maxWidth, maxHeight) => {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      const img = new Image();
      img.onload = () => {
        // Original dimensions
        const { width, height } = img;

        // Aspect ratio scaling (contain)
        const scale = Math.min(maxWidth / width, maxHeight / height);
        const finalWidth = width * scale;
        const finalHeight = height * scale;

        resolve({ base64, width: finalWidth, height: finalHeight });
      };
      img.onerror = reject;
      img.src = base64;
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
