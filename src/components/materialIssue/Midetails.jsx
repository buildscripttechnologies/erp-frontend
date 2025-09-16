import React from "react";

const MIdetails = ({ MI, filter }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  let filteredDetails = MI.itemDetails || [];

  console.log("filtered details", filteredDetails);

  if (filter == "cutting") {
    filteredDetails = filteredDetails.filter((item) =>
      ["in cutting", "yet to cutting", "cutting paused"].includes(
        item.status.toLowerCase()
      )
    );
  }
  if (filter === "print") {
    filteredDetails = filteredDetails.filter((item) => item.isPrint == true);
  }

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
            <th className="px-2 py-1 border-r border-[#d8b76a]">Type</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Location</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Part Name</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">
              Height (Inch)
            </th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">
              Width (Inch)
            </th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Quantity</th>
            {/* <th className="px-2 py-1 border-r border-[#d8b76a]">Rate (₹)</th> */}
            <th className="px-2 py-1 border-r border-[#d8b76a]">Status</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">
              {filter == "print" ? "Print" : "Cutting Type"}
            </th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">
              Jobwork Type
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredDetails?.length > 0 ? (
            filteredDetails.map((item, idx) => (
              <tr key={idx} className="border-b border-[#d8b76a]">
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {idx + 1}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.itemId.skuCode || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.itemId.itemName || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.type || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.itemId.location?.locationId || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.partName || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.height || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.width || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.grams ? `${item.grams/1000} kg` : item.qty || "-"}
                </td>
                {/* <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.rate || "-"}
                </td> */}
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  <span
                    className={`${
                      [
                        "pending",
                        "in cutting",
                        "in stitching",
                        "in printing",
                        "in progress",
                      ].includes(item.status)
                        ? "bg-yellow-200"
                        : item.status == "in quality check"
                        ? "bg-orange-200"
                        : "bg-green-200"
                    }  py-0.5 px-1 rounded font-bold capitalize `}
                  >
                    {item.status || "-"}
                  </span>
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a] capitalize">
                  {filter == "print" ? "print " : item.cuttingType || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {filter == "print"
                    ? "Outside Company"
                    : item.jobWorkType || "-"}
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

export default MIdetails;
