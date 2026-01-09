// File: BulkRmPanel.jsx
import React, { useState, useEffect } from "react";
import { FiTrash2, FiArrowLeft, FiPlus } from "react-icons/fi";
import { RiResetRightLine } from "react-icons/ri";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

import Select from "react-select";
import { useCategoryArrays } from "../../data/dropdownData";
import { useCategories } from "../../context/CategoryContext";

const BulkRmPanel = ({ onClose }) => {
  const [rows, setRows] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState();
  const { fabric, slider, plastic, zipper } = useCategoryArrays();

  const { gstTable } = useCategories();

  // console.log("gst table", gstTable);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/settings/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchUoms = async () => {
    try {
      const res = await axios.get("/uoms/all-uoms");
      setUoms(res.data.data || []);
    } catch {
      toast.error("Failed to load UOMs");
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get("/locations/get-all");
      setLocations(res.data.data || []);
    } catch {
      toast.error("Failed to load Locations");
    }
  };

  useEffect(() => {
    fetchUoms();
    fetchLocations();
    fetchCategories();
    addRow();
  }, []);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        skuCode: "",
        itemName: "",
        description: "",
        itemCategory: "",
        itemColor: "",
        hsnOrSac: "",
        type: "RM",
        qualityInspectionNeeded: "Required",
        location: "",
        baseQty: "",
        pkgQty: "",
        moq: "",
        panno: "",
        sqInchRate: "",
        baseRate: "",
        rate: "",
        totalRate: "",
        purchaseUOM: "",
        stockQty: 0,
        stockUOM: "",
        gst: "",
        attachments: [],
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      // const baseRate = updated[index].baseRate || 0;
      // const gst = updated[index].gst || 0;

      // if (baseRate && gst) {
      //   updated[index].rate = Number(baseRate) + (gst * baseRate) / 100;
      // }

      // const hsnOrSac = updated[index].hsnOrSac;

      // if (hsnOrSac) {
      //   const gst = gstTable.find((g) => g.hsn === hsnOrSac);
      //   updated[index].gst = gst ? gst.gst : "";
      // }

      const rate = parseFloat(updated[index].rate) || 0;
      const stockQty = parseFloat(updated[index].stockQty) || 0;
      updated[index].totalRate = rate * stockQty;

      const category = (updated[index].itemCategory || "").toLowerCase();
      const panno = parseFloat(updated[index].panno) || 0;

      // Determine fabricRate
      const fabricRate = category.includes("cotton") || category.includes("canvas") ? 38 : 39;
      // const fabricRate = 39;

      console.log("fabric rate", fabricRate);

      // Recalculate sqInchRate if category contains fabric/cotton/canvas
      if (rate && panno && fabric.includes(category)) {
        updated[index].sqInchRate = Number((rate / panno / fabricRate) /**1.05*/);
      } else {
        updated[index].sqInchRate = 0;
      }

      return updated;
    });
  };

  const handleFileChange = (index, files) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index].attachments = files;
      return updated;
    });
  };

  const handleRemove = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => setRows([]);

  const handleSubmit = async () => {
    if (rows.length === 0) return toast.error("Please add at least one row.");
    const hasMissingItemNames = rows.some((row) => !row.itemName?.trim());
    if (hasMissingItemNames) {
      return toast.error("All rows must have an Item Name.");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append(
      "rawMaterials",
      JSON.stringify(rows.map(({ attachments, ...rest }) => rest))
    );

    rows.forEach((rm, i) => {
      Array.from(rm.attachments).forEach((file) => {
        const renamed = new File([file], `__index_${i}__${file.name}`, {
          type: file.type,
        });
        formData.append("attachments", renamed);
      });
    });

    try {
      const res = await axios.post("/rms/add-many-rm", formData);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.status === 200 || res.status === 201) {
        toast.success("Raw materials added successfully");
        setRows([]);
        onClose?.();
      } else {
        toast.error(res.data?.message || "Failed to add materials");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add materials");
    } finally {
      setLoading(false);
    }
  };
  const locationOptions = locations.map((l) => ({
    value: l.locationId,
    label: l.locationId,
  }));

  return (
    <div className="fixed inset-0  backdrop-blur-xs  flex items-center justify-center z-50">
      <div className="bg-white w-full  max-w-[92vw] sm:max-w-5xl rounded-lg  border border-primary overflow-y-auto max-h-[90vh]  scrollbar-thin scrollbar-thumb-primary scrollbar-track-[#fdf6e9]">
        <div className="flex justify-between items-center sticky top-0 bg-white z-10 px-4 py-4">
          <h2 className="text-xl font-semibold">Add Raw Materials</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-red-500 font-bold text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Header Controls */}
        {/* <div className="flex justify-between mb-6">
          <button
            onClick={onClose}
            className="bg-primary text-[#292926] px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80"
          >
            <FiArrowLeft /> Back
          </button>
          <button
            onClick={handleReset}
            className="bg-primary text-[#292926] px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80"
          >
            <RiResetRightLine /> Reset
          </button>
        </div> */}

        {/* Form Rows */}
        <div className="space-y-6 px-6  ">
          {rows.map((rm, index) => (
            <div
              key={index}
              className="bg-white border border-primary rounded-lg p-4 space-y-4 shadow-md"
            >
              <h2 className="text-[15px] font-semibold text-[#292926] mb-1">
                Item {index + 1}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Sku Code
                  </label>
                  <input
                    required
                    placeholder="Sku Code"
                    value={rm.skuCode}
                    onChange={(e) =>
                      handleChange(index, "skuCode", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Item Name
                  </label>
                  <input
                    placeholder="Item Name"
                    value={rm.itemName}
                    onChange={(e) =>
                      handleChange(index, "itemName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Description
                  </label>
                  <input
                    placeholder="Description"
                    value={rm.description}
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926] mb-1 block">
                    Item Category
                  </label>
                  <select
                    value={rm.itemCategory}
                    onChange={(e) =>
                      handleChange(index, "itemCategory", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat, i) => (
                      <option key={i} value={cat.name}>
                        {cat.name} ({cat.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Item Color
                  </label>
                  <input
                    placeholder="Item Color"
                    value={rm.itemColor}
                    onChange={(e) =>
                      handleChange(index, "itemColor", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    HSN/SAC
                  </label>
                  <input
                    placeholder="HSN/SAC"
                    value={rm.hsnOrSac}
                    onChange={(e) =>
                      handleChange(index, "hsnOrSac", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    GST %
                  </label>
                  <input
                    placeholder="Item Color"
                    value={rm.gst}
                    onChange={(e) => handleChange(index, "gst", e.target.value)}
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    HSN/SAC
                  </label>

                  <select
                    value={rm.hsnOrSac}
                    onChange={(e) =>
                      handleChange(index, "hsnOrSac", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select HSN</option>
                    {gstTable?.map((cat, i) => (
                      <option key={i} value={cat.hsn}>
                        {cat.hsn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    GST %
                  </label>

                  <select
                    value={rm.gst}
                    onChange={(e) => handleChange(index, "gst", e.target.value)}
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select GST</option>
                    {gstTable?.map((cat, i) => (
                      <option key={i} value={cat.gst}>
                        {cat.gst}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Quality Inspection
                  </label>
                  <select
                    value={rm.qualityInspectionNeeded}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "qualityInspectionNeeded",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Required</option>
                    <option>Not Required</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Location
                  </label>
                  <Select
                    options={locationOptions}
                    value={
                      locationOptions.find(
                        (opt) => opt.value === rm.location
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      handleChange(
                        index,
                        "location",
                        selectedOption?.value || ""
                      )
                    }
                    placeholder="Select Location"
                    isSearchable
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: "#d8b76a",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px #b38a37"
                          : "none",
                        "&:hover": {
                          borderColor: "#b38a37",
                        },
                        padding: "2px",
                        fontSize: "0.875rem", // text-sm
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Base Qty
                  </label>
                  <input
                    type="number"
                    placeholder="Base Qty"
                    value={rm.baseQty}
                    onChange={(e) =>
                      handleChange(index, "baseQty", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Pkg Qty
                  </label>
                  <input
                    type="number"
                    placeholder="Pkg Qty"
                    value={rm.pkgQty}
                    onChange={(e) =>
                      handleChange(index, "pkgQty", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    MOQ
                  </label>
                  <input
                    type="number"
                    placeholder="MOQ"
                    value={rm.moq}
                    onChange={(e) => handleChange(index, "moq", e.target.value)}
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Base Rate
                  </label>
                  <input
                    type="number"
                    placeholder="Base Rate"
                    value={rm.baseRate}
                    onChange={(e) =>
                      handleChange(index, "baseRate", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div> */}
                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Rate
                  </label>
                  <input
                    type="number"
                    placeholder="Rate"
                    value={rm.rate}
                    onChange={(e) =>
                      handleChange(index, "rate", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Purchase UOM
                  </label>
                  <select
                    value={rm.purchaseUOM}
                    onChange={(e) =>
                      handleChange(index, "purchaseUOM", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select UOM</option>
                    {uoms.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Stock Qty
                  </label>
                  <input
                    // disabled
                    type="number"
                    placeholder="Stock Qty"
                    value={rm.stockQty ?? 0} // fallback to 0 if null/undefined
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange(
                        index,
                        "stockQty",
                        val === "" ? 0 : Number(val)
                      );
                    }}
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292926]">
                    Stock UOM
                  </label>
                  <select
                    value={rm.stockUOM}
                    onChange={(e) =>
                      handleChange(index, "stockUOM", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select UOM</option>
                    {uoms.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </div>
                {fabric.includes(rm.itemCategory.toLowerCase()) && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-[#292926]">
                        Panno
                      </label>
                      <input
                        type="number"
                        placeholder="Panno"
                        value={rm.panno}
                        onChange={(e) =>
                          handleChange(index, "panno", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#292926]">
                        SqInch Rate
                      </label>
                      <input
                        type="number"
                        placeholder="SqInch Rate"
                        value={rm.sqInchRate}
                        onChange={(e) =>
                          handleChange(index, "sqInchRate", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-semibold text-red-600">
                    Total Rate
                  </label>
                  <div className="w-full px-4 py-2 text-red-600 border border-red-600 rounded bg-gray-50">
                    ₹ {parseFloat(rm.totalRate || 0).toFixed(2)}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#292926]">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(index, e.target.files)}
                  className=" block w-full text-sm text-gray-600 cursor-pointer bg-white border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fdf6e9] file:text-[#292926] hover:file:bg-primary/10 file:cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-1 items-center text-red-600 ">
                <span
                  onClick={() => handleRemove(index)}
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <FiTrash2 className="text-red-500 hover:text-red-700 cursor-pointer text-xl" />
                  Remove
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex justify-end gap-4 p-6">
          <button
            onClick={addRow}
            className="bg-primary text-[#292926] px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 cursor-pointer"
          >
            <FiPlus /> Add Row
          </button>
          <button
            onClick={handleSubmit}
            className=" bg-primary text-[#292926] px-4 py-2 rounded hover:bg-primary/80 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span>Saving...</span>
                <BeatLoader size={5} color="#292926" />
              </div>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkRmPanel;
