import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import Select from "react-select";

const UpdateFgModal = ({ fg, onClose, onUpdated }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [existingFiles, setExistingFiles] = useState(fg.files || []);
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

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
    if (fg) {
      const mappedMaterials = [];

      (fg.rm || []).forEach((r) => {
        mappedMaterials.push({
          itemId: r.id,
          height: r.height,
          width: r.width,
          // depth: r.depth,
          qty: r.qty,
          rate: r.rate,
          sqInchRate: r.sqInchRate,
        });
      });
      (fg.sfg || []).forEach((s) => {
        mappedMaterials.push({
          itemId: s.id,
          height: s.height,
          width: s.width,
          // depth: s.depth,
          qty: s.qty,
          rate: r.rate,
          sqInchRate: r.sqInchRate,
        });
      });

      setForm({
        skuCode: fg.skuCode || "",
        itemName: fg.itemName || "",
        description: fg.description || "",
        hsnOrSac: fg.hsnOrSac || "",
        qualityInspectionNeeded: fg.qualityInspectionNeeded,
        location: fg.location?._id || fg.location || "",
        gst: fg.gst || "",
        status: fg.status || "Active",
        UOM: fg.uom || "",
        height: fg.height,
        width: fg.width,
        depth: fg.depth,
        stitching: fg.stitching,
        printing: fg.printing,
        others: fg.others,
        unitRate: fg.unitRate,
        unitB2BRate: fg.unitB2BRate,
        unitD2CRate: fg.unitD2CRate,
        // totalRate: fg.totalRate,
        // totalB2BRate: fg.totalB2BRate,
        // totalD2CRate: fg.totalD2CRate,
        B2B: fg.B2B,
        D2C: fg.D2C,
        rejection: fg.rejection,
        QC: fg.QC,
        machineMaintainance: fg.machineMaintainance,
        materialHandling: fg.materialHandling,
        packaging: fg.packaging,
        shipping: fg.shipping,
        companyOverHead: fg.companyOverHead,
        indirectExpense: fg.indirectExpense,
        file: [],
        materials: mappedMaterials,
      });
    }
  }, [fg]);

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
          name === "file"
            ? Array.from(files)
            : numericFields.includes(name)
            ? Number(value) || 0
            : value,
      })
    );
  };

  const handleMaterialChange = (matIndex, field, value) => {
    const updatedMaterials = [...form.materials];

    if (field === "itemId") {
      let itm = components.find((item) => item.id === value);
      if (itm) {
        updatedMaterials[matIndex].itemId = value;
        updatedMaterials[matIndex].sqInchRate = itm.sqInchRate || 1;
      }
    } else {
      updatedMaterials[matIndex][field] = value;
    }

    let height = Number(updatedMaterials[matIndex].height) || 0;
    let width = Number(updatedMaterials[matIndex].width) || 0;
    let qty = Number(updatedMaterials[matIndex].qty) || 0;
    let sqInchRate = Number(updatedMaterials[matIndex].sqInchRate) || 0;

    updatedMaterials[matIndex].rate =
      height && width && qty && sqInchRate
        ? Number((height * width * qty * sqInchRate).toFixed(4))
        : 0;

    setForm((prev) =>
      recalculateTotals({
        ...prev,
        materials: updatedMaterials,
      })
    );
  };

  const addMaterial = () => {
    setForm((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { itemId: "", height: "", width: "", qty: "", rate: "" },
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
            height: Number(mat.height),
            width: Number(mat.width),
            // depth: Number(mat.depth),
            qty: Number(mat.qty),
            rate: Number(mat.rate),
            sqInchRate: Number(mat.sqInchRate),
          });
        } else {
          sfgNested.push({
            sfgid: match.id,
            height: Number(mat.height),
            width: Number(mat.width),
            // depth: Number(mat.depth),
            qty: Number(mat.qty),
            rate: Number(mat.rate),
            sqInchRate: Number(mat.sqInchRate),
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
      };

      // console.log("data", data);
      newFiles.forEach((file) => {
        payload.append("files", file);
      });

      payload.append("data", JSON.stringify(data));

      if (form.file.length) {
        form.file.forEach((file) => payload.append("files", file));
      }

      let res = await axios.patch(`/fgs/edit/${fg.id}`, payload);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("FG updated successfully");
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
        })),
    },
    {
      label: "Semi-Finished Goods",
      options: components
        .filter((c) => c.type === "SFG")
        .map((c) => ({
          value: c.id,
          label: `${c.skuCode} - ${c.itemName} - ${c.description}`,
        })),
    },
  ];

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-[95vw] max-w-4xl p-6 rounded-lg border border-primary overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-primary">Edit FG Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Sku Code</label>
              <input
                disabled
                name="skuCode"
                placeholder="Sku Code"
                value={form.skuCode}
                onChange={handleChange}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200 disabled:cursor-not-allowed"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Item Name</label>
              <input
                name="itemName"
                placeholder="Item Name"
                value={form.itemName}
                onChange={handleChange}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">HSN/SAC</label>
              <input
                name="hsnOrSac"
                placeholder="HSN/SAC"
                value={form.hsnOrSac}
                onChange={handleChange}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">GST %</label>
              <input
                name="gst"
                placeholder="GST %"
                value={form.gst}
                onChange={handleChange}
                className="p-2 border border-primary rounded  focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">UOM</label>
              <select
                name="UOM"
                value={form.UOM}
                onChange={handleChange}
                className="p-2 border border-primary rounded cursor-pointer focus:border-2 focus:border-primary focus:outline-none transition duration-200"
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
              <label className="font-semibold mb-1">Quality Inspection</label>
              <select
                name="qualityInspectionNeeded"
                value={form.qualityInspectionNeeded}
                onChange={handleChange}
                className="p-2 border border-primary rounded cursor-pointer focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              >
                <option value={true}>Required</option>
                <option value={false}>Not-required</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Location</label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className="p-2 border border-primary rounded cursor-pointer focus:border-2 focus:border-primary focus:outline-none transition duration-200"
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
              <label className="font-semibold mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="p-2 border border-primary rounded cursor-pointer focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Existing Files */}
            <div className=" col-span-full">
              <p className="font-semibold mb-2 text-secondary">
                Existing Files
              </p>
              {existingFiles.length === 0 && (
                <p className="text-sm text-gray-500">No files uploaded</p>
              )}
              {existingFiles.map((file) => (
                <div
                  key={file._id}
                  className="flex justify-between items-center bg-[#fdf6e9] border border-primary rounded p-2 "
                >
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary underline"
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

            {/* Upload New Files */}
            <div className=" col-span-full">
              <label className="block font-semibold mb-2 text-secondary">
                Upload New Files
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setNewFiles(Array.from(e.target.files))}
                className="w-full text-sm text-gray-600 cursor-pointer bg-white border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fdf6e9] file:text-secondary hover:file:bg-primary/10 file:cursor-pointer"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
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
            {form.materials.map((mat, index) => (
              <div
                key={index}
                className="flex flex-wrap gap-3 mb-4 border p-3 rounded-md border-primary"
              >
                <div className="w-full sm:w-[55%] md:w-[40%]">
                  <label className="font-medium">Material</label>
                  <Select
                    className="flex-grow"
                    value={
                      groupedOptions
                        .flatMap((g) => g.options)
                        .find((opt) => opt.value === mat.itemId) || null
                    }
                    onChange={(selected) =>
                      handleMaterialChange(index, "itemId", selected?.value)
                    }
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

                {/* Height */}
                <div className="flex flex-col w-[46.5%] sm:w-[30%] md:w-[14%]">
                  <label className="font-medium text-sm mb-1">
                    Height (Inch)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Height"
                    value={mat.height}
                    onChange={(e) =>
                      handleMaterialChange(index, "height", e.target.value)
                    }
                    className="p-1.5 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition"
                  />
                </div>

                {/* Width */}
                <div className="flex flex-col w-[46.5%] sm:w-[30%] md:w-[14%]">
                  <label className="font-medium text-sm mb-1">
                    Width (Inch)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Width"
                    value={mat.width}
                    onChange={(e) =>
                      handleMaterialChange(index, "width", e.target.value)
                    }
                    className="p-1.5 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition"
                  />
                </div>

                <div className="flex flex-col w-[46.5%] sm:w-[30%] md:w-[10%]">
                  <label className="font-medium text-sm mb-1">Qty</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Qty"
                    value={mat.qty}
                    onChange={(e) =>
                      handleMaterialChange(index, "qty", e.target.value)
                    }
                    className="p-1.5  border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                  />
                </div>

                {/* Rate */}
                <div className="flex flex-col w-[46.5%] sm:w-[30%] md:w-[14%]">
                  <label className="font-medium text-sm mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Rate"
                    value={mat.rate}
                    onChange={(e) =>
                      handleMaterialChange(index, "rate", e.target.value)
                    }
                    className="p-1.5 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="text-red-600 cursor-pointer gap-1 flex items-center hover:underline"
                >
                  <FiTrash2 /> Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMaterial}
              className="bg-primary cursor-pointer hover:bg-[#d8b76a91] px-3 py-1 rounded flex items-center gap-1 mt-2"
            >
              <FiPlus /> Add RM/SFG
            </button>
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
                type="number"
                name="unitRate"
                placeholder="Unit Rate"
                value={form.unitRate}
                onChange={(e) => handleChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Unit B2B (₹)</label>
              <input
                type="number"
                name="unitB2BRate"
                placeholder="Unit B2B"
                value={form.unitB2BRate}
                onChange={(e) => handleChange(e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Unit D2C (₹)</label>
              <input
                type="number"
                name="unitD2CRate"
                placeholder="Unit D2C"
                value={form.unitD2CRate}
                onChange={(e) => handleChange(index, e)}
                className="p-2 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 cursor-pointer hover:bg-gray-400 text-secondary rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary cursor-pointer flex justify-center items-center hover:bg-primary/80 text-secondary font-semibold rounded"
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

export default UpdateFgModal;
