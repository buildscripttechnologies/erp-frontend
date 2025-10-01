import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    gst: "",
    address: "",
    mobile: "",
  });

  useEffect(() => {
    axios
      .get("/settings/vendor")
      .then((res) => setVendors(res.data?.vendors || []));
  }, []);

  const addVendor = async () => {
    if (!form.name.trim()) return toast.error("Vendor name is required!");
    const res = await axios.post("/settings/vendor", form);
    setVendors(res.data);
    setForm({ name: "", gst: "", address: "", mobile: "" });
  };

  const deleteVendor = async (id) => {
    if (!window.confirm("Are you sure want to DELETE this vendor?")) return;

    const res = await axios.delete(`/settings/vendor/${id}`);
    setVendors(res.data);
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      {/* Heading */}
      <h2 className="text-xl font-semibold text-primary mb-4">Vendors</h2>

      {/* Add Vendor Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <input
          required
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="GST"
          value={form.gst}
          onChange={(e) => setForm({ ...form, gst: e.target.value })}
        />
        <input
          required
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <input
          required
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Mobile No"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
        />
      </div>
      <button
        onClick={addVendor}
        className="bg-primary text-secondary font-medium px-5 py-2 rounded hover:bg-primary/80 transition"
      >
        Add Vendor
      </button>

      {/* Vendor List */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border border-gray-200 rounded overflow-hidden">
          <thead className="bg-primary text-secondary">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">GST</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Mobile</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v._id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-2 font-medium">{v.name}</td>
                <td className="px-4 py-2">{v.gst || "-"}</td>
                <td className="px-4 py-2">{v.address || "-"}</td>
                <td className="px-4 py-2">{v.mobile || "-"}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => deleteVendor(v._id)}
                    className="text-red-500 hover:text-red-700 transition flex items-center justify-center"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-4 text-center text-gray-500 italic"
                >
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
