import React from "react";

const BomDetailsSection = ({ bomData }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="bg-white border border-primary rounded shadow pt-3 pb-4 px-4 mx-2 mb-2 text-[11px] text-black">
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
            <th className="px-2 py-1 border-r border-primary">Height (Inch)</th>
            <th className="px-2 py-1 border-r border-primary">Width (Inch)</th>
            <th className="px-2 py-1 border-r border-primary">Quantity</th>
            <th className="px-2 py-1 border-r border-primary">Weight</th>
            <th className="px-2 py-1 border-r border-primary">Rate (₹)</th>
            {/* <th className="px-2 py-1 border-r border-primary">UOM</th> */}
          </tr>
        </thead>
        <tbody>
          {bomData.productDetails?.length > 0 ? (
            bomData.productDetails.map((item, idx) => (
              <tr key={idx} className="border-b border-primary">
                <td className="px-2 py-1 border-r border-primary">{idx + 1}</td>
                <td className="px-2 py-1 border-r border-primary  ">
                  {item.skuCode || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary  ">
                  {item.itemName || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary  ">
                  {item.type || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary  ">
                  {item.partName || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary ">
                  {item.category || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.height || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
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
          {bomData.consumptionTable?.length > 0 ? (
            bomData.consumptionTable.map((item, idx) => (
              <tr key={idx} className="border-b border-primary">
                <td className="px-2 py-1 border-r border-primary">{idx + 1}</td>
                <td className="px-2 py-1 border-r border-primary ">
                  {item.skuCode || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary  ">
                  {item.itemName || "N/A"}
                </td>
                <td className="px-2 py-1 border-r border-primary  ">
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
              {bomData.stitching || "0"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Print/Emb (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {bomData.printing || "0"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Others (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {bomData.others || "0"}
            </td>
          </tr>
          <tr className="border-b border-primary">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit Rate (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {bomData.unitRate || "0"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit B2B (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {bomData.unitB2BRate || "0"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit D2C (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {bomData.unitD2CRate || "0"}
            </td>
          </tr>
          <tr className="border-b border-primary">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Total Rate (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {bomData.totalRate || "0"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Total B2B (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {bomData.totalB2BRate || "0"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Total D2C (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {bomData.totalD2CRate || "0"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BomDetailsSection;
