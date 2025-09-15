import React from "react";
import {
  FaArrowCircleRight,
  FaPauseCircle,
  FaPlay,
  FaPlayCircle,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import StageModal from "./StageModal";

import axios from "../../utils/axios";
const JobDetails = ({ MI, filter, fetchMis }) => {
  const [openStageModal, setOpenStageModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  let filteredDetails = MI.itemDetails || [];

  //   console.log("filtered details", filteredDetails);

  //   if (filter == "cutting") {
  //     filteredDetails = filteredDetails.filter((item) =>
  //       ["in cutting", "yet to cutting", "cutting paused"].includes(
  //         item.status.toLowerCase()
  //       )
  //     );
  //   }
  //   if (filter === "print") {
  //     filteredDetails = filteredDetails.filter((item) => item.isPrint == true);
  //   }

  const handleNextStage = async (miId, itemId) => {
    // decide next stage
    const nextStage = "in stitching";

    // confirm with user
    if (!window.confirm(`Move this item to next stage: ${nextStage}?`)) return;

    try {
      const res = await axios.patch("/mi/next-stage", {
        miId,
        itemId,
        updates: { status: nextStage },
      });

      if (res.data.status === 403) {
        toast.error(res.data.message);
        return;
      }

      if (res.data.status === 200) {
        toast.success(`Item moved to: ${nextStage}`);
        fetchMis(); // refresh data
      }
    } catch (err) {
      toast.error("Failed to move to next stage");
    }
  };

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
            {["production"].includes(filter) ? (
              ""
            ) : (
              <>
                <th className="px-2 py-1 border-r border-[#d8b76a]">Type</th>
                <th className="px-2 py-1 border-r border-[#d8b76a]">
                  Location
                </th>
              </>
            )}
            <th className="px-2 py-1 border-r border-[#d8b76a]">Part Name</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">
              Height (Inch)
            </th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">
              Width (Inch)
            </th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Quantity</th>
            {/* <th className="px-2 py-1 border-r border-[#d8b76a]">Rate (₹)</th> */}
            {["printing", "stitching"].includes(filter) ? (
              ""
            ) : (
              <th className="px-2 py-1 border-r border-[#d8b76a]">
                Cutting Type
              </th>
            )}
            {["production"].includes(filter) ? (
              <th className="px-2 py-1 border-r border-[#d8b76a]">Printing</th>
            ) : (
              ""
            )}
            <th className="px-2 py-1 border-r border-[#d8b76a]">Status</th>
            <th className="px-2 py-1 border-r border-[#d8b76a]">Actions</th>
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
                {["production"].includes(filter) ? (
                  ""
                ) : (
                  <>
                    <td className="px-2 py-1 border-r border-[#d8b76a]">
                      {item.type || "-"}
                    </td>
                    <td className="px-2 py-1 border-r border-[#d8b76a]">
                      {item.itemId.location?.locationId || "-"}
                    </td>
                  </>
                )}
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
                  {item.grams ? `${item.grams} gm` : item.qty || "-"}
                </td>
                {/* <td className="px-2 py-1 border-r border-[#d8b76a]">
                  {item.rate || "-"}
                </td> */}
                {["printing", "stitching"].includes(filter) ? (
                  ""
                ) : (
                  <td className="px-2 py-1 border-r border-[#d8b76a] capitalize">
                    {item.cuttingType || "-"}
                  </td>
                )}{" "}
                {["production"].includes(filter) ? (
                  <th className="px-2 py-1 border-r border-[#d8b76a]">
                    {item.isPrint ? "Yes" : "-" || "-"}
                  </th>
                ) : (
                  ""
                )}{" "}
                <td className="px-2 py-1 border-r border-[#d8b76a]">
                  <span
                    className={`${
                      [
                        "Yet to Cutting",
                        "In Cutting",
                        "Cutting Paused",
                        "Yet to Print",
                        "In Printing",
                        "Printing Paused",
                        "Yet to Stitch",
                        "In Stitching",
                        "Stitching Paused",
                        "In Progress",
                      ].includes(item.status)
                        ? "bg-yellow-200"
                        : ["In Checking", "Yet to Check"].includes(item.status)
                        ? "bg-orange-200"
                        : "bg-green-200"
                    }  py-0.5 px-1 rounded font-bold  `}
                  >
                    {item.status || "-"}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-2 py-1 flex gap-1 text-[12px]">
                  {item.jobWorkType == "Outside Company" ? (
                    <>
                      {/* ▶️ Start outside job */}
                      {item.status != "In Progress" && (
                        <FaPlayCircle
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Start Outside Job"
                          className="cursor-pointer text-[#d8b76a] hover:text-green-600"
                          onClick={() => {
                            setSelectedItem({ ...item, action: "play" });
                            setOpenStageModal(true);
                          }}
                        />
                      )}

                      {/* ⏭ Move outside job to next stage */}
                      {item.status == "In Progress" && (
                        <FaArrowCircleRight
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Move to Next Stage"
                          className="cursor-pointer text-[#d8b76a] hover:text-green-600"
                          onClick={() => {
                            setSelectedItem({ ...item, action: "next" });
                            setOpenStageModal(true);
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {/* ▶️ Play button */}
                      {[
                        "Yet to Cutting",
                        "Yet to Print",
                        "Yet to Stitch",
                        "Yet to Check",
                        "Cutting Paused",
                        "Printing Paused",
                        "Stitching Paused",
                        "Checking Paused",
                      ].includes(item.status) && (
                        <FaPlayCircle
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Start / Resume"
                          className="cursor-pointer text-[#d8b76a] hover:text-green-600"
                          onClick={() => {
                            setSelectedItem({ ...item, action: "play" });
                            setOpenStageModal(true);
                          }}
                        />
                      )}

                      {/* ⏸ Pause button */}
                      {[
                        "In Cutting",
                        "In Printing",
                        "In Stitching",
                        "In Checking",
                      ].includes(item.status) && (
                        <FaPauseCircle
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Pause"
                          className="cursor-pointer text-[#d8b76a] hover:text-green-600"
                          onClick={() => {
                            setSelectedItem({ ...item, action: "pause" });
                            setOpenStageModal(true);
                          }}
                        />
                      )}

                      {/* ⏭ Next Stage button */}
                      {[
                        "In Cutting",
                        "In Printing",
                        "In Stitching",
                        "In Checking",
                      ].includes(item.status) && (
                        <FaArrowCircleRight
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Move to Next Stage"
                          className="cursor-pointer text-[#d8b76a] hover:text-green-600"
                          onClick={() => {
                            setSelectedItem({ ...item, action: "next" });
                            setOpenStageModal(true);
                          }}
                        />
                      )}
                    </>
                  )}

                  <Tooltip
                    id="statusTip"
                    place="top"
                    style={{
                      backgroundColor: "#292926",
                      color: "#d8b76a",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
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
      <StageModal
        open={openStageModal}
        onClose={() => setOpenStageModal(false)}
        item={selectedItem}
        fetchData={fetchMis}
        miId={MI._id}
      />
    </div>
  );
};

export default JobDetails;
