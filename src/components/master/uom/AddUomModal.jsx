import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../utils/axios";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { BeatLoader } from "react-spinners";

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
      let res = await axios.post("/uoms/add-many", formList);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
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
    <div className="fixed  inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-3xl rounded-lg p-6 border border-[#d8b76a] overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-[#fdf6e9]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">Add UOMs</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formList.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start border p-4 rounded border-[#d8b76a]"
            >
              <div>
                <label className="block text-sm font-semibold text-[#292926]">
                  Unit Name
                  {/* <span className="text-red-500">*</span> */}
                </label>
                <input
                  type="text"
                  name="unitName"
                  placeholder="Unit Name"
                  value={item.unitName}
                  onChange={(e) => handleChange(index, e)}
                  className="w-full mt-1 p-2 border border-[#d8b76a] rounded focus:ring-2 focus:ring-[#b38a37]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#292926]">
                  Unit Description
                </label>
                <input
                  type="text"
                  name="unitDescription"
                  placeholder="Unit Description"
                  value={item.unitDescription}
                  onChange={(e) => handleChange(index, e)}
                  className="w-full mt-1 p-2 border border-[#d8b76a] rounded"
                />
              </div>

              <div className="flex gap-2 items-end">
                {formList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="mt-6 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-3 rounded cursor-pointer"
                  >
                    <FiTrash2 />
                  </button>
                )}
                {index === formList.length - 1 && (
                  <button
                    type="button"
                    onClick={addRow}
                    className="mt-6 bg-[#d8b76a] flex items-center gap-1 hover:bg-[#b38a37] text-[#292926] px-3 py-2 rounded cursor-pointer"
                  >
                    <FiPlus /> <span>Add UOM</span>
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
                  <span className="mr-2">Saving</span>
                  <BeatLoader size={5} color="#292926" />
                </>
              ) : (
                "Save UOMs"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUomModal;
