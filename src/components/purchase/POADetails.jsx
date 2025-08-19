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
            {/* <th className="px-2 py-1 border-r border-primary">UOM</th> */}
          </tr>
        </thead>
        <tbody>
          {PO.item ? (
            <tr className="border-b border-primary">
              <td className="px-2 py-1 border-r border-primary">{1}</td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.skuCode || "-"}
              </td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.itemName || "-"}
              </td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.description || "-"}
              </td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.itemCategory || "-"}
              </td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.itemColor || "-"}
              </td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.hsnOrSac || "-"}
              </td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.gst || "-"}
              </td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.stockQty || "-"}
              </td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.stockUOM?.unitName || "-"}
              </td>

              <td className="px-2 py-1 border-r border-primary">
                {PO.orderQty || "-"}
              </td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.purchaseUOM?.unitName || "-"}
              </td>
              <td className="px-2 py-1 border-r border-primary">
                {PO.item.rate || "-"}
              </td>
            </tr>
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

export default POADetails;
