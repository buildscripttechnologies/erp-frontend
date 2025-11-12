import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import Select from "react-select";
import { BeatLoader } from "react-spinners";
import { useCategoryArrays } from "../../data/dropdownData";

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

    const baseRate = updatedForm.baseRate || 0;
    const gst = updatedForm.gst || 0;

    if (baseRate && gst) {
      updatedForm.rate = Number(baseRate) + (gst * baseRate) / 100;
    }

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

    console.log("cat", category);

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

      // console.log("attachments: ", form.attachments);

      for (let pair of form.entries()) {
        console.log(pair[0], pair[1]);
      }

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
    <div className="fixed inset-0  backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-[92vw] sm:max-w-2xl md:max-w-5xl rounded-lg p-6  border border-primary overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-primary scrollbar-track-[#fdf6e9]">
        <div className="flex flex-col sm:flex-row sm:justify-between  mb-4">
          <h2 className="w-full text-xl font-bold  text-primary flex justify-center sm:justify-start">
            Edit Raw Material
          </h2>
        </div>
        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm text-[#292926]"
        >
          {/* Item Name */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">Sku Code</label>
            <input
              disabled
              type="text"
              value={formData.skuCode}
              onChange={(e) => handleChange("skuCode", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
              Item Name
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => handleChange("itemName", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
              Description
            </label>
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black mb-1 block">
              Item Category
            </label>
            <select
              value={formData.itemCategory}
              onChange={(e) => handleChange("itemCategory", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
            <label className="text-xs font-semibold text-black">
              Item Color
            </label>
            <input
              type="text"
              placeholder="Item Color"
              value={formData.itemColor}
              onChange={(e) => handleChange("itemColor", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* HSN/SAC */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
              HSN / SAC
            </label>
            <input
              type="text"
              placeholder="HSN / SAC"
              value={formData.hsnOrSac}
              onChange={(e) => handleChange("hsnOrSac", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Quality Inspection */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
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
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>Required</option>
              <option>Not Required</option>
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">Location</label>
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
                  borderWidth: "1px",
                  boxShadow: state.isFocused ? "0 0 0 2px #b38a37" : "none",
                  "&:hover": {
                    borderColor: "#b38a37",
                  },

                  fontSize: "0.875rem", // text-sm
                  borderRadius: "0.25rem", // rounded
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 100,
                }),
              }}
            />
          </div>

          {/* Base Qty */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
              Base Quantity
            </label>
            <input
              type="number"
              placeholder="Base Quantity"
              value={formData.baseQty}
              onChange={(e) => handleChange("baseQty", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Pkg Qty */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
              Package Quantity
            </label>
            <input
              type="number"
              placeholder="Package Quantity"
              value={formData.pkgQty}
              onChange={(e) => handleChange("pkgQty", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* MOQ */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
              Minimum Order Quantity
            </label>
            <input
              type="number"
              placeholder="Minimum Order Quantity"
              value={formData.moq}
              onChange={(e) => handleChange("moq", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* GST */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">GST (%)</label>
            <input
              type="number"
              placeholder="GST(%)"
              value={formData.gst}
              onChange={(e) => handleChange("gst", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* Rate */}
          <div className="flex flex-col">
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
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">Rate</label>
            <input
              type="number"
              placeholder="Rate"
              value={formData.rate}
              onChange={(e) => handleChange("rate", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Purchase UOM */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
              Purchase UOM
            </label>
            <select
              value={formData.purchaseUOM}
              onChange={(e) => handleChange("purchaseUOM", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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
            <label className="text-xs font-semibold text-black">
              Stock Quantity
            </label>
            <input
              // disabled
              type="number"
              placeholder="Stock Quantiy"
              value={formData.stockQty ?? 0} // fallback to 0
              onChange={(e) => {
                const val = e.target.value;
                handleChange("stockQty", val === "" ? 0 : Number(val));
              }}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
            />
          </div>

          {/* Stock UOM */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-black">
              Stock UOM
            </label>
            <select
              value={formData.stockUOM}
              onChange={(e) => handleChange("stockUOM", e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer "
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
                <label className="text-xs font-semibold text-black">
                  Panno
                </label>
                <input
                  type="number"
                  placeholder="Panno"
                  value={formData.panno}
                  onChange={(e) => handleChange("panno", e.target.value)}
                  className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                />
              </div>
              {/* per SqInch Rate */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-black">
                  SqInch Rate
                </label>
                <input
                  type="number"
                  placeholder="SqInch Rate"
                  value={formData.sqInchRate}
                  onChange={(e) => handleChange("sqInchRate", e.target.value)}
                  className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                />
              </div>
            </>
          )}
          <div className="mt-1 flex items-center">
            <label className="text-base font-semibold text-red-600 mr-2">
              Total Rate :
            </label>
            <span className="text-red-600 font-semibold text-sm">
              ₹{" "}
              {(Number(formData.stockQty) * Number(formData.rate) || 0).toFixed(
                2
              )}
            </span>
          </div>

          <div className="col-span-full">
            <label className="block mb-2 font-medium">
              {formData.attachments.length != 0
                ? "Existing Attachments"
                : "No Existing Attachments"}
            </label>
            <ul className="space-y-1 text-sm text-[#292926]">
              {formData.attachments?.map((att, index) =>
                !deletedAttachments.includes(att._id) ? (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-[#fdf6e9] px-3 py-2 rounded border border-primary"
                  >
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600 truncate"
                    >
                      {att.fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setDeletedAttachments((prev) => [...prev, att._id])
                      }
                      className="text-red-600 hover:underline text-sm cursor-pointer"
                    >
                      Delete
                    </button>
                  </li>
                ) : null
              )}
            </ul>
          </div>

          <div className="col-span-full">
            <label className="block mb-2 font-medium">
              Add New Attachments
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setNewAttachments(Array.from(e.target.files))}
              className="block w-full text-sm text-gray-600 cursor-pointer bg-white border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fdf6e9] file:text-[#292926] hover:file:bg-primary/10 file:cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="col-span-full flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-[#292926] rounded cursor-pointer font-semibold "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary/80 text-[#292926] font-semibold rounded cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span>Updating</span>
                  <BeatLoader size={5} color="#292926" />
                </div>
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

export default EditRawMaterialModal;
