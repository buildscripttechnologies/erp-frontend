import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function EnvelopePreview({
  pdfUrl,
  onClose,
  customer,
  handlePrint,
}) {
  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);

  // ✅ Render each PDF page onto a canvas (no iframe, no borders)
  const renderPage = useCallback(
    async (pdf, pageNum, zoomLevel = zoom) => {
      let canvas = pageRefs.current[pageNum];
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = "rounded w-full mb-2";
        containerRef.current.appendChild(canvas);
        pageRefs.current[pageNum] = canvas;
      }

      const page = await pdf.getPage(pageNum);
      const unscaled = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current.clientWidth || unscaled.width;
      const scale = (containerWidth / unscaled.width) * zoomLevel;

      const viewport = page.getViewport({ scale });
      const ctx = canvas.getContext("2d");
      const outputScale = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      await page.render({ canvasContext: ctx, viewport }).promise;
    },
    [zoom]
  );

  // 🧩 Load and render the PDF file
  useEffect(() => {
    if (!pdfUrl || !containerRef.current) return;

    const loadPDF = async () => {
      setLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDoc = await loadingTask.promise;

        containerRef.current.innerHTML = ""; // clear old canvases
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          await renderPage(pdfDoc, i);
        }
      } catch (err) {
        console.error("Failed to load envelope PDF:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl, renderPage]);

  if (!pdfUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-2xl sm:text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 text-center sm:text-left">
            Envelope Preview — {customer?.customerName}
          </h2>
        </div>

        {/* PDF Render Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-50 rounded-b-lg"
        >
          {loading && (
            <p className="text-center text-gray-500 mt-20">Rendering PDF...</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t flex justify-center sm:justify-end">
          <button
            onClick={handlePrint}
            className="bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-5 py-2 rounded-md text-sm sm:text-base transition-all"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
