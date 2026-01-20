import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../utils/axios";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { BeatLoader } from "react-spinners";
import Select from "react-select";

const Inward = ({ onClose, onAdded }) => {
  const [formList, setFormList] = useState([
    {
      accessory: null,
      inwardQty: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [accessories, setAccessories] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await axios.get(`/accessories/get-all`);
        setAccessories(res.data.data || []);
      } catch {
        toast.error("Failed to fetch accessories");
      }
    };
    fetchDropdowns();
  }, []);

  const accessoriesOptions = accessories.map((a) => ({
    value: a._id,
    label: `${a.accessoryName} - ${a.description}`,
    full: a,
  }));

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formList];
    updated[index][name] = value;
    setFormList(updated);
  };

  // separate handler for react-select
  const handleAccessoryChange = (index, selected) => {
    const updated = [...formList];
    updated[index].accessory = selected;
    setFormList(updated);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // prepare clean payload
      const payload = formList.map((f) => ({
        ...f,
        accessory: f.accessory?.value || null,
      }));

      console.log("payload", payload[0]);

      const res = await axios.post("/accessory-inward/inward", payload[0]);

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
        <h2 className="text-xl font-bold mb-4 text-primary">
          Inward Accessory
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formList.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start border p-4 rounded border-primary"
            >
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-black mb-1">
                  Accessory
                </label>
                <Select
                  options={accessoriesOptions}
                  value={item.accessory}
                  onChange={(selected) =>
                    handleAccessoryChange(index, selected)
                  }
                  placeholder="Select Accessory"
                  isSearchable
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: "#d8b76a",
                      boxShadow: state.isFocused ? "0 0 0 1px #d8b76a" : "none",
                      "&:hover": { borderColor: "#d8b76a" },
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({
                      ...base,
                      width: "max-content",
                      minWidth: "100%",
                    }),
                  }}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="inwardQty"
                  placeholder="inwardQty"
                  value={item.inwardQty}
                  onChange={(e) => handleChange(index, e)}
                  required
                  className="w-full  px-2 py-1.5 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
                />
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
                "Inward"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inward;
