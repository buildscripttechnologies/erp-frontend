import { useEffect, useRef, useState } from "react";
import { generatePOPdf } from "./generatePOPdf";

export default function PurchaseOrderBill({ po, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [finalConfirmed, setFinalConfirmed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [sliderPos, setSliderPos] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (po) {
      const url = generatePOPdf(po, true);
      setPdfUrl(url);
    }
  }, [po]);

  const handleDrag = (e) => {
    if (finalConfirmed) return;

    const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const rect = sliderRef.current.getBoundingClientRect();
    let newPos = clientX - rect.left;

    if (newPos < 0) newPos = 0;
    if (newPos > rect.width - 40) newPos = rect.width - 40; // knob width

    setSliderPos(newPos);

    if (newPos >= rect.width - 40) {
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
    <div className="p-6 fixed inset-0 backdrop-blur-sm max-w-4xl mx-auto border border-primary rounded-2xl shadow bg-white z-50 max-h-[95vh] overflow-auto my-auto">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-gray-500 hover:text-red-600 text-xl font-bold"
      >
        ×
      </button>

      <h2 className="text-xl font-bold text-primary mb-4">
        Purchase Order Details
      </h2>

      {/* PDF Preview */}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          className="w-full h-[65vh] border rounded mb-6"
          title="PO Preview"
        />
      )}

      {/* Confirmation Section */}
      <div className="mt-4 border-t pt-4 space-y-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-5 h-5 accent-blue-600"
          />
          <span>I confirm that all details are correct.</span>
        </label>

        {confirmed && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Confirmation Note:
            </label>
            <textarea
              className="w-full border rounded p-2 focus:outline-blue-500"
              placeholder="Add confirmation note..."
            />
          </div>
        )}
      </div>

      {/* Final Slide Confirmation */}
      {confirmed && !finalConfirmed && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Slide to Confirm PO</span>
            <span className="text-xs text-gray-500">Pending</span>
          </div>

          <div
            ref={sliderRef}
            className="w-full h-12 rounded-full relative bg-gray-200 overflow-hidden"
            onMouseMove={(e) => dragging && handleDrag(e)}
            onTouchMove={(e) => dragging && handleDrag(e)}
            onMouseUp={stopDrag}
            onTouchEnd={stopDrag}
          >
            <div
              onMouseDown={() => setDragging(true)}
              onTouchStart={() => setDragging(true)}
              className="h-10 w-10 bg-white rounded-full shadow-md absolute top-1 cursor-pointer flex items-center justify-center transition"
              style={{ left: `${sliderPos}px` }}
            >
              👉
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Success Banner */}
      {finalConfirmed && (
        <div className="mt-6 space-y-4">
          <div className="p-3 bg-green-100 text-green-800 text-sm rounded-lg">
            ✅ Purchase Order has been successfully confirmed!
          </div>
          {/* <button
            onClick={resetConfirmation}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
          >
            Remove Confirmation
          </button> */}
        </div>
      )}
    </div>
  );
}
