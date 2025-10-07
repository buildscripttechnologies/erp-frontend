// getBase64ImageFromPDF.js
export const getCompressedImageFromPDF = (
  pdfPath,
  pageNumber = 0,
  scale = 2,
  quality = 0.6
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    fetch(pdfPath)
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const loadingTask = window.pdfjsLib.getDocument({ data });
        loadingTask.promise.then((pdf) => {
          pdf.getPage(pageNumber + 1).then((page) => {
            const viewport = page.getViewport({ scale });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = { canvasContext: context, viewport };
            page.render(renderContext).promise.then(() => {
              // 🔹 Compress canvas to JPEG instead of PNG
              const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
              resolve(compressedBase64);
            });
          });
        });
      })
      .catch((err) => {
        console.error("PDF to image conversion failed:", err);
        reject(err);
      });
  });
};
