import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    gst: "",
    address: "",
    mobile: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
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
    if (!form.name.trim()) return alert("Vendor name is required!");
    const res = await axios.post("/settings/vendor", form);
    setVendors(res.data);
    setForm({ name: "", gst: "", address: "", mobile: "" });
  };

  const deleteVendor = async (id) => {
    if (!window.confirm("Are you sure you want to DELETE this Vendor?")) return;
    const res = await axios.delete(`/settings/vendor/${id}`);
    setVendors(res.data);
  };

  const startEdit = (vendor) => {
    setEditingId(vendor._id);
    setEditForm({ ...vendor });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", gst: "", address: "", mobile: "" });
  };

  const saveEdit = async (id) => {
    if (!window.confirm("Are you sure you want to Apply Changes?")) return;
    const res = await axios.put(`/settings/vendor/${id}`, editForm);
    setVendors(res.data);
    cancelEdit();
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      {/* Heading */}
      <h2 className="text-xl font-semibold text-primary mb-4">Vendors</h2>

      {/* Add Vendor Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <input
          className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="GST"
          value={form.gst}
          onChange={(e) => setForm({ ...form, gst: e.target.value })}
        />
        <input
          className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <input
          className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Mobile No"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
        />
      </div>
      <button
        onClick={addVendor}
        className="bg-primary text-secondary font-medium px-5 py-1 rounded hover:bg-primary/80 transition"
      >
        Add Vendor
      </button>

      {/* Vendor List */}
      <div className="mt-6 overflow-x-auto  rounded border border-primary shadow-sm">
        <table className="w-full text-[11px]  overflow-hidden">
          <thead className="bg-primary text-secondary text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5 text-left">Name</th>
              <th className="px-2 py-1.5 text-left">GST</th>
              <th className="px-2 py-1.5 text-left">Address</th>
              <th className="px-2 py-1.5 text-left">Mobile</th>
              <th className="px-2 py-1.5 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v._id} className="hover:bg-gray-50 transition text-sm">
                {editingId === v._id ? (
                  <>
                    <td className="px-2 py-1">
                      <input
                        className="border border-primary rounded px-2 py-1 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-2">
                      <input
                        className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                        value={editForm.gst}
                        onChange={(e) =>
                          setEditForm({ ...editForm, gst: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-2 ">
                      <input
                        className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm({ ...editForm, address: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-2 ">
                      <input
                        className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                        value={editForm.mobile}
                        onChange={(e) =>
                          setEditForm({ ...editForm, mobile: e.target.value })
                        }
                      />
                    </td>
                    <td className="flex px-2 py-1 text-center space-x-2">
                      <button
                        onClick={() => saveEdit(v._id)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className=" px-2 border-r border-primary font-medium">
                      {v.name}
                    </td>
                    <td className=" px-2 border-r border-primary">
                      {v.gst || "-"}
                    </td>
                    <td className=" px-2 border-r border-primary">
                      {v.address || "-"}
                    </td>
                    <td className=" px-2 border-r border-primary">
                      {v.mobile || "-"}
                    </td>
                    <td className=" px-2 py-1  space-x-2 flex">
                      <button
                        onClick={() => startEdit(v)}
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => deleteVendor(v._id)}
                        className="flex items-center text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </>
                )}
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
