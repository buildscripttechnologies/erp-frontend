import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { generateLPPO } from "./generateLPPO";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PurchaseOrderBill({
  po,
  onClose,
  onUpdated,
  companyDetails,
  letterpadUrl,
  fetchPurchaseOrders, // optional: to refresh PO list after update
}) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [finalConfirmed, setFinalConfirmed] = useState(false);
  const [updating, setUpdating] = useState(false);

  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const [zoom, setZoom] = useState(1);
  const startRef = useRef(null);
  const pinchStart = useRef(null);
  const sliderRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [pdfData, setPdfData] = useState();

  console.log("po", po);

  // 🧩 Generate and render PO PDF
  useEffect(() => {
    async function setUrl() {
      if (po) {
        let p = await generateLPPO(po, letterpadUrl, companyDetails);
        setPdfUrl(p.url);
        setPdfData(p);
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

  const calculateStatus = (poItems) => {
    const total = poItems.length;
    const rejected = poItems.filter((i) => i.itemStatus == "rejected").length;
    const approved = total - rejected;

    // single item case
    if (total === 1) return rejected === 1 ? "rejected" : "approved";

    // two items case
    if (total === 2) {
      if (rejected === 2) return "rejected";
      if (rejected === 1) return "partially-approved";
      return "approved";
    }

    // more than two items
    if (rejected === 0) return "approved"; // all approved
    if (approved === 0) return "rejected"; // all rejected
    return "partially-approved"; // mix of both
  };

  // 📤 Update PO when finally confirmed
  useEffect(() => {
    const updatePOStatus = async () => {
      if (!finalConfirmed || !po?._id) return;

      try {
        setUpdating(true);

        const status = calculateStatus(po.items);
        console.log("status", status);

        // Convert blob to base64 and then send in PATCH
        const blob = pdfData.blob;
        const reader = new FileReader();

        reader.onloadend = async () => {
          try {
            const base64data = reader.result.split(",")[1]; // remove data:application/pdf;base64
            console.log("basedata", base64data);

            const res = await axios.patch(`/pos/update/${po._id}`, {
              status,
              pdfBase64: base64data,
            });

            if (res.data.status === 403) {
              toast.error(res.data.message);
              return;
            }

            toast.success("Purchase Order successfully confirmed ✅");
            onUpdated();

            if (fetchPurchaseOrders) fetchPurchaseOrders();
          } catch (err) {
            console.error("Error updating PO:", err);
            toast.error("Failed to update PO status!");
            setFinalConfirmed(false);
          } finally {
            setUpdating(false);
          }
        };

        reader.readAsDataURL(blob); // start the conversion
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("Something went wrong while updating PO!");
        setFinalConfirmed(false);
        setUpdating(false);
      }
    };

    updatePOStatus();
  }, [finalConfirmed, po, fetchPurchaseOrders]);

  /** Slider Handlers */
  const handleDrag = (e) => {
    if (!dragging || !sliderRef.current || !confirmed) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const knobWidth = 44;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relativeX = clientX - rect.left;
    const newPos = Math.min(
      Math.max(0, relativeX - knobWidth / 2),
      rect.width - knobWidth
    );
    setSliderPos(newPos);

    if (newPos >= rect.width - knobWidth - 2) {
      setFinalConfirmed(true);
      setDragging(false);
    }
  };

  const stopDrag = () => setDragging(false);
  const resetConfirmation = () => {
    setConfirmed(false);
    setFinalConfirmed(false);
    setSliderPos(0);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="p-4 sm:p-6 fixed inset-0 backdrop-blur-sm w-[95%] sm:max-w-4xl mx-auto rounded shadow-2xl bg-white z-50 max-h-[70vh] sm:max-h-[95vh] overflow-auto my-auto border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-gray-500 hover:text-red-600 text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-primary mb-6">
          Purchase Order Details
        </h2>

        {/* PDF Viewer */}
        <div
          ref={containerRef}
          className="w-full sm:h-[55vh] h-[30vh] overflow-auto border border-gray-300 rounded shadow-inner bg-gray-50 relative touch-pan-y"
        >
          {!pdfUrl && (
            <p className="text-gray-400 text-center mt-20">Loading PDF...</p>
          )}
        </div>

        {/* Confirmation Checkbox */}
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

        {/* Slide to confirm */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Slide to Confirm PO
            </span>
            <span className="text-xs text-gray-500">
              {updating
                ? "Updating..."
                : finalConfirmed
                ? "Confirmed"
                : confirmed
                ? "Pending"
                : "Locked"}
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
              <FaRegArrowAltCircleRight className="text-2xl text-secondary" />
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {finalConfirmed &&
          (updating ? (
            <span className=" mt-6 w-full flex items-center justify-center">
              <BeatLoader size={15} color="#d8b76a" />
            </span>
          ) : (
            <>
              <div className="mt-6">
                <div className="p-2 bg-gradient-to-r from-primary/20 to-green-200 text-green-600 text-center rounded shadow-md font-semibold">
                  ✅ Purchase Order has been successfully confirmed!
                </div>
              </div>
            </>
          ))}
      </div>
    </div>
  );
}
