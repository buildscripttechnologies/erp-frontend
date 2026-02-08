// File: BulkRmPanel.jsx
import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import { FiTrash2, FiArrowLeft, FiPlus, FiX, FiSave, FiEye } from "react-icons/fi";
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
  const [previewModal, setPreviewModal] = useState({ open: false, images: [], currentIndex: 0 });
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Clean Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
              <FiPlus className="text-black text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">Add Raw Materials</h2>
              <p className="text-black/70 text-xs">{rows.length} item{rows.length !== 1 ? 's' : ''} added</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-black/10 rounded-xl text-black/80 hover:text-black transition-all"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <FiPlus className="text-3xl text-gray-300" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-1">No items yet</p>
              <p className="text-sm text-gray-400 mb-5">Add your first raw material item</p>
              <button
                onClick={addRow}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-all"
              >
                <FiPlus /> Add First Item
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((rm, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Item Header Bar */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{rm.itemName || 'Untitled Item'}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {rm.skuCode && <span>SKU: {rm.skuCode}</span>}
                          {rm.itemCategory && <span className="text-primary">• {rm.itemCategory}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(index)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  {/* Form Grid */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
                      {/* Basic Info Section */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">SKU Code</label>
                        <input
                          value={rm.skuCode}
                          onChange={(e) => handleChange(index, "skuCode", e.target.value)}
                          placeholder="RM-001"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Item Name <span className="text-red-500">*</span></label>
                        <input
                          value={rm.itemName}
                          onChange={(e) => handleChange(index, "itemName", e.target.value)}
                          placeholder="Enter item name"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                        <input
                          value={rm.description}
                          onChange={(e) => handleChange(index, "description", e.target.value)}
                          placeholder="Item description"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                        <select
                          value={rm.itemCategory}
                          onChange={(e) => handleChange(index, "itemCategory", e.target.value)}
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10"
                        >
                          <option value="">Select Category</option>
                          {categories?.map((cat, i) => (
                            <option key={i} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Color</label>
                        <input
                          value={rm.itemColor}
                          onChange={(e) => handleChange(index, "itemColor", e.target.value)}
                          placeholder="e.g. Red"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">HSN/SAC</label>
                        <input
                          value={rm.hsnOrSac}
                          onChange={(e) => handleChange(index, "hsnOrSac", e.target.value)}
                          placeholder="HSN Code"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">GST %</label>
                        <input
                          value={rm.gst}
                          onChange={(e) => handleChange(index, "gst", e.target.value)}
                          placeholder="18"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Quality Inspection</label>
                        <select
                          value={rm.qualityInspectionNeeded}
                          onChange={(e) => handleChange(index, "qualityInspectionNeeded", e.target.value)}
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10"
                        >
                          <option>Required</option>
                          <option>Not Required</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Location</label>
                        <Select
                          options={locationOptions}
                          value={locationOptions.find((opt) => opt.value === rm.location) || null}
                          onChange={(selectedOption) => handleChange(index, "location", selectedOption?.value || "")}
                          placeholder="Select Location"
                          isSearchable
                          classNamePrefix="react-select"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              backgroundColor: 'var(--select-bg, #fff)',
                              borderColor: state.isFocused ? '#d8b76a' : 'var(--select-border, #e5e7eb)',
                              borderRadius: '0.5rem',
                              boxShadow: state.isFocused ? '0 0 0 2px rgba(216, 183, 106, 0.2)' : 'none',
                              height: '38px',
                              minHeight: '38px',
                              fontSize: '0.875rem',
                              '&:hover': { borderColor: '#d8b76a' },
                            }),
                            valueContainer: (base) => ({ ...base, padding: '0 12px', height: '36px' }),
                            input: (base) => ({ ...base, margin: 0, padding: 0, color: 'var(--select-text, #374151)' }),
                            singleValue: (base) => ({ ...base, color: 'var(--select-text, #374151)' }),
                            placeholder: (base) => ({ ...base, color: 'var(--select-placeholder, #9ca3af)' }),
                            indicatorSeparator: () => ({ display: 'none' }),
                            dropdownIndicator: (base) => ({ ...base, padding: '8px', color: 'var(--select-indicator, #6b7280)' }),
                            menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '0.5rem', backgroundColor: 'var(--select-bg, #fff)' }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isSelected ? '#d8b76a' : state.isFocused ? 'var(--select-option-hover, #fef3c7)' : 'var(--select-bg, #fff)',
                              color: state.isSelected ? '#fff' : 'var(--select-text, #374151)',
                              cursor: 'pointer',
                            }),
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Base Qty</label>
                        <input
                          type="number"
                          value={rm.baseQty}
                          onChange={(e) => handleChange(index, "baseQty", e.target.value)}
                          placeholder="0"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Pkg Qty</label>
                        <input
                          type="number"
                          value={rm.pkgQty}
                          onChange={(e) => handleChange(index, "pkgQty", e.target.value)}
                          placeholder="0"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">MOQ</label>
                        <input
                          type="number"
                          value={rm.moq}
                          onChange={(e) => handleChange(index, "moq", e.target.value)}
                          placeholder="0"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Rate (₹)</label>
                        <input
                          type="number"
                          value={rm.rate}
                          onChange={(e) => handleChange(index, "rate", e.target.value)}
                          placeholder="0.00"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Purchase UOM</label>
                        <select
                          value={rm.purchaseUOM}
                          onChange={(e) => handleChange(index, "purchaseUOM", e.target.value)}
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10"
                        >
                          <option value="">Select UOM</option>
                          {uoms.map((u) => (
                            <option key={u._id} value={u._id}>{u.unitName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Stock Qty</label>
                        <input
                          type="number"
                          value={rm.stockQty ?? 0}
                          onChange={(e) => handleChange(index, "stockQty", e.target.value === "" ? 0 : Number(e.target.value))}
                          placeholder="0"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Stock UOM</label>
                        <select
                          value={rm.stockUOM}
                          onChange={(e) => handleChange(index, "stockUOM", e.target.value)}
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10"
                        >
                          <option value="">Select UOM</option>
                          {uoms.map((u) => (
                            <option key={u._id} value={u._id}>{u.unitName}</option>
                          ))}
                        </select>
                      </div>

                      {/* Fabric Fields */}
                      {fabric.includes(rm.itemCategory.toLowerCase()) && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Panno</label>
                            <input
                              type="number"
                              value={rm.panno}
                              onChange={(e) => handleChange(index, "panno", e.target.value)}
                              placeholder="0"
                              className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">SqInch Rate</label>
                            <input
                              type="number"
                              value={rm.sqInchRate}
                              onChange={(e) => handleChange(index, "sqInchRate", e.target.value)}
                              placeholder="0"
                              className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>
                        </>
                      )}

                      {/* Total Rate */}
                      <div>
                        <label className="block text-xs font-medium text-primary mb-1.5">Total Rate</label>
                        <div className="h-[38px] px-3 flex items-center text-sm font-semibold text-primary bg-primary/10 border border-primary/30 rounded-lg">
                          ₹ {parseFloat(rm.totalRate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Attachments */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Attachments</label>
                        <div className="flex items-center h-[38px] border border-gray-200 rounded-lg bg-white">
                          <label className="flex items-center h-full px-3 cursor-pointer hover:bg-gray-50 transition-all flex-1">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded">Choose files</span>
                            <span className="ml-3 text-sm text-gray-400">
                              {rm.attachments?.length > 0 ? `${rm.attachments.length} file(s)` : 'No file chosen'}
                            </span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleFileChange(index, e.target.files)}
                              className="hidden"
                            />
                          </label>
                          {rm.attachments?.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const imageFiles = Array.from(rm.attachments).filter(file => file.type.startsWith('image/'));
                                if (imageFiles.length > 0) {
                                  const imageUrls = imageFiles.map(file => URL.createObjectURL(file));
                                  setPreviewModal({ open: true, images: imageUrls, currentIndex: 0 });
                                } else {
                                  toast.error('No image files to preview');
                                }
                              }}
                              className="h-full px-3 border-l border-gray-200 text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5"
                            >
                              <FiEye className="text-base" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clean Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary dark:bg-primary/30 text-secondary dark:text-primary dark:border dark:border-primary rounded-xl font-semibold text-sm hover:bg-primary/90 dark:hover:bg-primary/40 shadow-sm hover:shadow-md transition-all"
          >
            <FiPlus />
            Add Item
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || rows.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Saving... <BeatLoader size={5} color="#fff" /></>
              ) : (
                <><FiSave /> Save All</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">
                Image Preview ({previewModal.currentIndex + 1} / {previewModal.images.length})
              </h3>
              <button
                onClick={() => {
                  previewModal.images.forEach(url => URL.revokeObjectURL(url));
                  setPreviewModal({ open: false, images: [], currentIndex: 0 });
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
              >
                <FiX className="text-lg" />
              </button>
            </div>
            
            {/* Image Display */}
            <div className="p-5 bg-gray-50">
              <div className="relative flex items-center justify-center min-h-[300px] max-h-[60vh]">
                <img
                  src={previewModal.images[previewModal.currentIndex]}
                  alt={`Preview ${previewModal.currentIndex + 1}`}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* Navigation */}
            {previewModal.images.length > 1 && (
              <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-gray-100">
                <button
                  onClick={() => setPreviewModal(prev => ({
                    ...prev,
                    currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
                  }))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all"
                >
                  ← Previous
                </button>
                <div className="flex gap-1.5">
                  {previewModal.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewModal(prev => ({ ...prev, currentIndex: idx }))}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === previewModal.currentIndex ? 'bg-primary scale-110' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setPreviewModal(prev => ({
                    ...prev,
                    currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1
                  }))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all"
                >
                  Next →
                </button>
              </div>
            )}

            {/* Thumbnails */}
            {previewModal.images.length > 1 && (
              <div className="px-5 pb-5">
                <div className="flex gap-2 overflow-x-auto py-2">
                  {previewModal.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewModal(prev => ({ ...prev, currentIndex: idx }))}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === previewModal.currentIndex ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkRmPanel;
