import React, { useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

const CancelPO = ({ po, onClose, onCancelled }) => {

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancelPO = async () => {

    if (!reason.trim()) {
      toast.error("Cancellation reason is required");
      return;
    }

    setLoading(true);

    try {

      await axios.patch(`/pos/cancel/${po._id}`, {
        cancelReason: reason
      });

      toast.success("PO cancelled successfully");

      onCancelled?.();
      onClose();

    } catch (err) {

      toast.error(err.response?.data?.message || "Failed to cancel PO");

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

      <div className="bg-white w-[95%] max-w-md rounded-lg border border-primary shadow-lg">

        {/* Header */}
        <div className="bg-primary text-secondary px-5 py-3 rounded-t-lg">
          <h2 className="text-lg font-bold">
            Cancel Purchase Order
          </h2>
        </div>

        {/* Body */}
        <div className="p-5">

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              PO Number
            </label>
            <div className="p-2 bg-gray-100 rounded border">
              {po.poNo}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Cancellation Reason *
            </label>

            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full p-2 border border-primary rounded focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Close
          </button>

          <button
            onClick={handleCancelPO}
            disabled={loading}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded flex items-center"
          >
            {loading ? (
              <>
                Cancelling
                <span className="ml-2">
                  <BeatLoader size={6} color="#fff" />
                </span>
              </>
            ) : (
              "Cancel PO"
            )}
          </button>

        </div>

      </div>

    </div>
  );

};

export default CancelPO;
