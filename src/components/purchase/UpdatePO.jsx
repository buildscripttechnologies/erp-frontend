import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { BeatLoader } from "react-spinners";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Tooltip } from "react-tooltip";

const UpdatePO = ({ onClose, onUpdated, po }) => {
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
  // console.log("ware", warehouses);
  // console.log("add", address);

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

  // console.log("po item", poItems);

  const totalAmount = poItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const totalGstAmount = poItems.reduce(
    (sum, item) => sum + (Number(item.amountWithGst) - Number(item.amount)),
    0
  );

  const totalAmountWithGst = poItems.reduce(
    (sum, item) => sum + Number(item.amountWithGst),
    0
  );
  // fetch dropdowns
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

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0]; // keep only yyyy-MM-dd
  };

  // pre-fill PO data
  useEffect(() => {
    if (po) {
      setSelectedVendor({
        value: po.vendor._id,
        label: `${po.vendor.venderCode} - ${po.vendor.vendorName} - ${po.vendor.natureOfBusiness}`,
      });
      setDate(formatDateForInput(po.date));
      setExpiryDate(formatDateForInput(po.expiryDate));
      setDeliveryDate(formatDateForInput(po.deliveryDate));

      setAddress(po.address || "");
      setPoItems(
        po.items.map((i) => ({
          item: {
            value: i.item._id,
            label: `${i.item.skuCode} - ${i.item.itemName} - ${i.item.description}`,
          },
          orderQty: i.orderQty,
          rate: i.rate,
          gst: i.gst,
          amount: i.amount,
          amountWithGst: i.amountWithGst,
          itemStatus: i.itemStatus || "pending", // ✅ use itemStatus
          rejectionReason: i.rejectionReason || "", // ✅ keep rejection reason
          isEdited: false, // initially false
          itemDetails: {
            ...i.item,
            purchaseUOM: i.item?.purchaseUOM?.unitName || "",
            stockUOM: i.item?.stockUOM?.unitName || "",
            rate: i.rate,
            gst: i.gst,
          },
          gstAmount: i.gstAmount,
        }))
      );
    }
  }, [po]);

  // add item to list
  const handleAddItem = () => {
    if (
      !selectedItem ||
      !selectedVendor ||
      !orderQty ||
      !itemDetails.rate ||
      !date ||
      !expiryDate ||
      !deliveryDate ||
      !address
    ) {
      return toast.error("All fields are required before adding item");
    }

    if (orderQty < moq) {
      return toast.error(`Minimum Order Qty is ${moq}`);
    }

    const rate = Number(itemDetails?.rate || 0).toFixed(2);
    const gst = Number(itemDetails?.gst || 0).toFixed(2);
    const amount = Number(orderQty) * rate;
    const gstAmount = Number((amount * gst) / 100).toFixed(2);
    const amountWithGst = Number(Number(amount) + Number(gstAmount)).toFixed(2);

    const newItem = {
      item: selectedItem,
      orderQty,
      itemDetails,
      rate,
      gst,
      amount,
      itemStatus: "pending",
      amountWithGst,
    };

    if (editIndex !== null) {
      // update existing
      const updated = [...poItems];
      updated[editIndex] = {
        ...newItem,
        itemStatus: "pending", // ✅ edited items always go pending
        isEdited: true, // ✅ mark as edited
      };
      setPoItems(updated);
      setEditIndex(null); // reset back
      toast.success("Item updated successfully");
    } else {
      // add new
      setPoItems((prev) => [
        ...prev,
        { ...newItem, itemStatus: "pending", isEdited: true }, // new item is pending
      ]);
      toast.success("Item added successfully");
    }

    // clear form
    setSelectedItem(null);
    setOrderQty("");
    setItemDetails(null);
    setMoq(1);
  };

  // console.log("item details", itemDetails);

  const handleEdit = (index) => {
    const item = poItems[index];
    // console.log("item", item);

    setSelectedItem(item.item);
    setItemDetails(item.itemDetails);
    setOrderQty(item.orderQty);
    setMoq(item.itemDetails?.moq || 1);
    setEditIndex(index);
  };

  // remove item from list
  const handleRemove = (index) => {
    const updated = [...poItems];
    updated.splice(index, 1);
    setPoItems(updated);
  };

  const calculateStatus = () => {
    const total = poItems.length;
    const rejected = poItems.filter((i) => i.itemStatus === "rejected").length;
    const pending = poItems.filter((i) => i.itemStatus === "pending").length;
    const approved = total - rejected - pending;

    // if even one is pending → whole PO is pending
    if (pending > 0) return "pending";

    // single item case
    if (total === 1) return rejected === 1 ? "rejected" : "approved";

    // two items case
    if (total === 2) {
      if (rejected === 2) return "rejected";
      if (rejected === 1) return "partially-approved";
      return "approved";
    }

    // more than two items
    if (rejected === 0) return "approved"; // all approved
    if (approved === 0) return "rejected"; // all rejected
    return "partially-approved"; // mix of approved & rejected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (poItems.length === 0) return toast.error("Add at least one item");

    setLoading(true);
    try {
      const payload = {
        items: poItems.map((p) => {
          let finalStatus = p.itemStatus;

          if (p.itemStatus === "rejected") {
            finalStatus = "rejected"; // keep rejection
          } else if (p.isEdited) {
            finalStatus = "pending"; // edited/new items pending
          } else if (p.itemStatus === "approved") {
            finalStatus = "approved"; // untouched → approved
          } else {
            finalStatus = "pending";
          }

          return {
            item: p.item.value,
            orderQty: p.orderQty,
            rate: p.rate,
            gst: p.gst,
            amount: Number(p.amount).toFixed(2),
            gstAmount: (Number(p.amountWithGst) - Number(p.amount)).toFixed(2),
            amountWithGst: Number(p.amountWithGst).toFixed(2),
            itemStatus: finalStatus,
            rejectionReason: p.rejectionReason,
          };
        }),
        expiryDate,
        deliveryDate,
        address,
        vendor: selectedVendor.value,
        date,
        status: calculateStatus(items),
        totalAmount: totalAmount.toFixed(2),
        totalGstAmount: totalGstAmount.toFixed(2),
        totalAmountWithGst: totalAmountWithGst.toFixed(2),
      };

      const res = await axios.patch(`/pos/update/${po._id}`, payload);

      if (res.data.status === 403) {
        toast.error(res.data.message);
        return;
      }

      toast.success("Purchase Order Updated Successfully");
      onClose();
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update PO");
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
          Update Purchase Order
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
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row justify-between">
            {/* Add item button */}
            <button
              type="button"
              onClick={handleAddItem}
              disabled={po.status !== "pending" && editIndex === null}
              className={`px-4 py-1 font-semibold rounded cursor-pointer
    ${
      po.status !== "pending" && editIndex === null
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-primary hover:bg-primary/80 text-[#292926]"
    }`}
            >
              {editIndex != null ? "Update Item" : "Add Item"}
            </button>

            {/* Total Summary */}
            {poItems.length > 0 && (
              <div className="px-4 py-2 bg-primary text-[#292926] font-semibold rounded shadow-sm text-center space-y-1">
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
                    className={`
                    border border-primary rounded-lg p-4 shadow-sm
                    ${
                      editIndex === i
                        ? "bg-blue-100"
                        : p.itemStatus === "approved"
                        ? "bg-green-100"
                        : p.itemStatus === "rejected"
                        ? "bg-red-100"
                        : "bg-gray-50"
                    }
                  `}
                  >
                    {/* Row Number */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-primary">
                        Item #{i + 1}
                      </span>
                      <div className="flex gap-2">
                        {p.itemStatus !== "approved" && (
                          <>
                            <button
                              data-tooltip-id="statusTip"
                              data-tooltip-content="Edit"
                              type="button"
                              onClick={() => handleEdit(i)}
                              className="p-1.5 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs cursor-pointer"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              data-tooltip-id="statusTip"
                              data-tooltip-content="Delete"
                              type="button"
                              onClick={() => handleRemove(i)}
                              // disabled={p.itemStatus === "approved"} // ❌ prevent removing approved
                              className={`p-1.5 rounded-full transition cursor-pointer
      ${
        p.itemStatus === "approved"
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800"
      }`}
                            >
                              <FiTrash2 size={16} />
                            </button>
                            <Tooltip
                              id="statusTip"
                              place="top"
                              style={{
                                backgroundColor: "#292926",
                                color: "white",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Key → Value Pairs */}
                    <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-[#292926]">
                      <p>
                        <span className="font-semibold text-primary">
                          Item:{" "}
                        </span>
                        {p.item.label}
                      </p>
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
                        {p.itemStatus === "rejected" && (
                          <p className="text-sm text-red-700 mt-1">
                            Reason: {p.rejectionReason || "Not provided"}
                          </p>
                        )}
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
              className="flex items-center px-6 py-2 bg-primary hover:bg-primary/80 text-[#292926] font-semibold rounded cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="mr-2">Updating</span>
                  <BeatLoader size={5} color="#292926" />
                </>
              ) : (
                "Update"
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

export default UpdatePO;
