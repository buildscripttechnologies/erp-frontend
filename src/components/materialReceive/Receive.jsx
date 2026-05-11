import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { BeatLoader } from "react-spinners";
import { cuttingType, jobWorkType } from "../../data/dropdownData";

const Receive = ({ onClose, onAdded }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const [loading, setLoading] = useState(false);

  const [mis, setMis] = useState([]);

  // const [itemDetails, setItemDetails] = useState(null);
  const [consumptionTable, setConsumptionTable] = useState(null);
  // const [checkedSkus, setCheckedSkus] = useState([]);

  const fetchStockBySkuCodes = async (skuCodes = []) => {
    const uniqueSkuCodes = [...new Set(skuCodes.filter(Boolean))];
    if (!uniqueSkuCodes.length) return {};

    try {
      const stockRes = await axios.post("/stocks/stock-by-sku", {
        skuCodes: uniqueSkuCodes,
      });
      return stockRes.data?.data || {};
    } catch {
      toast.error("Failed to fetch current stock");
      return {};
    }
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [miRes, userRes] = await Promise.all([
          axios.get("/mi/get-all"),
          axios.get("/users/all-users"),
        ]);
        setMis(miRes.data.data || []);
        // setUsers(userRes.data.users || []);
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
      const receivedRows = (consumptionTable || [])
        .map((row) => {
          const {
            currentStockQty,
            originalQty,
            originalWeight,
            originalIssueQty,
            alreadyReceivedQty,
            remainingQty,
            stockByWarehouse,
            ...cleanRow
          } = row;
          return cleanRow;
        })
        .filter((row) => Number(row.receiveQty) > 0);

      if (!receivedRows.length) {
        toast.error("Enter receive quantity for at least one material");
        return;
      }

      const payload = {
        prodNo: selectedItem.m.prodNo,
        bom: selectedItem.m.bom._id,
        bomNo: selectedItem.m.bomNo,
        consumptionTable: receivedRows,
      };
      console.log("payload", payload);

      const res = await axios.post(`/mr/add`, payload);
      if (res.data.status === 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Material Received Successfully");
      onClose();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Material Receive failed");
    } finally {
      setLoading(false);
    }
  };

  let miOptions = mis.map((m) => ({
    value: m._id,
    label: `${m.bomNo} - ${m.bom?.productName || ""} `,
    m: m,
  }));

  const parseValue = (val) => {
    if (!val || val === "N/A") return 0;
    if (typeof val === "number") return val;
    const num = parseFloat(val.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
  };

  const getIssueQty = (row) => {
    const qtyVal = parseValue(row.qty);
    const weightVal = parseValue(row.weight);
    return qtyVal || weightVal;
  };

  const fmt = (val) => {
    if (val === "N/A" || val === null || val === undefined) return "-";
    const num = Number(val);
    if (isNaN(num)) return val; // if it's text, return as-is
    return parseFloat(num.toFixed(4)); // removes trailing zeros
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`bg-white w-[92vw]  ${
          selectedItem ? "max-w-6xl" : "max-w-2xl"
        } rounded-lg p-6 border border-primary overflow-y-auto max-h-[90vh] `}
      >
        <h2 className="text-xl font-bold mb-4 text-primary">
          Receive Material
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item & Vendor Select */}
          <div className="flex flex-wrap gap-5">
            <div className="w-full ">
              <label className="block text-sm font-semibold text-black mb-1">
                Select BOM
              </label>
              <Select
                menuPortalTarget={document.body}
                options={miOptions}
                value={selectedItem}
                onChange={async (item) => {
                  setSelectedItem(item);
                  const actualItem = item.m;
                  const stockMap = await fetchStockBySkuCodes(
                    (actualItem.consumptionTable || []).map((c) => c.skuCode)
                  );

                  const enhanced = (actualItem.consumptionTable || []).map(
                    (c) => {
                      const originalIssueQty = getIssueQty(c);
                      const alreadyReceivedQty = Number(c.receiveQty) || 0;
                      const remainingQty = Math.max(
                        originalIssueQty - alreadyReceivedQty,
                        0
                      );
                      const stockQty = Number(
                        stockMap[c.skuCode] ?? c.stockQty ?? 0
                      );

                      return {
                        ...c,
                        receiveQty: "",
                        isReceived: remainingQty <= 0,
                        originalQty: c.qty,
                        originalWeight: c.weight,
                        originalIssueQty,
                        alreadyReceivedQty,
                        remainingQty,
                        stockQty,
                        currentStockQty: stockQty,
                      };
                    }
                  );

                  setConsumptionTable(enhanced);
                }}
                placeholder="Item Name or SKU"
                isSearchable
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({
                    ...base,
                    width: "max-content",
                    minWidth: "100%",
                  }),
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
              <table className="w-full mb-4 text-[11px] border text-left whitespace-nowrap">
                <thead className="bg-primary/70">
                  <tr>
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
                      Issue Weight
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Issue Qty
                    </th>
                    <th className="px-2 py-1 border-r border-primary">
                      Receive Qty/Weight
                    </th>
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
                          {idx + 1}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.skuCode || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.itemName || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          {item.category || "-"}
                        </td>
                        <td className="px-2 py-1 border-r border-primary">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-200">
                            {fmt(item.weight)}
                          </span>
                        </td>

                        <td className="px-2 py-1 border-r border-primary">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-200">
                            {fmt(item.qty)}
                          </span>
                        </td>

                        <td className="px-2 py-1 border-r border-primary">
                          <input
                            type="text" // keep text so decimals like 0.012 work
                            inputMode="decimal"
                            placeholder="Receive"
                            value={item.receiveQty ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;

                              // allow only numbers + decimals
                              if (!/^\d*\.?\d*$/.test(raw)) return;

                              const updated = [...consumptionTable];
                              const currentRow = { ...updated[idx] };

                              // ✅ Case: cleared input
                              if (raw === "") {
                                currentRow.receiveQty = "";
                                currentRow.isReceived = false;

                                updated[idx] = currentRow;
                                setConsumptionTable(updated);
                                return;
                              }

                              // ✅ Case: valid number
                              const value = parseFloat(raw);
                              const remainingQty =
                                Number(currentRow.remainingQty) ||
                                getIssueQty(currentRow);

                              // keep raw string
                              currentRow.receiveQty = raw;

                              if (!isNaN(value)) {
                                if (value > remainingQty) {
                                  toast.error(
                                    "Receive Qty cannot be greater than remaining Issue Qty/Weight"
                                  );
                                  return;
                                }

                                currentRow.isReceived = value >= remainingQty;
                              }

                              updated[idx] = currentRow;
                              setConsumptionTable(updated);
                            }}
                            className="border border-primary px-2 py-1 rounded w-20"
                          />
                        </td>

                        <td className="px-2 py-1 border-r border-primary">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${(() => {
                              const remainingQty =
                                Number(item.remainingQty) || getIssueQty(item);
                              const currentStockQty = Number(
                                item.currentStockQty ?? item.stockQty ?? 0
                              );

                              return remainingQty && currentStockQty < 0
                                ? "bg-red-200 "
                                : "bg-green-100 ";
                            })()}`}
                          >
                            {Number(
                              item.currentStockQty ?? item.stockQty ?? 0
                            ).toFixed(2)}
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

          {/* Final Save */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
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
        </form>
      </div>
    </div>
  );
};

export default Receive;
