import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../utils/axios";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { ClipLoader } from "react-spinners";

const AddLocationModal = ({ onClose, onAdded }) => {
  const [formList, setFormList] = useState([
    { locationId: "", storeNo: "", storeRno: "", binNo: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, e) => {
    const updated = [...formList];
    updated[index][e.target.name] = e.target.value;
    setFormList(updated);
  };

  const addRow = () => {
    setFormList([
      ...formList,
      { locationId: "", storeNo: "", storeRno: "", binNo: "" },
    ]);
  };

  const removeRow = (index) => {
    const updated = [...formList];
    updated.splice(index, 1);
    setFormList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const locations = { locations: formList };
    console.log("loactions", locations);
    setLoading(true);
    try {
      let res = await axios.post("/locations/add-many", locations);
      if (res.data.staus == 400) {
        toast.error("All Fields Are Required");
        return;
      }
      toast.success("Locations added successfully");
      onClose();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-3xl rounded-lg p-6 border border-[#d8b76a] overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-[#fdf6e9]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">Add Locations</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formList.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center border p-4 rounded border-[#d8b76a]"
            >
              <input
                type="text"
                name="locationId"
                placeholder="Location ID"
                value={item.locationId}
                onChange={(e) => handleChange(index, e)}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                required
              />
              <input
                type="text"
                name="storeNo"
                placeholder="Store No"
                value={item.storeNo}
                onChange={(e) => handleChange(index, e)}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                required
              />
              <input
                type="text"
                name="storeRno"
                placeholder="Store Rack No"
                value={item.storeRno}
                onChange={(e) => handleChange(index, e)}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                required
              />
              <input
                type="text"
                name="binNo"
                placeholder="Bin No"
                value={item.binNo}
                onChange={(e) => handleChange(index, e)}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                required
              />
              <div className="flex gap-2">
                {formList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded cursor-pointer"
                  >
                    <FiTrash2 />
                  </button>
                )}
                {index === formList.length - 1 && (
                  <button
                    type="button"
                    onClick={addRow}
                    className="bg-[#d8b76a] flex items-center gap-1 hover:bg-[#b38a37] text-[#292926] px-3 py-2 rounded cursor-pointer"
                  >
                    <FiPlus /> <span>Add Location</span>
                  </button>
                )}
              </div>
            </div>
          ))}

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
              className="px-6 py-2 bg-[#d8b76a] flex justify-center items-center hover:bg-[#d8b76a]/80 text-[#292926] font-semibold rounded cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <ClipLoader size={20} color="#292926" />
                </>
              ) : (
                "Save Locations"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocationModal;
