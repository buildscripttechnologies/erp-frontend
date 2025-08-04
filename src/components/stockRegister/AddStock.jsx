import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { ClipLoader } from "react-spinners";

const AddStockModal = ({ onClose, onAdded }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockQty, setStockQty] = useState("");
  const [conversionFactor, setConversionFactor] = useState("");
  const [loading, setLoading] = useState(false);

  const [uoms, setUoms] = useState([]);
  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !stockQty) return toast.error("All fields required");

    setLoading(true);

    try {
      const payload = {
        itemId: selectedItem.value,
        itemType: selectedItem.type,
        stockQty: parseFloat(stockQty),
        conversionFactor: conversionFactor,
      };

      const res = await axios.post("/stocks/add", payload);
      toast.success("Stock added successfully");
      onClose();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
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
      <div className="bg-white w-[92vw] max-w-xl rounded-lg p-6 border border-[#d8b76a]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">Add Stock</h2>

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
                  // minHeight: "6px", // 🔸 Set desired height
                  // height: "30px",
                }),
              }}
            />
          </div>

          <div className="flex flex-wrap gap-5">
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-[#292926] mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                placeholder="Stock Quantity"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full p-2 border border-[#d8b76a] rounded focus:border-[#d8b76a] focus:ring-1 focus:ring-[#d8b76a] focus:outline-none transition duration-200"
                required
                min={0}
              />
            </div>
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-[#292926] mb-1">
                Conversion Factor
              </label>
              <input
                type="number"
                placeholder="Conversion Factor"
                value={conversionFactor}
                onChange={(e) => setConversionFactor(e.target.value)}
                className="w-full p-2 border border-[#d8b76a] rounded focus:border-[#d8b76a] focus:ring-1 focus:ring-[#d8b76a] focus:outline-none transition duration-200"
                required
                min={0}
              />
            </div>
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
                "Save Stock"
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
