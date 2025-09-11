import React from "react";

const SampleDetailsSection = ({ SampleData }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // console.log("sampledata", SampleData);

  return (
    <div className="bg-white border border-primary rounded shadow pt-2 p-4 mx-2 mb-2 text-[11px] text-[#292926]">
      {/* Product Details Table */}
      <h3 className="font-bold text-primary text-[14px] underline underline-offset-4 mb-2">
        Product Details (Raw Material / SFG)
      </h3>
      <table className="w-full mb-2 text-[11px] border text-left">
        <thead className="bg-primary/70">
          <tr>
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">Sku Code</th>
            <th className="px-2 py-1 border-r border-primary">Item Name</th>
            <th className="px-2 py-1 border-r border-primary">Type</th>
            <th className="px-2 py-1 border-r border-primary">Part Name</th>
            <th className="px-2 py-1 border-r border-primary">Category</th>
            <th className="px-2 py-1 border-r border-primary">
              Height (Inch)
            </th>
            <th className="px-2 py-1 border-r border-primary">
              Width (Inch)
            </th>
            <th className="px-2 py-1 border-r border-primary">Quantity</th>
            <th className="px-2 py-1 border-r border-primary">Weight</th>
            <th className="px-2 py-1 border-r border-primary">Rate (₹)</th>
            {/* <th className="px-2 py-1 border-r border-primary">UOM</th> */}
          </tr>
        </thead>
        <tbody>
          {SampleData.productDetails?.length > 0 ? (
            SampleData.productDetails.map((item, idx) => (
              <tr key={idx} className="border-b border-primary">
                <td className="px-2 py-1 border-r border-primary">
                  {idx + 1}
                </td>
                <td className="px-2 py-1 border-r border-primary  capitalize">
                  {item.skuCode || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary capitalize">
                  {item.itemName || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary capitalize">
                  {item.type || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary capitalize">
                  {item.partName || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary capitalize">
                  {item.category || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary capitalize">
                  {item.height || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary capitalize">
                  {item.width || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.qty || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.grams ? `${item.grams / 1000} kg` : "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.rate || "N/A"}
                </td>
                {/* <td className="px-2 py-1 border-r border-primary">
                  {item.itemId?.UOM?.unit || "N/A"}
                </td> */}
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

      {/* Consumption Table */}
      <h3 className="font-bold text-primary text-[14px] underline underline-offset-4 mb-2">
        Raw Material Consumption
      </h3>
      <table className="w-full mb-4 text-[11px] border text-left">
        <thead className="bg-primary/70">
          <tr>
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">Sku Code</th>
            <th className="px-2 py-1 border-r border-primary">Item Name</th>
            <th className="px-2 py-1 border-r border-primary">Category</th>
            <th className="px-2 py-1 border-r border-primary">Weight</th>
            <th className="px-2 py-1 border-r border-primary">Qty</th>
          </tr>
        </thead>
        <tbody>
          {SampleData.consumptionTable?.length > 0 ? (
            SampleData.consumptionTable.map((item, idx) => (
              <tr key={idx} className="border-b border-primary">
                <td className="px-2 py-1 border-r border-primary">
                  {idx + 1}
                </td>
                <td className="px-2 py-1 border-r border-primary capitalize">
                  {item.skuCode || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary capitalize">
                  {item.itemName || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary capitalize">
                  {item.category || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.weight || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.qty || "N/A"}
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

      <table className="w-full  text-[11px] border border-primary  rounded">
        <tbody>
          <tr className="border-b border-primary">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Stitching (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.stitching || "9"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Print/Emb (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.printing || "0"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Others (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.others || "0"}
            </td>
          </tr>
          <tr className="border-b border-primary">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit Rate (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.unitRate || "0"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit B2B (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.unitB2BRate || "0"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit D2C (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.unitD2CRate || "0"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SampleDetailsSection;
