import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const UpdateStockModal = ({ isOpen, onClose, stockData, onUpdated }) => {
  const [form, setForm] = useState({
    type: "",
    skuCode: "",
    itemName: "",
    description: "",
    stockUOM: "",
    stockQty: 0,
    damagedQty: 0,
    qualityApproved: false,
  });

  const [uoms, setUoms] = useState([]);

  useEffect(() => {
    if (stockData) {
      setForm({
        type: stockData.type || "",
        skuCode: stockData.skuCode || "",
        itemName: stockData.itemName || "",
        description: stockData.description || "",
        stockUOM: stockData.stockUOM?._id || "",
        stockQty: stockData.stockQty || 0,
        damagedQty: stockData.damagedQty || 0,
        qualityApproved: stockData.qualityApproved || false,
      });
    }
  }, [stockData]);

  useEffect(() => {
    fetchUoms();
  }, []);

  const fetchUoms = async () => {
    try {
      const res = await axios.get("/uoms/all-uoms");
      setUoms(res.data.data || []);
    } catch {
      toast.error("Failed to load UOMs");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `/stocks/update-stock/${stockData._id}`,
        form
      );
      if (res.data.status === 200) {
        toast.success("Stock updated successfully");
        onUpdated();
        onClose();
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch {
      toast.error("Update failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded shadow-md w-[400px]">
        <h2 className="text-lg font-bold mb-4">Update Material</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="skuCode"
            value={form.skuCode}
            onChange={handleChange}
            placeholder="SKU Code"
            className="border w-full px-2 py-1 rounded"
          />
          <input
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="Item Name"
            className="border w-full px-2 py-1 rounded"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="border w-full px-2 py-1 rounded"
          />
          <select
            name="stockUOM"
            value={form.stockUOM}
            onChange={handleChange}
            className="border w-full px-2 py-1 rounded"
          >
            <option value="">Select UOM</option>
            {uoms.map((u) => (
              <option key={u._id} value={u._id}>
                {u.unitName}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="stockQty"
            value={form.stockQty}
            onChange={handleChange}
            placeholder="Stock Qty"
            className="border w-full px-2 py-1 rounded"
          />
          <input
            type="number"
            name="damagedQty"
            value={form.damagedQty}
            onChange={handleChange}
            placeholder="Damaged Qty"
            className="border w-full px-2 py-1 rounded"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="qualityApproved"
              checked={form.qualityApproved}
              onChange={handleChange}
            />
            Quality Approved
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-[#d8b76a] text-[#292926] rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStockModal;
