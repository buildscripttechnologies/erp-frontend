import React from "react";

const MIdetails = ({ MI, filter = "" }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  let filteredDetails = MI.itemDetails || [];

  console.log("filtered details", filteredDetails);

  // if (filter == "cutting") {
  //   filteredDetails = filteredDetails.filter((item) =>
  //     ["in cutting", "yet to cutting", "cutting paused"].includes(
  //       item.status.toLowerCase()
  //     )
  //   );
  // }
  // if (filter === "print") {
  //   filteredDetails = filteredDetails.filter((item) => item.isPrint == true);
  // }

  const getStageByFilter = (item) => {
    return item.stages[item.stages.length - 1];
  };

  return (
    <div className="bg-white border border-primary rounded shadow pt-3 pb-4 px-4 mx-2 mb-2 text-[11px] text-[#292926]">
      {/* Product Details Table */}
      <h3 className="font-bold text-primary text-[14px] underline underline-offset-4 mb-2">
        Product Details (Raw Material / SFG)
      </h3>
      <table className="w-full  text-[11px] border text-left">
        <thead className="bg-primary/70">
          <tr>
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">Sku Code</th>
            <th className="px-2 py-1 border-r border-primary">Item Name</th>
            <th className="px-2 py-1 border-r border-primary">Type</th>
            <th className="px-2 py-1 border-r border-primary">Location</th>
            <th className="px-2 py-1 border-r border-primary">Part Name</th>
            <th className="px-2 py-1 border-r border-primary">Height (Inch)</th>
            <th className="px-2 py-1 border-r border-primary">Width (Inch)</th>
            <th className="px-2 py-1 border-r border-primary">Quantity</th>
            {/* <th className="px-2 py-1 border-r border-primary">Rate (₹)</th> */}
            <th className="px-2 py-1 border-r border-primary">Status</th>
            <th className="px-2 py-1 border-r border-primary">
              {filter == "print" ? "Print" : "Cutting Type"}
            </th>
            <th className="px-2 py-1 border-r border-primary">Jobwork Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredDetails?.length > 0 ? (
            filteredDetails.map((item, idx) => {
              const stage = getStageByFilter(item);
              let statusLabel;
              if (!stage) {
                statusLabel = "Pending";
              } else {
                statusLabel = "Completed";
              }

              return (
                <tr key={idx} className="border-b border-primary">
                  <td className="px-2 py-1 border-r border-primary">
                    {idx + 1}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.itemId.skuCode || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.itemId.itemName || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.type || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.itemId.location?.locationId || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.partName || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.height || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.width || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.grams ? `${item.grams / 1000} kg` : item.qty || "-"}
                  </td>
                  {/* <td className="px-2 py-1 border-r border-primary">
                  {item.rate || "-"}
                </td> */}
                  <td className="px-2 py-1 border-r border-primary">
                    <span
                      className={`${
                        statusLabel == "Completed"
                          ? "bg-green-200"
                          : "bg-yellow-200"
                      }  py-0.5 px-1 rounded font-bold`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-2 py-1 border-r border-primary capitalize">
                    {filter == "print" ? "print " : item.cuttingType || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {filter == "print"
                      ? "Outside Company"
                      : item.jobWorkType || "-"}
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

export default MIdetails;
