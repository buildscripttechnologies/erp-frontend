import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const EditRawMaterialModal = ({ rawMaterial, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(rawMaterial);
  const [loading, setLoading] = useState(false);
  const [uoms, setUoms] = useState([]);

  useEffect(() => {
    const fetchUOMs = async () => {
      try {
        const res = await axios.get("/uoms/all-uoms"); // your UOM endpoint
        setUoms(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load UOMs");
      }
    };
    fetchUOMs();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        purchaseUOM: formData.purchaseUOM, // it's ObjectId
        stockUOM: formData.stockUOM,
        qualityInspectionNeeded: formData.qualityInspectionNeeded,
      };
      const res = await axios.patch(`/rms/update-rm/${formData._id}`, payload);
      if (res.status === 200) {
        toast.success("Raw material updated");
        onUpdated();
        onClose();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-[#292926]">
          Edit Raw Material
        </h2>
        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* ... previous fields ... */}
          <input
            type="text"
            value={formData.itemName}
            onChange={(e) => handleChange("itemName", e.target.value)}
            placeholder="Item Name"
            className="border border-[#d8b76a] px-4 py-2 rounded"
            required
          />
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Description"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          />
          <input
            type="text"
            value={formData.hsnOrSac}
            onChange={(e) => handleChange("hsnOrSac", e.target.value)}
            placeholder="HSN/SAC"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          />
          <input
            type="text"
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            placeholder="Type"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          />
          <select
            value={
              formData.qualityInspectionNeeded ? "Required" : "Not Required"
            }
            onChange={(e) =>
              handleChange(
                "qualityInspectionNeeded",
                e.target.value === "Required"
              )
            }
            className="border border-[#d8b76a] px-4 py-2 rounded"
          >
            <option>Required</option>
            <option>Not Required</option>
          </select>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Location"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          />
          <input
            type="number"
            value={formData.baseQty}
            onChange={(e) => handleChange("baseQty", e.target.value)}
            placeholder="Base Qty"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          />
          <input
            type="number"
            value={formData.pkgQty}
            onChange={(e) => handleChange("pkgQty", e.target.value)}
            placeholder="Pkg Qty"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          />
          <input
            type="number"
            value={formData.moq}
            onChange={(e) => handleChange("moq", e.target.value)}
            placeholder="MOQ"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          />
          {/* <input
            type="text"
            value={formData.purchaseUOM}
            onChange={(e) => handleChange("purchaseUOM", e.target.value)}
            placeholder="Purchase UOM"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          /> */}
          <input
            type="number"
            value={formData.gst}
            onChange={(e) => handleChange("gst", e.target.value)}
            placeholder="GST"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          />
          <input
            type="number"
            value={formData.stockQty}
            onChange={(e) => handleChange("stockQty", e.target.value)}
            placeholder="Stock Qty"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          />
          {/* <input
            type="text"
            value={formData.stockUOM}
            onChange={(e) => handleChange("stockUOM", e.target.value)}
            placeholder="Stock UOM"
            className="border border-[#d8b76a] px-4 py-2 rounded"
          /> */}

          {/* UOM dropdowns */}
          <select
            value={formData.purchaseUOM}
            onChange={(e) => handleChange("purchaseUOM", e.target.value)}
            className="border border-[#d8b76a] px-4 py-2 rounded"
            required
          >
            <option value="">Select Purchase UOM</option>
            {uoms.map((u) => (
              <option key={u._id} value={u.unitName}>
                {u.unitName}
              </option>
            ))}
          </select>

          <select
            value={formData.stockUOM}
            onChange={(e) => handleChange("stockUOM", e.target.value)}
            className="border border-[#d8b76a] px-4 py-2 rounded"
            required
          >
            <option value="">Select Stock UOM</option>
            {uoms.map((u) => (
              <option key={u._id} value={u.unitName}>
                {u.unitName}
              </option>
            ))}
          </select>

          {/* Buttons */}
          <div className="col-span-full flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-black font-semibold rounded"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRawMaterialModal;
