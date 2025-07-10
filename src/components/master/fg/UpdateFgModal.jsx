import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiPlus, FiMinus } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import Select from "react-select";

const UpdateFgModal = ({ fg, onClose, onUpdated }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [existingFiles, setExistingFiles] = useState(fg.files || []);
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
    if (fg) {
      const mappedMaterials = [];

      (fg.rm || []).forEach((r) => {
        mappedMaterials.push({ itemId: r.id, qty: r.qty });
      });
      (fg.sfg || []).forEach((s) => {
        mappedMaterials.push({ itemId: s.id, qty: s.qty });
      });

      setForm({
        itemName: fg.itemName || "",
        description: fg.description || "",
        hsnOrSac: fg.hsnOrSac || "",
        qualityInspectionNeeded: fg.qualityInspectionNeeded,
        location: fg.location?._id || fg.location || "",
        gst: fg.gst || "",
        status: fg.status || "Active",
        UOM: fg.uom || "",
        file: [],
        materials: mappedMaterials,
      });
      console.log("form", form);
    }
  }, [fg]);

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

      console.log("materials", form.materials);

      form.materials.forEach((mat) => {
        const match = components.find((c) => c.id == mat.itemId);
        if (!match || !mat.qty) return;
        if (match.type === "RM") {
          rm.push({ rmid: match.id, qty: Number(mat.qty) });
        } else {
          sfgNested.push({ sfgid: match.id, qty: Number(mat.qty) });
        }
      });

      const data = {
        itemName: form.itemName,
        description: form.description,
        hsnOrSac: form.hsnOrSac,
        qualityInspectionNeeded: form.qualityInspectionNeeded,
        location: form.location,
        status: form.status,
        gst: form.gst,
        UOM: form.UOM,
        rm,
        sfg: sfgNested,
        deletedFiles: deletedFileIds,
      };

      console.log("data", data);
      newFiles.forEach((file) => {
        payload.append("files", file);
      });

      payload.append("data", JSON.stringify(data));
      console.log("payload", payload);

      if (form.file.length) {
        form.file.forEach((file) => payload.append("files", file));
      }

      await axios.patch(`/fgs/edit/${fg.id}`, payload);
      toast.success("FG updated successfully");
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const groupedOptions = [
    {
      label: "Raw Materials",
      options: components
        .filter((c) => c.type === "RM")
        .map((c) => ({
          value: c.id,
          label: `${c.skuCode} - ${c.itemName} (${c.type})`,
        })),
    },
    {
      label: "Semi-Finished Goods",
      options: components
        .filter((c) => c.type === "SFG")
        .map((c) => ({
          value: c.id,
          label: `${c.skuCode} - ${c.itemName} (${c.type})`,
        })),
    },
  ];

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-[95vw] max-w-4xl p-6 rounded-lg border border-[#d8b76a] overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">Edit FG Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <input
              name="itemName"
              placeholder="Item Name"
              value={form.itemName}
              onChange={handleChange}
              className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              required
            />
            <input
              name="hsnOrSac"
              placeholder="HSN/SAC"
              value={form.hsnOrSac}
              onChange={handleChange}
              className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
            />
            <input
              name="gst"
              placeholder="GST %"
              value={form.gst}
              onChange={handleChange}
              className="p-2 border border-[#d8b76a] rounded  focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
            />
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
            <select
              name="qualityInspectionNeeded"
              value={form.qualityInspectionNeeded}
              onChange={handleChange}
              className="p-2 border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
            >
              <option value={true}>Required</option>
              <option value={false}>Not-required</option>
            </select>
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
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="p-2  border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div></div>
            <div></div>

            <div className="mt-4">
              <p className="font-semibold mb-2 text-[#292926]">
                Existing Files
              </p>
              {existingFiles.length === 0 && (
                <p className="text-sm text-gray-500">No files uploaded</p>
              )}
              {existingFiles.map((file) => (
                <div
                  key={file._id}
                  className="flex justify-between items-center bg-[#fdf6e9] border border-[#d8b76a] rounded p-2 mb-2"
                >
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#292926] underline"
                  >
                    {file.fileName}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletedFileIds((prev) => [...prev, file._id]);
                      setExistingFiles((prev) =>
                        prev.filter((f) => f._id !== file._id)
                      );
                    }}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            {/* Upload New Files */}
            <div className="mt-4">
              <label className="block font-semibold mb-2 text-[#292926]">
                Upload New Files
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setNewFiles(Array.from(e.target.files))}
                className="p-2 border border-[#d8b76a] rounded w-full cursor-pointer  focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              />
              {newFiles.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                  {newFiles.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
          />

          <div>
            <p className="font-semibold mb-2">List of Consumed Components</p>
            {form.materials.map((mat, index) => (
              <div key={index} className="flex gap-2 mb-2 flex-wrap">
                <Select
                  className="flex-grow w-[60%]"
                  value={
                    groupedOptions
                      .flatMap((g) => g.options)
                      .find((opt) => opt.value === mat.itemId) || null
                  }
                  onChange={(selected) =>
                    handleMaterialChange(index, "itemId", selected?.value)
                  }
                  options={groupedOptions}
                  placeholder="Select RM or SFG"
                  isSearchable
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      padding: "2px",
                      borderRadius: "6px",
                      borderColor: "#d8b76a",
                      boxShadow: state.isFocused ? "0 0 0 1px #d8b76a" : "none",
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
                    placeholder: (base) => ({
                      ...base,
                      color: "#9e9e9e",
                    }),
                    groupHeading: (base) => ({
                      ...base,
                      color: "#292926",
                      fontWeight: "bold",
                    }),
                  }}
                  filterOption={(option, inputValue) => {
                    const label = option.label
                      .replace(/\s+/g, "")
                      .toLowerCase();
                    const input = inputValue.replace(/\s+/g, "").toLowerCase();
                    return label.includes(input);
                  }}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={mat.qty}
                  onChange={(e) =>
                    handleMaterialChange(index, "qty", e.target.value)
                  }
                  className="p-2 w-[20%] border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                />
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="text-red-600 cursor-pointer"
                >
                  <FiMinus />
                </button>
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

export default UpdateFgModal;
