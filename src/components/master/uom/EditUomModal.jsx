import React, { useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

const EditUomModal = ({ uom, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    unitName: uom.unitName,
    unitDescription: uom.unitDescription,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(`/uoms/update-uom/${uom._id}`, formData);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("UOM updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
      <div className="bg-white w-[92vw] max-w-md p-6 rounded-lg border border-[#d8b76a] shadow-lg">
        <h2 className="text-xl font-bold text-[#d8b76a] mb-4">Edit UOM</h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-sm text-[#292926]"
        >
          <div>
            <label className="block mb-1 font-medium">Unit Name</label>
            <input
              type="text"
              value={formData.unitName}
              placeholder="Unit Name"
              onChange={(e) => handleChange("unitName", e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:ring-2 focus:ring-[#b38a37] focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <input
              type="text"
              value={formData.unitDescription}
              onChange={(e) => handleChange("unitDescription", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:ring-2 focus:ring-[#b38a37] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-[#292926] rounded font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] flex justify-center items-center rounded font-semibold cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="mr-2">Updating...</span>
                  <ClipLoader size={20} color="#292926" />
                </>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUomModal;
