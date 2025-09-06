import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import Select from "react-select";
import { calculateRate } from "../../../utils/calc";
const UpdateSfgModal = ({ sfg, onClose, onUpdated }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [existingFiles, setExistingFiles] = useState(sfg.files || []);
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const [newPrintingFiles, setNewPrintingFiles] = useState([]);
  const [existingPrintingFiles, setExistingPrintingFiles] = useState(
    sfg.printingFile || []
  );
  const [deletedPrintingFiles, setDeletedPrintingFiles] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [uomRes, rmRes, sfgRes, locRes] = await Promise.all([
          axios.get("/uoms/all-uoms?limit=1000"),
          axios.get("/rms/rm"),
          axios.get("/sfgs/get-all?limit=1000"),
          axios.get("/locations/get-all"),
        ]);

        setUoms(uomRes.data.data || []);
        setLocations(locRes.data.data || []);

        const raw = (rmRes.data.rawMaterials || []).map((r) => ({
          ...r,
          type: "RM",
        }));
        const sfgList = (sfgRes.data.data || []).map((s) => ({
          ...s,
          type: "SFG",
        }));
        setComponents([...raw, ...sfgList]);
      } catch (err) {
        toast.error("Dropdown loading failed");
      }
    };

    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (sfg) {
      const mappedMaterials = [];

      (sfg.rm || []).forEach((r) => {
        mappedMaterials.push({
          itemId: r.id,
          partName: r.partName,
          height: r.height,
          width: r.width,
          // depth: r.depth,
          qty: r.qty,
          grams: r.grams,
          rate: r.rate,
          sqInchRate: r.sqInchRate,
          category: r.category,
          itemRate: r.itemRate,
          baseQty: r.baseQty,
          isPrint: r.isPrint,
          cuttingType: r.cuttingType,
        });
      });
      (sfg.sfg || []).forEach((s) => {
        mappedMaterials.push({
          itemId: s.id,
          partName: s.partName,
          height: s.height,
          width: s.width,
          // depth: s.depth,
          qty: s.qty,
          grams: s.grams,
          rate: s.rate,
          sqInchRate: s.sqInchRate,
          category: s.category,
          itemRate: s.itemRate,
          baseQty: s.baseQty,
          isPrint: s.isPrint,
          cuttingType: s.cuttingType,
        });
      });

      setForm({
        skuCode: sfg.skuCode || "",
        itemName: sfg.itemName || "",
        description: sfg.description || "",
        hsnOrSac: sfg.hsnOrSac || "",
        qualityInspectionNeeded: sfg.qualityInspectionNeeded,
        location: sfg.location?._id || sfg.location || "",
        gst: sfg.gst || "",
        type: sfg.type || "",
        moq: sfg.moq || "",
        basePrice: sfg.basePrice || "",
        status: sfg.status || "Active",
        UOM: sfg.uom || "",
        height: sfg.height,
        width: sfg.width,
        depth: sfg.depth,
        stitching: sfg.stitching,
        printing: sfg.printing,
        others: sfg.others,
        unitRate: sfg.unitRate,
        unitB2BRate: sfg.unitB2BRate,
        unitD2CRate: sfg.unitD2CRate,
        // totalRate: fg.totalRate,
        // totalB2BRate: fg.totalB2BRate,
        // totalD2CRate: fg.totalD2CRate,
        B2B: sfg.B2B,
        D2C: sfg.D2C,
        rejection: sfg.rejection,
        QC: sfg.QC,
        machineMaintainance: sfg.machineMaintainance,
        materialHandling: sfg.materialHandling,
        packaging: sfg.packaging,
        shipping: sfg.shipping,
        companyOverHead: sfg.companyOverHead,
        indirectExpense: sfg.indirectExpense,
        file: [],
        printingFile: [],
        materials: mappedMaterials,
      });
    }
  }, [sfg]);

  const recalculateTotals = (updatedForm) => {
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
    } = updatedForm;

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

    return {
      ...updatedForm,
      unitRate: Number(unitRate).toFixed(2),
      unitB2BRate: Number(unitB2BRate).toFixed(2),
      unitD2CRate: Number(unitD2CRate).toFixed(2),
      // totalRate: Number(unitRate * qty).toFixed(2),
      // totalB2BRate: Number(unitB2BRate * qty).toFixed(2),
      // totalD2CRate: Number(unitD2CRate * qty).toFixed(2),
    };
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
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

    setForm((prev) =>
      recalculateTotals({
        ...prev,
        [name]:
          name === "file" || name == "printingFile"
            ? Array.from(files)
            : numericFields.includes(name)
            ? Number(value) || 0
            : value,
      })
    );
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...form.materials];
    const comp = updated[index];
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

    setForm((prev) =>
      recalculateTotals({
        ...prev,
        materials: updated,
      })
    );
  };

  const addMaterial = () => {
    setForm((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
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
        },
      ],
    }));
  };

  const removeMaterial = (index) => {
    const updated = [...form.materials];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, materials: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();

      const rm = [];
      const sfgNested = [];

      form.materials.forEach((mat) => {
        const match = components.find((c) => c.id == mat.itemId);
        if (!match || !mat.qty) return;
        if (match.type === "RM") {
          rm.push({
            rmid: match.id,
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
        } else {
          sfgNested.push({
            sfgid: match.id,
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

      const data = {
        skuCode: form.skuCode,
        itemName: form.itemName,
        description: form.description,
        hsnOrSac: form.hsnOrSac,
        qualityInspectionNeeded: form.qualityInspectionNeeded,
        location: form.location,
        status: form.status,
        moq: form.moq,
        basePrice: form.basePrice,
        gst: form.gst,
        UOM: form.UOM,
        height: form.height,
        width: form.width,
        depth: form.depth,
        stitching: form.stitching,
        printing: form.printing,
        others: form.others,
        unitRate: form.unitRate,
        unitB2BRate: form.unitB2BRate,
        unitD2CRate: form.unitD2CRate,
        totalRate: form.totalRate,
        totalB2BRate: form.totalB2BRate,
        totalD2CRate: form.totalD2CRate,
        B2B: form.B2B,
        D2C: form.D2C,
        rejection: form.rejection,
        QC: form.QC,
        machineMaintainance: form.machineMaintainance,
        materialHandling: form.materialHandling,
        packaging: form.packaging,
        shipping: form.shipping,
        companyOverHead: form.companyOverHead,
        indirectExpense: form.indirectExpense,
        rm,
        sfg: sfgNested,
        deletedFiles: deletedFileIds,
        deletedPrintingFiles: deletedPrintingFiles,
      };

      newFiles.forEach((file) => {
        payload.append("files", file);
      });
      newPrintingFiles.forEach((file) => {
        payload.append("printingFiles", file);
      });

      payload.append("data", JSON.stringify(data));

      if (form.file.length) {
        form.file.forEach((file) => payload.append("files", file));
      }
      if (form.printingFile.length) {
        form.printingFile.forEach((file) =>
          payload.append("printingFiles", file)
        );
      }
      let res = await axios.patch(`/sfgs/edit/${sfg.id}`, payload);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("SFG updated successfully");
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const groupedOptions = [
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
  ];

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-[95vw] max-w-4xl p-6 rounded-lg border border-[#d8b76a] overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">Edit SFG Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold">Sku Code</label>
              <input
                disabled
                name="skuCode"
                placeholder="Sku Code"
                value={form.skuCode}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200 disabled:cursor-not-allowed"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold">Item Name</label>
              <input
                name="itemName"
                placeholder="Item Name"
                value={form.itemName}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">HSN/SAC</label>
              <input
                name="hsnOrSac"
                placeholder="HSN/SAC"
                value={form.hsnOrSac}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">GST %</label>
              <input
                name="gst"
                placeholder="GST %"
                value={form.gst}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">MOQ</label>
              <input
                name="moq"
                placeholder="MOQ"
                value={form.moq}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Base Price</label>
              <input
                name="basePrice"
                placeholder="Base Price"
                value={form.basePrice}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">UOM</label>
              <select
                name="UOM"
                value={form.UOM}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              >
                <option value={form.UOM}>{form.UOM}</option>
                {uoms.map((u) => (
                  <option key={u._id} value={u.unitName}>
                    {u.unitName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Quality Inspection</label>
              <select
                name="qualityInspectionNeeded"
                value={form.qualityInspectionNeeded}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              >
                <option value={true}>Required</option>
                <option value={false}>Not-required</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Location</label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className="p-2 border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
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
              <label className="font-semibold">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="p-2  border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="p-2  border border-[#d8b76a] rounded cursor-pointer focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              >
                <option value="">Select Type</option>
                <option value="SFG">SFG</option>
              </select>
            </div>
          </div>
          {/* Upload New Files */}
          <div className="col-span-full gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div>
              <div className=" ">
                <label className="block font-semibold mb-1 text-secondary">
                  Product Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setNewFiles(Array.from(e.target.files))}
                  className="w-full text-sm text-gray-600 cursor-pointer bg-white border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fdf6e9] file:text-secondary hover:file:bg-primary/10 file:cursor-pointer"
                />
              </div>
              <div>
                <p className="font-semibold mb-1 mt-2 text-secondary">
                  Existing Product Files
                </p>
                {existingFiles.length === 0 && (
                  <p className="text-sm text-gray-500">No files uploaded</p>
                )}
                {existingFiles.map((file) => (
                  <div
                    key={file._id}
                    className="flex justify-between items-center mb-1 bg-[#fdf6e9] border border-primary rounded p-1 "
                  >
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary underline truncate"
                    >
                      {file.fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletedFileIds((prev) => [...prev, file._id]);
                        setExistingFiles((prev) =>
                          prev.filter((f) => f._id !== file._id)
                        );
                      }}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className=" ">
                <label className="block font-semibold mb-1 text-secondary">
                  Printing Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setNewPrintingFiles(Array.from(e.target.files))
                  }
                  className="w-full text-sm text-gray-600 cursor-pointer bg-white border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fdf6e9] file:text-secondary hover:file:bg-primary/10 file:cursor-pointer"
                />
              </div>
              <div>
                <p className="font-semibold mb-1 mt-2 text-secondary">
                  Existing Printing Files
                </p>
                {existingPrintingFiles.length === 0 && (
                  <p className="text-sm text-gray-500">No files uploaded</p>
                )}
                {existingPrintingFiles.map((file) => (
                  <div
                    key={file._id}
                    className="flex justify-between items-center bg-[#fdf6e9] border border-primary rounded p-1 "
                  >
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary underline truncate"
                    >
                      {file.fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletedPrintingFiles((prev) => [...prev, file._id]);
                        setExistingPrintingFiles((prev) =>
                          prev.filter((f) => f._id !== file._id)
                        );
                      }}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full p-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
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
                  value={form.height}
                  onChange={(e) => handleChange(e)}
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
                  onChange={(e) => handleChange(e)}
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
                  onChange={(e) => handleChange(e)}
                  className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-2">List of Consumed Components</p>
            <div className="flex flex-col gap-4">
              {form.materials.map((mat, index) => (
                <div
                  key={index}
                  className="border border-primary rounded p-3 flex flex-col gap-2"
                >
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 ${
                      mat.category == "plastic" || mat.category == "non woven"
                        ? "md:grid-cols-8"
                        : "md:grid-cols-7"
                    } md:grid-cols-8 gap-3`}
                  >
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-[12px] font-semibold mb-[2px] text-[#292926]">
                        Material{" "}
                        <span className="text-primary capitalize">
                          {mat.category ? `● ${mat.category}` : ""}
                        </span>
                      </label>
                      <Select
                        className="flex-grow"
                        value={
                          groupedOptions
                            .flatMap((g) => g.options)
                            .find((opt) => opt.value === mat.itemId) || null
                        }
                        onChange={(selected) => {
                          handleMaterialChange(
                            index,
                            "itemId",
                            selected?.value
                          );
                          handleMaterialChange(
                            index,
                            "sqInchRate",
                            selected?.sqInchRate
                          );
                          handleMaterialChange(
                            index,
                            "category",
                            selected?.category
                          );
                          handleMaterialChange(
                            index,
                            "baseQty",
                            selected?.baseQty
                          );
                          handleMaterialChange(
                            index,
                            "itemRate",
                            selected?.itemRate
                          );
                        }}
                        options={groupedOptions}
                        placeholder="Select RM or SFG"
                        isSearchable
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            padding: "2px",
                            borderRadius: "6px",
                            borderColor: "var(--color-primary)",
                            boxShadow: state.isFocused
                              ? "0 0 0 1px var(--color-primary)"
                              : "none",
                            "&:hover": {
                              borderColor: "var(--color-primary)",
                            },
                          }),
                          // option: (base, state) => ({
                          //   ...base,
                          //   backgroundColor: state.isFocused ? "#f3e6c0" : "#fff",
                          //   color: "#292926",
                          // }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: "#292926",
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: "#9e9e9e",
                          }),
                          groupHeading: (base) => ({
                            ...base,
                            color: "#292926",
                            fontWeight: "bold",
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
                        [
                          "slider",
                          "bidding",
                          "adjuster",
                          "buckel",
                          "dkadi",
                          "accessories",
                        ].includes(mat.category?.toLowerCase()) &&
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
                        !["plastic", "non woven"].includes(
                          mat.category?.toLowerCase()
                        ) &&
                        field === "grams"
                      ) {
                        return null; // hide grams for others
                      }
                      // ✅ Add this new rule for zipper
                      if (
                        mat.category?.toLowerCase() === "zipper" &&
                        field === "height"
                      ) {
                        return null; // hide height only for zipper
                      }

                      return (
                        <div className="flex flex-col" key={field}>
                          <label className="text-[12px] font-semibold mb-[2px] text-[#292926] capitalize">
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
                              ["partName"].includes(field) ? "text" : "number"
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
                            className="p-1.5 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition"
                            value={mat[field] || ""}
                            onChange={(e) =>
                              handleMaterialChange(
                                index,

                                field,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2 flex w-full justify-between">
                    <div className="flex gap-4 items-center">
                      {/* Cutting Type Dropdown */}
                      <select
                        className="border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition px-2 py-1 text-sm"
                        value={mat.cuttingType || ""}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
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
                        <option value="Press Cutting">Press Cutting</option>
                        <option value="Laser Cutting">Laser Cutting</option>
                        <option value="Table Cutting">Table Cutting</option>
                      </select>

                      {/* Print Checkbox */}
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={mat.isPrint || false}
                          onChange={(e) =>
                            handleMaterialChange(
                              index,
                              "isPrint",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 accent-[#d8b76a]"
                        />
                        Print
                      </label>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      className="text-red-600 text-xs hover:underline flex gap-1 cursor-pointer items-center"
                      onClick={() => removeMaterial(index)}
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addMaterial}
                className="bg-[#d8b76a] hover:bg-[#d8b76a91] text-[#292926] px-3 py-1 rounded flex items-center gap-1 mt-2 cursor-pointer w-fit text-sm"
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
                value={form.B2B}
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(e)}
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
                onChange={(e) => handleChange(index, e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 cursor-pointer hover:bg-gray-400 text-[#292926] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#d8b76a] cursor-pointer flex justify-center items-center hover:bg-[#d8b76a]/80 text-[#292926] font-semibold rounded"
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
        </form>
      </div>
    </div>
  );
};

export default UpdateSfgModal;
