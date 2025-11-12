import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../utils/axios";
import { BeatLoader } from "react-spinners";
import Select from "react-select";

const UpdateAccessory = ({ onClose, onUpdated, accessory }) => {
  const [formData, setFormData] = useState({
    accessoryName: "",
    category: "",
    description: "",
    price: "",
    vendor: "",
    UOM: "",
    file: [],
  });
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uoms, setUoms] = useState([]);

  const [existingFiles, setExistingFiles] = useState(accessory.file || []);
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  // Load initial data
  useEffect(() => {
    if (accessory) {
      setFormData({
        accessoryName: accessory.accessoryName || "",
        category: accessory.category || "",
        description: accessory.description || "",
        price: accessory.price || "",
        vendor: accessory.vendor
          ? {
              value: accessory.vendor._id,
              label: `${accessory.vendor.venderCode} - ${accessory.vendor.vendorName} - ${accessory.vendor.natureOfBusiness}`,
              v: accessory.vendor,
            }
          : "",
        file: accessory.file,
        UOM: accessory.UOM?.unitName,
      });
    }
  }, [accessory]);

  // Fetch vendors
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [vendorRes, uomRes] = await Promise.all([
          axios.get("/vendors/get-all"),
          axios.get("/uoms/all-uoms"),
        ]);
        setVendors(vendorRes.data.data || []);
        setUoms(uomRes.data.data || []);
      } catch {
        toast.error("Failed to fetch dropdowns");
      }
    };
    fetchDropdowns();
  }, []);

  const vendorsOptions = vendors.map((v) => ({
    value: v._id,
    label: `${v.venderCode} - ${v.vendorName} - ${v.natureOfBusiness}`,
    v,
  }));

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "file" ? Array.from(files) : value,
    }));
  };

  const handleVendorChange = (selected) => {
    setFormData((prev) => ({ ...prev, vendor: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      const data = {
        ...formData,
        file: undefined,
        vendor: formData.vendor?.value || null,
      };

      newFiles.forEach((file) => {
        payload.append("files", file);
      });

      if (formData.file.length) {
        formData.file.forEach((file) => payload.append("files", file));
      }

      payload.append("data", JSON.stringify(data));
      payload.append("deletedFiles", JSON.stringify(deletedFileIds));

      console.log("payload updt acc", payload);

      const res = await axios.put(
        `/accessories/update/${accessory._id}`,
        payload
      );

      if (res.data.status === 200) {
        toast.success("Accessory updated successfully!");
        onUpdated();
        onClose();
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-4xl rounded-lg p-6 border border-primary overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-primary scrollbar-track-[#fdf6e9]">
        <h2 className="text-xl font-bold mb-4 text-primary">
          Update Accessory
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-start border p-4 rounded border-primary">
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-black">
                Accessory Name
              </label>
              <input
                type="text"
                name="accessoryName"
                value={formData.accessoryName}
                onChange={handleChange}
                placeholder="Accessory Name"
                className="w-full mt-1 p-2 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">
                Category
              </label>
              <input    
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Category"
                className="w-full mt-1 p-2 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black">
                UOM
              </label>
              <select
                name="UOM"
                value={formData.UOM}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
                required
              >
                <option value={formData.UOM}>{formData.UOM}</option>
                {uoms.map((u) => (
                  <option key={u._id} value={u.unitName}>
                    {u.unitName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Price"
                className="w-full mt-1 p-2 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4 ">
              <label className="block text-sm font-semibold text-black">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full mt-1 p-2 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
                rows={2}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-black">
                Vendor
              </label>
              <Select
                options={vendorsOptions}
                value={formData.vendor}
                onChange={handleVendorChange}
                placeholder="Select Vendor"
                isSearchable
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: "var(--color-primary)",
                    boxShadow: state.isFocused
                      ? "0 0 0 1px var(--color-primary)"
                      : "none",
                    "&:hover": { borderColor: "var(--color-primary)" },
                  }),
                }}
              />
            </div>

            <div className=" sm:col-span-2">
              <div className=" ">
                <label className="block font-semibold mb-1 text-black">
                  Product Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setNewFiles(Array.from(e.target.files))}
                  className="w-full text-sm text-gray-600 cursor-pointer bg-white border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-black hover:file:bg-primary/10 file:cursor-pointer"
                />
              </div>
              <div>
                <p className="font-semibold mb-1 mt-2 text-black">
                  Existing Product Files
                </p>
                {existingFiles.length === 0 && (
                  <p className="text-sm text-gray-500">No files uploaded</p>
                )}
                {existingFiles.map((file) => (
                  <div
                    key={file._id}
                    className="flex justify-between items-center mb-1 bg-primary/20 border border-primary rounded p-1 "
                  >
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black underline truncate"
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
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary flex justify-center items-center hover:bg-primary/80 text-secondary font-semibold rounded cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="mr-2">Updating</span>
                  <BeatLoader size={5} color="#292926" />
                </>
              ) : (
                "Update Accessory"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAccessory;
