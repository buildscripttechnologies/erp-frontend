import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../utils/axios";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { BeatLoader } from "react-spinners";
import Select from "react-select";
import { calculateRate } from "../../../utils/calc";
import { plastic, slider } from "../../../data/dropdownData";

const AddSfgModal = ({ onClose, onAdded }) => {
  const [uoms, setUoms] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  const [formList, setFormList] = useState([
    {
      skuCode: "",
      itemName: "",
      description: "",
      hsnOrSac: "",
      qualityInspectionNeeded: false,
      location: "",
      basePrice: "",
      gst: "",
      moq: "",
      type: "SFG",
      UOM: "",

      height: 0,
      width: 0,
      depth: 0,

      stitching: 0,
      printing: 0,
      others: 0,

      unitRate: 0,
      unitB2BRate: 0,
      unitD2CRate: 0,

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

      rm: [],
      sfg: [],
      file: [],
      printingFile: [],
      materials: [],
    },
  ]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [uomRes, rmRes, sfgRes, locationRes] = await Promise.all([
          axios.get("/uoms/all-uoms?limit=1000"),
          axios.get("/rms/rm"),
          axios.get("/sfgs/get-all?limit=1000"),
          axios.get("/locations/get-all"),
        ]);

        setUoms(uomRes.data.data || []);
        setLocations(locationRes.data.data || []);

        const rawMaterials = (rmRes.data.rawMaterials || []).map((item) => ({
          ...item,
          type: "RM",
        }));
        const sfgItems = (sfgRes.data.data || []).map((item) => ({
          ...item,
          type: "SFG",
        }));
        setComponents([...rawMaterials, ...sfgItems]);
      } catch {
        toast.error("Failed to load dropdown data");
      }
    };
    fetchDropdownData();
  }, []);

  const recalculateTotals = (updated, index) => {
    const {
      qty,
      rejection = 0,
      QC = 0,
      machineMaintainance = 0,
      materialHandling = 0,
      packaging = 0,
      shipping = 0,
      companyOverHead = 0,
      indirectExpense = 0,
      stitching = 0,
      printing = 0,
      others = 0,
      B2B = 0,
      D2C = 0,
      materials = [],
    } = updated[index];

    const p =
      rejection +
      QC +
      machineMaintainance +
      materialHandling +
      packaging +
      shipping +
      companyOverHead +
      indirectExpense;

    const baseComponentRate = materials.reduce(
      (sum, mat) => sum + (Number(mat.rate) || 0),
      0
    );

    const totalR = baseComponentRate + stitching + printing + others;

    const unitRate = totalR + totalR * (p / 100);
    const unitB2BRate = totalR + (totalR * (p + B2B)) / 100;
    const unitD2CRate = totalR + (totalR * (p + D2C)) / 100;

    updated[index].unitRate = Number(unitRate).toFixed(2);
    updated[index].unitB2BRate = Number(unitB2BRate).toFixed(2);
    updated[index].unitD2CRate = Number(unitD2CRate).toFixed(2);
    // updated[index].totalRate = Number(unitRate * qty).toFixed(2);
    // updated[index].totalB2BRate = Number(unitB2BRate * qty).toFixed(2);
    // updated[index].totalD2CRate = Number(unitD2CRate * qty).toFixed(2);

    return updated;
  };

  const handleChange = (index, e) => {
    const updated = [...formList];
    const { name, value, files } = e.target;

    if (name === "file" || name === "printingFile") {
      updated[index][name] = files ? Array.from(files) : [];
    } else {
      const numericFields = [
        "height",
        "width",
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
      updated[index][name] = numericFields.includes(name)
        ? Number(value) || 0
        : value;
    }

    setFormList(recalculateTotals(updated, index));
  };

  const handleMaterialChange = (index, matIndex, field, value) => {
    let updated = [...formList];
    let comp = updated[index].materials[matIndex];
    const orderQty = 1;
    const category = (comp.category || "").toLowerCase();

    if (field === "qty") {
      // user is entering per-unit qty or per-unit grams
      comp.qty = Number(value) || 0;
    } else if (field === "grams") {
      comp.grams = Number(value) || 0;
    } else {
      comp[field] = value;
    }
    // if (["plastic", "non woven", "ld cord"].includes(category)) {
    //   // scale grams with orderQty
    //   comp.grams = (comp.tempQty || 0) * orderQty;
    //   comp.qty = orderQty; // qty here is just "number of orders"
    // } else {
    //   // all other categories → qty = tempQty × orderQty
    //   comp.qty = (comp.tempQty || 0) * orderQty;
    // }

    comp.rate = calculateRate(comp, comp.qty);

    updated[index].materials[matIndex] = comp;

    setFormList(recalculateTotals(updated, index));
  };

  const addMaterial = (index) => {
    const updated = [...formList];
    updated[index].materials.push({
      itemId: "",
      partName: "",
      height: "",
      width: "",
      qty: 0,
      grams: 0,
      rate: 0,
      sqInchRate: "",
      category: "",
      itemRate: 0,
      baseQty: 0,
      isPrint: false,
      cuttingType: "",
    });

    setFormList(updated);
  };

  const removeMaterial = (index, matIndex) => {
    const updated = [...formList];
    updated[index].materials.splice(matIndex, 1);
    setFormList(updated);
  };

  const addRow = () => {
    setFormList([
      ...formList,
      {
        skuCode: "",
        itemName: "",
        description: "",
        hsnOrSac: "",
        qualityInspectionNeeded: "",
        location: "",
        basePrice: "",
        gst: "",
        moq: "",
        type: "SFG",
        UOM: "",

        height: 0,
        width: 0,
        depth: 0,
        // qty: 0,
        stitching: 0,
        printing: 0,
        others: 0,

        unitRate: 0,
        unitB2BRate: 0,
        unitD2CRate: 0,

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
        rm: [],
        sfg: [],
        file: [],
        printingFile: [],
        materials: [],
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = [...formList];
    updated.splice(index, 1);
    setFormList(updated);
  };

  useEffect(() => {
    if (formList.length > 1) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [formList.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();

      const transformedData = formList.map((item) => {
        const rm = [];
        const sfg = [];

        item.materials?.forEach((mat) => {
          const matched = components.find((c) => c.id == mat.itemId);

          if (!matched || !mat.qty) return;
          if (matched.type == "RM") {
            rm.push({
              rmid: matched.id,
              partName: mat.partName,
              height: Number(mat.height),
              width: Number(mat.width),
              // depth: Number(mat.depth),
              qty: Number(mat.qty),
              grams: Number(mat.grams),
              rate: Number(mat.rate),
              sqInchRate: Number(mat.sqInchRate),
              category: mat.category,
              itemRate: Number(mat.itemRate),
              baseQty: Number(mat.baseQty),
              isPrint: mat.isPrint,
              cuttingType: mat.cuttingType,
            });
          } else if (matched.type === "SFG") {
            sfg.push({
              sfgid: matched.id,
              partName: mat.partName,
              height: Number(mat.height),
              width: Number(mat.width),
              // depth: Number(mat.depth),
              qty: Number(mat.qty),
              grams: Number(mat.grams),
              rate: Number(mat.rate),
              sqInchRate: Number(mat.sqInchRate),
              category: mat.category,
              itemRate: Number(mat.itemRate),
              baseQty: Number(mat.baseQty),
              isPrint: mat.isPrint,
              cuttingType: mat.cuttingType,
            });
          }
        });

        return {
          ...item,
          rm,
          sfg,
          file: undefined,
          printingFile: undefined,
          materials: undefined,
        };
      });

      payload.append("sfgs", JSON.stringify(transformedData));

      formList.forEach((item, i) => {
        if (Array.isArray(item.file)) {
          item.file.forEach((file) => {
            const renamed = new File([file], `${file.name}__index_${i}__`);
            payload.append("files", renamed);
          });
        }
      });
      formList.forEach((item, i) => {
        if (Array.isArray(item.printingFile)) {
          item.printingFile.forEach((file) => {
            const renamed = new File([file], `${file.name}__index_${i}__`);
            payload.append("printingFiles", renamed);
          });
        }
      });

      let res = await axios.post("/sfgs/add-many", payload);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("SFGs added successfully");
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[95vw] max-w-6xl rounded-lg p-6 border border-primary overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-primary scrollbar-track-primary/20">
        <h2 className="text-xl font-bold mb-4 text-primary">
          Create Semi Finished Goods BOM
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formList.map((item, index) => (
            <div
              key={index}
              className="space-y-4 border border-primary p-4 rounded"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="font-medium">Sku Code</label>
                  <input
                    type="text"
                    name="skuCode"
                    placeholder="Sku Code"
                    value={item.skuCode}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">Item Name</label>
                  <input
                    type="text"
                    name="itemName"
                    placeholder="Item Name"
                    value={item.itemName}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">HSN/SAC</label>
                  <input
                    type="text"
                    name="hsnOrSac"
                    placeholder="HSN/SAC"
                    value={item.hsnOrSac}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />{" "}
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">Base Price</label>
                  <input
                    type="text"
                    name="basePrice"
                    placeholder="Base Price"
                    value={item.basePrice}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">GST %</label>
                  <input
                    type="text"
                    name="gst"
                    placeholder="GST %"
                    value={item.gst}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">MOQ</label>
                  <input
                    type="text"
                    name="moq"
                    placeholder="MOQ"
                    value={item.moq}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">UOM</label>
                  <select
                    name="UOM"
                    value={item.UOM}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded cursor-pointer focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                    required
                  >
                    <option value="">Select UOM</option>
                    {uoms.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">Quality Inspection</label>
                  <select
                    name="qualityInspectionNeeded"
                    value={item.qualityInspectionNeeded}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded cursor-pointer focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  >
                    <option value="">Select Quality Inspection</option>
                    <option value={true}>Required</option>
                    <option value={false}>Not-required</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">Type</label>
                  <select
                    name="type"
                    value={item.type}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded cursor-pointer focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  >
                    <option value="">Select Type</option>
                    <option value="SFG">SFG</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">Location</label>
                  <select
                    name="location"
                    value={item.location}
                    onChange={(e) => handleChange(index, e)}
                    className=" p-2 border border-primary rounded cursor-pointer focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  >
                    <option value="">Select Location</option>
                    {locations.map((l) => (
                      <option key={l._id} value={l.locationId}>
                        {l.locationId}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">Product Files</label>
                  <input
                    type="file"
                    name="file"
                    multiple
                    onChange={(e) => handleChange(index, e)}
                    className="w-full text-sm text-gray-600 cursor-pointer bg-white border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-black hover:file:bg-primary/10 file:cursor-pointer"
                    // className="p-2 border border-primary rounded cursor-pointer focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium">Printing Files</label>
                  <input
                    type="file"
                    name="printingFile"
                    multiple
                    onChange={(e) => handleChange(index, e)}
                    className="w-full text-sm text-gray-600 cursor-pointer bg-white border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-black hover:file:bg-primary/10 file:cursor-pointer"
                    // className="p-2 border border-primary rounded cursor-pointer focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Description</label>
                <textarea
                  name="description"
                  value={item.description}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Description (optional)"
                  className="w-full p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                />
              </div>
              <div className="flex-col">
                <div>
                  <h2 className="font-semibold mb-1">Product Size</h2>
                </div>
                <div className="p-2 border border-primary rounded grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
                  <div className="flex flex-col">
                    <label className="font-semibold mb-1">Height (Inch)</label>
                    <input
                      type="number"
                      name="height"
                      placeholder="Height (Inch)"
                      value={item.height}
                      onChange={(e) => handleChange(index, e)}
                      className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold mb-1">Width (Inch)</label>
                    <input
                      type="number"
                      name="width"
                      placeholder="Width (Inch)"
                      value={item.width}
                      onChange={(e) => handleChange(index, e)}
                      className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-semibold mb-1">Depth (Inch)</label>
                    <input
                      type="number"
                      name="depth"
                      placeholder="Depth (Inch)"
                      value={item.depth}
                      onChange={(e) => handleChange(index, e)}
                      className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">
                  List of Consumed Components
                </p>
                <div className="flex flex-col gap-4">
                  {item.materials.map((mat, matIndex) => {
                    const selectedOption = components.find(
                      (comp) => comp.id === mat.itemId
                    );

                    return (
                      <div
                        key={matIndex}
                        className="border border-primary rounded p-3 flex flex-col gap-2"
                      >
                        <div
                          className={`grid grid-cols-1 sm:grid-cols-2 ${
                            mat.category == "plastic" ||
                            mat.category == "non woven"
                              ? "md:grid-cols-8"
                              : "md:grid-cols-7"
                          } md:grid-cols-8 gap-3`}
                        >
                          {/* Material Selector */}
                          <div className="flex flex-col md:col-span-2">
                            <label className="text-[12px] font-semibold mb-[2px] text-black">
                              Material{" "}
                              <span className="text-primary capitalize">
                                {mat.category ? `● ${mat.category}` : ""}
                              </span>
                            </label>
                            <Select
                              value={
                                components
                                  .map((c) => ({
                                    value: c.id,
                                    label: `${c.skuCode} - ${c.itemName} - ${c.description}`,
                                  }))
                                  .find((opt) => opt.value === mat.itemId) ||
                                null
                              }
                              onChange={(selected) => {
                                handleMaterialChange(
                                  index,
                                  matIndex,
                                  "itemId",
                                  selected?.value
                                );
                                handleMaterialChange(
                                  index,
                                  matIndex,
                                  "sqInchRate",
                                  selected?.sqInchRate
                                );
                                handleMaterialChange(
                                  index,
                                  matIndex,
                                  "category",
                                  selected?.category
                                );
                                handleMaterialChange(
                                  index,
                                  matIndex,
                                  "baseQty",
                                  selected?.baseQty
                                );
                                handleMaterialChange(
                                  index,
                                  matIndex,
                                  "itemRate",
                                  selected?.itemRate
                                );
                              }}
                              options={[
                                {
                                  label: "Raw Materials",
                                  options: components
                                    .filter((c) => c.type === "RM")
                                    .map((c) => ({
                                      value: c.id,
                                      label: `${c.skuCode} - ${c.itemName} - ${c.description}`,
                                      sqInchRate: c.sqInchRate || null,
                                      category: c.itemCategory || null,
                                      baseQty: c.baseQty || null,
                                      itemRate: c.rate || null,
                                    })),
                                },
                                {
                                  label: "Semi-Finished Goods",
                                  options: components
                                    .filter((c) => c.type === "SFG")
                                    .map((c) => ({
                                      value: c.id,
                                      label: `${c.skuCode} - ${c.itemName} - ${c.description}`,
                                      sqInchRate: c.sqInchRate || null,
                                      category: c.itemCategory || null,
                                      baseQty: c.baseQty || null,
                                      itemRate: c.rate || null,
                                    })),
                                },
                              ]}
                              placeholder="Select RM/SFG"
                              isSearchable
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
                              filterOption={(option, inputValue) => {
                                const label = option.label
                                  .replace(/\s+/g, "")
                                  .toLowerCase();
                                const input = inputValue
                                  .replace(/\s+/g, "")
                                  .toLowerCase();
                                return label.includes(input);
                              }}
                            />
                          </div>

                          {/* Height, Width, Depth, Qty Fields */}
                          {[
                            "partName",
                            "height",
                            "width",
                            "qty",
                            "grams",
                            "rate",
                          ].map((field) => {
                            // Hide based on category
                            if (
                              slider.includes(mat.category?.toLowerCase()) &&
                              (field === "height" || field === "width")
                            )
                              return null;

                            // if (
                            //   ["plastic", "non woven"].includes(
                            //     mat.category?.toLowerCase()
                            //   ) &&
                            //   field === "qty"
                            // ) {
                            //   return null; // hide qty
                            // }
                            if (
                              !plastic.includes(mat.category?.toLowerCase()) &&
                              field === "grams"
                            ) {
                              return null; // hide grams for others
                            }
                            // ✅ Add this new rule for zipper
                            if (
                              zipper.includes(mat.category?.toLowerCase()) &&
                              field === "height"
                            ) {
                              return null; // hide height only for zipper
                            }
                            if (
                              mat.category?.toLowerCase() === "ld cord" &&
                              field === "height"
                            ) {
                              return null; // hide height only for zipper
                            }
                            return (
                              <div className="flex flex-col" key={field}>
                                <label className="text-[12px] font-semibold mb-[2px] text-black capitalize">
                                  {field === "partName"
                                    ? "Part Name"
                                    : field === "qty"
                                    ? "Qty"
                                    : field === "grams"
                                    ? "Weight (gm)"
                                    : field === "rate"
                                    ? "Rate"
                                    : `${field} (Inch)`}
                                </label>
                                <input
                                  type={
                                    ["partName"].includes(field)
                                      ? "text"
                                      : "number"
                                  }
                                  placeholder={
                                    field === "partName"
                                      ? "Item Part Name"
                                      : field === "grams"
                                      ? "Weight in grams"
                                      : field === "qty"
                                      ? "qty"
                                      : `${field}`
                                  }
                                  className="p-1.5 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition"
                                  value={mat[field] || ""}
                                  onChange={(e) =>
                                    handleMaterialChange(
                                      index,
                                      matIndex,
                                      field,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                        {/* Remove Button */}
                        <div className="mt-2 flex w-full justify-between">
                          <div className="flex gap-4 items-center">
                            {/* Cutting Type Dropdown */}
                            <select
                              className="border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition px-2 py-1 text-sm"
                              value={mat.cuttingType || ""}
                              onChange={(e) =>
                                handleMaterialChange(
                                  index,
                                  matIndex,
                                  "cuttingType",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Cutting Type</option>
                              <option value="Slitting Cutting">
                                Slitting Cutting
                              </option>
                              <option value="Cutting">Cutting</option>
                              <option value="Press Cutting">
                                Press Cutting
                              </option>
                              <option value="Laser Cutting">
                                Laser Cutting
                              </option>
                              <option value="Table Cutting">
                                Table Cutting
                              </option>
                            </select>

                            {/* Print Checkbox */}
                            <label className="flex items-center gap-1 text-sm">
                              <input
                                type="checkbox"
                                checked={mat.isPrint || false}
                                onChange={(e) =>
                                  handleMaterialChange(
                                    index,
                                    matIndex,
                                    "isPrint",
                                    e.target.checked
                                  )
                                }
                                className="rounded border-gray-300 accent-primary"
                              />
                              Print
                            </label>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            className="text-red-600 text-xs hover:underline flex gap-1 cursor-pointer items-center"
                            onClick={() => removeMaterial(index, matIndex)}
                          >
                            <FiTrash2 /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => addMaterial(index)}
                    className="bg-primary hover:bg-primary/80 text-secondary px-3 py-1 rounded flex items-center gap-1 mt-2 cursor-pointer w-fit text-sm"
                  >
                    <FiPlus /> Add RM/SFG
                  </button>
                </div>
              </div>

              <div className="bg-primary w-full h-[1px] my-2"></div>

              {/* bottom fields */}
              <div className="sm:text-[12px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">B2B (%)</label>
                  <input
                    type="number"
                    name="B2B"
                    placeholder="B2B"
                    value={item.B2B}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">D2C (%)</label>
                  <input
                    type="number"
                    name="D2C"
                    placeholder="D2C"
                    value={item.D2C}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Rejection (%)</label>
                  <input
                    type="number"
                    name="rejection"
                    placeholder="Rejection"
                    value={item.rejection}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">QC (%)</label>
                  <input
                    type="number"
                    name="QC"
                    placeholder="QC"
                    value={item.QC}
                    onChange={(e) => handleChange(index, e)}
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
                    value={item.machineMaintainance}
                    onChange={(e) => handleChange(index, e)}
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
                    value={item.materialHandling}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Packaging (%)</label>
                  <input
                    type="number"
                    name="packaging"
                    placeholder="Packaging"
                    value={item.packaging}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Shipping (%)</label>
                  <input
                    type="number"
                    name="shipping"
                    placeholder="Shipping"
                    value={item.shipping}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">
                    Company OverHead (%)
                  </label>
                  <input
                    type="number"
                    name="companyOverHead"
                    placeholder="Company OverHead"
                    value={item.companyOverHead}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">
                    Indirect Expense (%)
                  </label>
                  <input
                    type="number"
                    name="indirectExpense"
                    placeholder="Indirect Expense"
                    value={item.indirectExpense}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Stitching (₹)</label>
                  <input
                    type="number"
                    name="stitching"
                    placeholder="Stitching"
                    value={item.stitching}
                    onChange={(e) => handleChange(index, e)}
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
                    value={item.printing}
                    onChange={(e) => handleChange(index, e)}
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
                    value={item.others}
                    onChange={(e) => handleChange(index, e)}
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
                    value={item.unitRate}
                    onChange={(e) => handleChange(index, e)}
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
                    value={item.unitB2BRate}
                    onChange={(e) => handleChange(index, e)}
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
                    value={item.unitD2CRate}
                    onChange={(e) => handleChange(index, e)}
                    className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {formList.length > 1 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    Remove This SFG
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-start">
            <button
              type="button"
              onClick={addRow}
              className="bg-primary text-secondary hover:bg-primary/80 px-4 py-2 rounded flex items-center gap-1 cursor-pointer"
            >
              <FiPlus /> Add SFG
            </button>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary flex justify-center items-center hover:bg-primary/80 text-secondary font-semibold rounded cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving</span>
                  <BeatLoader size={5} color="secondary" />
                </>
              ) : (
                "Save All"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSfgModal;
