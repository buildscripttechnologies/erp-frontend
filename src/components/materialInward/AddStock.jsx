import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { ClipLoader } from "react-spinners";
import { useMemo } from "react";
import { FiTrash2 } from "react-icons/fi";

const AddStockModal = ({ onClose, onAdded }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockQty, setStockQty] = useState("");
  const [baseQty, setBaseQty] = useState("");
  const [damagedQty, setDamagedQty] = useState("");
  const [loading, setLoading] = useState(false);

  const [manualEntries, setManualEntries] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);
  console.log("stock qty", stockQty);

  const totalStockQty = useMemo(() => {
    return manualEntries.reduce(
      (acc, entry) => acc + Number(entry.baseQty || 0),
      0
    );
  }, [manualEntries]);

  const totalDamagedQty = useMemo(() => {
    return manualEntries.reduce(
      (acc, entry) => acc + Number(entry.damagedQty || 0),
      0
    );
  }, [manualEntries]);

  useEffect(() => {
    if (manualEntries.length > 0) {
      const totalStock = manualEntries.reduce(
        (sum, entry) => sum + Number(entry.baseQty || 0),
        0
      );
      const totalDamaged = manualEntries.reduce(
        (sum, entry) => sum + Number(entry.damagedQty || 0),
        0
      );
      setStockQty(totalStock);
      setDamagedQty(totalDamaged);
    }
  }, [manualEntries]);

  // Assuming only base qty contributes to stock

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [uomRes, rmRes, sfgRes, fgRes] = await Promise.all([
          axios.get("/uoms/all-uoms?limit=10000"),
          axios.get("/rms/rm?limit=10000"),
          axios.get("/sfgs/get-all?limit=10000"),
          axios.get("/fgs/get-all?limit=10000"),
        ]);
        setUoms(uomRes.data.data || []);
        setRms(rmRes.data.rawMaterials || []);
        setSfgs(sfgRes.data.data || []);
        setFgs(fgRes.data.data || []);
      } catch {
        toast.error("Failed to fetch UOM or RM data");
      }
    };
    fetchDropdowns();
  }, []);

  const addManualRow = () => {
    setManualEntries([...manualEntries, { baseQty: "", damagedQty: "" }]);
  };

  const updateManualRow = (index, field, value) => {
    const updated = [...manualEntries];
    updated[index][field] = value;
    setManualEntries(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !stockQty) return toast.error("All fields required");

    setLoading(true);

    try {
      const payload = {
        itemId: selectedItem.value,
        itemType: selectedItem.type,
        stockQty: parseFloat(stockQty),
        baseQty: baseQty,
        damagedQty: damagedQty,
        manualEntries: manualEntries.length > 0 ? manualEntries : undefined,
      };

      const res = await axios.post("/stocks/add", payload);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Material Inward successfully");
      onClose();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Inward failed");
    } finally {
      setLoading(false);
    }
  };

  let items = [
    ...rms.map((r) => ({
      value: r.id,
      label: `${r.skuCode} - ${r.itemName} - ${r.description}`,
      type: "RM",
    })),
    ...sfgs.map((s) => ({
      value: s.id,
      label: `${s.skuCode} - ${s.itemName} - ${s.description}`,
      type: "SFG",
    })),
    ...fgs.map((f) => ({
      value: f.id,
      label: `${f.skuCode} - ${f.itemName} - ${f.description}`,
      type: "FG",
    })),
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-xl rounded-lg p-6 border border-[#d8b76a] overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">Inward</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#292926] mb-1">
              Select Item (RM / SFG / FG)
            </label>
            <Select
              options={items}
              value={selectedItem}
              onChange={setSelectedItem}
              placeholder="Search item by name, SKU, or type..."
              isSearchable
              className="react-select-container"
              classNamePrefix="react-select"
              required
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: "#d8b76a",
                  boxShadow: state.isFocused ? "0 0 0 1px #d8b76a" : "none",
                  "&:hover": { borderColor: "#d8b76a" },
                }),
              }}
            />
          </div>

          <div className="flex flex-wrap gap-5">
            <div className="w-[30%]">
              <label className="block text-sm font-semibold text-[#292926] mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                placeholder="Stock Quantity"
                value={manualEntries.length > 0 ? totalStockQty : stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full p-2 border border-[#d8b76a] rounded focus:border-[#d8b76a] focus:ring-1 focus:ring-[#d8b76a] focus:outline-none transition duration-200"
                required
                min={0}
                disabled={manualEntries.length > 0}
              />
            </div>

            <div className="w-[30%]">
              <label className="block text-sm font-semibold text-[#292926] mb-1">
                Base Quantity
              </label>
              <input
                type="number"
                placeholder="Base Quantity"
                value={baseQty}
                onChange={(e) => setBaseQty(e.target.value)}
                className="w-full p-2 border border-[#d8b76a] rounded focus:border-[#d8b76a] focus:ring-1 focus:ring-[#d8b76a] focus:outline-none transition duration-200"
                required
                min={0}
                disabled={manualEntries.length > 0}
              />
            </div>

            <div className="w-[30%]">
              <label className="block text-sm font-semibold text-[#292926] mb-1">
                Damaged Quantity
              </label>
              <input
                type="number"
                placeholder="Damaged Quantity"
                value={manualEntries.length > 0 ? totalDamagedQty : damagedQty}
                onChange={(e) => setDamagedQty(e.target.value)}
                className="w-full p-2 border border-[#d8b76a] rounded focus:border-[#d8b76a] focus:ring-1 focus:ring-[#d8b76a] focus:outline-none transition duration-200"
                required
                min={0}
                disabled={manualEntries.length > 0}
              />
            </div>
          </div>

          {manualEntries.map((entry, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border border-[#d8b76a] rounded-md p-3 mb-2"
            >
              <div className="flex-1">
                <label className="block text-sm font-semibold text-[#292926] mb-1">
                  Base Qty
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={entry.baseQty}
                  onChange={(e) => {
                    const updated = [...manualEntries];
                    updated[index].baseQty = e.target.value;
                    setManualEntries(updated);
                  }}
                  min={0}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-[#292926] mb-1">
                  Damaged Qty
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={entry.damagedQty}
                  onChange={(e) => {
                    const updated = [...manualEntries];
                    updated[index].damagedQty = e.target.value;
                    setManualEntries(updated);
                  }}
                  min={0}
                />
              </div>

              <button
                type="button"
                className="text-red-500 hover:text-red-700 mt-6"
                onClick={() => {
                  const updated = manualEntries.filter((_, i) => i !== index);
                  setManualEntries(updated);
                }}
                title="Remove Entry"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}

          <div className="mt-4">
            <button
              type="button"
              onClick={addManualRow}
              className="px-4 py-2 bg-[#d8b76a] text-[#292926] rounded hover:bg-[#d8b76a]/80 font-semibold"
            >
              + Manual Inward
            </button>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-[#292926] font-semibold rounded cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <ClipLoader size={20} color="#292926" />
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-[#292926] rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;
