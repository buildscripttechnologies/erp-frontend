import React from "react";

const POADetails = ({ PO }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // console.log("sampledata", SampleData);

  return (
    <div className="bg-white border border-primary rounded shadow pt-2 p-4 mx-2 mb-2 text-[11px] text-secondary">
      <h2 className="text-[14px] text-primary font-bold underline underline-offset-4 mb-2">
        Purchase Order Details
      </h2>

      <table className="w-full  text-[11px] border text-left">
        <thead className="bg-primary/70">
          <tr>
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">Image</th>
            <th className="px-2 py-1 border-r border-primary">Sku Code</th>
            <th className="px-2 py-1 border-r border-primary">Item Name</th>
            <th className="px-2 py-1 border-r border-primary">
              Item Description
            </th>
            <th className="px-2 py-1 border-r border-primary">Item Category</th>
            <th className="px-2 py-1 border-r border-primary">Item Color</th>
            <th className="px-2 py-1 border-r border-primary">HSN/SAC</th>
            <th className="px-2 py-1 border-r border-primary">GST (%)</th>
            <th className="px-2 py-1 border-r border-primary">
              Stock Quantity
            </th>
            <th className="px-2 py-1 border-r border-primary">Stock UOM</th>
            <th className="px-2 py-1 border-r border-primary">
              Order Quantity
            </th>
            <th className="px-2 py-1 border-r border-primary">Purchase UOM</th>
            <th className="px-2 py-1 border-r border-primary">Rate (₹)</th>
            <th className="px-2 py-1 border-r border-primary">Amount (₹)</th>
            <th className="px-2 py-1 border-r border-primary">Status </th>
            <th className="px-2 py-1 border-r border-primary">
              Rejection Reason
            </th>
          </tr>
        </thead>
        <tbody>
          {PO.items?.length > 0 ? (
            PO.items.map((poItem, index) => (
              <tr
                key={index}
                className={`border-b border-primary capitalize 
              ${
                poItem.itemStatus == "rejected"
                  ? "bg-red-50"
                  : poItem.itemStatus == "pending"
                  ? "bg-yellow-50"
                  : ""
              }
              `}
              >
                <td className="px-2 py-1 border-r border-primary">
                  {index + 1}
                </td>
                <td className="px-2 py-1  border-r border-primary">
                  {poItem.item?.attachments?.[0]?.fileUrl ? (
                    <img
                      src={poItem.item?.attachments?.[0]?.fileUrl}
                      alt={poItem.item?.itemName}
                      className="w-20 h-20 object-contain rounded"
                    />
                  ) : (
                    <div className=" flex items-center justify-center">-</div>
                  )}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.skuCode || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.itemName || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.description || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.itemCategory || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.itemColor || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.hsnOrSac || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.gst || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.stockQty?.toFixed(2) || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.stockUOM?.unitName || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.orderQty || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.purchaseUOM?.unitName || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.rate || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.amount || "-"}
                </td>
                <td
                  className={`px-2 py-1 border-r border-primary font-semibold ${
                    poItem.itemStatus == "rejected"
                      ? "text-red-600 "
                      : poItem.itemStatus == "approved"
                      ? "text-green-600"
                      : "text-yellow-500"
                  }`}
                >
                  {poItem.itemStatus == "rejected"
                    ? "Rejected"
                    : poItem.itemStatus == "approved"
                    ? "Approved"
                    : "Pending" || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.rejectionReason || "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-2 py-1 text-center" colSpan={13}>
                No product details available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default POADetails;
