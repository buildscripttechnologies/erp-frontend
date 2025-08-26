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
          </tr>
        </thead>
        <tbody>
          {PO.items?.length > 0 ? (
            PO.items.map((poItem, index) => (
              <tr
                key={index}
                className={`border-b border-primary capitalize 
              ${poItem.rejected ? "bg-red-50" : ""}
              `}
              >
                <td className="px-2 py-1 border-r border-primary">
                  {index + 1}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.skuCode || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.itemName || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {poItem.item?.description || "-"}
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
                  {poItem.item?.stockQty || "-"}
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
