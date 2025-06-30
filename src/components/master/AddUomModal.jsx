import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import { FiMinus, FiPlus } from "react-icons/fi";

const AddUomModal = ({ onClose, onAdded }) => {
  const [formList, setFormList] = useState([
    { unitName: "", unitDescription: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, e) => {
    const updated = [...formList];
    updated[index][e.target.name] = e.target.value;
    setFormList(updated);
  };

  const addRow = () => {
    setFormList([...formList, { unitName: "", unitDescription: "" }]);
  };

  const removeRow = (index) => {
    const updated = [...formList];
    updated.splice(index, 1);
    setFormList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/uoms/add-many", formList);
      toast.success("UOMs added successfully");
      onClose();
      onAdded(); // Refresh table
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg p-6 border border-[#d8b76a] overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-[#fdf6e9]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">Add UOMs</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formList.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center border p-4 rounded border-[#d8b76a]"
            >
              <input
                type="text"
                name="unitName"
                placeholder="Unit Name"
                value={item.unitName}
                onChange={(e) => handleChange(index, e)}
                className="p-2 border border-[#d8b76a] rounded focus:ring-2 focus:ring-[#b38a37]"
                required
              />
              <input
                type="text"
                name="unitDescription"
                placeholder="Unit Description"
                value={item.unitDescription}
                onChange={(e) => handleChange(index, e)}
                className="p-2 border border-[#d8b76a] rounded"
              />
              <div className="flex gap-2">
                {formList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded"
                  >
                    <FiMinus />
                  </button>
                )}
                {index === formList.length - 1 && (
                  <button
                    type="button"
                    onClick={addRow}
                    className="bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] px-3 py-2 rounded"
                  >
                    <FiPlus />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-[#292926] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-[#292926] font-semibold rounded"
            >
              {loading ? "Saving..." : "Save UOMs"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUomModal;
