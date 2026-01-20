// StageModal.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import { BeatLoader } from "react-spinners";

const StageModal = ({
  open,
  onClose,
  item,
  items = [],
  bulkAction,
  fetchData,
  miId,
  MI,
}) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const isBulk = items.length > 0;

  // 👉 Helper: get latest stage of an item
  const getCurrentStage = (itm) => {
    if (!itm.stages || itm.stages.length === 0) return null;
    return itm.stages[itm.stages.length - 1];
  };

  // 👉 Define next stage flow
  const getNextStageName = (itm) => {
    const current = getCurrentStage(itm);

    if (!current) return null;

    // if (itm.jobWorkType === "Outside Company") {
    //   return current.stage === "Cutting" ? "Cutting" : "Stitching";
    // }

    switch (current.stage) {
      case "Cutting":
        if (itm.isPrint) return "Printing";
        return itm.isPasting ? "Pasting" : "Stitching";

      case "Printing":
        return itm.isPasting ? "Pasting" : "Stitching";
      case "Pasting":
        return "Stitching";
      case "Stitching":
        return "Checking";
      case "Checking":
        return "Completed";
      default:
        return null;
    }
  };

  // 👉 Decide final update depending on action
  const getFinalStage = (itm) => {
    const current = getCurrentStage(itm);
    if (!current) return null;

    const action = isBulk ? bulkAction : itm.action;

    switch (action) {
      case "start":
        return { ...current, status: "In Progress" };
      case "pause":
        return { ...current, status: "Paused" };
      case "next":
        const nextStageName = getNextStageName(itm);

        if (nextStageName === "Completed") {
          // Final stage → only mark current as completed, no new push
          return {
            completedStage: { ...current, status: "Completed" },
            newStage: { stage: nextStageName, status: "Completed" },
          };
        }

        return {
          completedStage: { ...current, status: "Completed" },
          newStage: { stage: nextStageName, status: "Yet to Start" },
        };

      default:
        return current;
    }
  };

  const readyForNextStage = (stage, action) => {
    if (!MI?.itemDetails || MI.itemDetails.length === 0) return false;

    if (stage == "Stitching" && action == "start") {
      console.log("stitch", MI.readyForStitching);

      return MI.readyForStitching;
    }

    if (stage == "Checking" && action == "start") {
      console.log("stitch", MI.readyForChecking);
      return MI.readyForChecking;
    }

    return true; // If moving to Yet to Start → always allow
  };

  // 👉 Save handler
  // 👉 Save handler
  const handleSave = async () => {
    try {
      setLoading(true);
      // 🟢 Normalize items list (bulk or single)
      const allItems = (isBulk ? items : [item]).filter(Boolean);
      if (allItems.length === 0) {
        toast.error("No items selected");
        return;
      }

      // 🟢 Collect latest stages
      const latestStages = allItems.map((it) => getCurrentStage(it));

      // 🟢 Determine action
      const currentAction = isBulk ? bulkAction : item?.action;

      // RULE CHECKS
      if (currentAction === "start") {
        // When bulk, check the first one (they should all be in same stage in practice)
        const targetStage = getCurrentStage(isBulk ? items[0] : item)?.stage;
        console.log("target stage", targetStage);

        if (
          targetStage === "Stitching" &&
          readyForNextStage("Stitching", "start") === false
        ) {
          toast.error(
            "Cannot start Stitching until all items are ready for Stitching"
          );
          return;
        }

        if (
          targetStage === "Checking" &&
          readyForNextStage("Checking", "start") === false
        ) {
          toast.error("Cannot start Checking until all items finish Stitching");
          return;
        }
      }

      // 🟢 Build updates payload
      let updates = allItems.map((itm) => {
        const result = getFinalStage(itm);

        if (result?.completedStage && result?.newStage) {
          return {
            itemId: itm._id,
            note,
            completeStage: result.completedStage,
            pushStage: result.newStage,
          };
        } else {
          return {
            itemId: itm._id,
            note,
            updateStage: result,
          };
        }
      });

      // 🟢 API call
      const res = await axios.patch(`/mi/next-stage`, { miId, updates });

      if (res.data.success) {
        toast.success(
          isBulk
            ? `Updated ${allItems.length} items successfully`
            : `Stage updated to ${
                getFinalStage(item).newStage?.stage || getFinalStage(item).stage
              }`
        );
        fetchData();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to update stage");
      }
    } catch (err) {
      toast.error("Error updating stage");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 👉 Render item row
  const renderItemRow = (it, idx) => {
    const current = getCurrentStage(it);
    const finalStage = getFinalStage(it);

    const next = finalStage.newStage || finalStage;

    return (
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
          {it.grams ? `${it.grams / 1000} kg` : it.qty || "-"}
        </td>
        <td className="px-2 py-1 border-r border-primary">
          {it.height || "-"}
        </td>
        <td className="px-2 py-1 border-r border-primary">{it.width || "-"}</td>
        <td className="px-2 py-1 border-r border-primary">
          {current ? `${current.stage} - ${current.status}` : "-"}
        </td>
        <td className="px-2 py-1 text-primary font-bold">
          {next?.stage == "Completed"
            ? ` ${next.stage}`
            : ` ${next.stage} - ${next.status}`}
        </td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 ">
        <h2 className="text-lg font-bold mb-4 text-primary">Confirm Update</h2>

        <p className="mb-4 text-sm text-gray-700">
          {isBulk ? (
            <>
              Are you sure you want to update selected <b>{items.length}</b>{" "}
              items to <b>{bulkAction}</b> phase?
            </>
          ) : (
            <>
              Are you sure you want to change stage from{" "}
              <span className="font-bold">
                {getCurrentStage(item)?.stage} - {getCurrentStage(item)?.status}
              </span>{" "}
              →{" "}
              <span className="font-bold text-primary">
                {getFinalStage(item)?.newStage?.stage == "Completed"
                  ? getFinalStage(item)?.newStage?.stage ||
                    getFinalStage(item)?.stage
                  : getFinalStage(item)?.newStage?.stage ||
                    getFinalStage(item)?.stage -
                      getFinalStage(item)?.newStage?.status ||
                    getFinalStage(item)?.status}
              </span>
              ?
            </>
          )}
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border border-primary  whitespace-nowrap">
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            placeholder="Enter note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm border-primary focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition duration-200"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex items-center px-4 py-2 text-sm bg-primary text-secondary rounded hover:bg-primary/80 font-semibold cursor-pointer"
            onClick={handleSave}
          >
            {loading ? (
              <>
                <span className="mr-2">Updating</span>
                <BeatLoader size={5} color="#292926" />
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageModal;
