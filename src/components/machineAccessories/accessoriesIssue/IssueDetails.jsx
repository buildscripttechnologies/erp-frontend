import React from "react";

const IssueDetails = ({ accessoriesData }) => {


  return (
    <div className="bg-white border border-primary rounded shadow pt-3 pb-4 px-4 mx-2 mb-2 text-[11px] text-black">
      {/* Product Details Table */}
      <h3 className="font-bold text-primary text-[14px] underline underline-offset-4 mb-2">
        Accessories Details
      </h3>
      <table className="w-full mb-2 text-[11px] border text-left">
        <thead className="bg-primary/70">
          <tr>
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">
              Accessory Name
            </th>
            <th className="px-2 py-1 border-r border-primary">Category</th>
            <th className="px-2 py-1 border-r border-primary">Description</th>
            <th className="px-2 py-1 border-r border-primary">Price</th>
            <th className="px-2 py-1 border-r border-primary">UOM</th>
            <th className="px-2 py-1 border-r border-primary">Issue Qty</th>
            <th className="px-2 py-1 border-r border-primary">Stock Qty</th>
            <th className="px-2 py-1 border-r border-primary">Remarks</th>

            {/* <th className="px-2 py-1 border-r border-primary">UOM</th> */}
          </tr>
        </thead>
        <tbody>
          {accessoriesData?.length > 0 ? (
            accessoriesData.map((item, idx) => (
              <tr key={idx} className="border-b border-primary">
                <td className="px-2 py-1 border-r border-primary">{idx + 1}</td>
                <td className="px-2 py-1 border-r border-primary  ">
                  {item.accessory?.accessoryName || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary  ">
                  {item.accessory?.category || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary  ">
                  {item.accessory?.description || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary  ">
                  {item.accessory?.price || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary ">
                  {item.accessory?.UOM?.unitName || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.issueQty || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.accessory?.stockQty || "N/A"}
                </td>
                <td className="px-2 py-1 ">{item.remarks || "N/A"}</td>
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

export default IssueDetails;
