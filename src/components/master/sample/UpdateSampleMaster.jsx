import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import Select from "react-select";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import { FiTrash2 } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { sample } from "lodash";

const UpdateSampleModal = ({ onClose, onSuccess, Sample }) => {
  // console.log("sample", Sample);

  const [form, setForm] = useState({
    partyName: Sample.partyName || "",
    productName: Sample.product?.name || "",
    orderQty: Sample.orderQty || 1,
    date: Sample.date?.split("T")[0] || new Date().toISOString().split("T")[0],
  });

  const [productDetails, setProductDetails] = useState(
    Sample.productDetails || []
  );
  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(Sample.file || []);
  const [deletedFiles, setDeletedFiles] = useState([]);

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

  // useEffect(() => {
  //   setProductDetails(
  //     (Sample.productDetails || []).map((comp) => ({
  //       ...comp,
  //       partName: comp.partName || "",
  //     }))
  //   );
  // }, [Sample]);

  const updateComponent = (index, field, value) => {
    console.log(index, field, value);

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
        partName: "", // ADD THIS
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
      const formData = new FormData();

      const payload = {
        ...form,
        productDetails: productDetails.map(({ label, ...rest }) => rest),
        deletedFiles,
      };

      // console.log("deleted files", deletedFiles);
      // console.log("pd", payload.productDetails);

      formData.append("data", JSON.stringify(payload));

      newFiles.forEach((file) => {
        formData.append("files", file);
      });

      let res = await axios.patch(`/samples/update/${Sample._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Sample updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to update Sample");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto px-6 pb-6  space-y-6 shadow-lg border border-[#d8b76a] text-[#292926]">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-2 pt-4">
          <h2 className="text-xl font-semibold">Update Sample Product</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-red-500 font-bold text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

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
              disabled
              type="number"
              placeholder="Order Qty"
              className="p-2 border border-[#d8b76a] rounded cursor-not-allowed focus:border-2 focus:border-[#d8b76a] focus:outline-none transition"
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
          <div className="flex flex-col">
            <label className="text-[12px] font-semibold mb-[2px] text-[#292926] capitalize">
              Upload New Files
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setNewFiles([...e.target.files])}
              className="block text-sm text-gray-600 cursor-pointer bg-white border border-[#d8b76a] rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#fdf6e9] file:text-[#292926] hover:file:bg-[#d8b76a]/10 file:cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-[14px] mb-1 text-[#d8b76a] underline">
            Existing Files
          </h3>
          {existingFiles.length === 0 && (
            <p className="text-sm text-gray-500">No files uploaded.</p>
          )}

          {existingFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-gray-100 px-3 py-1 rounded text-sm"
            >
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#292926] underline break-all"
              >
                {file.fileName}
              </a>
              <button
                type="button"
                onClick={() => {
                  setDeletedFiles([...deletedFiles, file]);
                  setExistingFiles(existingFiles.filter((_, i) => i !== idx));
                }}
                className="text-red-500 flex items-center gap-0.5 text-xs hover:underline cursor-pointer"
              >
                <FiTrash2 /> Remove
              </button>
            </div>
          ))}
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

                  {["partName", "height", "width", "depth","qty"].map((field) => (
                    <div className="flex flex-col" key={field}>
                      <label className="text-[12px] font-semibold mb-[2px] text-[#292926] capitalize">
                        {field == "partName"
                          ? "Part Name"
                          : field == "qty"
                          ? "Qty"
                          : `${field} (Inch)`}{" "}
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
                  ))}
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
  );
};

export default UpdateSampleModal;
