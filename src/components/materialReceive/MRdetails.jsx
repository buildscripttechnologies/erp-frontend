import React from "react";

const MRdetails = ({ MR }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="bg-white border border-[#d8b76a] rounded shadow pt-3 pb-4 px-4 mx-2 mb-2 text-[11px] text-[#292926]">
      {/* Product Details Table */}
      <h3 className="font-bold text-[#d8b76a] text-[14px] underline underline-offset-4 mb-2">
        Product Details (Raw Material / SFG)
      </h3>
      <table className="w-full  text-[11px] border text-left">
        <thead className="bg-[#d8b76a]/70">
          <tr>
            <th className="px-2 py-1 border-r border-[#d8b76a]">S. No.</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Sku Code</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Item Name</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Category</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Weight</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Qty</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">
              Received Q/W
            </th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">StockQty</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Status</th>
          </tr>
        </thead>
        <tbody>
          {MR.consumptionTable?.length > 0 ? (
            MR.consumptionTable.map((item, idx) => (
              <tr key={idx} className="border-b border-[#d8b76a]">
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {idx + 1}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.skuCode || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.itemName || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.category || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.weight || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.qty || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.receiveQty || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.stockQty?.toFixed(2) || "-"}
                </td>

                <td className="px-2 py-1 border-r border-[#d8b76a]">
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
