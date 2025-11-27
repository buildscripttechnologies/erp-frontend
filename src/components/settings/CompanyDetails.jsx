import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus } from "react-icons/fi";
import BeatLoader from "react-spinners/BeatLoader";

export default function CompanyDetails() {
  const [details, setDetails] = useState({
    companyName: "",
    gst: "",
    pan: "",
    mobile: "",
    warehouses: [],
    bankDetails: [],
  });
  const [loading, setLoading] = useState(true);
  const [editable, setEditable] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [editingBank, setEditingBank] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/settings/company-details");
      if (res.data) setDetails(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleWarehouseChange = (i, e) => {
    const updated = [...details.warehouses];
    updated[i][e.target.name] = e.target.value;
    setDetails({ ...details, warehouses: updated });
  };

  const handleBankChange = (i, e) => {
    const updated = [...details.bankDetails];
    updated[i][e.target.name] = e.target.value;
    setDetails({ ...details, bankDetails: updated });
  };

  const saveCompanyDetails = async () => {
    setSaving(true);
    try {
      await axios.put("/settings/company-details", details);
      setEditable(false);
      fetchDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditable(false);
    setEditingWarehouse(null);
    setEditingBank(null);
    fetchDetails();
  };

  // Warehouses
  const addWarehouse = () => {
    const newWarehouse = {
      _id: Date.now().toString(),
      name: "",
      address: "",
      isNew: true,
    };
    setDetails((prev) => ({
      ...prev,
      warehouses: [...prev.warehouses, newWarehouse],
    }));
    setEditingWarehouse(details.warehouses.length);
  };

  const saveWarehouse = async (i) => {
    const wh = details.warehouses[i];
    try {
      if (wh.isNew) {
        const res = await axios.post("/settings/company-details/warehouse", {
          name: wh.name,
          address: wh.address,
        });
        setDetails((prev) => ({ ...prev, warehouses: res.data }));
      } else {
        await axios.put(`/settings/company-details/warehouse/${wh._id}`, {
          name: wh.name,
          address: wh.address,
        });
        fetchDetails();
      }
      setEditingWarehouse(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteWarehouse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?"))
      return;
    try {
      const res = await axios.delete(
        `/settings/company-details/warehouse/${id}`
      );
      setDetails((prev) => ({ ...prev, warehouses: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const cancelWarehouseEdit = (i) => {
    if (details.warehouses[i].isNew) {
      // remove newly added row if cancelled
      setDetails((prev) => ({
        ...prev,
        warehouses: prev.warehouses.filter((_, index) => index !== i),
      }));
    }
    setEditingWarehouse(null);
  };

  // Bank Details
  const addBank = () => {
    const newBank = {
      _id: Date.now().toString(),
      accountNo: "",
      ifsc: "",
      upiId: "",
      bankName: "",
      branch: "",
      isNew: true,
    };
    setDetails((prev) => ({
      ...prev,
      bankDetails: [...prev.bankDetails, newBank],
    }));
    setEditingBank(details.bankDetails.length);
  };

  const saveBank = async (i) => {
    const bank = details.bankDetails[i];
    try {
      if (bank.isNew) {
        const res = await axios.post("/settings/company-details/bank", {
          accountNo: bank.accountNo,
          ifsc: bank.ifsc,
          upiId: bank.upiId,
          bankName: bank.bankName,
          branch: bank.branch,
        });
        setDetails((prev) => ({ ...prev, bankDetails: res.data }));
      } else {
        await axios.put(`/settings/company-details/bank/${bank._id}`, bank);
        fetchDetails();
      }
      setEditingBank(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBank = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bank?")) return;
    try {
      const res = await axios.delete(`/settings/company-details/bank/${id}`);
      setDetails((prev) => ({ ...prev, bankDetails: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const cancelBankEdit = (i) => {
    if (details.bankDetails[i].isNew) {
      setDetails((prev) => ({
        ...prev,
        bankDetails: prev.bankDetails.filter((_, index) => index !== i),
      }));
    }
    setEditingBank(null);
  };

  if (loading)
    return (
      <div className="p-4">
        <BeatLoader color="#d8b76a" />
      </div>
    );

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary">Company Details</h2>
        {!editable && (
          <button
            onClick={() => setEditable(true)}
            className="px-4 py-1 bg-primary text-secondary rounded shadow hover:bg-primary/90"
          >
            Edit
          </button>
        )}
      </div>

      {/* Company Info */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        {[
          { name: "Company Name", value: "companyName" },
          { name: "GST", value: "gst" },
          { name: "PAN", value: "pan" },
          { name: "Mobile", value: "mobile" },
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium mb-1">
              {field.name}
            </label>
            <input
              name={field.value}
              value={details[field.value]}
              onChange={handleChange}
              readOnly={!editable}
              className={`w-full p-2 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary ${
                !editable && "bg-gray-100"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Warehouses Table */}
      <h3 className="text-lg font-medium mb-1">Warehouses</h3>
      <div className="overflow-x-auto  rounded border border-primary shadow-sm">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-primary text-secondary text-left">
            <tr>
              <th className="px-2 py-1 ">#</th>
              <th className="px-2 py-1 ">Name</th>
              <th className="px-2 py-1 ">Address</th>
              {editable && <th className="px-2 py-1 ">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {details.warehouses.map((wh, i) => (
              <tr
                key={wh._id}
                className="hover:bg-gray-50 border-t border-primary"
              >
                <td className="px-2 py-1 border-r border-primary text-left">
                  {i + 1}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  <input
                    name="name"
                    value={wh.name}
                    onChange={(e) => handleWarehouseChange(i, e)}
                    readOnly={editingWarehouse !== i || !editable}
                    className={`w-full p-1 read-only:p-0 read-only:border-none read-only:bg-transparent read-only:focus:ring-0 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary ${
                      editingWarehouse !== i && !wh.isNew && "bg-gray-100"
                    }`}
                  />
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  <input
                    name="address"
                    value={wh.address}
                    onChange={(e) => handleWarehouseChange(i, e)}
                    readOnly={editingWarehouse !== i || !editable}
                    className={`w-full p-1 read-only:p-0  read-only:border-none read-only:bg-transparent read-only:focus:ring-0 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary ${
                      editingWarehouse !== i && !wh.isNew && "bg-gray-100"
                    }`}
                  />
                </td>
                {editable && (
                  <td className="px-2 py-1  text-left space-x-3">
                    {editingWarehouse === i ? (
                      <>
                        <button
                          onClick={() => saveWarehouse(i)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() => cancelWarehouseEdit(i)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FiX />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingWarehouse(i)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteWarehouse(wh._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editable && (
        <button
          onClick={addWarehouse}
          className="mb-4 mt-2 px-4 py-1 bg-primary text-secondary rounded hover:bg-primary/90 flex items-center"
        >
          <FiPlus className="mr-1" /> Add Warehouse
        </button>
      )}

      {/* Bank Details Table */}
      <h3 className="text-lg font-medium mb-1 mt-4">Bank Details</h3>
      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="w-full  text-sm whitespace-nowrap">
          <thead className="bg-primary text-secondary text-left">
            <tr>
              <th className="px-2 py-1 ">#</th>
              <th className="px-2 py-1 ">Account No</th>
              <th className="px-2 py-1 ">Bank Name</th>
              <th className="px-2 py-1 ">Branch</th>
              <th className="px-2 py-1 ">IFSC</th>
              <th className="px-2 py-1 ">UPI ID</th>
              {editable && <th className="px-2 py-1 ">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {details.bankDetails.map((bank, i) => (
              <tr
                key={bank._id}
                className="hover:bg-gray-50 border-t border-primary"
              >
                <td className="px-2 py-1  text-left border-r border-primary">
                  {i + 1}
                </td>
                {["accountNo", "bankName", "branch", "ifsc", "upiId"].map(
                  (field) => (
                    <td
                      key={field}
                      className="px-2 py-1 border-r border-primary"
                    >
                      <input
                        name={field}
                        value={bank[field]}
                        onChange={(e) => handleBankChange(i, e)}
                        readOnly={editingBank !== i || !editable}
                        className={`w-full p-1 read-only:p-0 read-only:border-none read-only:bg-transparent read-only:focus:ring-0 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary ${
                          editingBank !== i && !bank.isNew && "bg-gray-100"
                        }`}
                      />
                    </td>
                  )
                )}
                {editable && (
                  <td className="px-2 py-1   space-x-1">
                    {editingBank === i ? (
                      <>
                        <button
                          onClick={() => saveBank(i)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() => cancelBankEdit(i)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FiX />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingBank(i)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteBank(bank._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editable && (
        <button
          onClick={addBank}
          className="mb-4 mt-2 px-4 py-1 bg-primary text-secondary rounded hover:bg-primary/90 flex items-center"
        >
          <FiPlus className="mr-1" /> Add Bank
        </button>
      )}

      {/* Save / Cancel */}
      {editable && (
        <div className="flex space-x-2">
          <button
            onClick={saveCompanyDetails}
            disabled={saving}
            className="px-6 py-2 bg-primary text-secondary rounded shadow hover:bg-primary/90 flex items-center"
          >
            {saving && <BeatLoader size={6} color="#fff" className="mr-2" />}
            Save All
          </button>
          <button
            onClick={cancelEdit}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
