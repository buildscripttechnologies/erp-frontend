import React from "react";

const McDetails = ({ MI, filter = "" }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  let filteredDetails = MI.consumptionTable.filter((i) => i.isChecked == true);

  // console.log("filtered details", filteredDetails);

  return (
    <div className="bg-white border border-primary rounded shadow pt-3 pb-4 px-4 mx-2 mb-2 text-[11px] text-[#292926]">
      {/* Product Details Table */}
      <h3 className="font-bold text-primary text-[14px] underline underline-offset-4 mb-2">
        Consumption Details (Raw Material / SFG)
      </h3>
      <table className="w-full  text-[11px] border text-left whitespace-nowrap">
        <thead className="bg-primary/70">
          <tr>
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">Sku Code</th>
            <th className="px-2 py-1 border-r border-primary">Type</th>
            <th className="px-2 py-1 border-r border-primary">Item Name</th>
            <th className="px-2 py-1 border-r border-primary">Category</th>
            <th className="px-2 py-1 border-r border-primary">Weight</th>
            <th className="px-2 py-1 border-r border-primary">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {filteredDetails?.length > 0 ? (
            filteredDetails.map((item, idx) => {
              return (
                <tr key={idx} className="border-b border-primary">
                  <td className="px-2 py-1 border-r border-primary">
                    {idx + 1}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item?.skuCode || "-"}
                  </td>{" "}
                  <td className="px-2 py-1 border-r border-primary">
                    {item.type || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item?.itemName || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.category || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.weight || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.qty || "-"}
                  </td>
                </tr>
              );
            })
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

export default McDetails;
