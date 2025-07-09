import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../utils/axios";
import { ClipLoader } from "react-spinners";

const UpdateLocationModal = ({ location, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    locationId: location.locationId || "",
    storeNo: location.storeNo || "",
    storeRno: location.storeRno || "",
    binNo: location.binNo || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.patch(`/locations/update-location/${location._id}`, formData);
      toast.success("Location updated successfully");
      onClose();
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-xl rounded-lg p-6 border border-[#d8b76a]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">
          Update Location
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="">Location ID </label>{" "}
          <input
            type="text"
            name="locationId"
            placeholder="Location ID"
            value={formData.locationId}
            onChange={handleChange}
            className="w-full p-2 border border-[#d8b76a] rounded"
            required
          />
          <label htmlFor="">Store No</label>{" "}
          <input
            type="text"
            name="storeNo"
            placeholder="Store No"
            value={formData.storeNo}
            onChange={handleChange}
            className="w-full p-2 border border-[#d8b76a] rounded"
            required
          />
          <label htmlFor="">Store Rack No</label>{" "}
          <input
            type="text"
            name="storeRno"
            placeholder="Store Rack No"
            value={formData.storeRno}
            onChange={handleChange}
            className="w-full p-2 border border-[#d8b76a] rounded"
          />
          <label htmlFor="">Bin No</label>{" "}
          <input
            type="text"
            name="binNo"
            placeholder="Bin No"
            value={formData.binNo}
            onChange={handleChange}
            className="w-full p-2 border border-[#d8b76a] rounded"
          />
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-[#292926] rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold rounded flex items-center justify-center"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <ClipLoader size={20} color="#292926" />
                </>
              ) : (
                "Update Location"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateLocationModal;
