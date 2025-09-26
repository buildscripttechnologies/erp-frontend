import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../utils/axios";
import Select from "react-select";
import { BeatLoader } from "react-spinners";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { IoArrowUndoCircleOutline } from "react-icons/io5";
import { Tooltip } from "react-tooltip";

const PreviewPO = ({ po, onUpdated, onClose, onApproved, onRejected }) => {
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

  const [rejectionDialog, setRejectionDialog] = useState({
    open: false,
    index: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  // console.log("po item", poItems);

  const calculateTotals = () => {
    const validItems = poItems.filter((item) => item.itemStatus != "rejected");

    // console.log("valid items", validItems);

    const totalAmount = validItems.reduce(
      (sum, i) => Number(sum) + Number(i.amount),
      0
    );
    const totalGstAmount = validItems.reduce(
      (sum, i) => Number(sum) + Number(i.gstAmount),
      0
    );
    const totalAmountWithGst = validItems.reduce(
      (sum, i) => Number(sum) + Number(i.amountWithGst),
      0
    );

    // console.log(totalAmount, totalGstAmount, totalAmountWithGst);

    return { totalAmount, totalGstAmount, totalAmountWithGst };
  };

  const { totalAmount, totalGstAmount, totalAmountWithGst } = calculateTotals();

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
          itemDetails: {
            ...i.item,
            purchaseUOM: i.item?.purchaseUOM?.unitName || "",
            stockUOM: i.item?.stockUOM?.unitName || "",
            rate: i.rate,
            gst: i.gst,
          },
          gstAmount: i.gstAmount,
          amountWithGst: i.amountWithGst,

          // ✅ use values from DB
          itemStatus: i.itemStatus || false,
          rejectionReason: i.rejectionReason || "",
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
      amountWithGst,
      // itemStatus: false,
      // itemStatus: "approved",
      rejectionReason: "",
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
    calculateTotals();
    calculateStatus();
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

  const handleReject = (index) => {
    if (!rejectionReason.trim()) return;

    if (index === "all") {
      handleRejectAll();
    } else {
      setPoItems((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? { ...item, itemStatus: "rejected", rejectionReason }
            : item
        )
      );
    }

    setRejectionDialog({ open: false, index: null });
    setRejectionReason("");
    setEditIndex(null);
    setSelectedItem(null);
    setOrderQty("");
    setItemDetails(null);
    setMoq(1);
  };

  const handleRestore = (index) => {
    setPoItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, itemStatus: "approved", rejectionReason: "" }
          : item
      )
    );
  };

  const calculateStatus = () => {
    const total = poItems.length;
    const rejected = poItems.filter((i) => i.itemStatus == "rejected").length;
    const approved = total - rejected;

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
    return "partially-approved"; // mix of both
  };

  const buildPayload = (items, status = null) => {
    // ✅ First, normalize items:
    const normalizedItems = items.map((p) => ({
      ...p,
      itemStatus: p.itemStatus === "rejected" ? "rejected" : "approved", // force approval if not rejected
      rejectionReason: p.itemStatus === "rejected" ? p.rejectionReason : "", // clear rejection reason for approved
    }));

    status = status || calculateStatus(normalizedItems);

    return {
      items: normalizedItems.map((p) => ({
        item: p.item.value,
        orderQty: p.orderQty,
        rate: p.rate,
        gst: p.gst,
        amount: Number(p.amount).toFixed(2),
        gstAmount: (Number(p.amountWithGst) - Number(p.amount)).toFixed(2),
        amountWithGst: Number(p.amountWithGst).toFixed(2),
        itemStatus: p.itemStatus,
        rejectionReason: p.rejectionReason,
      })),
      expiryDate,
      deliveryDate,
      address,
      vendor: selectedVendor.value,
      date,
      status,
      totalAmount,
      totalGstAmount,
      totalAmountWithGst,
    };
  };

  const doSubmit = async (payload, status) => {
    setLoading(true);
    try {
      await axios.patch(`/pos/update/${po._id}`, payload);

      if (status === "rejected") {
        onRejected?.();
      } else {
        onApproved?.();
      }

      onClose();
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update PO");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = buildPayload(poItems);
    if (JSON.stringify(payload) === JSON.stringify(po)) {
      toast("No changes detected");
      return;
    }

    const status = calculateStatus(poItems);
    doSubmit(payload, status);
  };

  const handleRejectAll = () => {
    const rejectedItems = poItems.map((i) => ({
      ...i,
      itemStatus: "rejected",
      rejectionReason, // from your rejection dialog
    }));

    const payload = buildPayload(rejectedItems, "rejected");
    console.log("payLoad", payload);

    doSubmit(payload, "rejected");
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
  // const formatDateForInput = (date) => {
  //   if (!date) return "";
  //   const d = new Date(date);
  //   const day = String(d.getDate()).padStart(2, "0");
  //   const month = String(d.getMonth() + 1).padStart(2, "0");
  //   const year = String(d.getFullYear()).slice(-2); // last 2 digits
  //   return `${day}-${month}-${year}`;
  // };

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
          Review Purchase Order
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
                placeholder="dd-mm-yy"
                value={expiryDate}
                onChange={(e) =>
                  setExpiryDate(parseDateFromInput(e.target.value))
                }
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
                type="date"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="">Select Address</option>
                <option value="132,133,134, ALPINE INDUSTRIAL PARK,NR. CHORYASI TOLL PLAZA, AT. CHORYASI,KAMREJ, SURAT- 394150. GUJARAT,INDIA.">
                  Warehouse 1
                </option>
                <option value="Plot no. 62, Gate no. 3, Siddhivinayak Industrial Estate Taluka, Kholvad, Laskana-Kholvad Rd, opp. Opera palace, Kamrej, Gujarat 394190">
                  Warehouse 2
                </option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row justify-between">
            {/* Add item button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-1 bg-primary hover:bg-primary/80 text-[#292926] font-semibold rounded cursor-pointer"
            >
              {editIndex != null ? "Update Item" : "Add Item"}
            </button>
            {/* Total Summary */}
            {poItems.length > 0 && (
              <div className="px-4 py-2 bg-primary text-[#292926] font-semibold rounded shadow-sm text-center space-y-1">
                {/* <div>Total Amount (₹): {totalAmount.toFixed(2)}</div> */}
                <div>
                  Total Amount with GST (₹):{" "}
                  {Number(totalAmountWithGst).toFixed(2)}
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
                    className={`border rounded-lg p-4 shadow-sm ${
                      editIndex === i
                        ? "bg-blue-100"
                        : p.itemStatus == "rejected"
                        ? "bg-red-50 border-red-400 opacity-70"
                        : p.itemStatus == "approved"
                        ? "bg-green-50 border-primary"
                        : "bg-gray-50 border-primary"
                    } `}
                  >
                    {/* Row Number */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-primary">
                        Item #{i + 1}
                      </span>
                      <div className="flex gap-2">
                        {p.itemStatus == "rejected" ? (
                          <button
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Restore"
                            type="button"
                            onClick={() => handleRestore(i)}
                            className="p-1.5 rounded-full bg-green-200 hover:bg-green-300 text-green-900 text-xs cursor-pointer"
                          >
                            <IoArrowUndoCircleOutline size={16} />
                          </button>
                        ) : (
                          <>
                            <button
                              data-tooltip-id="statusTip"
                              data-tooltip-content="Reject"
                              type="button"
                              onClick={() =>
                                setRejectionDialog({ open: true, index: i })
                              }
                              className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 text-xs  cursor-pointer"
                            >
                              <AiOutlineCloseCircle size={16} />
                            </button>
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
                              className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition cursor-pointer"
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
                      </div>
                    </div>
                    {p.itemStatus == "rejected" && (
                      <p className="mt-2 text-sm text-red-600">
                        Rejection Reason: {p.rejectionReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Save */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={() => setRejectionDialog({ open: true, index: "all" })}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded cursor-pointer"
            >
              Reject PO
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-primary hover:bg-primary/80 text-[#292926] font-semibold rounded cursor-pointer "
            >
              {loading ? (
                <>
                  <span className="mr-2">Updating</span>
                  <BeatLoader size={5} color="#292926" />
                </>
              ) : (
                "Next"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-[#292926] rounded cursor-pointer "
            >
              Cancel
            </button>
          </div>
          {rejectionDialog.open && (
            <div className="fixed inset-0 flex items-center justify-center  bg-black/20  z-50">
              <div className="bg-white border-2 border-primary rounded-lg p-6 w-96">
                <h3 className="text-lg font-bold mb-3 text-primary">
                  Reject {rejectionDialog.index === "all" ? "PO" : "Item"}
                </h3>
                <textarea
                  className="w-full p-2 border border-primary rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  rows="3"
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setRejectionDialog({ open: false, index: null });
                      setRejectionReason("");
                    }}
                    className="px-4 py-1 bg-gray-300 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(rejectionDialog.index)}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-1 bg-red-500 text-white rounded disabled:opacity-50 cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PreviewPO;
