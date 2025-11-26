import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useCategories } from "../../context/CategoryContext";

export default function GstTable() {
  const [gst, setGst] = useState([]); // { name: '', type: '' }
  const [hsn, setHsn] = useState("");
  const [gstType, setGstType] = useState("");
  const [editingGstRow, setEditingGstRow] = useState(null);
  const [editHsn, setEditHsn] = useState("");
  const [editGst, setEditGst] = useState("");
  const [loading, setLoading] = useState(false);

  const gstTypes = [5, 18];

  const { refreshGstTable } = useCategories();

  // Fetch gst from backend
  const fetchGst = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/settings/gst-table/get");
      setGst(res.data.gstTable || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch gst");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGst();
  }, []);

  // Add new category
  const addGst = async () => {
    if (!hsn.trim()) return toast.error("Gst is required");
    try {
      const res = await axios.post("/settings/gst-table/add", {
        hsn: hsn,
        gst: gstType,
      });
      setGst(res.data.gstTable);
      setHsn("");
      setGstType("");
      toast.success("Hsn added ✅");
      await refreshGstTable();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add Hsn");
    }
  };

  // Edit category
  const startEdit = (cat) => {
    setEditingGstRow(cat.hsn);
    setEditHsn(cat.hsn);
    setEditGst(cat.gst);
  };

  const saveEdit = async () => {
    if (!editHsn.trim()) return toast.error("Gst value is required");
    try {
      const res = await axios.put("/settings/gst-table/edit", {
        oldHsn: editingGstRow,
        newHsn: editHsn,
        newGst: editGst,
      });
      setGst(res.data.gstTable);
      setEditingGstRow(null);
      setEditHsn("");
      setEditGst("");
      toast.success("Gst updated ✅");
      await refreshGstTable();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update Gst");
    }
  };

  const cancelEdit = () => {
    setEditingGstRow(null);
    setEditHsn("");
    setEditGst("");
  };

  // Delete Gst
  const deleteGst = async (cat) => {
    if (!window.confirm("Are you sure you want to delete this Gst?")) return;
    try {
      const res = await axios.delete(
        `/settings/gst-table/delete/${cat.name}/${cat.type}`
      );
      console.log("res", res);

      setGst(res.data.gstTable);
      toast.success("Gst deleted ✅");
      await refreshGstTable();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <h2 className="text-xl font-semibold text-primary mb-4">Gst Table</h2>

      {/* Add Gst */}
      <div className="flex gap-2 mb-4 items-center">
        <input
          className="border border-gray-300 rounded px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="New HSN Code"
          value={hsn}
          onChange={(e) => setHsn(e.target.value)}
        />
        <select
          value={gstType}
          onChange={(e) => setGstType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option key="" value="">
            Select Type
          </option>
          {gstTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button
          onClick={addGst}
          className="bg-primary text-secondary font-medium px-5 py-1 rounded hover:bg-primary/80 transition"
        >
          Add
        </button>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-primary text-secondary">
            <tr>
              <th className="px-2 py-1 text-left">#</th>
              <th className="px-2 py-1 text-left">HSN Code</th>
              <th className="px-2 py-1 text-left">GST (%)</th>
              <th className="px-2 py-1 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-2 py-2 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : gst?.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-2 py-2 text-center text-gray-500 italic "
                >
                  No gst found
                </td>
              </tr>
            ) : (
              gst?.map((cat, i) => (
                <tr
                  key={cat.hsn}
                  className="hover:bg-gray-50 transition border-t border-primary"
                >
                  <td className="px-2 py-1 border-r border-primary">{i + 1}</td>
                  <td className="px-2 py-1 border-r border-primary">
                    {editingGstRow === cat.hsn ? (
                      <input
                        value={editHsn}
                        onChange={(e) => setEditHsn(e.target.value)}
                        className="border border-primary rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      cat.hsn
                    )}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {editingGstRow === cat.hsn ? (
                      <select
                        value={editGst}
                        onChange={(e) => setEditGst(e.target.value)}
                        className="border border-primary rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      >
                        {gstTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    ) : (
                      cat.gst
                    )}
                  </td>
                  <td className="px-2 py-1 flex gap-2">
                    {editingGstRow === cat.hsn ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteGst(cat)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
