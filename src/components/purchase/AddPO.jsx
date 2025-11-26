import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { BeatLoader } from "react-spinners";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { add } from "lodash";
import DatePicker from "react-datepicker";

const AddPO = ({ onClose, onAdded, prefillItem }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [orderQty, setOrderQty] = useState("");

  const [moq, setMoq] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState();
  const [deliveryDate, setDeliveryDate] = useState();
  const [address, setAddress] = useState();
  const [loading, setLoading] = useState(false);

  const [vendors, setVendors] = useState([]);
  const [rms, setRms] = useState([]);
  const [itemDetails, setItemDetails] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  // multiple items state
  const [poItems, setPoItems] = useState([]);

  const [warehouses, setWarehouses] = useState();

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await axios.get("/settings/company-details");

        setWarehouses(res.data.warehouses || []);
      } catch {
        toast.error("Failed to fetch vendors or items");
      }
    };
    fetchWarehouses();
  }, []);

  // ---- Your existing total amount
  const totalAmount = poItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  // ---- Add these:
  const totalGstAmount = poItems.reduce(
    (sum, item) => sum + (Number(item.amountWithGst) - Number(item.amount)),
    0
  );

  const totalAmountWithGst = poItems.reduce(
    (sum, item) => sum + Number(item.amountWithGst),
    0
  );

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

  // helper function
  const prefillFromItem = (prefillItem, rms) => {
    if (!prefillItem || !rms || rms.length === 0) return null;

    const found = rms.find((r) => r.skuCode === prefillItem.skuCode);
    if (!found) return null;

    return {
      value: found.id,
      label: `${found.skuCode} - ${found.itemName} - ${found.description}`,
      r: found,
    };
  };

  useEffect(() => {
    if (prefillItem && rms.length > 0) {
      const matchedItem = prefillFromItem(prefillItem, rms);
      if (matchedItem) {
        setSelectedItem(matchedItem);
        setItemDetails(matchedItem.r);
        setMoq(matchedItem.r.moq || 1);
      }
    }
  }, [prefillItem, rms]);

  // NEW STATE

  // UPDATE handleAddItem
  const handleAddItem = () => {
    const validators = [
      { valid: selectedItem, message: "Please select an item" },
      { valid: selectedVendor, message: "Please select a vendor" },
      { valid: orderQty, message: "Order quantity is required" },
      { valid: itemDetails?.rate, message: "Rate is required" },
      { valid: date, message: "Order date is required" },
      { valid: expiryDate, message: "Expiry date is required" },
      { valid: deliveryDate, message: "Delivery date is required" },
      { valid: address, message: "Please select an address" },
      { valid: itemDetails?.description, message: "Description is required" },
    ];

    for (const v of validators) {
      if (!v.valid) {
        toast.error(v.message);
        return;
      }
    }

    if (orderQty < moq) {
      return toast.error(`Minimum Order Qty is ${moq}`);
    }

    const rate = Number(itemDetails?.rate || 0).toFixed(2);
    const gst = Number(itemDetails?.gst || 0).toFixed(2);
    const amount = Number(orderQty) * rate;
    const gstAmount = Number((amount * gst) / 100).toFixed(2);
    const amountWithGst = Number(Number(amount) + Number(gstAmount)).toFixed(2);
    const description = itemDetails?.description || "";
    const newItem = {
      item: selectedItem,
      orderQty,
      itemDetails,
      rate,
      gst,
      amount,
      amountWithGst,
      description,
    };

    if (editIndex !== null) {
      // update existing
      const updated = [...poItems];
      updated[editIndex] = newItem;
      setPoItems(updated);
      setEditIndex(null); // reset back
      toast.success("Item updated successfully");
    } else {
      // add new
      setPoItems((prev) => [...prev, newItem]);
      toast.success("Item added successfully");
    }

    // clear form
    setSelectedItem(null);
    setOrderQty("");
    setItemDetails(null);
    setMoq(1);
  };

  // HANDLE EDIT
  const handleEdit = (index) => {
    const item = poItems[index];
    setSelectedItem(item.item);
    setItemDetails(item.itemDetails);
    setOrderQty(item.orderQty);
    setMoq(item.itemDetails?.moq || 1);
    setDescription(item.description);
    setEditIndex(index);
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
          gst: p.gst,
          amount: Number(p.amount).toFixed(2),
          gstAmount: (Number(p.amountWithGst) - Number(p.amount)).toFixed(2),
          amountWithGst: Number(p.amountWithGst).toFixed(2),
          description: p.itemDetails.description || "",
        })),
        expiryDate,
        deliveryDate,
        address,
        vendor: selectedVendor.value,
        date,
        totalAmount: totalAmount.toFixed(2),
        totalGstAmount: totalGstAmount.toFixed(2),
        totalAmountWithGst: totalAmountWithGst.toFixed(2),
      };

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

  // Convert Date object or ISO string -> dd-MM-yy
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2); // last 2 digits
    return `${day}-${month}-${year}`;
  };

  // Convert from input (dd-MM-yy) -> ISO (for saving in DB)
  const parseDateFromInput = (value) => {
    if (!value) return null;
    const [day, month, year] = value.split("-");
    return new Date(`20${year}-${month}-${day}`); // converts to yyyy-MM-dd
  };

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
                    borderColor: "var(--color-primary)",
                    boxShadow: state.isFocused
                      ? "0 0 0 1px var(--color-primary)"
                      : "none",
                    "&:hover": { borderColor: "var(--color-primary)" },
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
                    borderColor: "var(--color-primary)",
                    boxShadow: state.isFocused
                      ? "0 0 0 1px var(--color-primary)"
                      : "none",
                    "&:hover": { borderColor: "var(--color-primary)" },
                  }),
                }}
                className=""
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
                  {itemDetails.stockQty?.toFixed(2) || "—"}
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
              <div className="flex">
                <strong className="mr-1">Description:</strong>{" "}
                <textarea
                  name=""
                  id=""
                  placeholder="Item Description"
                  className="w-full px-1 py-0.5 border rounded"
                  value={itemDetails?.description || ""}
                  onChange={(e) => {
                    const newItems = { ...itemDetails }; // copy array
                    newItems.description = e.target.value; // update rate for specific row
                    setItemDetails(newItems); // update state
                  }}
                ></textarea>
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
                placeholder="dd-mm-yy"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
              {/* <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                dateFormat="dd-MM-yy" // 👈 shows exactly like 23-08-25
                placeholderText="dd-mm-yy"
              /> */}
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-2">
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-black mb-1">
                Rate
              </label>
              <input
                type="number"
                placeholder="Rate"
                value={itemDetails?.rate || ""}
                onChange={(e) => {
                  const newItems = { ...itemDetails }; // copy array
                  newItems.rate = e.target.value; // update rate for specific row
                  setItemDetails(newItems); // update state
                }}
                className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-black mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-2">
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-black mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                placeholder="Delivery Data"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="w-[48%]">
              <label className="block text-sm font-semibold text-black mb-1">
                Select Address
              </label>
              <select
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="">Select Address</option>
                {warehouses?.map((wh, index) => (
                  <option key={index} value={wh.address}>
                    {wh.name} - {wh.address}
                    {/* or you can show wh.name + " - " + wh.address */}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            {/* Add item button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-1 bg-primary hover:bg-primary/80 text-secondary font-semibold rounded cursor-pointer"
            >
              {editIndex != null ? "Update Item" : "Add Item"}
            </button>
            {/* Total Summary */}
            {poItems.length > 0 && (
              <div className="px-4 py-2 bg-primary text-secondary font-semibold rounded shadow-sm text-center space-y-1">
                {/* <div>Total Amount (₹): {totalAmount.toFixed(2)}</div> */}
                <div>
                  Total Amount with GST (₹): {totalAmountWithGst.toFixed(2)}
                </div>
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
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(i)}
                          className="px-2 py-1 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(i)}
                          className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
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
                      <div className="flex flex-wrap gap-3">
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
                            GST (%) :{" "}
                          </span>
                          <span className="">{Number(p.gst).toFixed(2)}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-primary">
                            Amount (₹):{" "}
                          </span>
                          <span className="">
                            {Number(p.amount).toFixed(2)}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-primary">
                            Amount with GST (₹):{" "}
                          </span>
                          <span className="font-semibold">
                            {Number(p.amountWithGst).toFixed(2)}
                          </span>
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
              className="flex items-center px-6 py-2 bg-primary hover:bg-primary/80 text-secondary font-semibold rounded cursor-pointer"
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
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-secondary rounded cursor-pointer"
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
