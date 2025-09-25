import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { BeatLoader } from "react-spinners";
import { cuttingType, jobWorkType, vendors } from "../../data/dropdownData";
import AddPO from "../purchase/AddPO";

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

  const [poModalItem, setPoModalItem] = useState(null);

  // ---- Your existing total amount

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

  useEffect(() => {
    fetchDropdowns();
  }, []);

  //   console.log("selected item", selectedItem);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (checkedSkus.length < 1) {
      toast.error("Issue At least One Material");
      return;
    }

    if (checkedSkus.length > 0) {
      const selectedItems = itemDetails.filter((it) =>
        checkedSkus.includes(it.skuCode)
      );

      const isInvalid = selectedItems.some((it) => {
        if (!it.cuttingType || !it.jobWorkType) {
          return true; // missing cuttingType/jobWorkType
        }
        if (it.jobWorkType === "Outside Company" && !it.vendor) {
          return true; // vendor required for outside company
        }
        return false;
      });

      if (isInvalid) {
        toast.error(
          "Please select Cutting Type, Job Work Type, and Vendor (if Outside Company) for all issued items"
        );
        return;
      }
    }

    setLoading(true);

    try {
      const mainStatus = itemDetails.every(
        (it) => it.currentStatus !== "Pending"
      )
        ? "Issued"
        : "Pending";
      const payload = {
        bom: selectedItem.b._id,
        bomNo: selectedItem.b.bomNo,
        productName: selectedItem.b.productName,
        itemDetails: itemDetails.map((item) => ({
          ...item,
          currentStatus:
            item.currentStatus == "Pending"
              ? item.cuttingType &&
                checkedSkus.includes(item.skuCode) &&
                item.jobWorkType == "Inside Company"
                ? "Yet to Start"
                : item.cuttingType &&
                  checkedSkus.includes(item.skuCode) &&
                  item.jobWorkType == "Outside Company"
                ? "In Progress"
                : "Pending"
              : item.currentStatus,
          stages:
            item.currentStatus == "Pending" &&
            item.cuttingType &&
            checkedSkus.includes(item.skuCode)
              ? [
                  {
                    stage: "Cutting",
                    status:
                      item.jobWorkType === "Inside Company"
                        ? "Yet to Start"
                        : "In Progress",
                  },
                ]
              : item.stages,
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
        } rounded-lg p-6 border border-primary overflow-auto max-h-[90vh] `}
      >
        <h2 className="text-xl font-bold mb-4 text-primary">Issue Material</h2>

        <div className="space-y-4">
          {/* Item & Vendor Select */}
          <div className="flex flex-wrap gap-5">
            <div className="w-full ">
              <label className="block text-sm font-semibold text-black mb-1">
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
                        currentStatus: "Pending",
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
                    borderColor: "var(--color-primary)",
                    boxShadow: state.isFocused
                      ? "0 0 0 1px var(--color-primary)"
                      : "none",
                    "&:hover": { borderColor: "var(--color-primary)" },
                  }),
                }}
              />
            </div>
          </div>

          {/* Consumption Table */}
          {consumptionTable && (
            <div className="bg-white border border-primary rounded shadow pt-3  px-4  mb-4 text-[11px] text-black  overflow-x-auto">
              <h3 className="font-bold text-primary text-[14px] underline underline-offset-4 mb-2">
                Raw Material Consumption
              </h3>
              <table className="w-full mb-4 text-[11px] border text-left ">
                <thead className="bg-primary/70">
                  <tr>
                    <th className="px-2 py-1 border-r border-primary">
                      <input
                        type="checkbox"
                        className="accent-black"
                        checked={consumptionTable.every(
                          (item) => item.isChecked
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Try to select all (only if stock is enough)
                            const updated = consumptionTable.map((row) => {
                              let deduction = 0;
                              if (row.weight && row.weight !== "N/A") {
                                deduction = parseValue(row.weight);
                              } else if (row.qty && row.qty !== "N/A") {
                                deduction = parseValue(row.qty);
                              }

                              if (row.stockQty < deduction) {
                                toast.error(
                                  `Insufficient StockQty for ${row.skuCode}!`
                                );
                                return row; // keep unchecked
                              }

                              return {
                                ...row,
                                isChecked: true,
                                stockQty: parseFloat(
                                  (row.stockQty - deduction).toFixed(2)
                                ),
                              };
                            });

                            setConsumptionTable(updated);
                            setCheckedSkus(
                              updated
                                .filter((r) => r.isChecked)
                                .map((r) => r.skuCode)
                            );
                          } else {
                            // Uncheck all → restore stock
                            const updated = consumptionTable.map((row) => {
                              let deduction = 0;
                              if (row.weight && row.weight !== "N/A") {
                                deduction = parseValue(row.weight);
                              } else if (row.qty && row.qty !== "N/A") {
                                deduction = parseValue(row.qty);
                              }

                              return {
                                ...row,
                                isChecked: false,
                                stockQty: parseFloat(
                                  (row.stockQty + deduction).toFixed(2)
                                ),
                              };
                            });

                            setConsumptionTable(updated);
                            setCheckedSkus([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      S. No.
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Sku Code
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Item Name
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Category
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Weight
                    </th>
                    <th className="px-2 py-1 border-r border-primary">Qty</th>
                    <th className="px-2 py-1 border-r border-primary">
                      Stock Qty
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {consumptionTable?.length > 0 ? (
                    consumptionTable.map((item, idx) => (
                      <tr key={idx} className="border-b border-primary">
                        <td className="px-2 py-1 border-r border-primary">
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
                        <td className="px-2 py-1 border-r border-primary">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.skuCode || "N/A"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.itemName || "N/A"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.category || "N/A"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.weight || "N/A"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.qty || "N/A"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {(() => {
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

                            const isLowStock =
                              (qtyVal && item.stockQty < qtyVal) ||
                              (weightVal && item.stockQty < weightVal);

                            return (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    isLowStock ? "bg-red-200" : "bg-green-100"
                                  }`}
                                >
                                  {item.stockQty.toFixed(2)}
                                </span>
                                {isLowStock ? (
                                  <button
                                    className="px-2 py-1 text-xs rounded bg-yellow-500 text-white hover:bg-yellow-600"
                                    onClick={() => setPoModalItem(item)}
                                  >
                                    Add PO
                                  </button>
                                ) : (
                                  ""
                                )}
                              </div>
                            );
                          })()}
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
          {poModalItem && (
            <AddPO
              prefillItem={poModalItem} // 👈 pass the selected row
              onClose={() => setPoModalItem(null)}
              onAdded={() => {
                setPoModalItem(null);
                fetchDropdowns();
              }}
            />
          )}

          {/* Item details */}
          {checkedSkus.length > 0 && (
            <div className="bg-white border border-primary rounded shadow pt-3 pb-4 px-4  mb-2 text-[11px] text-black overflow-x-auto">
              {/* Product Details Table */}
              <h3 className="font-bold text-primary text-[14px] underline underline-offset-4 mb-2">
                Product Details (Raw Material / SFG)
              </h3>
              <table className="w-full  text-[11px] border text-left">
                <thead className="bg-primary/70">
                  <tr>
                    <th className="px-2 py-1 border-r border-primary">#</th>
                    <th className="px-2 py-1 border-r border-primary">
                      S. No.
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Sku Code
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Item Name
                    </th>
                    <th className="px-2 py-1 border-r border-primary">Type</th>
                    <th className="px-2 py-1 border-r border-primary">
                      Location
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Part Name
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Height (Inch)
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Width (Inch)
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Quantity
                    </th>
                    {/* <th className="px-2 py-1 border-r border-primary">
                      Rate (₹)
                    </th> */}
                    <th className="px-2 py-1 border-r border-primary">
                      Cutting Type
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Jobwork Type
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Vendor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDetails.length > 0 ? (
                    filteredDetails.map((item, idx) => (
                      <tr key={idx} className="border-b border-primary">
                        <td className="px-2 py-1 border-r border-primary">
                          <input
                            type="checkbox"
                            checked={!!item.cuttingType}
                            id={idx}
                            className="accent-primary"
                          />
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.skuCode || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.itemName || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.type || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.location?.locationId || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.partName || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.height || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.width || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.grams
                            ? `${item.grams / 1000} kg`
                            : item.qty || "-"}
                        </td>
                        {/* <td className="px-2 py-1 border-r border-primary">
                          {item.rate || "-"}
                        </td> */}
                        <td className="px-2 py-1 border-r border-primary">
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
                        <td className="px-2 py-1 border-r border-primary">
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
                        <td className="px-2 py-1 border-r border-primary">
                          <select
                            className="disabled:cursor-not-allowed"
                            disabled={item.jobWorkType != "Outside Company"}
                            value={item.vendor || ""}
                            onChange={(e) => {
                              let updated = [...itemDetails];
                              const targetIndex = updated.findIndex(
                                (pd) => pd._id === item._id
                              );

                              if (targetIndex !== -1) {
                                updated[targetIndex].vendor = e.target.value; // ✅ direct assign
                                setItemDetails(updated);
                              }
                            }}
                          >
                            <option value="">Select</option>
                            {vendors.map((type, idx) => (
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
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex items-center px-6 py-2 bg-primary hover:bg-primary/80 text-black font-semibold rounded cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving</span>
                  <BeatLoader size={5} color="#292926" />
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;
