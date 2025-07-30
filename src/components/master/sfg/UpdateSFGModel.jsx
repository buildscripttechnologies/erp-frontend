import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import Select from "react-select";
const UpdateSfgModal = ({ sfg, onClose, onUpdated }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [existingFiles, setExistingFiles] = useState(sfg.files || []);
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [uomRes, rmRes, sfgRes, locRes] = await Promise.all([
          axios.get("/uoms/all-uoms?limit=1000"),
          axios.get("/rms/rm"),
          axios.get("/sfgs/get-all?limit=1000"),
          axios.get("/locations/get-all"),
        ]);

        setUoms(uomRes.data.data || []);
        setLocations(locRes.data.data || []);

        const raw = (rmRes.data.rawMaterials || []).map((r) => ({
          ...r,
          type: "RM",
        }));
        const sfgList = (sfgRes.data.data || []).map((s) => ({
          ...s,
          type: "SFG",
        }));
        setComponents([...raw, ...sfgList]);
      } catch (err) {
        toast.error("Dropdown loading failed");
      }
    };

    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (sfg) {
      const mappedMaterials = [];

      (sfg.rm || []).forEach((r) => {
        mappedMaterials.push({
          itemId: r.id,
          height: r.height,
          width: r.width,
          depth: r.depth,
          qty: r.qty,
        });
      });
      (sfg.sfg || []).forEach((s) => {
        mappedMaterials.push({
          itemId: s.id,
          height: s.height,
          width: s.width,
          depth: s.depth,
          qty: s.qty,
        });
      });

      setForm({
        itemName: sfg.itemName || "",
        description: sfg.description || "",
        hsnOrSac: sfg.hsnOrSac || "",
        qualityInspectionNeeded: sfg.qualityInspectionNeeded,
        location: sfg.location?._id || sfg.location || "",
        gst: sfg.gst || "",
        type: sfg.type || "",
        moq: sfg.moq || "",
        basePrice: sfg.basePrice || "",
        status: sfg.status || "Active",
        UOM: sfg.uom || "",
        file: [],
        materials: mappedMaterials,
      });
    }
  }, [sfg]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "file" ? Array.from(files) : value,
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...form.materials];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, materials: updated }));
  };

  const addMaterial = () => {
    setForm((prev) => ({
      ...prev,
      materials: [...prev.materials, { itemId: "", qty: "" }],
    }));
  };

  const removeMaterial = (index) => {
    const updated = [...form.materials];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, materials: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();

      const rm = [];
      const sfgNested = [];

      form.materials.forEach((mat) => {
        const match = components.find((c) => c.id == mat.itemId);
        if (!match || !mat.qty) return;
        if (match.type === "RM") {
          rm.push({
            rmid: match.id,
            height: Number(mat.height),
            width: Number(mat.width),
            depth: Number(mat.depth),
            qty: Number(mat.qty),
          });
        } else {
          sfgNested.push({
            sfgid: match.id,
            height: Number(mat.height),
            width: Number(mat.width),
            depth: Number(mat.depth),
            qty: Number(mat.qty),
          });
        }
      });

      const data = {
        itemName: form.itemName,
        description: form.description,
        hsnOrSac: form.hsnOrSac,
        qualityInspectionNeeded: form.qualityInspectionNeeded,
        location: form.location,
        status: form.status,
        moq: form.moq,
        basePrice: form.basePrice,
        gst: form.gst,
        UOM: form.UOM,
        rm,
        sfg: sfgNested,
        deletedFiles: deletedFileIds,
      };

      newFiles.forEach((file) => {
        payload.append("files", file);
      });

      payload.append("data", JSON.stringify(data));

      if (form.file.length) {
        form.file.forEach((file) => payload.append("files", file));
      }

      await axios.patch(`/sfgs/edit/${sfg.id}`, payload);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("SFG updated successfully");
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const options = components.map((c) => ({
    value: c.id,
    label: `${c.skuCode} - ${c.itemName} - ${c.description}`,
  }));

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-[95vw] max-w-4xl p-6 rounded-lg border border-[#d8b76a] overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">Edit SFG Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold">Item Name</label>
              <input
                name="itemName"
                placeholder="Item Name"
                value={form.itemName}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">HSN/SAC</label>
              <input
                name="hsnOrSac"
                placeholder="HSN/SAC"
                value={form.hsnOrSac}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">GST %</label>
              <input
                name="gst"
                placeholder="GST %"
                value={form.gst}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">MOQ</label>
              <input
                name="moq"
                placeholder="MOQ"
                value={form.moq}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Base Price</label>
              <input
                name="basePrice"
                placeholder="Base Price"
                value={form.basePrice}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">UOM</label>
              <select
                name="UOM"
                value={form.UOM}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              >
                <option value={form.UOM}>{form.UOM}</option>
                {uoms.map((u) => (
                  <option key={u._id} value={u.unitName}>
                    {u.unitName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Quality Inspection</label>
              <select
                name="qualityInspectionNeeded"
                value={form.qualityInspectionNeeded}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              >
                <option value={true}>Required</option>
                <option value={false}>Not-required</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Location</label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              >
                <option value="">Select Location</option>
                {locations.map((l) => (
                  <option key={l._id} value={l.locationId}>
                    {l.locationId}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="p-2  border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="p-2  border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              >
                <option value="">Select Type</option>
                <option value="SFG">SFG</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
            />
          </div>

          <div>
            <p className="font-semibold mb-2">List of Consumed Components</p>
            {form.materials.map((mat, index) => (
              <div
                key={index}
                className="flex flex-wrap gap-3 mb-4 border p-3 rounded-md border-[#d8b76a]"
              >
                <div className="w-full sm:w-[55%] md:w-[40%]">
                  <label className="font-semibold">Material</label>
                  <Select
                    className="flex-grow  "
                    value={
                      options.find((opt) => opt.value === mat.itemId) || null
                    }
                    onChange={(selected) =>
                      handleMaterialChange(index, "itemId", selected?.value)
                    }
                    options={options}
                    isSearchable
                    placeholder="Select RM or SFG"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        padding: "2px",
                        borderRadius: "6px",
                        borderColor: "#d8b76a",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #d8b76a"
                          : "none",
                        "&:hover": {
                          borderColor: "#d8b76a",
                        },
                      }),
                      // option: (base, state) => ({
                      //   ...base,
                      //   backgroundColor: state.isFocused ? "#f3e6c0" : "#fff",
                      //   color: "#292926",
                      // }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#292926",
                      }),
                    }}
                    filterOption={(option, inputValue) => {
                      const normalizedLabel = option.label
                        .replace(/\s+/g, "")
                        .toLowerCase();
                      const normalizedInput = inputValue
                        .replace(/\s+/g, "")
                        .toLowerCase();
                      return normalizedLabel.includes(normalizedInput);
                    }}
                  />
                </div>
                <div className="flex flex-col w-[46.5%] sm:w-[30%] md:w-[14%]">
                  <label className="font-medium">Height (cm)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Height"
                    value={mat.height}
                    onChange={(e) =>
                      handleMaterialChange(
                        index,

                        "height",
                        e.target.value
                      )
                    }
                    className="p-2  border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col w-[46.5%] sm:w-[30%] md:w-[14%]">
                  <label className="font-medium">Width (cm)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Width"
                    value={mat.width}
                    onChange={(e) =>
                      handleMaterialChange(
                        index,

                        "width",
                        e.target.value
                      )
                    }
                    className="p-2  border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col w-[46.5%] sm:w-[30%] md:w-[14%]">
                  <label className="font-medium">Depth (cm)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Depth"
                    value={mat.depth}
                    onChange={(e) =>
                      handleMaterialChange(
                        index,

                        "depth",
                        e.target.value
                      )
                    }
                    className="p-2  border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col w-[46.5%] sm:w-[30%] md:w-[10%]">
                  <label className="font-semibold">Qty</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Qty"
                    value={mat.qty}
                    onChange={(e) =>
                      handleMaterialChange(index, "qty", e.target.value)
                    }
                    className="p-2  border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200 "
                  />
                </div>
                <div className="flex items-end w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="text-red-600 cursor-pointer flex items-center gap-1 hover:underline  "
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addMaterial}
              className="bg-[#d8b76a] cursor-pointer hover:bg-[#d8b76a91] px-3 py-1 rounded flex items-center gap-1 mt-2"
            >
              <FiPlus /> Add RM/SFG
            </button>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 cursor-pointer hover:bg-gray-400 text-[#292926] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#d8b76a] cursor-pointer flex justify-center items-center hover:bg-[#d8b76a]/80 text-[#292926] font-semibold rounded"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving...</span>
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

export default UpdateSfgModal;
