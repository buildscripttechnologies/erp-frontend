import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { ClipLoader } from "react-spinners";

const Add = ({ onClose, onAdded }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const [loading, setLoading] = useState(false);

  const [boms, setBoms] = useState([]);
  const [users, setUsers] = useState([]);
  const [itemDetails, setItemDetails] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  // multiple items state
  const [poItems, setPoItems] = useState([]);

  // ---- Your existing total amount

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [bomRes, userRes] = await Promise.all([
          axios.get("/boms/get-all"),
          axios.get("/users/all-users"),
        ]);
        setBoms(bomRes.data.data || []);
        setUsers(userRes.data.users || []);
      } catch {
        toast.error("Failed to fetch vendors or items");
      }
    };
    fetchDropdowns();
  }, []);

  //   console.log("selected item", selectedItem);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const payload = {
        bom: selectedItem.b._id,
        bomNo: selectedItem.b.bomNo,
        itemDetails: itemDetails,
      };

      //   console.log("payload", payload);

      const res = await axios.post("/mi/add", payload);
      if (res.data.status === 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Material Issue Created Successfully");
      onClose();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Material Issue failed");
    } finally {
      setLoading(false);
    }
  };

  let bomOptions = boms.map((b) => ({
    value: b._id,
    label: `${b.bomNo} - ${b.productName} `,
    b: b,
  }));

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`bg-white w-[92vw]  ${
          itemDetails ? "max-w-6xl" : "max-w-2xl"
        } rounded-lg p-6 border border-primary overflow-y-auto max-h-[90vh] `}
      >
        <h2 className="text-xl font-bold mb-4 text-primary">Issue Material</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item & Vendor Select */}
          <div className="flex flex-wrap gap-5">
            <div className="w-full ">
              <label className="block text-sm font-semibold text-[#292926] mb-1">
                Select BOM
              </label>
              <Select
                options={bomOptions}
                value={selectedItem}
                onChange={(item) => {
                  setSelectedItem(item);
                  const actualItem = item.b;
                  setItemDetails(actualItem.productDetails);
                }}
                placeholder="Item Name or SKU"
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
          </div>

          {/* Item details */}
          {itemDetails && (
            <div className="bg-white border border-[#d8b76a] rounded shadow pt-3 pb-4 px-4  mb-2 text-[11px] text-[#292926]">
              {/* Product Details Table */}
              <h3 className="font-bold text-[#d8b76a] text-[14px] underline underline-offset-4 mb-2">
                Product Details (Raw Material / SFG)
              </h3>
              <table className="w-full  text-[11px] border text-left">
                <thead className="bg-[#d8b76a]/70">
                  <tr>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">#</th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      S. No.
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Sku Code
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Item Name
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Type
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Location
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Part Name
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Height (Inch)
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Width (Inch)
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Quantity
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Rate (₹)
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Assignee
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itemDetails.length > 0 ? (
                    itemDetails.map((item, idx) => (
                      <tr key={idx} className="border-b border-[#d8b76a]">
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          <input
                            type="checkbox"
                            checked={!!item.assignee}
                            id={idx}
                            className="accent-primary"
                          />
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.skuCode || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.itemName || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.type || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.location?.locationId || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.partName || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.height || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.width || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.grams ? `${item.grams} gm` : item.qty || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.rate || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          <select
                            value={item.assignee || ""}
                            onChange={(e) => {
                              const selectedUser = users.find(
                                (u) => u.id === e.target.value
                              );
                              let updated = [...itemDetails];
                              updated[idx].assignee = selectedUser
                                ? selectedUser.id
                                : null;
                              setItemDetails(updated);
                            }}
                          >
                            <option value="">Select</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.fullName}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-2 py-1 text-center" colSpan={8}>
                        No product details available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Final Save */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary/80 text-[#292926] font-semibold rounded cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <ClipLoader size={20} color="#292926" />
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-[#292926] rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
