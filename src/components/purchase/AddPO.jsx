import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { ClipLoader } from "react-spinners";
import { FiTrash2 } from "react-icons/fi";

const AddPO = ({ onClose, onAdded }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [orderQty, setOrderQty] = useState("");
  const [moq, setMoq] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const [vendors, setVendors] = useState([]);
  const [rms, setRms] = useState([]);
  const [itemDetails, setItemDetails] = useState(null);

  // multiple items state
  const [poItems, setPoItems] = useState([]);

  const totalAmount = poItems.reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [vendorRes, rmRes] = await Promise.all([
          axios.get("/vendors/get-all"),
          axios.get("/rms/rm"),
        ]);
        setVendors(vendorRes.data.data || []);
        setRms(rmRes.data.rawMaterials || []);
      } catch {
        toast.error("Failed to fetch vendors or items");
      }
    };
    fetchDropdowns();
  }, []);

  // const handleOrderQty = (e) => {
  //   const value = e.target.value;
  //   const numericValue = Number(value);
  //   if (!isNaN(numericValue) && numericValue < moq && value !== "") {
  //     setOrderQty(moq);
  //   } else {
  //     setOrderQty(value);
  //   }
  // };

  // add item to list
  const handleAddItem = () => {
    if (!selectedItem || !selectedVendor || !orderQty) {
      return toast.error("All fields are required before adding item");
    }

    if (orderQty < moq) {
      return toast.error(`Minimum Order Qty is ${moq}`);
    }

    const rate = Number(itemDetails?.rate || 0);
    const amount = Number(orderQty) * rate;

    const newItem = {
      item: selectedItem,
      // vendor: selectedVendor,
      orderQty,
      // date,
      itemDetails,
      rate,
      amount,
    };

    setPoItems((prev) => [...prev, newItem]);

    // clear item & vendor but keep list
    setSelectedItem(null);
    // setSelectedVendor(null);
    setOrderQty("");
    // setDate(new Date().toISOString().split("T")[0]);
    setItemDetails(null);
    setMoq(1);

    // console.log("Added Item:", newItem);
  };

  // remove item from list
  const handleRemove = (index) => {
    const updated = [...poItems];
    updated.splice(index, 1);
    setPoItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (poItems.length === 0) return toast.error("Add at least one item");

    setLoading(true);
    try {
      const payload = {
        items: poItems.map((p) => ({
          item: p.item.value,
          orderQty: p.orderQty,
          rate: p.rate,
          amount: p.amount,
        })),
        vendor: selectedVendor.value,
        date: date,
        totalAmount: totalAmount,
      };

      // console.log("payload", payload);

      const res = await axios.post("/pos/add-po", payload);
      if (res.data.status === 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Purchase Order Created Successfully");
      onClose();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Purchase Order failed");
    } finally {
      setLoading(false);
    }
  };

  let items = rms.map((r) => ({
    value: r.id,
    label: `${r.skuCode} - ${r.itemName} - ${r.description}`,
    r: r,
  }));

  let vendorsOptions = vendors.map((v) => ({
    value: v._id,
    label: `${v.venderCode} - ${v.vendorName} - ${v.natureOfBusiness}`,
    v: v,
  }));

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-2xl rounded-lg p-6 border border-primary overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-primary">
          Create Purchase Order
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item & Vendor Select */}
          <div className="flex flex-wrap gap-5">
            <div className="w-full sm:w-[48%]">
              <label className="block text-sm font-semibold text-[#292926] mb-1">
                Select Item
              </label>
              <Select
                options={items}
                value={selectedItem}
                onChange={(item) => {
                  setSelectedItem(item);
                  const actualItem = item.r;
                  setItemDetails(actualItem);
                  if (actualItem) {
                    setMoq(actualItem.moq);
                    setOrderQty(actualItem.moq);
                  } else {
                    setMoq(0);
                    setOrderQty("");
                  }
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
            <div className="w-full sm:w-[48%]">
              <label className="block text-sm font-semibold text-[#292926] mb-1">
                Select Vendor
              </label>
              <Select
                isDisabled={poItems.length > 0}
                options={vendorsOptions}
                value={selectedVendor}
                onChange={(v) => setSelectedVendor(v)}
                placeholder="Vendor Name or Code"
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
            <div className="bg-gray-100 border border-primary rounded p-4 mt-3 text-sm space-y-1">
              <div className="grid sm:grid-cols-2">
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
            </div>
          )}

          {/* Qty & Date */}
          <div className="flex flex-wrap justify-between gap-2">
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-black mb-1">
                Order Qty
              </label>
              <input
                type="number"
                placeholder="Order Qty"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
              {moq > 0 && (
                <p className="mt-1 text-xs text-gray-500">MOQ: {moq}</p>
              )}
            </div>
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-black mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            {/* Add item button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-1 bg-primary hover:bg-primary/80 text-[#292926] font-semibold rounded cursor-pointer"
            >
              Add Item
            </button>
            {/* Total Summary */}
            {poItems.length > 0 && (
              <div className="px-4 py-1 bg-primary text-[#292926] font-semibold rounded shadow-sm text-center">
                Total Amount (₹): {totalAmount.toFixed(2)}
              </div>
            )}
          </div>

          {/* Items List */}
          {poItems.length > 0 && (
            <div className="mt-6 border-t border-primary pt-4">
              <h3 className="text-lg font-bold text-primary mb-4">
                Added Items
              </h3>

              <div className="space-y-4">
                {poItems.map((p, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-primary rounded-lg p-4 shadow-sm"
                  >
                    {/* Row Number */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-primary">
                        Item #{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(i)}
                        className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    {/* Key → Value Pairs */}
                    <div className="grid grid-cols-1  gap-x-6 gap-y-2 text-sm text-[#292926]">
                      <p>
                        <span className="font-semibold text-primary">
                          Item:{" "}
                        </span>
                        {p.item.label}
                      </p>
                      {/* <p>
                        <span className="font-semibold text-primary">
                          Vendor:{" "}
                        </span>
                        {p.vendor.label}
                      </p> */}
                      <div className="flex gap-3">
                        {" "}
                        <p>
                          <span className="font-semibold text-primary">
                            Order Qty:{" "}
                          </span>
                          {p.orderQty}
                        </p>
                        <p>
                          <span className="font-semibold text-primary">
                            Rate (₹):{" "}
                          </span>
                          {p.rate}
                        </p>
                        <p>
                          <span className="font-semibold text-primary">
                            Amount (₹):{" "}
                          </span>
                          <span className="font-semibold">{p.amount}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

export default AddPO;
