import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";

const LabelPrint = ({ stock, onClose }) => {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Labels - ${stock.itemName}`,
  });

  

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-4 rounded-lg  w-full max-w-md overflow-y-auto shadow-xl border border-[#d8b76a]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#d8b76a]">
            Print Labels for: {stock.itemName}
          </h2>
          <button
            onClick={onClose}
            className="text-red-600 text-2xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <div
          ref={printRef}
          className="grid grid-cols-1  print:grid-cols-1 max-h-[75vh] overflow-auto max-w-[110mm]"
        >
          {(stock.barcodes || []).map((barcodeObj, idx) => (
            <div
              key={idx}
              className="printLabel print-rotate p-1 rounded max-w-[105mm] h-[70mm] text-[10px] flex flex-col"
            >
              <table className=" text-[10px] w-[100mm] h-[65mm]  border border-collapse mb-1">
                <tbody>
                  <tr>
                    <td className="border px-1 py-0.5 font-semibold">
                      Party Name
                    </td>
                    <td colSpan={3} className="border px-1 py-0.5">
                      {stock.partyName || ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-1 py-0.5 font-semibold">
                      Purchased Date
                    </td>
                    <td colSpan={3} className="border px-1 py-0.5">
                      {stock.purchasedDate || ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-1 py-0.5 font-semibold">
                      Purchased Bill No.
                    </td>
                    <td colSpan={3} className="border px-1 py-0.5">
                      {stock.billNo || ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-1 py-0.5 font-semibold">
                      Purc. Order No.
                    </td>
                    <td colSpan={3} className="border px-1 py-0.5">
                      {stock.orderNo || ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-1 py-0.5 font-semibold">
                      Purc. Order Date
                    </td>
                    <td colSpan={3} className="border px-1 py-0.5">
                      {stock.orderDate || ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-1 py-0.5 font-semibold">
                      Item Name
                    </td>
                    <td colSpan={3} className="border px-1 py-0.5">
                      {stock.itemName || ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-1 py-0.5 font-semibold">
                      Item Code
                    </td>
                    <td className="border px-1 py-0.5">
                      {stock.skuCode || ""}
                    </td>
                    <td className="border px-1 py-0.5 font-semibold">
                      Item Category
                    </td>
                    <td className="border px-1 py-0.5">
                      {stock.category || "----------"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-1 py-0.5 font-semibold">
                      Item Qty.
                    </td>
                    <td className="border px-1 py-0.5">
                      {stock.stockQty || "----------"}
                    </td>
                    <td className="border px-1 py-0.5 font-semibold">
                      Item Color
                    </td>
                    <td className="border px-1 py-0.5">
                      {stock.color || "----------"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-1 py-0.5 font-semibold">LLPII</td>
                    <td colSpan={3} className=" py-0.5">
                      <Barcode
                        value={barcodeObj.barcode}
                        height={40}
                        width={1.2}
                        fontSize={10}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="text-center mt-auto">
                {/* <div className="text-center mt-1">{barcodeObj.barcode}</div> */}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handlePrint}
            className="bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-black font-semibold px-4 py-2 rounded  cursor-pointer"
          >
            Print Labels
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded  cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabelPrint;
