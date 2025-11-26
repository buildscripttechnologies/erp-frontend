import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { FaRegArrowAltCircleRight } from "react-icons/fa";

import { BeatLoader } from "react-spinners";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PreviewEnvelope({
  pdfUrl,
  previewItem,
  onClose,
  onPrint,
}) {
  // const [pdfUrl, setPdfUrl] = useState(null);

  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const [zoom, setZoom] = useState(1);
  const renderPage = useCallback(
    async (pdf, pageNum, zoomLevel = zoom) => {
      let canvas = pageRefs.current[pageNum];
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = "rounded w-full shadow-sm mb-2";
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

  useEffect(() => {
    if (!pdfUrl || !containerRef.current) return;
    let pdfDoc = null;

    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        pdfDoc = await loadingTask.promise;
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          await renderPage(pdfDoc, i);
        }
      } catch (err) {
        console.error("Failed to load PDF:", err);
      }
    };

    loadPDF();
  }, [pdfUrl, renderPage]);

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="p-4 sm:p-6 fixed inset-0 backdrop-blur-sm w-[95%] sm:max-w-4xl mx-auto rounded shadow-2xl bg-white z-50 max-h-[35vh] sm:max-h-[80vh] overflow-auto my-auto border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-gray-500 hover:text-red-600 text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-sm sm:text-xl font-bold text-primary mb-6">
          Envelope Preview —{" "}
          {previewItem.customerName || previewItem.vendorName || ""}
        </h2>

        {/* PDF Viewer */}
        <div
          ref={containerRef}
          className="w-full sm:h-[55vh] h-[20vh] overflow-hidden border border-gray-300 rounded shadow-inner bg-gray-50 relative touch-pan-y"
        >
          {!pdfUrl && (
            <p className="text-gray-400 text-center mt-20">Loading PDF...</p>
          )}
        </div>
        <div className="px-4 sm:px-6 pt-3 border-t flex justify-center sm:justify-end">
          <button
            onClick={onPrint}
            className="bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-5 py-2 rounded-md text-sm sm:text-base transition-all duration-150"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
