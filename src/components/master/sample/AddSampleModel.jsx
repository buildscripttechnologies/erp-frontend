import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import Select from "react-select";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import { FiTrash2 } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { capitalize } from "lodash";

const AddSampleModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    partyName: "",
    productName: "",
    orderQty: 1,
    date: new Date().toISOString().split("T")[0],
    height: 0,
    width: 0,
    depth: 0,
    B2B: 0,
    D2C: 0,
    rejection: 2,
    QC: 0.75,
    machineMaintainance: 1.75,
    materialHandling: 1.75,
    packaging: 2,
    shipping: 1,
    companyOverHead: 4,
    indirectExpense: 1.75,
    stitching: 0,
    printing: 0,
    others: 0,
    unitRate: 0,
    unitB2BRate: 0,
    unitD2CRate: 0,
  });

  const [productDetails, setProductDetails] = useState([]);
  // const [selectedFg, setSelectedFg] = useState();
  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [components, setComponents] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [rmRes, sfgRes, fgRes, customerRes] = await Promise.all([
          axios.get("/rms/rm"),
          axios.get("/sfgs/get-all"),
          axios.get("/fgs/get-all"),
          axios.get("/customers/get-all"),
        ]);
        setRms(
          (rmRes.data.rawMaterials || []).map((i) => ({
            ...i,
            type: "RawMaterial",
          }))
        );
        setSfgs((sfgRes.data.data || []).map((i) => ({ ...i, type: "SFG" })));
        setFgs(fgRes.data.data || []);
        setCustomers(customerRes.data.data || []);
        setComponents([...rms, ...sfgs, ...fgs]);
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
      sqInchRate: rm.sqInchRate,
    })),
    ...sfgs.map((sfg) => ({
      label: `${sfg.skuCode}: ${sfg.itemName}${
        sfg.description ? " - " + sfg.description : ""
      }`,
      value: sfg.id,
      type: "SFG",
      sqInchRate: sfg.sqInchRate || 1,
    })),
  ];

  const recalculateTotals = (
    updatedForm = form,
    updatedDetails = productDetails
  ) => {
    const {
      rejection,
      QC,
      machineMaintainance,
      materialHandling,
      packaging,
      shipping,
      companyOverHead,
      indirectExpense,
      stitching,
      printing,
      others,
      B2B,
      D2C,
    } = updatedForm;

    const overheadPercent =
      rejection +
      QC +
      machineMaintainance +
      materialHandling +
      packaging +
      shipping +
      companyOverHead +
      indirectExpense;

    console.log("overHead", overheadPercent);

    const baseComponentRate = updatedDetails.reduce(
      (sum, comp) => sum + (Number(comp.rate) || 0),
      0
    );
    const totalR = baseComponentRate + stitching + printing + others;

    const unitRate = totalR + (totalR * overheadPercent) / 100;
    const unitB2BRate = totalR + (totalR * (overheadPercent + B2B)) / 100;
    const unitD2CRate = totalR + (totalR * (overheadPercent + D2C)) / 100;

    setForm((prev) => ({
      ...prev,
      ...updatedForm,
      unitRate: unitRate.toFixed(2),
      unitB2BRate: unitB2BRate.toFixed(2),
      unitD2CRate: unitD2CRate.toFixed(2),
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      "height",
      "width",
      "depth",
      "qty",
      "sqInchRate",
      "rejection",
      "QC",
      "machineMaintainance",
      "materialHandling",
      "packaging",
      "shipping",
      "companyOverHead",
      "indirectExpense",
      "stitching",
      "printing",
      "others",
      "B2B",
      "D2C",
    ];
    const newValue = numericFields.includes(name) ? Number(value) || 0 : value;
    recalculateTotals({ ...form, [name]: newValue }, productDetails);
  };

  const handleAddComponent = () => {
    setProductDetails((prev) => [
      ...prev,
      {
        itemId: "",
        type: "",
        qty: 0,
        partName: "",
        height: 0,
        width: 0,
        // depth: 0,
        rate: 0,
        label: "",
      },
    ]);
  };

  const updateComponent = (index, field, value) => {
    const updated = [...productDetails];
    updated[index][field] = value;

    // console.log("index field value", index, field, value);

    if (field === "sqInchRate") {
      updated[index].sqInchRate = value;
      // console.log("sq in rate", updated[index].sqInchRate);
    }

    let height = Number(updated[index].height) || 0;
    let width = Number(updated[index].width) || 0;
    let qty = Number(updated[index].qty) || 0;
    let sqInchRate = Number(updated[index].sqInchRate) || null;

    console.log("sq rate", sqInchRate);

    updated[index].rate =
      height && width && qty && sqInchRate
        ? Number((height * width * qty * sqInchRate).toFixed(2))
        : null;

    setProductDetails(updated);
    recalculateTotals(form, updated);
  };

  const removeComponent = (index) => {
    const updated = [...productDetails];
    updated.splice(index, 1);
    setProductDetails(updated);
    recalculateTotals(form, updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!form.partyName || !form.productName || !form.orderQty) {
      setLoading(false);
      return toast.error("Please fill all required fields");
    }
    const hasEmpty = productDetails.some(
      (c) =>
        !c.itemId || c.qty <= 0 || c.height <= 0 || c.width <= 0 || !c.partName
    );
    if (hasEmpty) {
      setLoading(false);
      return toast.error("Please fill or remove all incomplete RM/SFG rows");
    }
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ ...form, productDetails }));
      files.forEach((f) => formData.append("files", f));

      const res = await axios.post("/samples/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.status === 403) return toast.error(res.data.message);

      toast.success("Sample added successfully");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add Sample");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto   shadow-lg border border-[#d8b76a] text-[#292926]">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 p-4 bg-white z-10">
          <h2 className="text-xl font-semibold">Add Sample Product</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-red-500 font-bold text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="px-4 pb-5">
          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm ">
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
                    "&:hover": {
                      borderColor: "#d8b76a",
                    },
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
                    "&:hover": {
                      borderColor: "#d8b76a",
                    },
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
                  // setForm({ ...form, productName: e?.value });

                  setForm({
                    ...form,
                    productName: e?.value,
                    height: selectedFG.height || 0,
                    width: selectedFG.width || 0,
                    depth: selectedFG.depth || 0,
                    B2B: selectedFG.B2B || 0,
                    D2C: selectedFG.D2C || 0,
                    rejection: selectedFG.rejection || 2,
                    QC: selectedFG.QC || 0.75,
                    machineMaintainance: selectedFG.machineMaintainance || 1.75,
                    materialHandling: selectedFG.materialHandling || 1.75,
                    packaging: selectedFG.packaging || 2,
                    shipping: selectedFG.shipping || 1,
                    companyOverHead: selectedFG.companyOverHead || 4,
                    indirectExpense: selectedFG.indirectExpense || 1.75,
                    stitching: selectedFG.stitching || 0,
                    printing: selectedFG.printing || 0,
                    others: selectedFG.others || 0,
                    unitRate: selectedFG.unitRate || 0,
                    unitB2BRate: selectedFG.unitB2BRate || 0,
                    unitD2CRate: selectedFG.unitD2CRate || 0,
                  });

                  console.log("selectedFG", selectedFG);

                  if (!selectedFG) return;

                  const allDetails = [
                    ...(selectedFG.rm || []),
                    ...(selectedFG.sfg || []),
                  ];
                  // setSelectedFg(selectedFG);

                  const enrichedDetails = allDetails.map((item) => ({
                    itemId: item.id,
                    type: item.type,
                    qty: item.qty || "",
                    height: item.height || "",
                    width: item.width || "",
                    rate: item.rate || "",
                    sqInchRate: item.sqInchRate || "",
                    partName: item.partName || "",
                    // depth: item.depth || "",
                    label: `${item.skuCode}: ${item.itemName}${
                      item.description ? ` - ${item.description}` : ""
                    }`,
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
                disabled
                type="number"
                placeholder="Order Qty"
                className="p-2 border border-[#d8b76a] cursor-not-allowed rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition"
                value="1"
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
            <div className="flex flex-col ">
              <label className="text-[12px] font-semibold mb-[2px] text-[#292926] capitalize">
                Upload Files
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles([...e.target.files])}
                className="block text-sm text-gray-600 cursor-pointer bg-white border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fdf6e9] file:text-[#292926] hover:file:bg-[#d8b76a]/10 file:cursor-pointer"
              />
            </div>
          </div>

          {/* Product Size */}
          <div className="flex-col my-2">
            <div>
              <h2 className="font-semibold mb-1">Product Size</h2>
            </div>
            <div className="p-2 border text-[12px] border-primary rounded grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Height (Inch)</label>
                <input
                  type="number"
                  name="height"
                  placeholder="Height (Inch)"
                  value={form.height}
                  onChange={(e) => handleFormChange(e)}
                  className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Width (Inch)</label>
                <input
                  type="number"
                  name="width"
                  placeholder="Width (Inch)"
                  value={form.width}
                  onChange={(e) => handleFormChange(e)}
                  className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Depth (Inch)</label>
                <input
                  type="number"
                  name="depth"
                  placeholder="Depth (Inch)"
                  value={form.depth}
                  onChange={(e) => handleFormChange(e)}
                  className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                />
              </div>
            </div>
          </div>

          {/* Components Section */}
          <div>
            <h3 className="font-bold text-[14px] my-2 text-[#d8b76a] underline">
              RM/SFG Components
            </h3>

            <div className="flex flex-col gap-4">
              {productDetails.map((comp, index) => (
                <div
                  key={index}
                  className="border border-[#d8b76a] rounded p-3 flex flex-col gap-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
                    {/* Component Field - span 2 columns on medium+ screens */}
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-[12px] font-semibold mb-[2px] text-[#292926]">
                        Component
                      </label>
                      <Select
                        className="w-full"
                        required
                        value={materialOptions.find(
                          (opt) => opt.value === comp.itemId
                        )}
                        options={materialOptions}
                        onChange={(e) => {
                          updateComponent(index, "itemId", e.value);
                          updateComponent(index, "type", e.type);
                          updateComponent(index, "label", e.label);
                          updateComponent(index, "sqInchRate", e.sqInchRate);
                        }}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            borderColor: "#d8b76a",
                            boxShadow: state.isFocused
                              ? "0 0 0 1px #d8b76a"
                              : "none",
                            "&:hover": {
                              borderColor: "#d8b76a",
                            },
                          }),
                        }}
                      />
                    </div>

                    {/* Height, Width, Depth, Qty Fields */}
                    {["partName", "height", "width", "qty", "rate"].map(
                      (field) => (
                        <div className="flex flex-col" key={field}>
                          <label className="text-[12px] font-semibold mb-[2px] text-[#292926] capitalize">
                            {field == "partName"
                              ? "Part Name"
                              : field == "qty" || field == "rate"
                              ? capitalize(field)
                              : `${field} (Inch)`}
                          </label>
                          <input
                            type={field == "partName" ? "text" : "number"}
                            placeholder={
                              field == "partName"
                                ? "Item Part Name"
                                : field == "qty" || field == "rate"
                                ? field
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
                onClick={() => handleAddComponent({ label: "", value: "" })}
                className="bg-[#d8b76a] hover:bg-[#d8b76a91] text-[#292926] px-3 py-1 rounded flex items-center gap-1 mt-2 cursor-pointer w-fit text-sm"
              >
                + Add RM/SFG
              </button>
            </div>
          </div>

          <div className="bg-primary w-full h-[1px] my-5"></div>

          {/* bottom fields */}
          <div className="sm:text-[12px] mb-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">B2B (%)</label>
              <input
                type="number"
                name="B2B"
                placeholder="B2B"
                value={form.B2B}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">D2C (%)</label>
              <input
                type="number"
                name="D2C"
                placeholder="D2C"
                value={form.D2C}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Rejection (%)</label>
              <input
                type="number"
                name="rejection"
                placeholder="Rejection"
                value={form.rejection}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">QC (%)</label>
              <input
                type="number"
                name="QC"
                placeholder="QC"
                value={form.QC}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">
                Machine Maintainance (%)
              </label>
              <input
                type="number"
                name="machineMaintainance"
                placeholder="Machine Maintainance"
                value={form.machineMaintainance}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">
                Material Handling (%)
              </label>
              <input
                type="number"
                name="materialHandling"
                placeholder="Material Handling"
                value={form.materialHandling}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Packaging (%)</label>
              <input
                type="number"
                name="packaging"
                placeholder="Packaging"
                value={form.packaging}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Shipping (%)</label>
              <input
                type="number"
                name="shipping"
                placeholder="Shipping"
                value={form.shipping}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Company OverHead (%)</label>
              <input
                type="number"
                name="companyOverHead"
                placeholder="Company OverHead"
                value={form.companyOverHead}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Indirect Expense (%)</label>
              <input
                type="number"
                name="indirectExpense"
                placeholder="Indirect Expense"
                value={form.indirectExpense}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Stitching (₹)</label>
              <input
                type="number"
                name="stitching"
                placeholder="Stitching"
                value={form.stitching}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Print/Emb (₹)</label>
              <input
                type="number"
                name="printing"
                placeholder="Print/Emb"
                value={form.printing}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Others (₹)</label>
              <input
                type="number"
                name="others"
                placeholder="Others"
                value={form.others}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Unit Rate (₹)</label>
              <input
                disabled
                type="number"
                name="unitRate"
                placeholder="Unit Rate"
                value={form.unitRate}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200 disabled:cursor-not-allowed"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Unit B2B (₹)</label>
              <input
                disabled
                type="number"
                name="unitB2BRate"
                placeholder="Unit B2B"
                value={form.unitB2BRate}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Unit D2C (₹)</label>
              <input
                disabled
                type="number"
                name="unitD2CRate"
                placeholder="Unit D2C"
                value={form.unitD2CRate}
                onChange={(e) => handleFormChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="bg-[#d8b76a] text-black px-6 py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSampleModal;
