import React from "react";

const SfgDetailsSection = ({ sfgData }) => {


  return (
    <div className=" rounded mx-2 mb-2 text-[11px] text-black">
      <table className="w-full  text-[11px] border border-primary  rounded">
        <tbody>
          <tr className="border-b border-primary">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Stitching (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {sfgData.stitching || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Print/Emb (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {sfgData.printing || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Others (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {sfgData.others || "-"}
            </td>
          </tr>
          <tr className="border-b border-primary">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit Rate (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {sfgData.unitRate || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit B2B (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {sfgData.unitB2BRate || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-primary">
              Unit D2C (₹)
            </td>
            <td className="px-2 py-1 border-r border-primary">
              {sfgData.unitD2CRate || "-"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SfgDetailsSection;
