import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import Select from "react-select";
import { BeatLoader } from "react-spinners";
import { FiX, FiSave } from "react-icons/fi";
import { useCategoryArrays } from "../../data/dropdownData";
import { useCategories } from "../../context/CategoryContext";
const EditRawMaterialModal = ({
  rawMaterial = [],
  onClose,
  onUpdated,
  uoms,
}) => {
  const [formData, setFormData] = useState(rawMaterial);
  const [loading, setLoading] = useState(false);
  // const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [deletedAttachments, setDeletedAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);
  const [categories, setCategories] = useState();
  const { fabric, slider, plastic, zipper } = useCategoryArrays();

  const { gstTable } = useCategories();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // setLoading(true);
        const res = await axios.get("/settings/categories");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch categories");
      } finally {
        // setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get("/locations/get-all"); // your UOM endpoint
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

    // const baseRate = updatedForm.baseRate || 0;
    // const gst = updatedForm.gst || 0;

    // if (baseRate && gst) {
    //   updatedForm.rate = Number(baseRate) + (gst * baseRate) / 100;
    // }

    // const hsnOrSac = updatedForm.hsnOrSac;

    // if (hsnOrSac) {
    //   const gst = gstTable.find((g) => g.hsn === hsnOrSac);
    //   updatedForm.gst = gst ? gst.gst : ""; // Updated to use updatedForm instead of updated[index]
    // }

    // Update totalRate if rate or stockQty changes
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white w-full max-w-[95vw] sm:max-w-[92vw] sm:max-w-2xl md:max-w-5xl rounded-xl sm:rounded-2xl shadow-2xl border-2 border-primary/30 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Distinct Header Design */}
        <div className="bg-white px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 flex items-center justify-between border-b-2 border-primary/20 relative">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary">
                Edit Raw Material
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">Update material information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-600"
            title="Close"
          >
            <FiX className="text-lg sm:text-xl" />
          </button>
        </div>

        <div className="overflow-y-auto rm-modal-scrollbar flex-1 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 bg-gradient-to-b from-gray-50/50 to-white">
        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 text-xs sm:text-sm text-[#292926]"
        >
          {/* Item Name */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">Sku Code</label>
            <input
              disabled
              type="text"
              value={formData.skuCode}
              onChange={(e) => handleChange("skuCode", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed transition-all"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Item Name
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => handleChange("itemName", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
              required
            />
          </div>
          {/* Description */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Description
            </label>
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Item Category
            </label>
            <select
              value={formData.itemCategory}
              onChange={(e) => handleChange("itemCategory", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50 cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories?.map((cat, i) => (
                <option key={i} value={cat.name}>
                  {cat.name} ({cat.type})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Item Color
            </label>
            <input
              type="text"
              placeholder="Item Color"
              value={formData.itemColor}
              onChange={(e) => handleChange("itemColor", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              HSN / SAC
            </label>
            <input
              type="text"
              placeholder="HSN / SAC"
              value={formData.hsnOrSac}
              onChange={(e) => handleChange("hsnOrSac", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">GST (%)</label>
            <input
              type="text"
              placeholder="GST (%)"
              value={formData.gst}
              onChange={(e) => handleChange("gst", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
            />
          </div>
          {/* HSN/SAC */}
          {/* <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
              HSN / SAC
            </label>

            <select
              value={formData.hsnOrSac}
              onChange={(e) => handleChange("hsnOrSac", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select HSN</option>
              {gstTable?.map((cat, i) => (
                <option key={i} value={cat.hsn}>
                  {cat.hsn}
                </option>
              ))}
            </select>
          </div> */}

          {/* GST */}
          {/* <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">GST (%)</label>

            <select
              value={formData.gst}
              onChange={(e) => handleChange("gst", e.target.value)}
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
          {/* Type */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
            />
          </div>
          {/* Quality Inspection */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Quality Inspection
            </label>
            <select
              value={
                formData.qualityInspectionNeeded ? "Required" : "Not Required"
              }
              onChange={(e) =>
                handleChange(
                  "qualityInspectionNeeded",
                  e.target.value === "Required"
                )
              }
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50 cursor-pointer"
            >
              <option>Required</option>
              <option>Not Required</option>
            </select>
          </div>
          {/* Location */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">Location</label>
            <Select
              options={locationOptions}
              value={
                locationOptions.find(
                  (opt) => opt.value === formData.location
                ) || null
              }
              onChange={(selectedOption) =>
                handleChange("location", selectedOption?.value || "")
              }
              placeholder="Select"
              isSearchable
              styles={{
                control: (base, state) => ({
                  ...base,
                  backgroundColor: "white",
                  borderColor: "#d8b76a",
                  borderWidth: "2px",
                  borderRadius: "0.5rem",
                  boxShadow: state.isFocused ? "0 0 0 2px rgba(216, 183, 106, 0.2)" : "none",
                  "&:hover": {
                    borderColor: "#d8b76a",
                  },
                  fontSize: "0.875rem",
                  padding: "2px",
                  minHeight: "38px",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 100,
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }),
              }}
              className="text-xs sm:text-sm"
            />
          </div>
          {/* Base Qty */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Base Quantity
            </label>
            <input
              type="number"
              placeholder="Base Quantity"
              value={formData.baseQty}
              onChange={(e) => handleChange("baseQty", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
            />
          </div>
          {/* Pkg Qty */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Package Quantity
            </label>
            <input
              type="number"
              placeholder="Package Quantity"
              value={formData.pkgQty}
              onChange={(e) => handleChange("pkgQty", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
            />
          </div>
          {/* MOQ */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Minimum Order Quantity
            </label>
            <input
              type="number"
              placeholder="Minimum Order Quantity"
              value={formData.moq}
              onChange={(e) => handleChange("moq", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
            />
          </div>
          {/* Rate */}
          {/* <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
              Base Rate
            </label>
            <input
              type="number"
              placeholder="Base Rate"
              value={formData.baseRate}
              onChange={(e) => handleChange("baseRate", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div> */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">Rate</label>
            <input
              type="number"
              placeholder="Rate"
              value={formData.rate}
              onChange={(e) => handleChange("rate", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
            />
          </div>
          {/* Purchase UOM */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Purchase UOM
            </label>
            <select
              value={formData.purchaseUOM}
              onChange={(e) => handleChange("purchaseUOM", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50 cursor-pointer"
            >
              <option value="">Select</option>
              {uoms.map((u) => (
                <option key={u._id} value={u.unitName}>
                  {u.unitName}
                </option>
              ))}
            </select>
          </div>
          {/* Stock Qty */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Stock Quantity
            </label>
            <input
              // disabled
              type="number"
              placeholder="Stock Quantity"
              value={formData.stockQty ?? 0} // fallback to 0
              onChange={(e) => {
                const val = e.target.value;
                handleChange("stockQty", val === "" ? 0 : Number(val));
              }}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
          {/* Stock UOM */}
          <div className="flex flex-col">
            <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
              Stock UOM
            </label>
            <select
              value={formData.stockUOM}
              onChange={(e) => handleChange("stockUOM", e.target.value)}
              className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50 cursor-pointer"
            >
              <option value="">Select</option>
              {uoms.map((u) => (
                <option key={u._id} value={u.unitName}>
                  {u.unitName}
                </option>
              ))}
            </select>
          </div>
          {fabric.includes(formData.itemCategory.toLowerCase()) && (
            <>
              {/* Panno */}
              <div className="flex flex-col">
                <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
                  Panno
                </label>
                <input
                  type="number"
                  placeholder="Panno"
                  value={formData.panno}
                  onChange={(e) => handleChange("panno", e.target.value)}
                  className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
              {/* per SqInch Rate */}
              <div className="flex flex-col">
                <label className="text-[10px] sm:text-xs font-semibold text-secondary mb-1 sm:mb-1.5">
                  SqInch Rate
                </label>
                <input
                  type="number"
                  placeholder="SqInch Rate"
                  value={formData.sqInchRate}
                  onChange={(e) => handleChange("sqInchRate", e.target.value)}
                  className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm border-2 border-primary/30 rounded-md sm:rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
            </>
          )}
          <div className="col-span-full mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3">
            <label className="text-sm sm:text-base font-bold text-red-700">
              Total Rate:
            </label>
            <span className="text-red-700 font-bold text-base sm:text-lg">
              ₹{" "}
              {(Number(formData.stockQty) * Number(formData.rate) || 0).toFixed(
                2
              )}
            </span>
          </div>
          <div className="col-span-full mt-2">
            <label className="block mb-2 sm:mb-3 text-xs sm:text-sm font-semibold text-secondary">
              {formData.attachments.length != 0
                ? "Existing Attachments"
                : "No Existing Attachments"}
            </label>
            <ul className="space-y-2 text-xs sm:text-sm text-[#292926]">
              {formData.attachments?.map((att, index) =>
                !deletedAttachments.includes(att._id) ? (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all"
                  >
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-primary font-medium truncate flex-1 text-xs sm:text-sm"
                    >
                      {att.fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setDeletedAttachments((prev) => [...prev, att._id])
                      }
                      className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 text-red-600 hover:bg-red-50 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </li>
                ) : null
              )}
            </ul>
          </div>
          <div className="col-span-full mt-2">
            <label className="block mb-2 sm:mb-3 text-xs sm:text-sm font-semibold text-secondary">
              Add New Attachments
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setNewAttachments(Array.from(e.target.files))}
              className="block w-full text-xs sm:text-sm text-gray-600 cursor-pointer bg-white border-2 border-primary/30 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2.5 file:px-2 sm:file:px-4 file:rounded-md sm:file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary/10 file:text-secondary hover:file:bg-primary/20 file:cursor-pointer transition-colors"
            />
          </div>
          {/* Actions */}
          <div className="col-span-full mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-primary/20">
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-secondary rounded-lg sm:rounded-xl cursor-pointer font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-secondary font-bold rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <span>Updating</span>
                    <BeatLoader size={5} color="#292926" />
                  </>
                ) : (
                  <>
                    <FiSave className="text-base sm:text-lg" />
                    <span className="hidden sm:inline">Update Material</span>
                    <span className="sm:hidden">Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default EditRawMaterialModal;
