import React from "react";

const FgDetailSection = ({ fgData }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // console.log("fgData", fgData);

  return (
    <div className=" rounded mx-2 mb-2 text-[11px] text-secondary">
      {/* <h2 className="text-[14px] text-primary font-bold underline underline-offset-4 mb-2">
        FG Details
      </h2> */}

      <table className="w-full  text-[11px] border border-primary  rounded">
        <tbody>
          <tr className="border-b border-primary">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Stitching (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {fgData.stitching || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Print/Emb (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {fgData.printing || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Others (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {fgData.others || "-"}
            </td>
          </tr>
          <tr className="border-b border-primary">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit Rate (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {fgData.unitRate || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit B2B (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {fgData.unitB2BRate || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit D2C (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {fgData.unitD2CRate || "-"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FgDetailSection;
