import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import { FiMinus, FiPlus } from "react-icons/fi";
import { ClipLoader } from "react-spinners";

const AddFgModal = ({ onClose, onAdded }) => {
  const [uoms, setUoms] = useState([]);
  const [rms, setRms] = useState([]);
  const [sfgs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formList, setFormList] = useState([
    {
      skuCode: "",
      itemName: "",
      basePrice: "",
      gst: "",
      moq: "",
      hsnSac: "",
      uom: "",
      qualityInspection: "",
      location: "",
      description: "",
      file: null,
      materials: [], // contains both RM and SFG entries
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uomRes, rmRes] = await Promise.all([
          axios.get("/uoms/all-uoms?limit=1000"),
          axios.get("/rms/rm"),
          //axios.get("/sfgs/all?limit=1000")
        ]);
        setUoms(uomRes.data.data || []);
        setRms(rmRes.data.rawMaterials || []);
        //setSfgs(sfgRes.data.data || []);
      } catch {
        toast.error("Failed to load dropdown data");
      }
    };
    fetchData();
  }, []);

  const handleChange = (index, e) => {
    const updated = [...formList];
    const { name, value, files } = e.target;
    updated[index][name] = files ? files[0] : value;
    setFormList(updated);
  };

  const handleMaterialChange = (index, matIndex, field, value) => {
    const updated = [...formList];
    updated[index].materials[matIndex][field] = value;
    setFormList(updated);
  };

  const addMaterial = (index, type = "rm") => {
    const updated = [...formList];
    updated[index].materials.push({ itemId: "", qty: "", type });
    setFormList(updated);
  };

  const removeMaterial = (index, matIndex) => {
    const updated = [...formList];
    updated[index].materials.splice(matIndex, 1);
    setFormList(updated);
  };

  const addRow = () => {
    setFormList([
      ...formList,
      {
        skuCode: "",
        itemName: "",
        basePrice: "",
        gst: "",
        moq: "",
        hsnSac: "",
        uom: "",
        qualityInspection: "",
        location: "",
        description: "",
        file: null,
        materials: [],
      },
    ]);
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
      const payload = new FormData();
      payload.append("data", JSON.stringify(formList));
      formList.forEach((item, i) => {
        if (item.file) {
          payload.append(`files[${i}]`, item.file);
        }
      });
      await axios.post("/fgs/add-many", payload);
      toast.success("Finished Goods added successfully");
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[95vw] max-w-6xl rounded-lg p-6 border border-[#d8b76a] overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-[#fdf6e9]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">
          Create Finished Goods BOM
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formList.map((item, index) => (
            <div
              key={index}
              className="space-y-4 border border-[#d8b76a] p-4 rounded"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="skuCode"
                  placeholder="SKU Code"
                  value={item.skuCode}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                  required
                />
                <input
                  type="text"
                  name="itemName"
                  placeholder="Item Name"
                  value={item.itemName}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                  required
                />
                <input
                  type="text"
                  name="hsnSac"
                  placeholder="HSN/SAC"
                  value={item.hsnSac}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                />
                <input
                  type="text"
                  name="basePrice"
                  placeholder="Base Price"
                  value={item.basePrice}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                />
                <input
                  type="text"
                  name="gst"
                  placeholder="GST %"
                  value={item.gst}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                />
                <input
                  type="text"
                  name="moq"
                  placeholder="MOQ"
                  value={item.moq}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                />
                <select
                  name="uom"
                  value={item.uom}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                  required
                >
                  <option value="">Select UOM</option>
                  {uoms.map((u) => (
                    <option key={u._id} value={u.unitName}>
                      {u.unitName}
                    </option>
                  ))}
                </select>
                <select
                  name="qualityInspection"
                  value={item.qualityInspection}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                >
                  <option value="">Select Quality Inspection</option>
                  <option value="Required">Required</option>
                  <option value="Not-required">Not-required</option>
                </select>
                <select
                  name="location"
                  value={item.location}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                  disabled
                >
                  <option value="">Select Location (Coming soon)</option>
                </select>
                <input
                  type="file"
                  name="file"
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                />
              </div>

              <textarea
                name="description"
                value={item.description}
                onChange={(e) => handleChange(index, e)}
                placeholder="Description (optional)"
                className="w-full p-2 border border-[#d8b76a] rounded"
              />

              <div>
                <p className="font-semibold mb-2">
                  List of Consumed Components
                </p>
                {item.materials.map((mat, matIndex) => (
                  <div key={matIndex} className="flex gap-2 mb-2">
                    <select
                      value={mat.itemId}
                      onChange={(e) =>
                        handleMaterialChange(
                          index,
                          matIndex,
                          "itemId",
                          e.target.value
                        )
                      }
                      className="p-2 border border-[#d8b76a] rounded w-full"
                    >
                      <option value="">
                        Select {mat.type === "sfg" ? "SFG" : "RM"}
                      </option>
                      {(mat.type === "sfg" ? sfgs : rms).map((i) => (
                        <option key={i._id} value={i._id}>
                          {i.skuCode} - {i.itemName}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={mat.qty}
                      onChange={(e) =>
                        handleMaterialChange(
                          index,
                          matIndex,
                          "qty",
                          e.target.value
                        )
                      }
                      className="p-2 border border-[#d8b76a] rounded w-24"
                    />
                    <button
                      type="button"
                      onClick={() => removeMaterial(index, matIndex)}
                      className="text-red-600"
                    >
                      <FiMinus />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => addMaterial(index, "rm")}
                    className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded flex items-center gap-1"
                  >
                    <FiPlus /> Add RM
                  </button>
                  <button
                    type="button"
                    onClick={() => addMaterial(index, "sfg")}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded flex items-center gap-1"
                  >
                    <FiPlus /> Add SFG
                  </button>
                </div>
              </div>

              {formList.length > 1 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-600 hover:underline"
                  >
                    Remove This FG
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-start">
            <button
              type="button"
              onClick={addRow}
              className="bg-[#6d28d9] text-white px-4 py-2 rounded flex items-center gap-1"
            >
              <FiPlus /> Add FG
            </button>
          </div>

          <div className="flex justify-end gap-4 mt-6">
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
              className="px-6 py-2 bg-[#d8b76a] flex justify-center items-center hover:bg-[#d8b76a]/80 text-[#292926] font-semibold rounded"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <ClipLoader size={20} color="#292926" />
                </>
              ) : (
                "Save All"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFgModal;
