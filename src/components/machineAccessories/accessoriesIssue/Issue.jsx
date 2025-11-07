import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../utils/axios";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { BeatLoader } from "react-spinners";
import Select from "react-select";

const Issue = ({ onClose, onAdded }) => {
  const [formList, setFormList] = useState([
    {
      accessory: null,
      issueQty: 0,
      remarks: "",
      // personName: "",
      // department: "",
      // issueReason: "",
      // receivedBy: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [personName, setPersonName] = useState([]);
  const [department, setDepartment] = useState([]);
  const [issueReason, setIssueReason] = useState([]);
  const [receivedBy, setReceivedBy] = useState([]);
  const [supervisor, setSupervisor] = useState([]);
  const [accessories, setAccessories] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await axios.get(`/accessories/get-all`);
        setAccessories(res.data.data || []);
      } catch {
        toast.error("Failed to fetch accessories");
      }
    };
    fetchDropdowns();
  }, []);

  const accessoriesOptions = accessories.map((a) => ({
    value: a._id,
    label: `${a.accessoryName} - ${a.description}`,
    full: a,
  }));

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formList];
    updated[index][name] = value;
    setFormList(updated);
  };

  // separate handler for react-select
  const handleAccessoryChange = (index, selected) => {
    const updated = [...formList];
    updated[index].accessory = selected;
    setFormList(updated);
  };

  const addRow = () => {
    setFormList([
      ...formList,
      {
        accessory: null,
        issueQty: 0,
        remarks: "",
        // personName: "",
        // department: "",
        // issueReason: "",
        // receivedBy: "",
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = [...formList];
    updated.splice(index, 1);
    setFormList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // prepare clean payload
      const acc = formList.map((f) => ({
        ...f,
        accessory: f.accessory?.value || null,
      }));

      const payload = {
        accessories: acc,
        personName,
        department,
        issueReason,
        receivedBy,
        supervisor,
      };

      const res = await axios.post("/accessory-issue/issue", payload);

      if (res.data.status === 200) {
        toast.success("Accessories issued successfully!");
        onAdded?.();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to issue accessories");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error in issue accessories");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-4xl rounded-lg p-6 border border-primary overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-primary scrollbar-track-[#fdf6e9]">
        <h2 className="text-xl font-bold mb-4 text-primary">Issue Accessory</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Labour / Employee Name
              </label>
              <input
                type="text"
                name="personName"
                placeholder="Labour / Employee Name"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full  px-2 py-1.5 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full  px-2 py-1.5 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Issue Reason
              </label>
              <input
                type="text"
                name="issueReason"
                placeholder="Issue Reason"
                value={issueReason}
                onChange={(e) => setIssueReason(e.target.value)}
                className="w-full  px-2 py-1.5 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Received By
              </label>
              <input
                type="text"
                name="receivedBy"
                placeholder="Received By"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full  px-2 py-1.5 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Supervisor
              </label>
              <input
                type="text"
                name="supervisor"
                placeholder="Supervisor"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                className="w-full  px-2 py-1.5 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          {formList.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start border p-4 rounded border-primary"
            >
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-black mb-1">
                  Accessory
                </label>
                <Select
                  options={accessoriesOptions}
                  value={item.accessory}
                  onChange={(selected) =>
                    handleAccessoryChange(index, selected)
                  }
                  placeholder="Select Accessory"
                  isSearchable
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: "#d8b76a",
                      boxShadow: state.isFocused ? "0 0 0 1px #d8b76a" : "none",
                      "&:hover": { borderColor: "#d8b76a" },
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({
                      ...base,
                      width: "max-content",
                      minWidth: "100%",
                    }),
                  }}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="issueQty"
                  placeholder="Issue Qty"
                  value={item.issueQty}
                  onChange={(e) => handleChange(index, e)}
                  required
                  className="w-full  px-2 py-1.5 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Remarks
                </label>
                <input
                  type="text"
                  name="remarks"
                  placeholder="Remarks"
                  value={item.remarks}
                  onChange={(e) => handleChange(index, e)}
                  className="w-full  px-2 py-1.5 border border-primary rounded focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Vendor Select */}

              {/* Buttons */}
              <div className="flex gap-2 items-end ">
                {formList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className=" bg-red-100 hover:bg-red-200 text-red-700 px-3 py-3 rounded cursor-pointer"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Footer buttons */}
          <div className="flex justify-between gap-4 mt-4">
            <button
              type="button"
              onClick={addRow}
              className=" bg-primary flex items-center gap-1 hover:bg-primary/80 text-black px-3 py-2 rounded cursor-pointer"
            >
              <FiPlus /> <span>Add Row</span>
            </button>
            <div className="flex gap-2">
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
                    <BeatLoader size={5} color="#292926" />
                  </>
                ) : (
                  "Issue"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Issue;
