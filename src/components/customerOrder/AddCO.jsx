import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import Select from "react-select";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import { FiTrash2 } from "react-icons/fi";
import { capitalize } from "lodash";
import { calculateRate } from "../../utils/calc";
import { generateConsumptionTable } from "../../utils/consumptionTable";
// import { plastic, slider, zipper } from "../../data/dropdownData";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { useCategoryArrays } from "../../data/dropdownData";

const AddCO = ({ onClose, onSuccess }) => {
   const { fabric, slider, plastic, zipper } = useCategoryArrays();
  const [form, setForm] = useState({
    partyName: "",
    productName: "",
    sampleNo: "",
    orderQty: 1,
    date: new Date().toISOString().split("T")[0],
    deliveryDate: "",
  });

  const [productDetails, setProductDetails] = useState([]);
  // const [selectedProduct, setSelectedFg] = useState();
  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);
  const [samples, setSamples] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState([]);

  const [files, setFiles] = useState([]);
  const [printingFiles, setPrintingFiles] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [rmRes, sfgRes, fgRes, customerRes, sampleRes] =
          await Promise.all([
            axios.get("/rms/rm"),
            axios.get("/sfgs/get-all"),
            axios.get("/fgs/get-all"),
            axios.get("/customers/get-all"),
            axios.get("/samples/get-all"),
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
        setSamples(sampleRes.data.data || []);
        setComponents([...rms, ...sfgs, ...fgs]);
      } catch {
        toast.error("Failed to load dropdown data");
      }
    };
    fetchDropdownData();
  }, []);

  const productOptions = [
    ...samples.map((s) => ({
      label: `${s.sampleNo}: ${s.product.name}${
        s.description ? " - " + s.description : ""
      }`,
      value: s._id,
      type: "SAMPLE",
      sample: s,
    })),
    ...fgs.map((fg) => ({
      label: `${fg.skuCode}: ${fg.itemName}${
        fg.description ? " - " + fg.description : ""
      }`,
      value: fg.id,
      type: "FG",
      fg: fg,
    })),
  ];

  // console.log("product Options", productOptions);

  const recalculateTotals = (
    updatedForm = form,
    updatedDetails = productDetails
  ) => {
    const {
      orderQty,
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
    const unitR = baseComponentRate / orderQty + stitching + printing + others;

    const totalR =
      (baseComponentRate / orderQty + stitching + printing + others) * orderQty;

    const unitRate = unitR + (unitR * overheadPercent) / 100;
    const unitB2BRate = unitR + (unitR * (overheadPercent + B2B)) / 100;
    const unitD2CRate = unitR + (unitR * (overheadPercent + D2C)) / 100;
    const totalRate = totalR + (totalR * overheadPercent) / 100;
    const totalB2BRate = totalR + (totalR * (overheadPercent + B2B)) / 100;
    const totalD2CRate = totalR + (totalR * (overheadPercent + D2C)) / 100;

    setForm((prev) => ({
      ...prev,
      ...updatedForm,
      unitRate: unitRate.toFixed(2),
      unitB2BRate: unitB2BRate.toFixed(2),
      unitD2CRate: unitD2CRate.toFixed(2),
      totalRate: totalRate.toFixed(2),
      totalB2BRate: totalB2BRate.toFixed(2),
      totalD2CRate: totalD2CRate.toFixed(2),
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      "height",
      "width",
      "depth",
      "orderQty",
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
    const newValue = numericFields.includes(name)
      ? Number(value) || null
      : value;

    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const addSample = () => {
    navigate("/sample-master", { state: { showModal: true } });
  };

  const handleSubmit = async () => {
    console.log("form", form.partyName, form.productName, form.orderQty);

    setLoading(true);
    if (!form.partyName || !form.productName || !form.orderQty) {
      setLoading(false);
      return toast.error("Please fill all required fields");
    }
    const hasEmpty = productDetails.some(
      (c) =>
        !c.itemId || c.qty <= 0 || c.height <= 0 || c.width <= 0 || !c.partName
    );

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ ...form }));

      const res = await axios.post("/cos/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("res co", res);

      if (res.data.status === 403) return toast.error(res.data.message);

      toast.success("CO added successfully");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add CO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto   shadow-lg border border-primary text-black">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 p-4 bg-white z-10">
          <h2 className="text-xl font-semibold">Add Customer Order</h2>
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
              <label className="text-[12px] font-semibold mb-[2px] text-black capitalize">
                Product Name
              </label>
              <Select
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: "var(--color-primary)",
                    boxShadow: state.isFocused
                      ? "0 0 0 1px var(--color-primary)"
                      : "none",
                    "&:hover": {
                      borderColor: "var(--color-primary)",
                    },
                  }),
                }}
                options={productOptions}
                placeholder="Select or Type FG Product"
                onCreateOption={(val) => setForm({ ...form, productName: val })}
                value={
                  form.productName
                    ? { label: form.productName, value: form.productName }
                    : null
                }
                // onChange={(e) => setForm({ ...form, productName: e?.value })}

                onChange={(e) => {
                  let selectedProduct = null;
                  console.log("e", e);

                  if (e.type === "FG") {
                    selectedProduct = e.fg;
                    // setForm({ ...form, productName: selectedProduct.itemName });
                  } else if (e.type === "SAMPLE") {
                    selectedProduct = e.sample;
                    // setForm({
                    //   ...form,
                    //   productName: selectedProduct.product.name,
                    // });
                  }

                  setForm({
                    productName:
                      selectedProduct.itemName ||
                      selectedProduct.product.name ||
                      "",
                    sampleNo:
                      selectedProduct.sampleNo || selectedProduct.skuCode,
                    partyName: selectedProduct.partyName || "",
                    orderQty: selectedProduct.orderQty || 1,
                  });

                  console.log("selectedProduct", selectedProduct);

                  if (!selectedProduct) return;

                  const allDetails = [
                    ...(selectedProduct.rm || []),
                    ...(selectedProduct.sfg || []),
                    ...(selectedProduct.productDetails || []),
                  ];
                  // setSelectedFg(selectedProduct);
                }}
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold mb-[2px] text-black capitalize">
                Party Name
              </label>
              <CreatableSelect
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: "var(--color-primary)",
                    boxShadow: state.isFocused
                      ? "0 0 0 1px var(--color-primary)"
                      : "none",
                    "&:hover": {
                      borderColor: "var(--color-primary)",
                    },
                  }),
                }}
                options={customers.map((c) => ({
                  label: c.customerName,
                  value: c.customerName?.trim(),
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

            <div className="flex flex-col">
              <label className="text-[12px] font-semibold mb-[2px] text-black capitalize">
                Order Qty
              </label>
              <input
                type="number"
                placeholder="Order Qty"
                name="orderQty"
                className="p-2 border border-primary  rounded focus:border-2 focus:border-primary focus:outline-none transition"
                value={form.orderQty}
                // onChange={(e) => setForm({ ...form, orderQty: e.target.value })}
                onChange={(e) => handleFormChange(e)}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <div className="flex flex-col w-full">
                <label className="text-[12px] font-semibold mb-[2px] text-black capitalize">
                  Date
                </label>
                <input
                  type="date"
                  className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="text-[12px] font-semibold mb-[2px] text-black capitalize">
                  Delivery Date
                </label>
                <input
                  type="date"
                  className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition"
                  value={form.deliveryDate}
                  onChange={(e) =>
                    setForm({ ...form, deliveryDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-5">
            <button
              onClick={addSample}
              className="bg-primary text-secondary px-6 py-2 rounded hover:bg-primary/80 cursor-pointer"
            >
              Add Sample
            </button>
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="flex items-center bg-primary text-secondary px-6 py-2 rounded hover:bg-primary/80 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving </span>{" "}
                  <BeatLoader size={5} color="#292926" />
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

export default AddCO;
