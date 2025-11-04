import React, { useEffect, useState } from "react";
import axios from "./../../utils/axios";
import Select from "react-select";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import { BeatLoader } from "react-spinners";
import { calculateRate } from "./../../utils/calc";
import { generateConsumptionTable } from "./../../utils/consumptionTable";
import { useCategoryArrays } from "./../../data/dropdownData";

const AddQuotation = ({ onClose, onSuccess, coData }) => {
  const { fabric, slider, plastic, zipper } = useCategoryArrays();
  const categoryData = useCategoryArrays();

  const [partyName, setPartyName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [form, setForm] = useState([
    {
      productName: "",
      description: "",
      sampleNo: "",
      orderQty: 0,
      date: new Date().toISOString().split("T")[0],
      deliveryDate: "",
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
      totalRate: 0,
      totalB2BRate: 0,
      totalD2CRate: 0,
      productDetails: [],
    },
  ]);

  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);
  const [samples, setSamples] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

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
      } catch {
        toast.error("Failed to load dropdown data");
      }
    };
    fetchDropdownData();
  }, []);

  const productOptions = [
    ...fgs.map((fg) => ({
      label: `${fg.skuCode}: ${fg.itemName}${
        fg.description ? " - " + fg.description : ""
      }`,
      value: fg.id,
      type: "FG",
      fg: fg,
    })),
  ];

  const recalculateTotals = (index, updatedForm, updatedDetails) => {
    setForm((prev) => {
      const formsCopy = [...prev];
      const currentForm = updatedForm || formsCopy[index];
      const details = updatedDetails || currentForm.productDetails || [];

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
      } = currentForm;

      const oq = Number(orderQty) || 1;
      const overheadPercent =
        Number(rejection || 0) +
        Number(QC || 0) +
        Number(machineMaintainance || 0) +
        Number(materialHandling || 0) +
        Number(packaging || 0) +
        Number(shipping || 0) +
        Number(companyOverHead || 0) +
        Number(indirectExpense || 0);

      const baseComponentRate = details.reduce(
        (sum, comp) => sum + (Number(comp.rate) || 0),
        0
      );

      const unitR =
        baseComponentRate / oq +
        (Number(stitching) || 0) +
        (Number(printing) || 0) +
        (Number(others) || 0);
      const totalR = unitR * oq;

      const unitRate = unitR + (unitR * overheadPercent) / 100;
      const unitB2BRate =
        unitR + (unitR * (overheadPercent + Number(B2B || 0))) / 100;
      const unitD2CRate =
        unitR + (unitR * (overheadPercent + Number(D2C || 0))) / 100;
      const totalRate = totalR + (totalR * overheadPercent) / 100;
      const totalB2BRate =
        totalR + (totalR * (overheadPercent + Number(B2B || 0))) / 100;
      const totalD2CRate =
        totalR + (totalR * (overheadPercent + Number(D2C || 0))) / 100;

      formsCopy[index] = {
        ...formsCopy[index],
        ...currentForm,
        productDetails: details,
        unitRate: unitRate.toFixed(2),
        unitB2BRate: unitB2BRate.toFixed(2),
        unitD2CRate: unitD2CRate.toFixed(2),
        totalRate: totalRate.toFixed(2),
        totalB2BRate: totalB2BRate.toFixed(2),
        totalD2CRate: totalD2CRate.toFixed(2),
      };
      return formsCopy;
    });
  };

  const handleFormChange = (index, e) => {
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
    const newValue = numericFields.includes(name) ? Number(value) || 0 : value;

    setForm((prev) => {
      const formsCopy = [...prev];
      let currentForm = { ...formsCopy[index] };
      let updatedDetails = [...(currentForm.productDetails || [])];

      if (name === "orderQty") {
        const oq = Number(newValue) || 1;
        updatedDetails = updatedDetails.map((comp) => {
          const category = (comp.category || "").toLowerCase();

          const updated = { ...comp };

          updated.qty = (Number(comp.tempQty) || 0) * oq;
          updated.grams = (Number(comp.tempGrams) || 0) * oq;
          updated.width = Number(comp.tempWidth) || comp.width || 0;
          updated.rate = calculateRate(updated, oq, categoryData);

          return updated;
        });
      }

      currentForm = {
        ...currentForm,
        [name]: newValue,
        productDetails: updatedDetails,
      };

      formsCopy[index] = currentForm;

      setTimeout(
        () => recalculateTotals(index, currentForm, updatedDetails),
        0
      );
      return formsCopy;
    });
  };

  const addNewQuotation = () => {
    setForm((prev) => [
      ...prev,
      {
        productName: "",
        description: "",
        sampleNo: "",
        orderQty: 0,
        date: new Date().toISOString().split("T")[0],
        deliveryDate: "",
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
        totalRate: 0,
        totalB2BRate: 0,
        totalD2CRate: 0,
        productDetails: [],
      },
    ]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!partyName) {
        toast.error("Please select a Party Name");
        setLoading(false);
        return;
      }

      for (const q of form) {
        if (!q.productName || !q.orderQty) {
          toast.error("Please fill all required fields for each quotation");
          setLoading(false);
          return;
        }
      }

      const quotations = form.map((q) => {
        const consumptionTable = generateConsumptionTable(
          q.productDetails,
          categoryData
        );
        return { ...q, consumptionTable };
      });

      console.log("quotation payload", quotations);

      const res = await axios.post("/quotation/add", {
        partyName,
        date,
        quotations,
      });

      if (res.data.status === 403) return toast.error(res.data.message);

      toast.success("Quotations added successfully");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add quotations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-lg border border-primary text-black">
        <div className="flex justify-between items-center sticky top-0 p-4 bg-white z-10">
          <h2 className="text-xl font-semibold">Create Quotations</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-red-500 font-bold text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="px-4 pb-6">
          <div className="mb-4">
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
                  "&:hover": { borderColor: "var(--color-primary)" },
                }),
              }}
              options={customers.map((c) => ({
                label: c.customerName,
                value: c.customerName?.trim(),
              }))}
              placeholder="Select or Type Customer"
              onChange={(e) => setPartyName(e?.value)}
              onCreateOption={(val) => setPartyName(val)}
              value={partyName ? { label: partyName, value: partyName } : null}
            />
          </div>

          {form.map((q, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm text-black">
                  Quotation {index + 1}
                </h3>
                {form.length > 1 && (
                  <button
                    onClick={() =>
                      setForm((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-red-500 text-xs font-semibold hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-[12px] font-semibold mb-[2px] text-black capitalize">
                    Product Name
                  </label>
                  <Select
                    options={productOptions}
                    placeholder="Select Product"
                    value={
                      q.productName
                        ? { label: q.productName, value: q.productName }
                        : null
                    }
                    onChange={(e) => {
                      const selectedProduct = e.fg || e.sample || null;
                      if (!selectedProduct) return;

                      setForm((prev) => {
                        const updated = [...prev];
                        const orderQty = Number(updated[index]?.orderQty) || 1;

                        // Merge all product details from FG/Sample/SFG
                        const allDetails = [
                          ...(selectedProduct.rm || []),
                          ...(selectedProduct.sfg || []),
                          ...(selectedProduct.productDetails || []),
                        ];

                        console.log("all details", allDetails);

                        const enrichedDetails = allDetails.map((item) => {
                          const enrichedItem = {
                            itemId: item.itemId || item.id || "",
                            type: item.type,
                            tempQty: item.qty || 0,
                            tempGrams: item.grams || 0,
                            qty: item.qty || 0,
                            category: item.category || "",
                            grams: item.grams || 0,
                            height: item.height || "",
                            width: item.width || "",
                            panno: item.panno || 0,
                            rate: item.rate || "",
                            sqInchRate: item.sqInchRate || "",
                            partName: item.partName || "",
                            baseQty: item.baseQty || 0,
                            itemRate: item.itemRate || 0,
                            itemName: item.itemName || "",
                            skuCode: item.skuCode || "",
                            isPasting: item.isPasting,
                            isPrint: item.isPrint,
                            label: `${item.skuCode}: ${item.itemName}${
                              item.description ? ` - ${item.description}` : ""
                            }`,
                          };

                          return enrichedItem;
                        });

                        updated[index] = {
                          ...updated[index],
                          productName:
                            selectedProduct.itemName ||
                            selectedProduct.product?.name ||
                            "",
                          description: selectedProduct.description,
                          sampleNo:
                            selectedProduct.sampleNo ||
                            selectedProduct.skuCode ||
                            "",
                          height: Number(selectedProduct.height) || 0,
                          width: Number(selectedProduct.width) || 0,
                          depth: Number(selectedProduct.depth) || 0,
                          productDetails: enrichedDetails,
                        };

                        // trigger recalculation
                        setTimeout(
                          () =>
                            recalculateTotals(
                              index,
                              updated[index],
                              enrichedDetails
                            ),
                          0
                        );
                        return updated;
                      });
                    }}
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold mb-[2px] text-black capitalize">
                    Order Qty
                  </label>
                  <input
                    type="number"
                    name="orderQty"
                    placeholder="Order Qty"
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition w-full"
                    value={q.orderQty}
                    onChange={(e) => handleFormChange(index, e)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={addNewQuotation}
              className="border border-primary text-primary px-4 py-2 rounded hover:bg-primary/10 transition"
            >
              + Add Another Quotation
            </button>

            <button
              disabled={loading}
              onClick={handleSubmit}
              className="flex items-center bg-primary text-secondary px-6 py-2 rounded hover:bg-primary/80 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving</span>
                  <BeatLoader size={5} color="#292926" />
                </>
              ) : (
                "Save All"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuotation;
