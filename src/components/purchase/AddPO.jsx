import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { ClipLoader } from "react-spinners";
import { useMemo } from "react";
import { FiTrash2 } from "react-icons/fi";
import { FcApproval } from "react-icons/fc";

const AddPO = ({ onClose, onAdded }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [orderQty, setOrderQty] = useState("");
  const [moq, setMoq] = useState(1);
  const [date, setDate] = useState(Date.now());
  //   const [baseQty, setBaseQty] = useState("");
  //   const [damagedQty, setDamagedQty] = useState("");
  const [loading, setLoading] = useState(false);

  //   const [manualEntries, setManualEntries] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [rms, setRms] = useState([]);
  //   const [sfgs, setSfgs] = useState([]);
  //   const [fgs, setFgs] = useState([]);
  // console.log("stock qty", stockQty);

  const [itemDetails, setItemDetails] = useState(null);
  const [qualityApproved, setQualityApproved] = useState(false);
  const [qualityNote, setQualityNote] = useState("");

  const handleOrderQty = (e) => {
    const value = e.target.value;
    const numericValue = Number(value);

    // Check if the value is a number and is less than the MOQ
    if (!isNaN(numericValue) && numericValue < moq && value !== "") {
      setOrderQty(moq);
    } else {
      setOrderQty(value);
    }
  };

  //   const totalStockQty = useMemo(() => {
  //     return manualEntries.reduce(
  //       (acc, entry) => acc + Number(entry.baseQty || 0),
  //       0
  //     );
  //   }, [manualEntries]);

  //   const totalDamagedQty = useMemo(() => {
  //     return manualEntries.reduce(
  //       (acc, entry) => acc + Number(entry.damagedQty || 0),
  //       0
  //     );
  //   }, [manualEntries]);

  //   useEffect(() => {
  //     if (manualEntries.length > 0) {
  //       const totalStock = manualEntries.reduce(
  //         (sum, entry) => sum + Number(entry.baseQty || 0),
  //         0
  //       );
  //       const totalDamaged = manualEntries.reduce(
  //         (sum, entry) => sum + Number(entry.damagedQty || 0),
  //         0
  //       );
  //       setStockQty(totalStock);
  //       setDamagedQty(totalDamaged);
  //     }
  //   }, [manualEntries]);

  // Assuming only base qty contributes to stock

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [vendorRes, rmRes, sfgRes, fgRes] = await Promise.all([
          axios.get("/vendors/get-all"),
          axios.get("/rms/rm"),
        ]);
        setVendors(vendorRes.data.data || []);
        setRms(rmRes.data.rawMaterials || []);
      } catch {
        toast.error("Failed to fetch UOM or RM data");
      }
    };
    fetchDropdowns();
  }, []);

  const addManualRow = () => {
    setManualEntries([...manualEntries, { baseQty: "", damagedQty: "" }]);
  };

  const updateManualRow = (index, field, value) => {
    const updated = [...manualEntries];
    updated[index][field] = value;
    setManualEntries(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!selectedItem || !selectedVendor) return toast.error("All fields required");

    setLoading(true);

    console.log("vendor", selectedVendor);
    console.log("item", selectedItem);

    try {
      // const payload = {
      //   itemId: selectedItem.value,
      //   itemType: selectedItem.type,
      //   stockQty: parseFloat(stockQty),
      //   baseQty: baseQty,
      //   damagedQty: damagedQty,
      //   manualEntries: manualEntries.length > 0 ? manualEntries : undefined,
      // };
      const payload = {
        vendor: selectedVendor.value,
        item: selectedItem.value,
        orderQty: orderQty,
        totalAmount: Number(orderQty) * Number(itemDetails.rate),
      };

      console.log("payload", payload);

      const res = await axios.post("/pos/add-po", payload);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Purchase Order Successfull");
      onClose();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Purchase Order failed");
    } finally {
      setLoading(false);
    }
  };

  let items = [
    ...rms.map((r) => ({
      value: r.id,
      label: `${r.skuCode} - ${r.itemName} - ${r.description}`,
      type: "RM",
      r: r,
    })),
  ];

  let vendorsOptions = [
    ...vendors.map((v) => ({
      value: v._id,
      label: `${v.venderCode} - ${v.vendorName} - ${v.natureOfBusiness}`,
      v: v,
    })),
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-xl rounded-lg p-6 border border-primary overflow-y-auto max-h-[90vh]">
        <div className="flex  items-center justify-between">
          <h2 className="text-xl font-bold mb-4 text-primary">Inward</h2>
          {/* <button className="px-4 py-2 bg-primary cursor-pointer text-[#292926] rounded hover:bg-primary/80 font-semibold">
            Inward by PO
          </button> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between gap-5">
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-[#292926] mb-1">
                Select Item
              </label>
              <Select
                options={items}
                value={selectedItem}
                onChange={(item) => {
                  setSelectedItem(item);

                  // Extract the actual item object depending on type
                  const actualItem = item.r;
                  setItemDetails(actualItem);
                  if (actualItem) {
                    setMoq(actualItem.moq);
                    setOrderQty(actualItem.moq);
                  } else {
                    setMoq(0);
                    setOrderQty("");
                  }

                  // Auto-approve if no quality inspection is needed
                  setQualityApproved(!actualItem.qualityInspectionNeeded);
                }}
                placeholder="item-name or SKU"
                isSearchable
                className="react-select-container cursor-pointer"
                classNamePrefix="react-select"
                required
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
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-[#292926] mb-1">
                Select Vendor
              </label>
              <Select
                options={vendorsOptions}
                value={selectedVendor}
                onChange={(v) => {
                  setSelectedVendor(v);

                  // Extract the actual item object depending on type
                  //   const actualItem = item.r || item.s || item.f;
                  //   setItemDetails(actualItem);

                  // Auto-approve if no quality inspection is needed
                  //   setQualityApproved(!actualItem.qualityInspectionNeeded);
                }}
                placeholder="vendor-name or code"
                isSearchable
                className="react-select-container cursor-pointer"
                classNamePrefix="react-select"
                required
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
          {itemDetails && (
            <div className="bg-gray-100 border border-primary rounded p-4 mt-3 text-sm space-y-1">
              <div className="grid sm:grid-cols-2  ">
                <div>
                  <strong className="mr-1">Purchase UOM:</strong>{" "}
                  {itemDetails.purchaseUOM}
                </div>

                <div className="flex sm:justify-end">
                  <strong className="mr-1">Stock Qty:</strong>
                  {itemDetails.stockQty || "—"}
                </div>
                <div>
                  <strong className="mr-1">Category:</strong>{" "}
                  {itemDetails.itemCategory || "—"}
                </div>
                <div className="flex sm:justify-end">
                  <strong className="mr-1">Color:</strong>{" "}
                  {itemDetails.itemColor || "—"}
                </div>
                <div>
                  <strong>HSN:</strong> {itemDetails.hsnOrSac || "—"}
                </div>
                <div className="flex sm:justify-end">
                  <strong className="mr-1">Rate: </strong>₹
                  {itemDetails.rate || "—"}
                </div>

                <div>
                  <strong className="mr-1">GST:</strong>{" "}
                  {`${itemDetails.gst ? itemDetails.gst + "%" : "—"}`}
                </div>
              </div>

              {/* <div className="mt-3">
                  <div className="flex justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={!itemDetails.qualityInspectionNeeded}
                        checked={qualityApproved}
                        onChange={(e) => setQualityApproved(e.target.checked)}
                      />
                      Approve Quality
                    </label>
                    <div className="font-semibold mb-1">
                      {itemDetails.qualityInspectionNeeded ? (
                        <span className="text-red-600">
                          {qualityApproved ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <FcApproval /> Quality Approved
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              ⚠️ Requires Quality Inspection
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-green-600">
                          Don't Require Quality Inspection
                        </span>
                      )}
                    </div>
                  </div>

                  <textarea
                    placeholder="Add quality notes (optional)"
                    value={qualityNote}
                    onChange={(e) => setQualityNote(e.target.value)}
                    className="mt-2 w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition duration-200"
                    rows={3}
                  />
                </div> */}
            </div>
          )}

          <div className="flex flex-wrap gap-5">
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-black mb-1">
                Order Qty
              </label>
              <input
                type="number"
                placeholder="Order Qty"
                value={orderQty}
                onChange={handleOrderQty}
                className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition duration-200"
                required
              />
              {moq > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Minimum Order Quantity (MOQ): {moq}
                </p>
              )}
            </div>

            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-black mb-1">
                Date
              </label>
              <input
                type="date"
                placeholder="Date"
                value={date ? new Date(date).toISOString().split("T")[0] : ""}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition duration-200"
              />
            </div>
          </div>

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

export default AddPO;
