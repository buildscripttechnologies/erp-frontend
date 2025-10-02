import React from "react";
import {
  FaArrowCircleRight,
  FaPauseCircle,
  FaPlayCircle,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import StageModal from "./StageModal";

// 🔹 Stage order with new "Pasting" stage after Printing
const STAGE_ORDER = [
  "Material Issue",
  "Cutting",
  "Printing",
  "Pasting", // 🔹 NEW optional stage
  "Stitching",
  "Checking",
  "Completed",
];

const JobDetails = ({ MI, filter, fetchMis }) => {
  const [openStageModal, setOpenStageModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [bulkAction, setBulkAction] = React.useState(null);

  const filteredDetails = MI.itemDetails || [];

  // ✅ Helper: get stage based on filter
  const getStageByFilter = (item, filter) => {
    if (!item.stages || item.stages.length === 0) {
      return { stage: "Material Issue", status: "Pending" };
    }

    const filterStage = filter === "outside" ? "Cutting" : filter;
    const filterIndex = STAGE_ORDER.findIndex(
      (s) => s.toLowerCase() === filterStage.toLowerCase()
    );

    const lastStage = item.stages[item.stages.length - 1];
    const lastStageIndex = STAGE_ORDER.findIndex(
      (s) => s.toLowerCase() === lastStage.stage.toLowerCase()
    );

    if (lastStageIndex === filterIndex) return lastStage;
    if (lastStageIndex < filterIndex) return lastStage;
    return { stage: STAGE_ORDER[filterIndex], status: "Completed" };
  };

  // ✅ Check if item is in the current filter stage
  const isInFilterStage = (item) => {
    if (filter === "production") return true;
    const stage = getStageByFilter(
      item,
      filter === "outside" ? "Cutting" : filter
    );
    return (
      stage &&
      stage.stage.toLowerCase() ===
        (filter === "outside" ? "cutting" : filter.toLowerCase())
    );
  };

  // ✅ Determine items to display
  const showAll =
    filteredDetails.some((item) => isInFilterStage(item)) ||
    filter === "production";
  const displayedItems = showAll
    ? filteredDetails
    : filteredDetails.filter(isInFilterStage);

  // ✅ Determine if all displayed items are in the same stage (for bulk actions)
  const allSameStage = displayedItems.every(
    (item) =>
      getStageByFilter(item, filter).stage ===
      getStageByFilter(displayedItems[0], filter).stage
  );

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const eligibleItems = displayedItems
      .filter(
        (item) =>
          isInFilterStage(item) &&
          getStageByFilter(item, filter).status !== "Completed" &&
          !(
            filter.toLowerCase() === "cutting" &&
            item.jobWorkType === "Outside Company"
          )
      )
      .map((i) => i._id);
    setSelectedItems(
      selectedItems.length === eligibleItems.length ? [] : eligibleItems
    );
  };

  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) return;
    setBulkAction(action);
    setSelectedItem(null);
    setOpenStageModal(true);
  };

  // ✅ Allowed bulk actions
  const allowedActions = (items, filter) => {
    if (!items || items.length === 0 || filter === "production")
      return { start: false, pause: false, next: false };

    const eligibleItems = items.filter(
      (item) =>
        isInFilterStage(item) &&
        getStageByFilter(item, filter).status !== "Completed" &&
        !(
          filter.toLowerCase() === "cutting" &&
          item.jobWorkType === "Outside Company"
        )
    );

    if (eligibleItems.length === 0)
      return { start: false, pause: false, next: false };

    const statuses = eligibleItems.map(
      (item) => getStageByFilter(item, filter).status
    );

    return {
      start: statuses.some((s) => s === "Yet to Start" || s === "Paused"),
      pause: statuses.every((s) => s === "In Progress"),
      next: statuses.every((s) => s === "In Progress"),
    };
  };

  const actions = allowedActions(displayedItems, filter);

  return (
    <div className="bg-white border border-primary rounded shadow pt-3 pb-4 px-4 mx-2 mb-2 text-[11px] text-black whitespace-nowrap">
      {/* Header + Bulk Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-primary text-[14px] underline underline-offset-4 capitalize">
          Product Details ({filter})
        </div>

        {filter !== "production" &&
          selectedItems.length > 0 &&
          allSameStage && (
            <div className="flex gap-2 text-sm">
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
            {filter !== "production" && allSameStage && (
              <th className="px-2 py-1 border-r border-primary flex gap-1">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.length ===
                      displayedItems.filter(
                        (item) =>
                          isInFilterStage(item) &&
                          getStageByFilter(item, filter).status !==
                            "Completed" &&
                          !(
                            filter.toLowerCase() === "cutting" &&
                            item.jobWorkType === "Outside Company"
                          )
                      ).length &&
                    displayedItems.filter(
                      (item) =>
                        isInFilterStage(item) &&
                        getStageByFilter(item, filter).status !== "Completed" &&
                        !(
                          filter.toLowerCase() === "cutting" &&
                          item.jobWorkType === "Outside Company"
                        )
                    ).length > 0
                  }
                  onChange={handleSelectAll}
                  className="accent-black"
                />
              </th>
            )}
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">Sku Code</th>
            <th className="px-2 py-1 border-r border-primary">Item Name</th>
            {filter !== "production" && (
              <>
                <th className="px-2 py-1 border-r border-primary">Type</th>
                <th className="px-2 py-1 border-r border-primary">Location</th>
              </>
            )}
            <th className="px-2 py-1 border-r border-primary">Part Name</th>
            <th className="px-2 py-1 border-r border-primary">Height</th>
            <th className="px-2 py-1 border-r border-primary">Width</th>
            <th className="px-2 py-1 border-r border-primary">Quantity</th>
            {filter !== "printing" && filter !== "stitching" && (
              <th className="px-2 py-1 border-r border-primary">
                Cutting Type
              </th>
            )}
            {filter === "production" && (
              <th className="px-2 py-1 border-r border-primary">
                Latest Stage
              </th>
            )}
            <th className="px-2 py-1 border-r border-primary">Status</th>
            {filter !== "production" && (
              <th className="px-2 py-1 border-r border-primary">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {displayedItems.length > 0 ? (
            displayedItems.map((item, idx) => {
              const stage = getStageByFilter(item, filter);
              if (!stage) return null;

              const inStage = isInFilterStage(item);
              const isOutsideCutting =
                filter.toLowerCase() === "cutting" &&
                item.jobWorkType === "Outside Company";

              const statusLabel =
                stage.status === "Completed"
                  ? stage.status
                  : `${stage.stage} - ${stage.status}`;

              return (
                <tr
                  key={item._id}
                  className={`border-b border-primary ${
                    !inStage || stage.status === "Completed" || isOutsideCutting
                      ? "bg-gray-100 text-gray-500"
                      : ""
                  }`}
                >
                  {filter !== "production" && allSameStage && (
                    <td className="px-2 py-1 border-r border-primary accent-primary">
                      {!isOutsideCutting && (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleCheckboxChange(item._id)}
                          disabled={!inStage || stage.status === "Completed"}
                        />
                      )}
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
                  {filter !== "production" && (
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
                  {filter !== "printing" && filter !== "stitching" && (
                    <td className="px-2 py-1 border-r border-primary">
                      {item.cuttingType || "-"}
                    </td>
                  )}
                  {filter === "production" && (
                    <td className="px-2 py-1 border-r border-primary font-semibold">
                      {stage.stage}
                    </td>
                  )}
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
                      } py-0.5 px-1 rounded font-bold`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  {filter !== "production" && (
                    <td className="px-2 py-1 flex gap-1 text-[12px]">
                      {!isOutsideCutting &&
                        (filter.toLowerCase() === "stitching" ||
                        filter.toLowerCase() === "checking"
                          ? allSameStage
                          : true) && (
                          <>
                            {inStage && stage.status === "Yet to Start" && (
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
                            {inStage && stage.status === "Paused" && (
                              <FaPlayCircle
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Resume"
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
                            {inStage && stage.status === "In Progress" && (
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
                          </>
                        )}
                      <Tooltip
                        id="statusTip"
                        place="top"
                        style={{
                          backgroundColor: "black",
                          color: "white",
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
              <td className="px-2 py-1 text-center" colSpan={12}>
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
            ? displayedItems.filter((i) => selectedItems.includes(i._id))
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
