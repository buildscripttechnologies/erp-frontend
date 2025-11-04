import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../utils/axios";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { BeatLoader } from "react-spinners";
import Select from "react-select";

const AddAccessories = ({ onClose, onAdded }) => {
  const [formList, setFormList] = useState([
    {
      accessoryName: "",
      category: "",
      description: "",
      price: "",
      vendor: null,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const vendorRes = await axios.get("/vendors/get-all");
        setVendors(vendorRes.data.data || []);
      } catch {
        toast.error("Failed to fetch vendors");
      }
    };
    fetchDropdowns();
  }, []);

  const vendorsOptions = vendors.map((v) => ({
    value: v._id,
    label: `${v.venderCode} - ${v.vendorName} - ${v.natureOfBusiness}`,
    full: v,
  }));

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formList];
    updated[index][name] = value;
    setFormList(updated);
  };

  // separate handler for react-select
  const handleVendorChange = (index, selected) => {
    const updated = [...formList];
    updated[index].vendor = selected;
    setFormList(updated);
  };

  const addRow = () => {
    setFormList([
      ...formList,
      {
        accessoryName: "",
        category: "",
        description: "",
        price: "",
        vendor: null,
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = [...formList];
    updated.splice(index, 1);
    setFormList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // prepare clean payload
      const payload = formList.map((f) => ({
        ...f,
        vendor: f.vendor?.value || null,
      }));

      const res = await axios.post("/accessories/add-many", payload);

      if (res.data.status === 200) {
        toast.success("Accessories added successfully!");
        onAdded?.();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to add accessories");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding accessories");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-4xl rounded-lg p-6 border border-primary overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-primary scrollbar-track-[#fdf6e9]">
        <h2 className="text-xl font-bold mb-4 text-primary">Add Accessories</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formList.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-start border p-4 rounded border-primary"
            >
              {/* Accessory Name */}
              <div>
                <label className="block text-sm font-semibold text-black">
                  Accessory Name
                </label>
                <input
                  type="text"
                  name="accessoryName"
                  placeholder="Accessory Name"
                  value={item.accessoryName}
                  onChange={(e) => handleChange(index, e)}
                  required
                  className="w-full mt-1 p-2 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-black">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={item.category}
                  onChange={(e) => handleChange(index, e)}
                  className="w-full mt-1 p-2 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-black">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handleChange(index, e)}
                  required
                  className="w-full mt-1 p-2 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Vendor Select */}
              <div>
                <label className="block text-sm font-semibold text-black">
                  Vendor
                </label>
                <Select
                  options={vendorsOptions}
                  value={item.vendor}
                  onChange={(selected) => handleVendorChange(index, selected)}
                  placeholder="Select Vendor"
                  isSearchable
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: "#d8b76a",
                      boxShadow: state.isFocused ? "0 0 0 1px #d8b76a" : "none",
                      "&:hover": { borderColor: "#d8b76a" },
                    }),
                  }}
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-3 ">
                <label className="block text-sm font-semibold text-black">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleChange(index, e)}
                  rows={2}
                  className="w-full mt-1 p-2 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 items-end ">
                {formList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="sm:mt-8 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-3 rounded cursor-pointer"
                  >
                    <FiTrash2 />
                  </button>
                )}
                {index === formList.length - 1 && (
                  <button
                    type="button"
                    onClick={addRow}
                    className="sm:mt-8 bg-primary flex items-center gap-1 hover:bg-primary/80 text-black px-3 py-2 rounded cursor-pointer"
                  >
                    <FiPlus /> <span>Add Row</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Footer buttons */}
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
                  <span className="mr-2">Saving</span>
                  <BeatLoader size={5} color="#292926" />
                </>
              ) : (
                "Save Accessories"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccessories;
