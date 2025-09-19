import React from "react";
import {
  FaArrowCircleRight,
  FaPauseCircle,
  FaPlayCircle,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import StageModal from "./StageModal";

const JobDetails = ({ MI, filter, fetchMis }) => {
  const [openStageModal, setOpenStageModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [bulkAction, setBulkAction] = React.useState(null);

  let filteredDetails = MI.itemDetails || [];

  console.log("filtered details", filteredDetails);

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredDetails.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredDetails.map((i) => i._id));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) return;
    setBulkAction(action);
    setSelectedItem(null);
    setOpenStageModal(true);
  };

  // ✅ helper: get stage by filter
  const getStageByFilter = (item) => {
    if (!item.stages || item.stages.length === 0) return null;
    if (filter.toLowerCase() === "production") {
      // 👉 return the last stage (latest one)
      return item.stages[item.stages.length - 1];
    }
    if (filter.toLowerCase() === "outside") {
      // 👉 return the last stage (latest one)
      return item.stages.find((s) => s.stage === "Cutting");
    }

    return item.stages.find(
      (s) => s.stage.toLowerCase() === filter.toLowerCase()
    );
  };

  // ✅ show only items relevant to current stage (filter)
  if (filter != "production")
    filteredDetails = filteredDetails.filter((item) => getStageByFilter(item));

  // Decide what bulk actions are allowed based on MI
  const allowedActions = (MI) => {
    if (!MI || !MI.itemDetails || MI.itemDetails.length === 0) {
      return { start: false, pause: false, next: false };
    }

    const stages = MI.itemDetails.map((it) => {
      const last = it.stages?.[it.stages.length - 1];
      return last ? last.stage : null;
    });

    const statuses = MI.itemDetails.map((it) => {
      const last = it.stages?.[it.stages.length - 1];
      return last ? last.status : null;
    });

    // 👉 Default all to false
    let permissions = { start: false, pause: false, next: false };

    // ✅ Rule 1: If any item is "Yet to Start", only Start is allowed
    if (statuses.includes("Yet to Start")) {
      permissions.start = true;
      return permissions; // exit early
    }
    if (statuses.includes("Paused")) {
      permissions.start = true;
      return permissions; // exit early
    }

    // ✅ Rule 2: If all items are "In Progress", allow Pause + Next
    if (statuses.every((s) => s === "In Progress")) {
      permissions.pause = true;
      permissions.next = true;
    }

    // ✅ Rule 3: Handle Stitching + Checking readiness
    // if (stages.includes("Stitching") && !MI.readyForStitching) {
    //   permissions.start = false; // block starting Stitching
    // } else if (stages.includes("Stitching")) {
    //   permissions.start = true;
    // }

    // if (stages.includes("Checking") && !MI.readyForChecking) {
    //   permissions.start = false; // block starting Checking
    // } else if (stages.includes("Checking")) {
    //   permissions.start = true;
    // }

    return permissions;
  };
  const actions = allowedActions(MI);
  console.log("actions", actions);

  return (
    <div className="bg-white border border-primary rounded shadow pt-3 pb-4 px-4 mx-2 mb-2 text-[11px] text-black">
      {/* Header + Bulk Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-primary text-[14px] underline underline-offset-4">
          Product Details ({filter})
        </div>

        {selectedItems.length > 0 && (
          <div className="flex gap-2 text-sm">
            {["outside"].includes(filter) ? null : (
              <>
                {actions.start && (
                  <FaPlayCircle
                    className="cursor-pointer text-primary hover:text-green-600"
                    data-tooltip-id="statusTip"
                    data-tooltip-content="Start / Resume Selected"
                    onClick={() => handleBulkAction("start")}
                  />
                )}
                {actions.pause && (
                  <FaPauseCircle
                    className="cursor-pointer text-primary hover:text-orange-600"
                    data-tooltip-id="statusTip"
                    data-tooltip-content="Pause Selected"
                    onClick={() => handleBulkAction("pause")}
                  />
                )}
              </>
            )}
            {actions.next && (
              <FaArrowCircleRight
                className="cursor-pointer text-primary hover:text-blue-600"
                data-tooltip-id="statusTip"
                data-tooltip-content="Next Stage"
                onClick={() => handleBulkAction("next")}
              />
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <table className="w-full text-[11px] border text-left">
        <thead className="bg-primary/70">
          <tr>
            {["production"].includes(filter) ? null : (
              <th className="px-2 py-1 border-r border-primary flex gap-1">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.length === filteredDetails.length &&
                    filteredDetails.length > 0
                  }
                  onChange={handleSelectAll}
                  className="accent-black"
                />
              </th>
            )}
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">Sku Code</th>
            <th className="px-2 py-1 border-r border-primary">Item Name</th>
            {["production"].includes(filter) ? null : (
              <>
                <th className="px-2 py-1 border-r border-primary">Type</th>
                <th className="px-2 py-1 border-r border-primary">Location</th>
              </>
            )}
            <th className="px-2 py-1 border-r border-primary">Part Name</th>
            <th className="px-2 py-1 border-r border-primary">Height</th>
            <th className="px-2 py-1 border-r border-primary">Width</th>
            <th className="px-2 py-1 border-r border-primary">Quantity</th>
            {["printing", "stitching"].includes(filter) ? null : (
              <th className="px-2 py-1 border-r border-primary">
                Cutting Type
              </th>
            )}
            {["production"].includes(filter) ? (
              <th className="px-2 py-1 border-r border-primary">Printing</th>
            ) : null}
            {["outside"].includes(filter) ? (
              <th className="px-2 py-1 border-r border-primary">Vendor</th>
            ) : null}
            <th className="px-2 py-1 border-r border-primary">Status</th>
            {["production"].includes(filter) ? null : (
              <th className="px-2 py-1 border-r border-primary">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredDetails?.length > 0 ? (
            filteredDetails.map((item, idx) => {
              const stage = getStageByFilter(item);
              if (!stage) return null;

              const statusLabel =
                stage.stage == "Completed"
                  ? `${stage.stage} `
                  : `${stage.stage} - ${stage.status}`;
              return (
                <tr key={item._id} className="border-b border-primary">
                  {["production"].includes(filter) ? null : (
                    <td className="px-2 py-1 border-r border-primary accent-primary">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleCheckboxChange(item._id)}
                      />
                    </td>
                  )}
                  <td className="px-2 py-1 border-r border-primary">
                    {idx + 1}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.itemId.skuCode || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.itemId.itemName || "-"}
                  </td>
                  {["production"].includes(filter) ? null : (
                    <>
                      <td className="px-2 py-1 border-r border-primary">
                        {item.type || "-"}
                      </td>
                      <td className="px-2 py-1 border-r border-primary">
                        {item.itemId.location?.locationId || "-"}
                      </td>
                    </>
                  )}
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
                  {["printing", "stitching"].includes(filter) ? null : (
                    <td className="px-2 py-1 border-r border-primary ">
                      {item.cuttingType || "-"}
                    </td>
                  )}
                  {["production"].includes(filter) ? (
                    <td className="px-2 py-1 font-semibold border-r border-primary">
                      {item.isPrint ? "Yes" : "-"}
                    </td>
                  ) : null}
                  {["outside"].includes(filter) ? (
                    <td className="px-2 py-1 border-r border-primary">
                      {item.vendor || "-"}
                    </td>
                  ) : null}
                  {/* ✅ Status Badge */}
                  <td className="px-2 py-1 border-r border-primary">
                    <span
                      className={`${
                        stage?.status?.includes("Yet")
                          ? "bg-gray-200"
                          : stage?.status?.includes("In Progress")
                          ? "bg-yellow-200"
                          : stage?.status?.includes("Paused")
                          ? "bg-orange-200"
                          : stage?.status?.includes("Completed")
                          ? "bg-green-200"
                          : "bg-gray-100"
                      }  py-0.5 px-1 rounded font-bold`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  {/* ✅ Actions */}
                  {["production"].includes(filter) ? null : (
                    <td className="px-2 py-1 flex gap-1 text-[12px]">
                      {(stage.status === "Yet to Start" ||
                        stage.status === "Paused") && (
                        <FaPlayCircle
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Start"
                          className="cursor-pointer text-primary hover:text-green-600"
                          onClick={() => {
                            setSelectedItem({
                              ...item,
                              action: "start",
                              stage: stage.stage,
                            });
                            setBulkAction(null);
                            setOpenStageModal(true);
                          }}
                        />
                      )}
                      {stage.status === "In Progress" && (
                        <>
                          <FaPauseCircle
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Pause"
                            className="cursor-pointer text-primary hover:text-red-600"
                            onClick={() => {
                              setSelectedItem({
                                ...item,
                                action: "pause",
                                stage: stage.stage,
                              });
                              setBulkAction(null);
                              setOpenStageModal(true);
                            }}
                          />
                          <FaArrowCircleRight
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Next Stage"
                            className="cursor-pointer text-primary hover:text-blue-600"
                            onClick={() => {
                              setSelectedItem({
                                ...item,
                                action: "next",
                                stage: stage.stage,
                              });
                              setBulkAction(null);
                              setOpenStageModal(true);
                            }}
                          />
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
                  )}
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

      {/* StageModal */}
      <StageModal
        open={openStageModal}
        onClose={() => setOpenStageModal(false)}
        item={selectedItem}
        items={
          bulkAction
            ? filteredDetails.filter((i) => selectedItems.includes(i._id))
            : []
        }
        bulkAction={bulkAction}
        fetchData={fetchMis}
        miId={MI._id}
        MI={MI}
      />
    </div>
  );
};

export default JobDetails;
