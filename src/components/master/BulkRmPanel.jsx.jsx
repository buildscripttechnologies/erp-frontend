import React, { useState, useEffect } from "react";
import { FiTrash2, FiArrowLeft, FiPlus } from "react-icons/fi";
import { RiResetRightLine } from "react-icons/ri";

import axios from "../../utils/axios";
import toast from "react-hot-toast";

const BulkRmPanel = ({ onClose }) => {
  const [rows, setRows] = useState([]);
  const [uoms, setUoms] = useState([]);

  const fetchUoms = async () => {
    try {
      const res = await axios.get("/uoms/all-uoms");
      setUoms(res.data.data || []);
    } catch {
      toast.error("Failed to load UOMs");
    }
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        // Remove skuCode here
        itemName: "",
        description: "",
        hsnOrSac: "",
        type: "RM",
        qualityInspectionNeeded: "Required",
        location: "",
        baseQty: "",
        pkgQty: "",
        moq: "",
        purchaseUOM: "",
        stockQty: "",
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

  const handleReset = () => {
    setRows([]);
  };

  const handleSubmit = async () => {
    if (rows.length === 0) return toast.error("Please add at least one row.");

    const formData = new FormData();
    formData.append(
      "rawMaterials",
      JSON.stringify(
        rows.map((r) => {
          const { attachments, ...rest } = r;
          return rest;
        })
      )
    );

    // Rename attachments with __index_N__ prefix so backend can map them
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

      if (res.status === 200 || res.status === 201) {
        toast.success("Raw materials added successfully");
        setRows([]);
        fetchUoms(); // Optional: Refresh if UOMs can change
        onClose?.(); // Close the panel
      } else {
        toast.error(res.data?.message || "Failed to add materials");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add materials");
    }
  };

  useEffect(() => {
    fetchUoms();
    addRow();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gray-200 p-6 overflow-y-auto">
      {/* Top buttons */}
      <div className="flex justify-between mb-4">
        <button
          onClick={onClose}
          className="flex items-center bg-[#d8b76a] px-4 font-semibold gap-2 rounded hover:bg-[#d8b76a]/80 text-[#292926] cursor-pointer"
        >
          <FiArrowLeft /> Back
        </button>
        <button
          onClick={handleReset}
          className="bg-[#d8b76a] flex justify-center font-semibold items-center gap-1 text-[#292926] px-4 py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer duration-100"
        >
          <RiResetRightLine />
          Reset
        </button>
      </div>

      <div className="overflow-x-auto rounded shadow-md drop-shadow-lg">
        <table className="min-w-full bg-white/90  text-sm text-left rounded-md">
          <thead className="bg-[#d8b76a] text-[#292926] font-semibold rounded">
            <tr>
              {[
                // "SKU Code",
                "Item Name",
                "Description",
                "HSN/SAC",
                "Type",
                "Qual. Insp.",
                "Location",
                "Base Qty",
                "Pkg Qty",
                "MOQ",
                "Pur. UOM",
                "GST %",
                "Stock Qty",
                "Stock UOM",
                "Attachments",
                "Action",
              ].map((label) => (
                <th key={label} className="p-2 whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rm, i) => (
              <tr key={i} className="border-b border-[#d8b76a]">
                {/* <td className="p-2">{rm.skuCode}</td> */}
                <td className="p-2">
                  <input
                    placeholder="Item Name"
                    className="px-2 py-1 w-40 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200 "
                    value={rm.itemName}
                    onChange={(e) =>
                      handleChange(i, "itemName", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    placeholder="Description"
                    className="px-2 py-1 w-40 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200 "
                    value={rm.description}
                    onChange={(e) =>
                      handleChange(i, "description", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    placeholder="HSN/SAC"
                    className="px-2 py-1 w-20 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200 "
                    value={rm.hsnOrSac}
                    onChange={(e) =>
                      handleChange(i, "hsnOrSac", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">RM</td>
                <td className="p-2">
                  <select
                    className="px-2 py-1 w-32 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200 "
                    value={rm.qualityInspectionNeeded}
                    onChange={(e) =>
                      handleChange(i, "qualityInspectionNeeded", e.target.value)
                    }
                  >
                    <option>Required</option>
                    <option>Not Required</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    placeholder="Location"
                    className="px-2 py-1 w-40 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200 "
                    value={rm.location}
                    onChange={(e) =>
                      handleChange(i, "location", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    placeholder="Base Qty"
                    type="number"
                    className="px-2 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200  w-16"
                    value={rm.baseQty}
                    onChange={(e) => handleChange(i, "baseQty", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    placeholder="Pkg Qty"
                    type="number"
                    className="px-2 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200  w-16"
                    value={rm.pkgQty}
                    onChange={(e) => handleChange(i, "pkgQty", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    placeholder="MOQ"
                    type="number"
                    className="px-2 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200  w-16"
                    value={rm.moq}
                    onChange={(e) => handleChange(i, "moq", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <select
                    className="px-2 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200 "
                    value={rm.purchaseUOM}
                    onChange={(e) =>
                      handleChange(i, "purchaseUOM", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {uoms.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    placeholder="GST %"
                    type="number"
                    className="px-2 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200  w-16"
                    value={rm.gst}
                    onChange={(e) => handleChange(i, "gst", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    placeholder="Stock Qty"
                    type="number"
                    className="px-2 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200  w-16"
                    value={rm.stockQty}
                    onChange={(e) =>
                      handleChange(i, "stockQty", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">
                  <select
                    className="px-2 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200 "
                    value={rm.stockUOM}
                    onChange={(e) =>
                      handleChange(i, "stockUOM", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {uoms.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileChange(i, e.target.files)}
                  />
                </td>
                <td className="p-2">
                  <FiTrash2
                    className="text-[#d8b76a] hover:text-red-600 cursor-pointer text-lg duration-200"
                    onClick={() => handleRemove(i)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={addRow}
          className="bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-[#292926] cursor-pointer font-semibold px-4 py-2 rounded flex items-center gap-2 duration-100"
        >
          <FiPlus /> Add Items
        </button>
        <button
          onClick={handleSubmit}
          className="bg-[#d8b76a]  hover:bg-[#d8b76a]/80 text-[#292926] cursor-pointer font-semibold px-6 py-2 rounded duration-100"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default BulkRmPanel;
