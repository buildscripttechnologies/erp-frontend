// File: BulkRmPanel.jsx
import React, { useState, useEffect } from "react";
import { FiTrash2, FiArrowLeft, FiPlus } from "react-icons/fi";
import { RiResetRightLine } from "react-icons/ri";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

import Select from "react-select";

const BulkRmPanel = ({ onClose }) => {
  const [rows, setRows] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUoms = async () => {
    try {
      const res = await axios.get("/uoms/all-uoms");
      setUoms(res.data.data || []);
    } catch {
      toast.error("Failed to load UOMs");
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get("/locations/get-all");
      setLocations(res.data.data || []);
    } catch {
      toast.error("Failed to load Locations");
    }
  };

  useEffect(() => {
    fetchUoms();
    fetchLocations();
    addRow();
  }, []);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        itemName: "",
        description: "",
        itemCategory:"",
        itemColor:"",
        hsnOrSac: "",
        type: "RM",
        qualityInspectionNeeded: "Required",
        location: "",
        baseQty: "",
        pkgQty: "",
        moq: "",
        rate: "",
        totalRate: "",
        purchaseUOM: "",
        stockQty: 0,
        stockUOM: "",
        gst: "",
        attachments: [],
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      const rate = parseFloat(updated[index].rate) || 0;
      const stockQty = parseFloat(updated[index].stockQty) || 0;
      updated[index].totalRate = rate * stockQty;

      return updated;
    });
  };

  const handleFileChange = (index, files) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index].attachments = files;
      return updated;
    });
  };

  const handleRemove = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => setRows([]);

  const handleSubmit = async () => {
    if (rows.length === 0) return toast.error("Please add at least one row.");
    const hasMissingItemNames = rows.some((row) => !row.itemName?.trim());
    if (hasMissingItemNames) {
      return toast.error("All rows must have an Item Name.");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append(
      "rawMaterials",
      JSON.stringify(rows.map(({ attachments, ...rest }) => rest))
    );

    console.log("formdata", rows);

    rows.forEach((rm, i) => {
      Array.from(rm.attachments).forEach((file) => {
        const renamed = new File([file], `__index_${i}__${file.name}`, {
          type: file.type,
        });
        formData.append("attachments", renamed);
      });
    });

    try {
      const res = await axios.post("/rms/add-many-rm", formData);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.status === 200 || res.status === 201) {
        toast.success("Raw materials added successfully");
        setRows([]);
        onClose?.();
      } else {
        toast.error(res.data?.message || "Failed to add materials");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add materials");
    } finally {
      setLoading(false);
    }
  };
  const locationOptions = locations.map((l) => ({
    value: l.locationId,
    label: l.locationId,
  }));

  return (
    <div className="fixed inset-0  backdrop-blur-xs  flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-[92vw] sm:max-w-5xl rounded-lg  border border-[#d8b76a] overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-[#fdf6e9]">
        <div className="flex justify-between items-center sticky top-0 bg-white z-10 px-4 py-4">
          <h2 className="text-xl font-semibold">Add Raw Materials</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-red-500 font-bold text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Header Controls */}
        {/* <div className="flex justify-between mb-6">
          <button
            onClick={onClose}
            className="bg-[#d8b76a] text-[#292926] px-4 py-2 rounded flex items-center gap-2 hover:bg-[#d8b76a]/80"
          >
            <FiArrowLeft /> Back
          </button>
          <button
            onClick={handleReset}
            className="bg-[#d8b76a] text-[#292926] px-4 py-2 rounded flex items-center gap-2 hover:bg-[#d8b76a]/80"
          >
            <RiResetRightLine /> Reset
          </button>
        </div> */}

        {/* Form Rows */}
        <div className="space-y-6 px-6  ">
          {rows.map((rm, index) => (
            <div
              key={index}
              className="bg-white border border-[#d8b76a] rounded-lg p-4 space-y-4 shadow-md"
            >
              <h2 className="text-[15px] font-semibold text-[#292926] mb-1">
                Item {index + 1}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Item Name
                  </label>
                  <input
                    placeholder="Item Name"
                    value={rm.itemName}
                    onChange={(e) =>
                      handleChange(index, "itemName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Description
                  </label>
                  <input
                    placeholder="Description"
                    value={rm.description}
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Item Category
                  </label>
                  <input
                    placeholder="Item Category"
                    value={rm.itemCategory}
                    onChange={(e) =>
                      handleChange(index, "itemCategory", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Item Color
                  </label>
                  <input
                    placeholder="Item Color"
                    value={rm.itemColor}
                    onChange={(e) =>
                      handleChange(index, "itemColor", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    HSN/SAC
                  </label>
                  <input
                    placeholder="HSN/SAC"
                    value={rm.hsnOrSac}
                    onChange={(e) =>
                      handleChange(index, "hsnOrSac", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Quality Inspection
                  </label>
                  <select
                    value={rm.qualityInspectionNeeded}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "qualityInspectionNeeded",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  >
                    <option>Required</option>
                    <option>Not Required</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Location
                  </label>
                  <Select
                    options={locationOptions}
                    value={
                      locationOptions.find(
                        (opt) => opt.value === rm.location
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      handleChange(
                        index,
                        "location",
                        selectedOption?.value || ""
                      )
                    }
                    placeholder="Select Location"
                    isSearchable
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: "#d8b76a",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px #b38a37"
                          : "none",
                        "&:hover": {
                          borderColor: "#b38a37",
                        },
                        padding: "2px",
                        fontSize: "0.875rem", // text-sm
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Base Qty
                  </label>
                  <input
                    type="number"
                    placeholder="Base Qty"
                    value={rm.baseQty}
                    onChange={(e) =>
                      handleChange(index, "baseQty", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Pkg Qty
                  </label>
                  <input
                    type="number"
                    placeholder="Pkg Qty"
                    value={rm.pkgQty}
                    onChange={(e) =>
                      handleChange(index, "pkgQty", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    MOQ
                  </label>
                  <input
                    type="number"
                    placeholder="MOQ"
                    value={rm.moq}
                    onChange={(e) => handleChange(index, "moq", e.target.value)}
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Rate
                  </label>
                  <input
                    type="number"
                    placeholder="Rate"
                    value={rm.rate}
                    onChange={(e) =>
                      handleChange(index, "rate", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Purchase UOM
                  </label>
                  <select
                    value={rm.purchaseUOM}
                    onChange={(e) =>
                      handleChange(index, "purchaseUOM", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  >
                    <option value="">Select UOM</option>
                    {uoms.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    GST %
                  </label>
                  <input
                    type="number"
                    placeholder="GST %"
                    value={rm.gst}
                    onChange={(e) => handleChange(index, "gst", e.target.value)}
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Stock Qty
                  </label>
                  <input
                    disabled
                    type="number"
                    placeholder="Stock Qty"
                    value={rm.stockQty}
                    onChange={(e) =>
                      handleChange(index, "stockQty", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Stock UOM
                  </label>
                  <select
                    value={rm.stockUOM}
                    onChange={(e) =>
                      handleChange(index, "stockUOM", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
                  >
                    <option value="">Select UOM</option>
                    {uoms.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-red-600">
                    Total Rate
                  </label>
                  <div className="w-full px-4 py-2 text-red-600 border border-red-600 rounded bg-gray-50">
                    ₹ {parseFloat(rm.totalRate || 0).toFixed(2)}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#292926]">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(index, e.target.files)}
                  className=" block w-full text-sm text-gray-600 cursor-pointer bg-white border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37] file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fdf6e9] file:text-[#292926] hover:file:bg-[#d8b76a]/10 file:cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-1 items-center text-red-600 ">
                <span
                  onClick={() => handleRemove(index)}
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <FiTrash2 className="text-red-500 hover:text-red-700 cursor-pointer text-xl" />
                  Remove
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex justify-end gap-4 p-6">
          <button
            onClick={addRow}
            className="bg-[#d8b76a] text-[#292926] px-4 py-2 rounded flex items-center gap-2 hover:bg-[#d8b76a]/80 cursor-pointer"
          >
            <FiPlus /> Add Row
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#d8b76a] text-[#292926] px-4 py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span>Saving...</span>
                <ClipLoader size={18} color="#292926" />
              </div>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkRmPanel;
