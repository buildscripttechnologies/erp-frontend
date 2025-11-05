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
  });
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

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
      });
    }
  }, [accessory]);

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get("/vendors/get-all");
        setVendors(res.data.data || []);
      } catch {
        toast.error("Failed to fetch vendors");
      }
    };
    fetchVendors();
  }, []);

  const vendorsOptions = vendors.map((v) => ({
    value: v._id,
    label: `${v.venderCode} - ${v.vendorName} - ${v.natureOfBusiness}`,
    v,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVendorChange = (selected) => {
    setFormData((prev) => ({ ...prev, vendor: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        vendor: formData.vendor?.value || null,
      };

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
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-lg rounded-lg p-6 border border-primary shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-primary">
          Update Accessory
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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

          <div>
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

          <div>
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
