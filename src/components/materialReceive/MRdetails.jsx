import { isNumber } from "lodash";
import React from "react";

const MRdetails = ({ MR }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="bg-white border border-primary rounded shadow pt-3 pb-4 px-4 mx-2 mb-2 text-[11px] text-black">
      {/* Product Details Table */}
      <h3 className="font-bold text-primary text-[14px] underline underline-offset-4 mb-2">
        Product Details (Raw Material / SFG)
      </h3>
      <table className="w-full  text-[11px] border text-left  whitespace-nowrap">
        <thead className="bg-primary/70">
          <tr>
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">Sku Code</th>
            <th className="px-2 py-1 border-r border-primary">Item Name</th>
            <th className="px-2 py-1 border-r border-primary">Category</th>
            <th className="px-2 py-1 border-r border-primary">Weight</th>
            <th className="px-2 py-1 border-r border-primary">Qty</th>
            <th className="px-2 py-1 border-r border-primary">
              Received Q/W
            </th>
            <th className="px-2 py-1 border-r border-primary">StockQty</th>
            <th className="px-2 py-1 border-r border-primary">Status</th>
          </tr>
        </thead>
        <tbody>
          {MR.consumptionTable?.length > 0 ? (
            MR.consumptionTable.map((item, idx) => (
              <tr key={idx} className="border-b border-primary">
                <td className="px-2 py-1 border-r border-primary">
                  {idx + 1}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.skuCode || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.itemName || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.category || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.weight || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {isNumber(item.qty) ? item.qty.toFixed(2) : item.qty || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.receiveQty || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.stockQty?.toFixed(2) || "-"}
                </td>

                <td className="px-2 py-1 border-r border-primary">
                  <span
                    className={`${
                      item.isReceived ? "bg-green-200" : ""
                    }  py-0.5 px-1 rounded font-bold capitalize `}
                  >
                    {item.isReceived ? "Received" : "N/A"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-2 py-1 text-center" colSpan={8}>
                No product details available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MRdetails;
