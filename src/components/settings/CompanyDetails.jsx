import { useEffect, useState } from "react";
import axios from "../../utils/axios";

export default function CompanyDetails() {
  const [details, setDetails] = useState({
    companyName: "",
    gst: "",
    pan: "",
    mobile: "",
    warehouses: [{ name: "", address: "" }],
    bankDetails: [
      { accountNo: "", ifsc: "", upiId: "", bankName: "", branch: "" },
    ],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/settings/company").then((res) => {
      if (res.data) setDetails(res.data);
      setLoading(false);
    });
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

  const addWarehouse = () => {
    setDetails({
      ...details,
      warehouses: [...details.warehouses, { name: "", address: "" }],
    });
  };

  const addBank = () => {
    setDetails({
      ...details,
      bankDetails: [
        ...details.bankDetails,
        { accountNo: "", ifsc: "", upiId: "", bankName: "", branch: "" },
      ],
    });
  };

  const saveDetails = async () => {
    await axios.post("/settings/company", details);
    alert("Company details saved ✅");
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Company Details
      </h2>

      {/* Company Info */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <input
          name="companyName"
          placeholder="Company Name"
          value={details.companyName}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="gst"
          placeholder="GST"
          value={details.gst}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="pan"
          placeholder="PAN"
          value={details.pan}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="mobile"
          placeholder="Mobile"
          value={details.mobile}
          onChange={handleChange}
          className="p-2 border rounded"
        />
      </div>

      {/* Warehouses */}
      <h3 className="text-lg font-medium mb-2">Warehouses</h3>
      {details.warehouses.map((wh, i) => (
        <div key={i} className="grid gap-4 sm:grid-cols-2 mb-3">
          <input
            name="name"
            placeholder="Warehouse Name"
            value={wh.name}
            onChange={(e) => handleWarehouseChange(i, e)}
            className="p-2 border rounded"
          />
          <input
            name="address"
            placeholder="Warehouse Address"
            value={wh.address}
            onChange={(e) => handleWarehouseChange(i, e)}
            className="p-2 border rounded"
          />
        </div>
      ))}
      <button
        onClick={addWarehouse}
        className="mb-6 px-4 py-2 bg-primary text-secondary rounded shadow hover:bg-primary/90"
      >
        + Add Warehouse
      </button>

      {/* Bank Details */}
      <h3 className="text-lg font-medium mb-2">Bank Details</h3>
      {details.bankDetails.map((bank, i) => (
        <div key={i} className="grid gap-4 sm:grid-cols-3 mb-3">
          <input
            name="accountNo"
            placeholder="Account No"
            value={bank.accountNo}
            onChange={(e) => handleBankChange(i, e)}
            className="p-2 border rounded"
          />
          <input
            name="ifsc"
            placeholder="IFSC"
            value={bank.ifsc}
            onChange={(e) => handleBankChange(i, e)}
            className="p-2 border rounded"
          />
          <input
            name="upiId"
            placeholder="UPI ID"
            value={bank.upiId}
            onChange={(e) => handleBankChange(i, e)}
            className="p-2 border rounded"
          />
          <input
            name="bankName"
            placeholder="Bank Name"
            value={bank.bankName}
            onChange={(e) => handleBankChange(i, e)}
            className="p-2 border rounded"
          />
          <input
            name="branch"
            placeholder="Branch"
            value={bank.branch}
            onChange={(e) => handleBankChange(i, e)}
            className="p-2 border rounded"
          />
        </div>
      ))}
      <button
        onClick={addBank}
        className="mb-6 px-4 py-2 bg-primary text-secondary rounded shadow hover:bg-primary/90"
      >
        + Add Bank
      </button>

      {/* Save */}
      <button
        onClick={saveDetails}
        className="px-6 py-2 bg-primary text-secondary font-medium rounded-lg shadow hover:bg-primary/90"
      >
        Save Company Details
      </button>
    </div>
  );
}
