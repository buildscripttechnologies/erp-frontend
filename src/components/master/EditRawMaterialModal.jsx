import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import Select from "react-select";
import { BeatLoader } from "react-spinners";
import { FiX, FiSave, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { useCategoryArrays } from "../../data/dropdownData";
const EditRawMaterialModal = ({
  rawMaterial = [],
  onClose,
  onUpdated,
  uoms,
}) => {
  const [formData, setFormData] = useState(rawMaterial);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [deletedAttachments, setDeletedAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);
  const [categories, setCategories] = useState();
  const [previewModal, setPreviewModal] = useState({ open: false, images: [], currentIndex: 0 });
  const { fabric } = useCategoryArrays();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/settings/categories");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get("/locations/get-all");
        setLocations(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load Locations");
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (field, value) => {
    const updatedForm = {
      ...formData,
      [field]: value,
    };

    if (field === "rate" || field === "stockQty") {
      const stockQty = Number(
        field === "stockQty" ? value : updatedForm.stockQty
      );
      const rate = Number(field === "rate" ? value : updatedForm.rate);
      updatedForm.totalRate = (stockQty * rate).toFixed(2);
    }

    const rate = parseFloat(updatedForm.rate) || 0;
    const stockQty = parseFloat(updatedForm.stockQty) || 0;
    updatedForm.totalRate = rate * stockQty;

    const category = (updatedForm.itemCategory || "").toLowerCase();
    const panno = parseFloat(updatedForm.panno) || 0;

    // Determine fabricRate
    const fabricRate =
      category.includes("cotton") || category.includes("canvas") ? 38 : 39;

    // Recalculate sqInchRate if category contains fabric/cotton/canvas
    if (rate && panno && fabric.includes(category)) {
      updatedForm.sqInchRate = Number((rate / panno / fabricRate) * 1.05);
    } else {
      updatedForm.sqInchRate = 0;
    }

    setFormData(updatedForm);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { attachments, ...rest } = formData;
    try {
      const payload = {
        ...rest,
        deletedAttachments: deletedAttachments, // list of attachment _ids to delete
      };

      const form = new FormData();
      form.append("data", JSON.stringify(payload));
      newAttachments.forEach((file) => {
        form.append("attachments", file);
      });

      const res = await axios.patch(`/rms/edit-rm/${formData.id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.status == 403) {
        toast.error(res.data.message);
        onUpdated();
        onClose();
        return;
      }

      if (res.status === 200) {
        toast.success("Raw material updated");
        onUpdated();
        onClose();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Unexpected error");
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
        {/* Header - matching Add modal */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <FiEdit className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Raw Material</h2>
              <p className="text-white/60 text-xs">Update material information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/15 rounded-xl text-white/70 hover:text-white transition-all"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-5 rm-modal-scrollbar">
          <form onSubmit={handleUpdate}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Item Header Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    <FiEdit className="text-sm" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{formData.itemName || 'Untitled Item'}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {formData.skuCode && <span>SKU: {formData.skuCode}</span>}
                      {formData.itemCategory && <span className="text-primary">• {formData.itemCategory}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
                  {/* Basic Info Section */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">SKU Code</label>
                    <input
                      disabled
                      value={formData.skuCode}
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Item Name <span className="text-red-500">*</span></label>
                    <input
                      value={formData.itemName}
                      onChange={(e) => handleChange("itemName", e.target.value)}
                      placeholder="Enter item name"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                    <input
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Item description"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                    <select
                      value={formData.itemCategory}
                      onChange={(e) => handleChange("itemCategory", e.target.value)}
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
                      value={formData.itemColor}
                      onChange={(e) => handleChange("itemColor", e.target.value)}
                      placeholder="e.g. Red"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">HSN/SAC</label>
                    <input
                      value={formData.hsnOrSac}
                      onChange={(e) => handleChange("hsnOrSac", e.target.value)}
                      placeholder="HSN Code"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">GST %</label>
                    <input
                      value={formData.gst}
                      onChange={(e) => handleChange("gst", e.target.value)}
                      placeholder="18"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
                    <input
                      value={formData.type}
                      onChange={(e) => handleChange("type", e.target.value)}
                      placeholder="RM"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Quality Inspection</label>
                    <select
                      value={formData.qualityInspectionNeeded ? "Required" : "Not Required"}
                      onChange={(e) => handleChange("qualityInspectionNeeded", e.target.value === "Required")}
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
                      value={locationOptions.find((opt) => opt.value === formData.location) || null}
                      onChange={(selectedOption) => handleChange("location", selectedOption?.value || "")}
                      placeholder="Select Location"
                      isSearchable
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          backgroundColor: '#fff',
                          borderColor: state.isFocused ? '#d8b76a' : '#e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: state.isFocused ? '0 0 0 2px rgba(216, 183, 106, 0.2)' : 'none',
                          height: '38px',
                          minHeight: '38px',
                          fontSize: '0.875rem',
                          '&:hover': { borderColor: '#d8b76a' },
                        }),
                        valueContainer: (base) => ({ ...base, padding: '0 12px', height: '36px' }),
                        input: (base) => ({ ...base, margin: 0, padding: 0 }),
                        indicatorSeparator: () => ({ display: 'none' }),
                        dropdownIndicator: (base) => ({ ...base, padding: '8px', color: '#6b7280' }),
                        menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '0.5rem' }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected ? '#d8b76a' : state.isFocused ? '#fef3c7' : '#fff',
                          color: state.isSelected ? '#fff' : '#374151',
                          cursor: 'pointer',
                        }),
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Base Qty</label>
                    <input
                      type="number"
                      value={formData.baseQty}
                      onChange={(e) => handleChange("baseQty", e.target.value)}
                      placeholder="0"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Pkg Qty</label>
                    <input
                      type="number"
                      value={formData.pkgQty}
                      onChange={(e) => handleChange("pkgQty", e.target.value)}
                      placeholder="0"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">MOQ</label>
                    <input
                      type="number"
                      value={formData.moq}
                      onChange={(e) => handleChange("moq", e.target.value)}
                      placeholder="0"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Rate (₹)</label>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => handleChange("rate", e.target.value)}
                      placeholder="0.00"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Purchase UOM</label>
                    <select
                      value={formData.purchaseUOM}
                      onChange={(e) => handleChange("purchaseUOM", e.target.value)}
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10"
                    >
                      <option value="">Select UOM</option>
                      {uoms.map((u) => (
                        <option key={u._id} value={u.unitName}>{u.unitName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Stock Qty</label>
                    <input
                      type="number"
                      value={formData.stockQty ?? 0}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleChange("stockQty", val === "" ? 0 : Number(val));
                      }}
                      placeholder="0"
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Stock UOM</label>
                    <select
                      value={formData.stockUOM}
                      onChange={(e) => handleChange("stockUOM", e.target.value)}
                      className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10"
                    >
                      <option value="">Select UOM</option>
                      {uoms.map((u) => (
                        <option key={u._id} value={u.unitName}>{u.unitName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Fabric Fields */}
                  {fabric.includes(formData.itemCategory?.toLowerCase()) && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Panno</label>
                        <input
                          type="number"
                          value={formData.panno}
                          onChange={(e) => handleChange("panno", e.target.value)}
                          placeholder="0"
                          className="w-full h-[38px] px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">SqInch Rate</label>
                        <input
                          type="number"
                          value={formData.sqInchRate}
                          onChange={(e) => handleChange("sqInchRate", e.target.value)}
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
                      ₹ {(Number(formData.stockQty) * Number(formData.rate) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Attachments</label>
                    
                    {/* Existing Attachments */}
                    {formData.attachments?.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {formData.attachments?.map((att, index) =>
                          !deletedAttachments.includes(att._id) ? (
                            <div
                              key={index}
                              className="flex items-center justify-between h-[38px] px-3 border border-gray-200 rounded-lg bg-white group"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const validAttachments = formData.attachments.filter(
                                    (a) => !deletedAttachments.includes(a._id)
                                  );
                                  const imageUrls = validAttachments.map((a) => a.fileUrl);
                                  const currentIdx = validAttachments.findIndex((a) => a._id === att._id);
                                  setPreviewModal({ open: true, images: imageUrls, currentIndex: currentIdx >= 0 ? currentIdx : 0 });
                                }}
                                className="text-sm text-primary hover:underline truncate flex-1 flex items-center gap-2 text-left"
                              >
                                <FiEye className="text-gray-400" />
                                {att.fileName}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletedAttachments((prev) => [...prev, att._id])}
                                className="ml-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <FiTrash2 className="text-sm" />
                              </button>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}

                    {/* Upload New */}
                    <div className="flex items-center h-[38px] border border-gray-200 rounded-lg bg-white">
                      <label className="flex items-center h-full px-3 cursor-pointer hover:bg-gray-50 transition-all flex-1">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded">Choose files</span>
                        <span className="ml-3 text-sm text-gray-400">
                          {newAttachments?.length > 0 ? `${newAttachments.length} file(s) selected` : 'Add new files'}
                        </span>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => setNewAttachments(Array.from(e.target.files))}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {newAttachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {newAttachments.map((file, i) => (
                          <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - matching Add modal */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end items-center shrink-0 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>Updating... <BeatLoader size={5} color="#fff" /></>
            ) : (
              <><FiSave /> Update Material</>
            )}
          </button>
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
                onClick={() => setPreviewModal({ open: false, images: [], currentIndex: 0 })}
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

export default EditRawMaterialModal;
