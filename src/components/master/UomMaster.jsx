import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiSearch,
  FiX,
} from "react-icons/fi";
import Dashboard from "../../pages/Dashboard";
import AddUomModal from "./AddUomModal";
import EditUomModal from "./EditUomModal";

const UomMaster = () => {
  const [uoms, setUoms] = useState([]);
  const [formList, setFormList] = useState([
    { unitName: "", unitDescription: "" },
  ]);
  const [formOpen, setFormOpen] = useState(false);
  const [editUom, setEditUom] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUOMs = async () => {
    try {
      const res = await axios.get("/uoms/all-uoms");
      setUoms(res.data.data || []);
    } catch {
      toast.error("Failed to fetch UOMs");
    }
  };

  useEffect(() => {
    fetchUOMs();
  }, []);

  const handleFormChange = (index, e) => {
    const updated = [...formList];
    updated[index][e.target.name] = e.target.value;
    setFormList(updated);
  };

  const addRow = () => {
    setFormList([...formList, { unitName: "", unitDescription: "" }]);
  };

  const removeRow = (index) => {
    const updated = [...formList];
    updated.splice(index, 1);
    setFormList(updated);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/uoms/add-many", formList);
      toast.success("UOMs added");
      setFormList([{ unitName: "", unitDescription: "" }]);
      fetchUOMs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this UOM?")) return;
    try {
      await axios.delete(`/uoms/delete-uom/${id}`);
      toast.success("UOM deleted");
      fetchUOMs();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredUoms = uoms.filter((u) =>
    u.unitName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dashboard>
      <div className="p-6 text-[#292926]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#292926] mb-3">
          Raw Materials <span className="text-gray-500 ">({uoms.length})</span>
        </h2>
        <div className="flex justify-between items-start sm:items-center mb-4 flex-col sm:flex-row gap-4">
          <div className="flex justify-between   gap-2 w-full ">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-3 text-[#d8b76a]" />
              <input
                type="text"
                placeholder="Search UOM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#d8b76a] rounded focus:ring-2 focus:ring-[#b38a37]"
              />
            </div>
            <button
              onClick={() => setFormOpen(!formOpen)}
              className="bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-2 rounded flex items-center gap-2 cursor-pointer"
            >
              <FiPlus />
              {formOpen ? "Close Form" : "Add UOM"}
            </button>
          </div>
        </div>

        {formOpen && (
          <AddUomModal onClose={() => setFormOpen(false)} onAdded={fetchUOMs} />
        )}

        <div className="overflow-x-auto shadow-md dropshadow">
          <table className="min-w-full border  border-[#d8b76a] rounded overflow-hidden">
            <thead className="bg-[#d8b76a] text-[#292926] text-left">
              <tr>
                <th className="px-4 py-2 ">#</th>
                <th className="px-4 py-2 ">UOM</th>
                <th className="px-4 py-2 ">Description</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUoms.map((uom, index) => (
                <tr
                  key={uom._id}
                  className="border-t border-[#d8b76a]  hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{uom.unitName}</td>
                  <td className="px-4 py-2">{uom.unitDescription || "-"}</td>
                  <td className="px-4 py-2 flex gap-3">
                    <FiEdit
                      className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                      onClick={() => setEditUom(uom)}
                    />
                    <FiTrash2
                      className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                      onClick={() => handleDelete(uom._id)}
                    />
                  </td>
                </tr>
              ))}
              {filteredUoms.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No UOMs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editUom && (
          <EditUomModal
            uom={editUom}
            onClose={() => setEditUom(null)}
            onUpdated={fetchUOMs}
          />
        )}
      </div>
    </Dashboard>
  );
};

export default UomMaster;
