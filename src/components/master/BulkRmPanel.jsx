// File: BulkRmPanel.jsx
import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import { FiTrash2, FiArrowLeft, FiPlus, FiX, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

import Select from "react-select";
import { useCategoryArrays } from "../../data/dropdownData";
import { useCategories } from "../../context/CategoryContext";

const BulkRmPanel = ({ onClose }) => {
  const [rows, setRows] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState();
  const { fabric, slider, plastic, zipper } = useCategoryArrays();

  const { gstTable } = useCategories();

  // console.log("gst table", gstTable);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/settings/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

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
    fetchCategories();
    addRow();
  }, []);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        skuCode: "",
        itemName: "",
        description: "",
        itemCategory: "",
        itemColor: "",
        hsnOrSac: "",
        type: "RM",
        qualityInspectionNeeded: "Required",
        location: "",
        baseQty: "",
        pkgQty: "",
        moq: "",
        panno: "",
        sqInchRate: "",
        baseRate: "",
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

      // const baseRate = updated[index].baseRate || 0;
      // const gst = updated[index].gst || 0;

      // if (baseRate && gst) {
      //   updated[index].rate = Number(baseRate) + (gst * baseRate) / 100;
      // }

      // const hsnOrSac = updated[index].hsnOrSac;

      // if (hsnOrSac) {
      //   const gst = gstTable.find((g) => g.hsn === hsnOrSac);
      //   updated[index].gst = gst ? gst.gst : "";
      // }

      const rate = parseFloat(updated[index].rate) || 0;
      const stockQty = parseFloat(updated[index].stockQty) || 0;
      updated[index].totalRate = rate * stockQty;

      const category = (updated[index].itemCategory || "").toLowerCase();
      const panno = parseFloat(updated[index].panno) || 0;

      // Determine fabricRate
      const fabricRate = category.includes("cotton") || category.includes("canvas") ? 38 : 39;
      // const fabricRate = 39;

      console.log("fabric rate", fabricRate);

      // Recalculate sqInchRate if category contains fabric/cotton/canvas
      if (rate && panno && fabric.includes(category)) {
        updated[index].sqInchRate = Number((rate / panno / fabricRate) /**1.05*/);
      } else {
        updated[index].sqInchRate = 0;
      }

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white w-full max-w-[95vw] sm:max-w-[92vw] sm:max-w-5xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-primary to-primary/90 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-primary/20 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1 h-6 sm:h-8 bg-secondary rounded-full"></div>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary">
              Add Raw Materials
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-secondary/10 rounded-lg transition-colors text-secondary hover:text-red-600"
            title="Close"
          >
            <FiX className="text-lg sm:text-xl" />
          </button>
        </div>

        <div className="overflow-y-auto rm-modal-scrollbar flex-1">

        {/* Header Controls */}
        {/* <div className="flex justify-between mb-6">
          <button
            onClick={onClose}
            className="bg-primary text-[#292926] px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80"
          >
            <FiArrowLeft /> Back
          </button>
          <button
            onClick={handleReset}
            className="bg-primary text-[#292926] px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80"
          >
            <RiResetRightLine /> Reset
          </button>
        </div> */}

        {/* Form Rows */}
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
          {rows.map((rm, index) => (
            <div
              key={index}
              className="bg-white border-2 border-primary/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-2 pb-2 sm:pb-3 border-b border-gray-200">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1 h-4 sm:h-6 bg-primary rounded-full"></div>
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-secondary">
                    Item {index + 1}
                  </h2>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-red-600 hover:bg-red-50 rounded-md sm:rounded-lg transition-colors font-medium text-xs sm:text-sm"
                >
                  <FiTrash2 className="text-sm sm:text-base" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Sku Code
                  </label>
                  <input
                    required
                    placeholder="Sku Code"
                    value={rm.skuCode}
                    onChange={(e) =>
                      handleChange(index, "skuCode", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Item Name
                  </label>
                  <input
                    placeholder="Item Name"
                    value={rm.itemName}
                    onChange={(e) =>
                      handleChange(index, "itemName", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Description
                  </label>
                  <input
                    placeholder="Description"
                    value={rm.description}
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Item Category
                  </label>
                  <select
                    value={rm.itemCategory}
                    onChange={(e) =>
                      handleChange(index, "itemCategory", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat, i) => (
                      <option key={i} value={cat.name}>
                        {cat.name} ({cat.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Item Color
                  </label>
                  <input
                    placeholder="Item Color"
                    value={rm.itemColor}
                    onChange={(e) =>
                      handleChange(index, "itemColor", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    HSN/SAC
                  </label>
                  <input
                    placeholder="HSN/SAC"
                    value={rm.hsnOrSac}
                    onChange={(e) =>
                      handleChange(index, "hsnOrSac", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    GST %
                  </label>
                  <input
                    placeholder="GST %"
                    value={rm.gst}
                    onChange={(e) => handleChange(index, "gst", e.target.value)}
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                {/* <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    HSN/SAC
                  </label>

                  <select
                    value={rm.hsnOrSac}
                    onChange={(e) =>
                      handleChange(index, "hsnOrSac", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select HSN</option>
                    {gstTable?.map((cat, i) => (
                      <option key={i} value={cat.hsn}>
                        {cat.hsn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    GST %
                  </label>

                  <select
                    value={rm.gst}
                    onChange={(e) => handleChange(index, "gst", e.target.value)}
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select GST</option>
                    {gstTable?.map((cat, i) => (
                      <option key={i} value={cat.gst}>
                        {cat.gst}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
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
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer transition-all"
                  >
                    <option>Required</option>
                    <option>Not Required</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
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
                        borderWidth: "2px",
                        borderRadius: "0.5rem",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px rgba(216, 183, 106, 0.2)"
                          : "none",
                        "&:hover": {
                          borderColor: "#d8b76a",
                        },
                        padding: "2px",
                        fontSize: "0.875rem",
                        minHeight: "38px",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        borderRadius: "0.5rem",
                      }),
                    }}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Base Qty
                  </label>
                  <input
                    type="number"
                    placeholder="Base Qty"
                    value={rm.baseQty}
                    onChange={(e) =>
                      handleChange(index, "baseQty", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Pkg Qty
                  </label>
                  <input
                    type="number"
                    placeholder="Pkg Qty"
                    value={rm.pkgQty}
                    onChange={(e) =>
                      handleChange(index, "pkgQty", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    MOQ
                  </label>
                  <input
                    type="number"
                    placeholder="MOQ"
                    value={rm.moq}
                    onChange={(e) => handleChange(index, "moq", e.target.value)}
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                {/* <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Base Rate
                  </label>
                  <input
                    type="number"
                    placeholder="Base Rate"
                    value={rm.baseRate}
                    onChange={(e) =>
                      handleChange(index, "baseRate", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div> */}
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Rate
                  </label>
                  <input
                    type="number"
                    placeholder="Rate"
                    value={rm.rate}
                    onChange={(e) =>
                      handleChange(index, "rate", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Purchase UOM
                  </label>
                  <select
                    value={rm.purchaseUOM}
                    onChange={(e) =>
                      handleChange(index, "purchaseUOM", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer transition-all"
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
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Stock Qty
                  </label>
                  <input
                    // disabled
                    type="number"
                    placeholder="Stock Qty"
                    value={rm.stockQty ?? 0} // fallback to 0 if null/undefined
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange(
                        index,
                        "stockQty",
                        val === "" ? 0 : Number(val)
                      );
                    }}
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                    Stock UOM
                  </label>
                  <select
                    value={rm.stockUOM}
                    onChange={(e) =>
                      handleChange(index, "stockUOM", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer transition-all"
                  >
                    <option value="">Select UOM</option>
                    {uoms.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </div>
                {fabric.includes(rm.itemCategory.toLowerCase()) && (
                  <>
                    <div>
                      <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                        Panno
                      </label>
                      <input
                        type="number"
                        placeholder="Panno"
                        value={rm.panno}
                        onChange={(e) =>
                          handleChange(index, "panno", e.target.value)
                        }
                        className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                        SqInch Rate
                      </label>
                      <input
                        type="number"
                        placeholder="SqInch Rate"
                        value={rm.sqInchRate}
                        onChange={(e) =>
                          handleChange(index, "sqInchRate", e.target.value)
                        }
                        className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-red-600 mb-1 sm:mb-1.5 block">
                    Total Rate
                  </label>
                  <div className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-700 font-bold border-2 border-red-300 rounded-md sm:rounded-lg bg-gradient-to-r from-red-50 to-red-100">
                    ₹ {parseFloat(rm.totalRate || 0).toFixed(2)}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] sm:text-xs font-semibold text-[#292926] mb-1 sm:mb-1.5 block">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(index, e.target.files)}
                  className="block w-full text-xs sm:text-sm text-gray-600 cursor-pointer bg-white border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2.5 file:px-2 sm:file:px-4 file:rounded-md sm:file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary/10 file:text-secondary hover:file:bg-primary/20 file:cursor-pointer transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={addRow}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-primary hover:bg-primary/90 text-secondary rounded-lg flex items-center justify-center gap-2 font-semibold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FiPlus className="text-sm sm:text-base" /> 
            <span>Add Row</span>
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-secondary rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-primary hover:bg-primary/90 text-secondary rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span>Saving...</span>
                  <BeatLoader size={5} color="#292926" />
                </>
              ) : (
                <>
                  <FiSave className="text-sm sm:text-base" />
                  <span className="hidden sm:inline">Save All</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkRmPanel;
