import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

const BarcodeModal = ({ stock, onClose }) => {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef, // ✅ FIXED FOR v3.x
    documentTitle: `Barcodes - ${stock.itemName}`,
  });

  return (
    <div className="fixed inset-0 bg-white/20 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-4 rounded-lg max-h-[90vh] w-full max-w-6xl overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Barcodes for: {stock.itemName}
          </h2>
          <button onClick={onClose} className="text-red-600 text-2xl font-bold">
            ×
          </button>
        </div>

        <div
          ref={printRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3"
        >
          {(stock.barcodes || []).map((code, idx) => (
            <div
              key={idx}
              className="border p-2 text-center rounded shadow print:break-inside-avoid"
            >
              <div className="text-xs font-semibold mb-1">{stock.itemName}</div>
              <Barcode
                value={code.barcode}
                width={1}
                height={40}
                fontSize={10}
              />
              <div className="text-xs mt-1">{code.barcode}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeModal;
