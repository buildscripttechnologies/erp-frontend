import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { ClipLoader } from "react-spinners";
import { cuttingType, jobWorkType } from "../../data/dropdownData";

const Add = ({ onClose, onAdded }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const [loading, setLoading] = useState(false);

  const [boms, setBoms] = useState([]);
  const [users, setUsers] = useState([]);
  const [itemDetails, setItemDetails] = useState(null);
  const [consumptionTable, setConsumptionTable] = useState(null);
  const [checkedSkus, setCheckedSkus] = useState([]);

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

    if (checkedSkus.length < 1) {
      toast.error("Issue Atleast One Material");
      return;
    }
    setLoading(true);

    try {
      const mainStatus = itemDetails.every((it) => it.status !== "pending")
        ? "issued"
        : "pending";
      const payload = {
        bom: selectedItem.b._id,
        bomNo: selectedItem.b.bomNo,
        itemDetails: itemDetails.map((item) => ({
          ...item,
          status:
            item.cuttingType && checkedSkus.includes(item.skuCode)
              ? "in cutting"
              : "pending",
        })),
        consumptionTable, // already has isChecked, stockQty, type
        status: mainStatus,
      };
      console.log("payload", payload);

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

  const filteredDetails = checkedSkus.flatMap((sku) =>
    itemDetails.filter((pd) => pd.skuCode === sku)
  );

  const parseValue = (val) => {
    if (!val || val === "N/A") return 0;
    const num = parseFloat(val.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
  };

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

                  const enhancedItems = (actualItem.productDetails || []).map(
                    (c) => {
                      return {
                        ...c,
                        status: "pending",
                      };
                    }
                  );

                  setItemDetails(enhancedItems);
                  // build enhanced consumption table
                  const enhanced = (actualItem.consumptionTable || []).map(
                    (c) => {
                      const match = actualItem.productDetails.find(
                        (d) => d.skuCode === c.skuCode
                      );
                      return {
                        ...c,
                        type: match?.type || null,
                        stockQty: match?.stockQty || 0,
                        isChecked: false,
                      };
                    }
                  );
                  setConsumptionTable(enhanced);
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

          {/* Consumption Table */}
          {consumptionTable && (
            <div className="bg-white border border-[#d8b76a] rounded shadow pt-3  px-4  mb-4 text-[11px] text-[#292926]">
              <h3 className="font-bold text-[#d8b76a] text-[14px] underline underline-offset-4 mb-2">
                Raw Material Consumption
              </h3>
              <table className="w-full mb-4 text-[11px] border text-left">
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
                      Category
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Weight
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">Qty</th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Stock Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {consumptionTable?.length > 0 ? (
                    consumptionTable.map((item, idx) => (
                      <tr key={idx} className="border-b border-[#d8b76a]">
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          <input
                            type="checkbox"
                            checked={item.isChecked}
                            onChange={(e) => {
                              const updated = [...consumptionTable];
                              const currentRow = updated[idx];

                              // Deduction from weight or qty
                              let deduction = 0;
                              if (
                                currentRow.weight &&
                                currentRow.weight !== "N/A"
                              ) {
                                deduction = parseValue(currentRow.weight);
                              } else if (
                                currentRow.qty &&
                                currentRow.qty !== "N/A"
                              ) {
                                deduction = parseValue(currentRow.qty);
                              }

                              if (e.target.checked) {
                                if (currentRow.stockQty < deduction) {
                                  toast.error("Insufficient StockQty!");
                                  return;
                                }
                                currentRow.isChecked = true;
                                currentRow.stockQty = parseFloat(
                                  (currentRow.stockQty - deduction).toFixed(2)
                                );
                                setCheckedSkus((prev) => [
                                  ...prev,
                                  currentRow.skuCode,
                                ]);
                              } else {
                                currentRow.isChecked = false;
                                currentRow.stockQty = parseFloat(
                                  (currentRow.stockQty + deduction).toFixed(2)
                                );
                                setCheckedSkus((prev) =>
                                  prev.filter(
                                    (sku) => sku !== currentRow.skuCode
                                  )
                                );
                              }

                              updated[idx] = currentRow;
                              setConsumptionTable(updated);
                            }}
                            className="accent-primary"
                          />
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.skuCode || "N/A"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.itemName || "N/A"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.category || "N/A"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.weight || "N/A"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.qty || "N/A"}
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${(() => {
                              const qtyVal =
                                item.qty && item.qty !== "N/A"
                                  ? parseFloat(
                                      item.qty.replace(/[^0-9.]/g, "")
                                    ) || 0
                                  : 0;
                              const weightVal =
                                item.weight && item.weight !== "N/A"
                                  ? parseFloat(
                                      item.weight.replace(/[^0-9.]/g, "")
                                    ) || 0
                                  : 0;

                              return (qtyVal && item.stockQty < qtyVal) ||
                                (weightVal && item.stockQty < weightVal)
                                ? "bg-red-200 "
                                : "bg-green-100 ";
                            })()}`}
                          >
                            {item.stockQty.toFixed(2)}
                          </span>
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

          {/* Item details */}
          {checkedSkus.length > 0 && (
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
                    {/* <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Rate (₹)
                    </th> */}
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Cutting Type
                    </th>
                    <th className="px-2 py-1 border-r border-[#d8b76a]">
                      Jobwork Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDetails.length > 0 ? (
                    filteredDetails.map((item, idx) => (
                      <tr key={idx} className="border-b border-[#d8b76a]">
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          <input
                            type="checkbox"
                            checked={!!item.cuttingType}
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
                        {/* <td className="px-2 py-1 border-r border-[#d8b76a]">
                          {item.rate || "-"}
                        </td> */}
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          <select
                            value={item.cuttingType || ""}
                            onChange={(e) => {
                              let updated = [...itemDetails];
                              const targetIndex = updated.findIndex(
                                (pd) => pd._id === item._id
                              );

                              if (targetIndex !== -1) {
                                updated[targetIndex].cuttingType =
                                  e.target.value; // ✅ direct assign
                                setItemDetails(updated);
                              }
                            }}
                          >
                            <option value="">Select</option>
                            {cuttingType.map((type, idx) => (
                              <option key={idx} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1 border-r border-[#d8b76a]">
                          <select
                            value={item.jobWorkType || ""}
                            onChange={(e) => {
                              let updated = [...itemDetails];
                              const targetIndex = updated.findIndex(
                                (pd) => pd._id === item._id
                              );

                              if (targetIndex !== -1) {
                                updated[targetIndex].jobWorkType =
                                  e.target.value; // ✅ direct assign
                                setItemDetails(updated);
                              }
                            }}
                          >
                            <option value="">Select</option>
                            {jobWorkType.map((type, idx) => (
                              <option key={idx} value={type}>
                                {type}
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
