// StageModal.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";

const StageModal = ({
  open,
  onClose,
  item,
  items = [],
  bulkAction,
  fetchData,
  miId,
}) => {
  const [note, setNote] = useState("");

  if (!open) return null;

  const isBulk = items.length > 0;
  const currentStage = !isBulk ? item?.status : null;

  const getNextStage = (itm) => {
    if (itm.jobWorkType === "Outside Company") {
      // Outside flow: only two steps
      return itm.isPrint ? "Yet to Print" : "Yet to Stitch";
    }

    // Normal flow
    const stage = itm.status.toLowerCase();
    if (stage.includes("cutting")) {
      return itm.isPrint ? "Yet to Print" : "Yet to Stitch";
    }
    if (stage.includes("print")) return "Yet to Stitch";
    if (stage.includes("stitch")) return "Job Completed";
    if (stage.includes("check")) return "Approved";
    return null;
  };

  const getFinalStage = (itm) => {
    const currentStage = itm.status;

    if (itm.jobWorkType === "Outside Company") {
      if ((isBulk ? bulkAction : itm.action) === "play") return "In Progress";
      if ((isBulk ? bulkAction : itm.action) === "next")
        return getNextStage(itm);
      return currentStage;
    }

    switch (isBulk ? bulkAction : itm.action) {
      case "start":
        if (currentStage.includes("Cutting")) return "In Cutting";
        if (currentStage.includes("Print")) return "In Printing";
        if (currentStage.includes("Stitch")) return "In Stitching";
        if (currentStage.includes("Check")) return "In Checking";
        return currentStage;
      case "pause":
        if (currentStage.includes("In Cutting")) return "Cutting Paused";
        if (currentStage.includes("In Printing")) return "Printing Paused";
        if (currentStage.includes("In Stitching")) return "Stitching Paused";
        if (currentStage.includes("In Check")) return "Checking Paused";
        return currentStage;
      case "next":
        return getNextStage(itm);
      default:
        return currentStage;
    }
  };

  const handleSave = async () => {
    try {
      let updates;

      if (isBulk) {
        updates = items.map((itm) => ({
          itemId: itm._id,
          status: getFinalStage(itm),
          jobWorkType:
            itm.jobWorkType === "Outside Company" && bulkAction === "next"
              ? "Inside Company"
              : itm.jobWorkType,
          note,
        }));
      } else {
        updates = [
          {
            itemId: item._id,
            status: getFinalStage(item),
            jobWorkType:
              item.jobWorkType === "Outside Company" && item.action === "next"
                ? "Inside Company"
                : item.jobWorkType,
            note,
          },
        ];
      }

      const res = await axios.patch(`/mi/next-stage`, {
        miId,
        updates,
      });

      if (res.data.success) {
        toast.success(
          isBulk
            ? `Updated ${items.length} items successfully`
            : `Stage updated to ${updates[0].status}`
        );
        fetchData();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to update stage");
      }
    } catch (err) {
      toast.error("Error updating stage");
      console.error(err);
    }
  };

  const renderItemRow = (it, idx) => (
    <tr key={it._id} className="border-b border-primary">
      <td className="px-2 py-1 border-r border-primary">{idx + 1}</td>
      <td className="px-2 py-1 border-r border-primary">
        {it.itemId?.skuCode || "-"}
      </td>
      <td className="px-2 py-1 border-r border-primary">
        {it.itemId?.itemName || "-"}
      </td>
      <td className="px-2 py-1 border-r border-primary">
        {it.partName || "-"}
      </td>
      <td className="px-2 py-1 border-r border-primary">
        {" "}
        {it.grams ? `${it.grams / 1000} kg` : it.qty || "-"}
      </td>
      <td className="px-2 py-1 border-r border-primary">{it.height || "-"}</td>
      <td className="px-2 py-1 border-r border-primary">{it.width || "-"}</td>
      <td className="px-2 py-1 border-r border-primary">{it.status || "-"}</td>
      <td className="px-2 py-1 text-primary font-bold">
        → {getFinalStage(it)}
      </td>
    </tr>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
        {/* Header */}
        <h2 className="text-lg font-bold mb-4 text-primary">Confirm Update</h2>

        {/* Info */}
        <p className="mb-4 text-sm text-gray-700">
          {isBulk ? (
            <>
              Are you sure you want to update selected <b>{items.length}</b>{" "}
              items to <b>{bulkAction}</b> phase?
            </>
          ) : (
            <>
              Are you sure you want to change stage from{" "}
              <span className="font-bold">{currentStage}</span> →{" "}
              <span className="font-bold text-primary">
                {getFinalStage(item)}
              </span>
              ?
            </>
          )}
        </p>

        {/* Item details table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border border-primary">
            <thead className="bg-primary/70 text-black text-left">
              <tr>
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">Sku Code</th>
                <th className="px-2 py-1">Item Name</th>
                <th className="px-2 py-1">Part Name</th>
                <th className="px-2 py-1">Qty</th>
                <th className="px-2 py-1">Height</th>
                <th className="px-2 py-1">Width</th>
                <th className="px-2 py-1">Current</th>
                <th className="px-2 py-1">Next</th>
              </tr>
            </thead>
            <tbody>
              {isBulk
                ? items.map((it, idx) => renderItemRow(it, idx))
                : renderItemRow(item, 0)}
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            placeholder="Enter note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-yellow-400 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm bg-primary text-secondary rounded hover:bg-primary/80 font-semibold cursor-pointer"
            onClick={handleSave}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageModal;
