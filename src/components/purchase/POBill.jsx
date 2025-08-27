import { useEffect, useRef, useState, useCallback } from "react";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { generateLPPO } from "./generateLPPO";
import { FaArrowCircleRight, FaRegArrowAltCircleRight } from "react-icons/fa";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PurchaseOrderBill({ po, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [finalConfirmed, setFinalConfirmed] = useState(false);

  // PDF rendering
  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const [zoom, setZoom] = useState(1);

  // Pan & pinch state
  const startRef = useRef(null);
  const pinchStart = useRef(null);

  // Slider state
  const sliderRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    async function setUrl() {
      if (po) {
        let p = await generateLPPO(po);
        setPdfUrl(p.url);
      }
    }
    setUrl();
  }, [po]);

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

  /** Zoom */
  const handleDoubleClick = () => {
    setZoom((z) => (z === 1 ? 2 : 1));
    if (containerRef.current) containerRef.current.scrollTo(0, 0);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStart.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1 && zoom > 1) {
      startRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStart.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.sqrt(dx * dx + dy * dy);

      if (newDistance > pinchStart.current + 10) {
        setZoom((z) => Math.min(z + 0.05, 3));
        pinchStart.current = newDistance;
      } else if (newDistance < pinchStart.current - 10) {
        setZoom((z) => Math.max(z - 0.05, 1));
        pinchStart.current = newDistance;
      }
    } else if (e.touches.length === 1 && startRef.current && zoom > 1) {
      const dx = e.touches[0].clientX - startRef.current.x;
      const dy = e.touches[0].clientY - startRef.current.y;

      containerRef.current.scrollLeft = startRef.current.scrollLeft - dx;
      containerRef.current.scrollTop = startRef.current.scrollTop - dy;
    }
  };

  const handleTouchEnd = () => {
    pinchStart.current = null;
    startRef.current = null;
  };

  /** Mouse drag for desktop */
  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    };
  };

  const handleMouseMove = (e) => {
    if (!startRef.current || zoom <= 1) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    containerRef.current.scrollLeft = startRef.current.scrollLeft - dx;
    containerRef.current.scrollTop = startRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    startRef.current = null;
  };

  /** Slider Handlers */
  const handleDrag = (e) => {
    if (!dragging || !sliderRef.current || !confirmed) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const knobWidth = 44; // actual knob width (h-11 w-11 ≈ 44px)

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relativeX = clientX - rect.left;

    // Position = finger position - half knob, clamped between [0, max]
    const newPos = Math.min(
      Math.max(0, relativeX - knobWidth / 2),
      rect.width - knobWidth
    );

    setSliderPos(newPos);

    // Confirm only when knob reaches the very end
    if (newPos >= rect.width - knobWidth - 2) {
      // -2 for tiny margin tolerance
      setFinalConfirmed(true);
      setDragging(false);
    }
  };

  const stopDrag = () => setDragging(false);

  /** Reset */
  const resetConfirmation = () => {
    setConfirmed(false);
    setFinalConfirmed(false);
    setSliderPos(0);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="p-4 sm:p-6 fixed inset-0 backdrop-blur-sm w-[95%]  sm:max-w-4xl mx-auto rounded shadow-2xl bg-white z-50 max-h-[70vh] sm:max-h-[95vh] overflow-auto my-auto border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-gray-500 hover:text-red-600 text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-primary mb-6">
          Purchase Order Details
        </h2>

        {/* PDF container */}
        <div
          ref={containerRef}
          className="w-full sm:h-[55vh] h-[30vh] overflow-auto border border-gray-300 rounded shadow-inner bg-gray-50 relative touch-pan-y"
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {!pdfUrl && (
            <p className="text-gray-400 text-center mt-20">Loading PDF...</p>
          )}
        </div>

        {/* Confirmation Section */}
        <div className="mt-6 border-t border-gray-200 pt-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              disabled={finalConfirmed}
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-gray-700 font-medium text-sm">
              I confirm that all details are correct
            </span>
          </label>
        </div>

        {/* Slide confirmation (always visible) */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Slide to Confirm PO
            </span>
            <span className="text-xs text-gray-500">
              {finalConfirmed ? "Confirmed" : confirmed ? "Pending" : "Locked"}
            </span>
          </div>

          <div
            ref={sliderRef}
            className={`w-full h-12 rounded-full relative overflow-hidden ${
              confirmed && !finalConfirmed
                ? "bg-gray-200"
                : "bg-gray-100 cursor-not-allowed opacity-60"
            }`}
            onMouseMove={(e) => dragging && handleDrag(e)}
            onTouchMove={(e) => dragging && handleDrag(e)}
            onMouseUp={stopDrag}
            onTouchEnd={stopDrag}
          >
            <div
              onMouseDown={() =>
                confirmed && !finalConfirmed && setDragging(true)
              }
              onTouchStart={() =>
                confirmed && !finalConfirmed && setDragging(true)
              }
              className={`h-11 w-11 rounded-full top-0.5 shadow-md absolute flex items-center justify-center transition ${
                confirmed && !finalConfirmed
                  ? "bg-primary cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              style={{ left: `${sliderPos}px` }}
            >
              <FaRegArrowAltCircleRight className="text-2xl " />
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {finalConfirmed && (
          <div className="mt-6">
            <div className="p-2 bg-gradient-to-r from-primary/20 to-[#10B981]/20 text-[#10B981] sm:text-lg text-sm text-center rounded shadow-md font-semibold flex items-center justify-center">
              ✅ Purchase Order has been successfully confirmed!
            </div>
            {/* <button
              onClick={resetConfirmation}
              className="mt-4 px-5 py-2 bg-primary text-white rounded-lg hover:bg-[#1B40C4] transition"
            >
              Reset Confirmation
            </button> */}
          </div>
        )}
      </div>
    </div>
  );
}
