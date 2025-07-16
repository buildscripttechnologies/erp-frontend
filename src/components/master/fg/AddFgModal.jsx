import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../utils/axios";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import Select from "react-select";

const AddFgModal = ({ onClose, onAdded }) => {
  const [uoms, setUoms] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  const [formList, setFormList] = useState([
    {
      itemName: "",
      description: "",
      hsnOrSac: "",
      qualityInspectionNeeded: "",
      location: "",
      gst: "",
      type: "SFG",
      UOM: "",
      rm: [],
      sfg: [],
      file: [],
      materials: [],
    },
  ]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [uomRes, rmRes, sfgRes, locationRes] = await Promise.all([
          axios.get("/uoms/all-uoms?limit=1000"),
          axios.get("/rms/rm?limit=1000"),
          axios.get("/sfgs/get-all?limit=1000"),
          axios.get("/locations/get-all"),
        ]);

        setUoms(uomRes.data.data || []);
        setLocations(locationRes.data.data || []);

        const rawMaterials = (rmRes.data.rawMaterials || []).map((item) => ({
          ...item,
          type: "RM",
        }));
        const sfgItems = (sfgRes.data.data || []).map((item) => ({
          ...item,
          type: "SFG",
        }));
        setComponents([...rawMaterials, ...sfgItems]);
      } catch {
        toast.error("Failed to load dropdown data");
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (index, e) => {
    const updated = [...formList];
    const { name, value, files } = e.target;

    if (name === "file") {
      updated[index][name] = Array.from(files);
    } else {
      updated[index][name] = value;
    }

    setFormList(updated);
  };

  const handleMaterialChange = (index, matIndex, field, value) => {
    const updated = [...formList];
    updated[index].materials[matIndex][field] = value;
    setFormList(updated);
  };

  const addMaterial = (index) => {
    const updated = [...formList];
    updated[index].materials.push({ itemId: "", qty: "" });

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
        itemName: "",
        description: "",
        hsnOrSac: "",
        qualityInspectionNeeded: false,
        location: "",
        gst: "",
        type: "FG",
        UOM: "",
        rm: [],
        sfg: [],
        file: [],
        materials: [],
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = [...formList];
    updated.splice(index, 1);
    setFormList(updated);
  };

  useEffect(() => {
    if (formList.length > 1) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [formList.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();

      const transformedData = formList.map((item) => {
        const rm = [];
        const sfg = [];

        item.materials?.forEach((mat) => {
          const matched = components.find((c) => c.id == mat.itemId);

          if (!matched || !mat.qty) return;
          if (matched.type == "RM") {
            rm.push({ rmid: matched.id, qty: Number(mat.qty) });
          } else if (matched.type === "SFG") {
            sfg.push({ sfgid: matched.id, qty: Number(mat.qty) });
          }
        });

        return {
          ...item,
          rm,
          sfg,
          file: undefined,
          materials: undefined,
        };
      });
      console.log("transformed Data", transformedData);

      payload.append("fgs", JSON.stringify(transformedData));

      formList.forEach((item, i) => {
        if (Array.isArray(item.file)) {
          item.file.forEach((file) => {
            const renamed = new File([file], `${file.name}__index_${i}__`);
            payload.append("files", renamed);
          });
        }
      });

      await axios.post("/fgs/add-many", payload);
      toast.success("FGs added successfully");
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Item Name</label>
                  <input
                    type="text"
                    name="itemName"
                    placeholder="Item Name"
                    value={item.itemName}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">HSN/SAC</label>
                  <input
                    type="text"
                    name="hsnOrSac"
                    placeholder="HSN/SAC"
                    value={item.hsnOrSac}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">GST %</label>
                  <input
                    type="text"
                    name="gst"
                    placeholder="GST %"
                    value={item.gst}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">UOM</label>
                  <select
                    name="UOM"
                    value={item.UOM}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                    required
                  >
                    <option value="">Select UOM</option>
                    {uoms.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">
                    Quality Inspection
                  </label>
                  <select
                    name="qualityInspectionNeeded"
                    value={item.qualityInspectionNeeded}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                  >
                    <option value="">Select Quality Inspection</option>
                    <option value={true}>Required</option>
                    <option value={false}>Not-required</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Type</label>
                  <select
                    name="type"
                    value={item.type}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                  >
                    <option value="">Select Type</option>
                    <option value="FG">FG</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Location</label>
                  <select
                    name="location"
                    value={item.location}
                    onChange={(e) => handleChange(index, e)}
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
                  <label className="font-semibold mb-1">Upload Files</label>
                  <input
                    type="file"
                    name="file"
                    multiple
                    onChange={(e) => handleChange(index, e)}
                    className="w-full text-sm text-gray-600 cursor-pointer bg-white border border-[#d8b76a] rounded focus:outline-none focus:ring-1 focus:ring-[#d8b76a] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fdf6e9] file:text-[#292926] hover:file:bg-[#d8b76a]/10 file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-medium">Description</label>
                <textarea
                  name="description"
                  value={item.description}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Description (optional)"
                  className="w-full p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                />
              </div>

              <div>
                <p className="font-semibold mb-2">
                  List of Consumed Components
                </p>

                {item.materials.map((mat, matIndex) => (
                  <div
                    key={matIndex}
                    className="flex gap-2 mb-2 flex-wrap w-full items-center"
                  >
                    <div className="w-[65%]">
                      <label className="font-medium">Material</label>
                      <Select
                        value={
                          components
                            .map((c) => ({
                              value: c.id,
                              label: `${c.skuCode} - ${c.itemName} - ${c.description}`,
                            }))
                            .find((opt) => opt.value === mat.itemId) || null
                        }
                        onChange={(selected) =>
                          handleMaterialChange(
                            index,
                            matIndex,
                            "itemId",
                            selected?.value
                          )
                        }
                        options={[
                          {
                            label: "Raw Materials",
                            options: components
                              .filter((c) => c.type === "RM")
                              .map((c) => ({
                                value: c.id,
                                label: `${c.skuCode} - ${c.itemName} - ${c.description}`,
                              })),
                          },
                          {
                            label: "Semi-Finished Goods",
                            options: components
                              .filter((c) => c.type === "SFG")
                              .map((c) => ({
                                value: c.id,
                                label: `${c.skuCode} - ${c.itemName} - ${c.description}`,
                              })),
                          },
                        ]}
                        placeholder="Select RM/SFG"
                        isSearchable
                        styles={{
                          control: (base, state) => ({
                            ...base,
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
                          //   backgroundColor: state.isFocused
                          //     ? "#f3e6c0"
                          //     : "#fff",
                          //   color: "#292926",
                          // }),
                          singleValue: (base) => ({
                            ...base,
                            color: "#292926",
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
                          const input = inputValue
                            .replace(/\s+/g, "")
                            .toLowerCase();
                          return label.includes(input);
                        }}
                      />
                    </div>

                    <div className="flex flex-col  w-[10%]">
                      <label className="font-medium">Qty</label>
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
                        className="p-1.5 border border-[#d8b76a] rounded  focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMaterial(index, matIndex)}
                      className="text-red-600 cursor-pointer mt-5"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addMaterial(index)}
                  className="bg-[#d8b76a] hover:bg-[#d8b76a91] px-3 py-1 rounded flex items-center gap-1 mt-2 cursor-pointer"
                >
                  <FiPlus /> Add RM/SFG
                </button>
              </div>

              {formList.length > 1 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-600 hover:underline cursor-pointer"
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
              className="bg-[#d8b76a] px-4 py-2 rounded flex items-center gap-1 cursor-pointer"
            >
              <FiPlus /> Add FG
            </button>
          </div>

          <div className="flex justify-end gap-4 mt-6">
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
