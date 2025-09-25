export const getBase64ImageFromPDF = (pdfPath, pageNumber = 0) => {
  console.log("pdfpath", pdfPath);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    fetch(pdfPath)
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const loadingTask = window.pdfjsLib.getDocument({ data });
        loadingTask.promise.then((pdf) => {
          pdf.getPage(pageNumber + 1).then((page) => {
            const viewport = page.getViewport({ scale: 2 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            page.render(renderContext).promise.then(() => {
              resolve(canvas.toDataURL("image/png"));
            });
          });
        });
      })
      .catch(reject);
  });
};
