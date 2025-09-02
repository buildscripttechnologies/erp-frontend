import React from "react";

const SampleDetailsSection = ({ SampleData }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // console.log("sampledata", SampleData);

  return (
    <div className="bg-white border border-[#d8b76a] rounded shadow pt-2 p-4 mx-2 mb-2 text-[11px] text-[#292926]">
      <h2 className="text-[14px] text-[#d8b76a] font-bold underline underline-offset-4 mb-2">
        Sample Details
      </h2>

      <table className="w-full text-[11px] border border-[#d8b76a] mb-4 rounded">
        <tbody>
          <tr className="border-b border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Party Name
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {SampleData.partyName || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Sample No.
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {SampleData.sampleNo || "-"}
            </td>
          </tr>

          <tr className="border-b border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Product Name
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {SampleData.product?.name || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Date
            </td>
            <td className="px-2 py-1">
              {new Date(SampleData.date).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Product Details Table */}
      <h3 className="font-bold text-[#d8b76a] text-[14px] underline underline-offset-4 mb-2">
        Product Details (Raw Material / SFG)
      </h3>
      <table className="w-full mb-4 text-[11px] border text-left">
        <thead className="bg-[#d8b76a]/70">
          <tr>
            <th className="px-2 py-1 border-r border-[#d8b76a]">S. No.</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Sku Code</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Item Name</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Type</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Part Name</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">
              Height (Inch)
            </th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">
              Width (Inch)
            </th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Quantity</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Rate (₹)</th>
            {/* <th className="px-2 py-1 border-r border-[#d8b76a]">UOM</th> */}
          </tr>
        </thead>
        <tbody>
          {SampleData.productDetails?.length > 0 ? (
            SampleData.productDetails.map((item, idx) => (
              <tr key={idx} className="border-b border-[#d8b76a]">
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {idx + 1}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.skuCode || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.itemName || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.type || "-"}
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
                  {item.grams? `${item.grams/1000} kg` : item.qty || "-"}
                </td>
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.rate || "-"}
                </td>
                {/* <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.itemId?.UOM?.unit || "-"}
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

      <table className="w-full  text-[11px] border border-primary  rounded">
        <tbody>
          <tr className="border-b border-primary">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Stitching (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.stitching || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Print/Emb (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.printing || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Others (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.others || "-"}
            </td>
          </tr>
          <tr className="border-b border-primary">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit Rate (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.unitRate || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit B2B (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.unitB2BRate || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit D2C (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {SampleData.unitD2CRate || "-"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SampleDetailsSection;
