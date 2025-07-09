import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const EditRawMaterialModal = ({ rawMaterial, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(rawMaterial);
  const [loading, setLoading] = useState(false);
  const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [deletedAttachments, setDeletedAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);

  useEffect(() => {
    const fetchUOMs = async () => {
      try {
        const res = await axios.get("/uoms/all-uoms"); // your UOM endpoint
        setUoms(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load UOMs");
      }
    };

    fetchUOMs();
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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

      console.log("attachments: ", form.attachments);

      for (let pair of form.entries()) {
        console.log(pair[0], pair[1]);
      }
      // console.log("Payload: ", payload);
      // console.log("form: ", form);
      // console.log("formData: ", formData);

      // console.log("deletedAttachments: ", deletedAttachments);
      // console.log("newAttachments: ", newAttachments);

      const res = await axios.patch(`/rms/edit-rm/${formData.id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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

  return (
    <div className="fixed inset-0  backdrop-blur-xs  flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-[92vw] sm:max-w-3xl rounded-lg p-6  border overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-[#fdf6e9]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">
          Edit Raw Material
        </h2>
        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#292926]"
        >
          {/* Item Name */}
          <div>
            <label className="block mb-1 font-medium">Item Name</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => handleChange("itemName", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
            />
          </div>

          {/* HSN/SAC */}
          <div>
            <label className="block mb-1 font-medium">HSN / SAC</label>
            <input
              type="text"
              value={formData.hsnOrSac}
              onChange={(e) => handleChange("hsnOrSac", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
            />
          </div>

          {/* Quality Inspection */}
          <div>
            <label className="block mb-1 font-medium">Quality Inspection</label>
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
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
            >
              <option>Required</option>
              <option>Not Required</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block mb-1 font-medium">Location</label>
            <select
              type="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
            >
              <option value="">Select</option>
              {locations.map((l) => (
                <option key={l._id} value={l.locationId}>
                  {l.locationId}
                </option>
              ))}
            </select>
          </div>

          {/* Base Qty */}
          <div>
            <label className="block mb-1 font-medium">Base Quantity</label>
            <input
              type="number"
              value={formData.baseQty}
              onChange={(e) => handleChange("baseQty", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
            />
          </div>

          {/* Pkg Qty */}
          <div>
            <label className="block mb-1 font-medium">Package Quantity</label>
            <input
              type="number"
              value={formData.pkgQty}
              onChange={(e) => handleChange("pkgQty", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
            />
          </div>

          {/* MOQ */}
          <div>
            <label className="block mb-1 font-medium">
              Minimum Order Quantity
            </label>
            <input
              type="number"
              value={formData.moq}
              onChange={(e) => handleChange("moq", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
            />
          </div>

          {/* Purchase UOM */}
          <div>
            <label className="block mb-1 font-medium">Purchase UOM</label>
            <select
              value={formData.purchaseUOM}
              onChange={(e) => handleChange("purchaseUOM", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37] cursor-pointer"
            >
              <option value="">Select</option>
              {uoms.map((u) => (
                <option key={u._id} value={u.unitName}>
                  {u.unitName}
                </option>
              ))}
            </select>
          </div>

          {/* GST */}
          <div>
            <label className="block mb-1 font-medium">GST (%)</label>
            <input
              type="number"
              value={formData.gst}
              onChange={(e) => handleChange("gst", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
            />
          </div>

          {/* Stock Qty */}
          <div>
            <label className="block mb-1 font-medium">Stock Quantity</label>
            <input
              type="number"
              value={formData.stockQty}
              onChange={(e) => handleChange("stockQty", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
            />
          </div>

          {/* Stock UOM */}
          <div>
            <label className="block mb-1 font-medium">Stock UOM</label>
            <select
              value={formData.stockUOM}
              onChange={(e) => handleChange("stockUOM", e.target.value)}
              className="w-full px-4 py-2 border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37] cursor-pointer "
            >
              <option value="">Select</option>
              {uoms.map((u) => (
                <option key={u._id} value={u.unitName}>
                  {u.unitName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-full">
            <label className="block mb-2 font-medium">
              Existing Attachments
            </label>
            <ul className="space-y-1 text-sm text-[#292926]">
              {formData.attachments?.map((att, index) =>
                !deletedAttachments.includes(att._id) ? (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-[#fdf6e9] px-3 py-2 rounded border border-[#d8b76a]"
                  >
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600"
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
              className="block w-full text-sm text-gray-600 cursor-pointer bg-white border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fdf6e9] file:text-[#292926] hover:file:bg-[#d8b76a]/10 file:cursor-pointer"
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
              className="px-6 py-2 bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-[#292926] font-semibold rounded cursor-pointer"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRawMaterialModal;
