import React from "react";

const QuotationDetails = ({ quotationData }) => {
  if (!quotationData) return null;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "-";

  return (
    <div className="bg-white border border-primary rounded shadow  pb-3 px-2 mx-2 mb-3 text-[11px] text-black">
      {/* Header Info */}

      {/* Loop through each quotation */}
      {quotationData.quotations?.length > 0 ? (
        quotationData.quotations.map((q, index) => (
          <div
            key={index}
            className="mt-3 border border-primary rounded overflow-hidden"
          >
            <div className=" px-3 py-2 font-bold text-primary text-base">
              Product {index + 1}: {q.productName || "Unnamed Product"}{" "}
              {q.sampleNo
                ? `- ${q.sampleNo} - (${q.orderQty})`
                : `- (${q.orderQty})`}
            </div>

            {/* Product Details */}
            <div className="p-3">
              <h3 className="font-bold text-primary text-[13px] underline underline-offset-4 mb-2">
                Product Details (Raw Material / SFG)
              </h3>
              <table className="w-full mb-2 text-[11px] border border-primary text-left">
                <thead className="bg-primary/70 text-secondary">
                  <tr>
                    <th className="px-2 py-1 border-r border-primary">
                      S. No.
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Sku Code
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Item Name
                    </th>
                    <th className="px-2 py-1 border-r border-primary">Type</th>
                    <th className="px-2 py-1 border-r border-primary">
                      Part Name
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Category
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Height
                    </th>
                    <th className="px-2 py-1 border-r border-primary">Width</th>
                    <th className="px-2 py-1 border-r border-primary">Qty</th>
                    <th className="px-2 py-1 border-r border-primary">
                      Weight
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Rate (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {q.productDetails?.length > 0 ? (
                    q.productDetails.map((item, idx) => (
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
                          {item.type || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.partName || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.category || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.height || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.width || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.qty || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.grams ? `${item.grams / 1000} kg` : "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.rate || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={11}
                        className="text-center py-2 text-gray-500"
                      >
                        No product details available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Consumption Table */}
              <h3 className="font-bold text-primary text-[13px] underline underline-offset-4 mb-2">
                Raw Material Consumption
              </h3>
              <table className="w-full mb-3 text-[11px]  border border-primary  text-left">
                <thead className="bg-primary/70 text-secondary">
                  <tr>
                    <th className="px-2 py-1 border-r border-primary">
                      S. No.
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Sku Code
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Item Name
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Category
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Weight
                    </th>
                    <th className="px-2 py-1 border-r border-primary">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {q.consumptionTable?.length > 0 ? (
                    q.consumptionTable.map((item, idx) => (
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
                          {item.weight == "N/A" ? "-" : item.weight || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.qty || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-2 text-gray-500"
                      >
                        No consumption details available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Summary Table */}
              <table className="w-full text-[11px] border border-primary rounded">
                <tbody>
                  <tr className="border-b border-primary">
                    <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
                      Stitching (₹)
                    </td>
                    <td className="px-2 py-1 border-r border-primary">
                      {q.stitching || "0"}
                    </td>
                    <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
                      Print/Emb (₹)
                    </td>
                    <td className="px-2 py-1 border-r border-primary">
                      {q.printing || "0"}
                    </td>
                    <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
                      Others (₹)
                    </td>
                    <td className="px-2 py-1 border-r border-primary">
                      {q.others || "0"}
                    </td>
                  </tr>
                  <tr className="border-b border-primary">
                    <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
                      Unit Rate (₹)
                    </td>
                    <td className="px-2 py-1 border-r border-primary">
                      {q.unitRate || "0"}
                    </td>
                    <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
                      Unit D2C Rate (₹)
                    </td>
                    <td className="px-2 py-1 border-r border-primary">
                      {q.unitD2CRate || "0"}
                    </td>
                    <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
                      Unit B2B Rate (₹)
                    </td>
                    <td className="px-2 py-1 border-r border-primary">
                      {q.unitB2BRate || "0"}
                    </td>
                  </tr>
                  <tr className="border-b border-primary">
                    <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
                      Total Rate (₹)
                    </td>
                    <td className="px-2 py-1 border-r border-primary">
                      {q.totalRate || "0"}
                    </td>
                    <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
                      Total D2C Rate (₹)
                    </td>
                    <td className="px-2 py-1 border-r border-primary">
                      {q.totalD2CRate || "0"}
                    </td>
                    <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
                      Total B2B Rate (₹)
                    </td>
                    <td className="px-2 py-1 border-r border-primary">
                      {q.totalB2BRate || "0"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 italic">No quotations found.</p>
      )}

      {/* Footer Info */}
      {/* <div className="text-[11px] text-gray-600 mt-3 border-t border-dashed border-primary pt-2 flex justify-between">
        <span>
          Created By:{" "}
          {quotationData.createdBy?.fullName ||
            quotationData.createdBy?.username ||
            "Unknown"}
        </span>
        <span>Created At: {formatDate(quotationData.createdAt)}</span>
      </div> */}
    </div>
  );
};

export default QuotationDetails;
