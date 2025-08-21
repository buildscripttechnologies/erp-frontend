import { useRef, useState } from "react";

export default function PurchaseOrderBill({ po }) {
  const [confirmed, setConfirmed] = useState(false);
  const [finalConfirmed, setFinalConfirmed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [sliderPos, setSliderPos] = useState(0);
  const sliderRef = useRef(null);

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

  return (
    <div className="p-6 fixed inset-0 backdrop-blur-sm max-w-3xl mx-auto border rounded-2xl shadow bg-white z-50 max-h-[90vh] overflow-auto my-auto">
      {/* Bill Header */}
      <h2 className="text-xl font-bold mb-4">Purchase Order Bill</h2>

      {/* Bill Info */}
      <div className="space-y-2 mb-6">
        <p>
          <span className="font-semibold">PO No:</span> {po.poNo}
        </p>
        <p>
          <span className="font-semibold">Vendor:</span> {po.vendor?.vendorName}
        </p>
        <p>
          <span className="font-semibold">Date:</span>{" "}
          {new Date(po.date).toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold">Total Amount:</span> ₹{po.totalAmount}
        </p>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Item</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Rate</th>
            <th className="border p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {po.items?.map((it) => (
            <tr key={it._id}>
              <td className="border p-2">{it.item?.itemName}</td>
              <td className="border p-2 text-center">{it.orderQty}</td>
              <td className="border p-2 text-center">₹{it.rate}</td>
              <td className="border p-2 text-center">₹{it.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Section */}
      <div className="mt-6 border-t pt-4 space-y-4">
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
      {confirmed && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Slide to Confirm PO</span>
            <span className="text-xs text-gray-500">
              {finalConfirmed ? "Confirmed" : "Pending"}
            </span>
          </div>

          <div
            ref={sliderRef}
            className={`w-full h-12 rounded-full relative bg-gray-200 overflow-hidden`}
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
        <div className="mt-6 p-3 bg-green-100 text-green-800 text-sm rounded-lg">
          ✅ Purchase Order has been successfully confirmed!
        </div>
      )}
    </div>
  );
}
