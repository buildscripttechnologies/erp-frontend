// StageModal.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";

const StageModal = ({ open, onClose, item, fetchData, miId }) => {
  const [note, setNote] = useState("");

  if (!open || !item) return null;

  const currentStage = item.status;

  const getNextStage = () => {
    if (item.jobWorkType == "Outside Company") {
      // Outside flow: only two steps
      return item.isPrint ? "Yet to Print" : "Yet to Stitch";
    }

    // Normal flow
    if (currentStage.toLowerCase().includes("cutting")) {
      return item.isPrint ? "Yet to Print" : "Yet to Stitch";
    }
    if (currentStage.toLowerCase().includes("print")) return "Yet to Stitch";
    if (currentStage.toLowerCase().includes("stitch")) return "Completed";
    if (currentStage.toLowerCase().includes("check")) return "Approved";
    return null;
  };

  const getFinalStage = () => {
    if (item.isOutsideJob) {
      if (item.action === "play") return "In Progress";
      if (item.action === "next") return getNextStage();
      return currentStage;
    }

    // In-company jobs
    switch (item.action) {
      case "play":
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
        return getNextStage();
      default:
        return currentStage;
    }
  };

  const handleSave = async () => {
    const finalStage = getFinalStage();
    // Extra condition: if outside job moves to next stage → switch to inside
    let updatedFields = { status: finalStage };

    if (item.jobWorkType == "Outside Company" && item.action == "next") {
      updatedFields.jobWorkType = "Inside Company";
    }

    try {
      const res = await axios.patch(`/mi/next-stage`, {
        miId,
        itemId: item._id,
        updates: {
          status: updatedFields.status,
          jobWorkType: updatedFields.jobWorkType,
          note,
        },
      });

      if (res.data.success) {
        toast.success(`Stage updated to ${finalStage}`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <h2 className="text-lg font-bold mb-4 text-gray-800">Confirm Update</h2>

        {/* Info */}
        <p className="mb-4 text-sm text-gray-700">
          Are you sure you want to change stage from{" "}
          <span className="font-bold">{currentStage}</span> →{" "}
          <span className="font-bold text-yellow-600">{getFinalStage()}</span>?
        </p>

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
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
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
