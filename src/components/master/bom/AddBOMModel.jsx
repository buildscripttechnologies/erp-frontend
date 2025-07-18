import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import Select from "react-select";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";

const AddBomModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    partyName: "",
    productName: "",
    orderQty: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [productDetails, setProductDetails] = useState([]);
  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [rmRes, sfgRes, fgRes, customerRes] = await Promise.all([
          axios.get("/rms/rm?limit=1000"),
          axios.get("/sfgs/get-all?limit=1000"),
          axios.get("/fgs/get-all?limit=1000"),
          axios.get("/customers/get-all?limit=1000"),
        ]);

        const rawMaterials = (rmRes.data.rawMaterials || []).map((item) => ({
          ...item,
          type: "RM",
        }));
        const sfgItems = (sfgRes.data.data || []).map((item) => ({
          ...item,
          type: "SFG",
        }));

        setRms(rawMaterials);
        setSfgs(sfgItems);
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

  console.log("form", form);

  const handleAddComponent = (selected) => {
    if (!selected) return;
    const exists = productDetails.some(
      (item) => item.itemId === selected.value
    );
    if (exists) return toast.error("Component already added");
    setProductDetails([
      ...productDetails,
      {
        itemId: selected.value,
        type: selected.type,
        qty: "",
        height: "",
        width: "",
        depth: "",
        label: selected.label,
      },
    ]);
  };

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

  const handleSubmit = async () => {
    if (!form.partyName || !form.productName || !form.orderQty) {
      return toast.error("Please fill all required fields");
    }

    try {
      const payload = {
        ...form,
        productDetails: productDetails.map(({ label, ...rest }) => rest),
      };

      await axios.post("/boms/add", payload);
      toast.success("BOM added successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to add BOM");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50  bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl p-6 space-y-5 shadow-lg border border-[#d8b76a] text-[#292926]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Bill of Materials</h2>
          <button onClick={onClose} className="text-red-500 font-bold text-xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <CreatableSelect
            options={customers.map((c) => ({
              label: c.customerName,
              value: c.customerName.trim(),
            }))}
            placeholder="Select or Type Customer"
            onChange={(e) => setForm({ ...form, partyName: e?.value })}
            onCreateOption={(inputValue) =>
              setForm({ ...form, partyName: inputValue })
            }
            value={
              form.partyName
                ? { label: form.partyName, value: form.partyName }
                : null
            }
          />

          <CreatableSelect
            options={fgs.map((fg) => ({
              label: fg.itemName,
              value: fg.itemName.trim(),
            }))}
            placeholder="Select or Type FG Product"
            onChange={(e) => setForm({ ...form, productName: e?.value })}
            onCreateOption={(inputValue) =>
              setForm({ ...form, productName: inputValue })
            }
            value={
              form.productName
                ? { label: form.productName, value: form.productName }
                : null
            }
          />

          <input
            type="number"
            placeholder="Order Qty"
            className="border p-2 rounded"
            value={form.orderQty}
            onChange={(e) => setForm({ ...form, orderQty: e.target.value })}
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div className="mt-4">
          <h3 className="font-bold text-[14px] mb-2 text-[#d8b76a] underline">
            RM/SFG Components
          </h3>

          <div className="flex flex-col mb-3">
            <label className="text-[12px] font-semibold mb-[4px] text-[#292926]">
              Add RM/SFG Component
            </label>
            <Select
              options={materialOptions}
              onChange={handleAddComponent}
              className="text-[#292926]"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d8b76a",
                  minHeight: "36px",
                  fontSize: "12px",
                }),
              }}
            />
          </div>

          {productDetails.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border border-[#d8b76a] text-sm text-[#292926]">
                <thead className="bg-[#d8b76a] text-white text-[12px]">
                  <tr>
                    <th className="p-2 font-semibold">Component</th>
                    <th className="p-2 font-semibold">Type</th>
                    <th className="p-2 font-semibold">Qty</th>
                    <th className="p-2 font-semibold">H</th>
                    <th className="p-2 font-semibold">W</th>
                    <th className="p-2 font-semibold">D</th>
                    <th className="p-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {productDetails.map((comp, index) => (
                    <tr key={index} className="border-t border-[#d8b76a]">
                      <td className="p-2 text-[12px]">{comp.label}</td>
                      <td className="p-2 text-[12px]">{comp.type}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="border border-[#d8b76a] rounded px-2 py-1 w-16 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#d8b76a]"
                          value={comp.qty}
                          onChange={(e) =>
                            updateComponent(index, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="border border-[#d8b76a] rounded px-2 py-1 w-12 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#d8b76a]"
                          value={comp.height}
                          placeholder="H"
                          onChange={(e) =>
                            updateComponent(index, "height", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="border border-[#d8b76a] rounded px-2 py-1 w-12 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#d8b76a]"
                          value={comp.width}
                          placeholder="W"
                          onChange={(e) =>
                            updateComponent(index, "width", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="border border-[#d8b76a] rounded px-2 py-1 w-12 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#d8b76a]"
                          value={comp.depth}
                          placeholder="D"
                          onChange={(e) =>
                            updateComponent(index, "depth", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          className="text-red-600 text-xs hover:underline"
                          onClick={() => removeComponent(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-[#292926] text-white px-6 py-2 rounded hover:bg-[#1f1f1f]"
          >
            Save BOM
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBomModal;
