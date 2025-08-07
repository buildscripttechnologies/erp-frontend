import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import Select from "react-select";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import { FiTrash2 } from "react-icons/fi";
import { ClipLoader } from "react-spinners";

const UpdateBomModal = ({ onClose, onSuccess, bom }) => {
  const [form, setForm] = useState({
    partyName: bom.partyName || "",
    productName: bom.productName || "",
    orderQty: bom.orderQty || "",
    date: bom.date?.split("T")[0] || new Date().toISOString().split("T")[0],
  });

  const [productDetails, setProductDetails] = useState(
    bom.productDetails || []
  );
  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [rmRes, sfgRes, fgRes, customerRes] = await Promise.all([
          axios.get("/rms/rm?limit=10000"),
          axios.get("/sfgs/get-all?limit=10000"),
          axios.get("/fgs/get-all?limit=10000"),
          axios.get("/customers/get-all?limit=10000"),
        ]);

        setRms(
          (rmRes.data.rawMaterials || []).map((item) => ({
            ...item,
            type: "RawMaterial",
          }))
        );

        setSfgs(
          (sfgRes.data.data || []).map((item) => ({
            ...item,
            type: "SFG",
          }))
        );

        setFgs(fgRes.data.data || []);
        setCustomers(customerRes.data.data || []);
      } catch {
        toast.error("Failed to load dropdown data");
      }
    };

    fetchDropdownData();
  }, []);

  const materialOptions = [
    ...rms.map((rm) => ({
      label: `${rm.skuCode}: ${rm.itemName}${
        rm.description ? " - " + rm.description : ""
      }`,
      value: rm.id,
      type: "RawMaterial",
    })),
    ...sfgs.map((sfg) => ({
      label: `${sfg.skuCode}: ${sfg.itemName}${
        sfg.description ? " - " + sfg.description : ""
      }`,
      value: sfg.id,
      type: "SFG",
    })),
  ];

  const updateComponent = (index, field, value) => {
    const updated = [...productDetails];
    updated[index][field] = value;
    setProductDetails(updated);
  };

  const removeComponent = (index) => {
    const updated = [...productDetails];
    updated.splice(index, 1);
    setProductDetails(updated);
  };

  const handleAddComponent = () => {
    setProductDetails([
      ...productDetails,
      {
        itemId: "",
        type: "",
        qty: "",
        height: "",
        width: "",
        depth: "",
        label: "",
        partName: "",
      },
    ]);
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!form.partyName || !form.productName || !form.orderQty) {
      setLoading(false);
      return toast.error("Please fill all required fields");
    }

    const hasEmptyComponent = productDetails.some((comp) => {
      return (
        !comp.itemId ||
        comp.qty === "" ||
        comp.height === "" ||
        comp.width === "" ||
        comp.depth === "" ||
        comp.partName === ""
      );
    });

    if (hasEmptyComponent) {
      setLoading(false);
      return toast.error("Please fill or remove all incomplete RM/SFG rows");
    }

    try {
      const payload = {
        ...form,
        productDetails: productDetails.map(({ label, ...rest }) => rest),
      };

      let res = await axios.patch(`/boms/update/${bom._id}`, payload);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("BOM updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to update BOM");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto  shadow-lg border border-[#d8b76a] text-[#292926]">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 bg-white p-4 z-10 pb-2">
          <h2 className="text-xl font-semibold">Update Bill of Materials</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-red-500 font-bold text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="px-4 pb-4">
          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-[12px] font-semibold mb-[2px] text-[#292926] capitalize">
                Party Name
              </label>
              <CreatableSelect
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: "#d8b76a",
                    boxShadow: state.isFocused ? "0 0 0 1px #d8b76a" : "none",
                    "&:hover": { borderColor: "#d8b76a" },
                  }),
                }}
                options={customers.map((c) => ({
                  label: c.customerName,
                  value: c.customerName.trim(),
                }))}
                placeholder="Select or Type Customer"
                onChange={(e) => setForm({ ...form, partyName: e?.value })}
                onCreateOption={(val) => setForm({ ...form, partyName: val })}
                value={
                  form.partyName
                    ? { label: form.partyName, value: form.partyName }
                    : null
                }
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold mb-[2px] text-[#292926] capitalize">
                Product Name
              </label>
              <CreatableSelect
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: "#d8b76a",
                    boxShadow: state.isFocused ? "0 0 0 1px #d8b76a" : "none",
                    "&:hover": { borderColor: "#d8b76a" },
                  }),
                }}
                options={fgs.map((fg) => ({
                  label: fg.itemName,
                  value: fg.itemName.trim(),
                }))}
                placeholder="Select or Type FG Product"
                onCreateOption={(val) => setForm({ ...form, productName: val })}
                value={
                  form.productName
                    ? { label: form.productName, value: form.productName }
                    : null
                }
                // onChange={(e) => setForm({ ...form, productName: e?.value })}
                onChange={(e) => {
                  const selectedFG = fgs.find((fg) => fg.itemName === e?.value);
                  setForm({ ...form, productName: e?.value });

                  if (!selectedFG) return;

                  const allDetails = [
                    ...(selectedFG.rm || []),
                    ...(selectedFG.sfg || []),
                  ];

                  const enrichedDetails = allDetails.map((item) => ({
                    itemId: item.id,
                    type: item.type,
                    qty: item.qty || "",
                    height: item.height || "",
                    width: item.width || "",
                    depth: item.depth || "",
                    label: `${item.skuCode}: ${item.itemName}${
                      item.description ? ` - ${item.description}` : ""
                    }`,
                    partName: "",
                  }));

                  setProductDetails(enrichedDetails);
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[12px] font-semibold mb-[2px] text-[#292926] capitalize">
                Order Qty
              </label>
              <input
                type="number"
                placeholder="Order Qty"
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition"
                value={form.orderQty}
                onChange={(e) => setForm({ ...form, orderQty: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[12px] font-semibold mb-[2px] text-[#292926] capitalize">
                Date
              </label>
              <input
                type="date"
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          {/* RM/SFG Components */}
          <div>
            <h3 className="font-bold text-[14px] mb-2 text-[#d8b76a] underline">
              RM/SFG Components
            </h3>

            <div className="flex flex-col gap-4">
              {productDetails.map((comp, index) => (
                <div
                  key={index}
                  className="border border-[#d8b76a] rounded p-3 flex flex-col gap-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-[12px] font-semibold mb-[2px] text-[#292926]">
                        Component
                      </label>
                      <Select
                        value={materialOptions.find(
                          (opt) => opt.value === comp.itemId
                        )}
                        options={materialOptions}
                        onChange={(e) => {
                          updateComponent(index, "itemId", e.value);
                          updateComponent(index, "type", e.type);
                          updateComponent(index, "label", e.label);
                        }}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            borderColor: "#d8b76a",
                            boxShadow: state.isFocused
                              ? "0 0 0 1px #d8b76a"
                              : "none",
                            "&:hover": { borderColor: "#d8b76a" },
                          }),
                        }}
                      />
                    </div>

                    {["partName", "height", "width", "depth", "qty"].map(
                      (field) => (
                        <div className="flex flex-col" key={field}>
                          <label className="text-[12px] font-semibold mb-[2px] text-[#292926] capitalize">
                            {field == "partName"
                              ? "Part Name"
                              : field == "qty"
                              ? "Qty"
                              : `${field} (Inch)`}
                          </label>
                          <input
                            type={field == "partName" ? "text" : "number"}
                            placeholder={
                              field == "partName"
                                ? "Item Part Name"
                                : field == "qty"
                                ? "qty"
                                : `${field} (Inch)`
                            }
                            className="p-1.5 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition"
                            value={comp[field]}
                            onChange={(e) =>
                              updateComponent(index, field, e.target.value)
                            }
                          />
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-2">
                    <button
                      type="button"
                      className="text-red-600 text-xs hover:underline flex items-center gap-1 cursor-pointer"
                      onClick={() => removeComponent(index)}
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddComponent}
                className="bg-[#d8b76a] hover:bg-[#d8b76a91] text-[#292926] px-3 py-1 rounded flex items-center gap-1 mt-2 cursor-pointer w-fit text-sm"
              >
                + Add RM/SFG
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="bg-[#d8b76a] text-black px-6 py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer items-center"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <ClipLoader size={20} color="#292926" />
                </>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBomModal;
