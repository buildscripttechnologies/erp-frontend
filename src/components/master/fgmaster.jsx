import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import Dashboard from "../../pages/Dashboard";
import TableSkeleton from "../TableSkeleton";
import AddFgModal from "./AddFgModal";

const FgMaster = () => {
  const [fgs, setFgs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);


  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const fetchFGs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/fg?page=${page}&limit=${pagination.limit}`);
      setFgs(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch FGs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFGs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchFGs(page);
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const filteredFGs = fgs.filter((fg) =>
    fg.itemName?.toLowerCase().includes(search.toLowerCase()) ||
    fg.skuCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dashboard>
      <div className="relative p-4 sm:p-6 max-w-[99vw] mx-auto overflow-x-hidden">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Finished Goods (FG) <span className="text-gray-500">({fgs.length})</span>
        </h2>

        {/* Search & Add FG */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-3 text-[#d8b76a]" />
            <input
              type="text"
              placeholder="Search by SKU, Item Name, etc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto justify-center bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-2 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            Add FG
          </button>

        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#d8b76a] rounded shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-[#d8b76a] text-[#292926] text-left whitespace-nowrap">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Created At</th>
                <th className="px-3 py-2">Updated At</th>
                <th className="px-3 py-2">SKU Code</th>
                <th className="px-3 py-2">Item Name</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">HSN/SAC</th>
                <th className="px-3 py-2">Quality Insp.</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">GST</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">UOM</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">File</th>
                <th className="px-3 py-2">Created By</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} columns={Array(15).fill({})} />
              ) : (
                <>
                  {filteredFGs.map((fg, index) => (
                    <React.Fragment key={fg._id}>
                      <tr
                        onClick={() => toggleRow(index)}
                        className="border-t border-[#d8b76a] hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">{new Date(fg.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">{new Date(fg.updatedAt).toLocaleString()}</td>
                        <td className="px-3 py-2">{fg.skuCode}</td>
                        <td className="px-3 py-2">{fg.itemName}</td>
                        <td className="px-3 py-2">{fg.description || "-"}</td>
                        <td className="px-3 py-2">{fg.hsnSac || "-"}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              fg.qualityInspection === "Required"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {fg.qualityInspection}
                          </span>
                        </td>
                        <td className="px-3 py-2">{fg.location || "-"}</td>
                        <td className="px-3 py-2">{fg.gst || "-"}</td>
                        <td className="px-3 py-2">{fg.type}</td>
                        <td className="px-3 py-2">{fg.uom}</td>
                        <td className="px-3 py-2">
                          <select
                            defaultValue={fg.status}
                            className="bg-green-100 px-2 py-1 rounded"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">{fg.file || "-"}</td>
                        <td className="px-3 py-2">{fg.createdBy || "-"}</td>
                        <td className="px-3 py-2 flex gap-2">
                          <FiEdit className="cursor-pointer text-[#d8b76a]" />
                          <FiTrash2 className="cursor-pointer text-[#d8b76a]" />
                        </td>
                      </tr>

                      {expandedRow === index && (
                        <tr className="bg-gray-100">
                          <td colSpan="16" className="px-4 py-3">
                            <div className="border border-[#d8b76a] rounded p-3 overflow-x-auto">
                              <table className="min-w-full text-sm border">
                                <thead className="bg-gray-200">
                                  <tr>
                                    <th className="px-2 py-1">SKU Code</th>
                                    <th className="px-2 py-1">Item Name</th>
                                    <th className="px-2 py-1">Description</th>
                                    <th className="px-2 py-1">Type</th>
                                    <th className="px-2 py-1">HSN/SAC</th>
                                    <th className="px-2 py-1">UOM</th>
                                    <th className="px-2 py-1">Qual. Insp.</th>
                                    <th className="px-2 py-1">Location</th>
                                    <th className="px-2 py-1">Qty.</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(fg.materials || []).map((rm, idx) => (
                                    <tr key={idx} className="border-t">
                                      <td className="px-2 py-1">{rm.skuCode}</td>
                                      <td className="px-2 py-1">{rm.itemName}</td>
                                      <td className="px-2 py-1">{rm.description}</td>
                                      <td className="px-2 py-1">{rm.type}</td>
                                      <td className="px-2 py-1">{rm.hsnSac}</td>
                                      <td className="px-2 py-1">{rm.uom}</td>
                                      <td className="px-2 py-1">{rm.qualityInspection}</td>
                                      <td className="px-2 py-1">{rm.location}</td>
                                      <td className="px-2 py-1">{rm.qty}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-wrap justify-center sm:justify-end items-center gap-2 text-sm">
          <button
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(pagination.totalPages).keys()].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              className={`px-5 py-2 rounded text-base ${
                pagination.currentPage === i + 1
                  ? "bg-[#d8b76a] text-white font-semibold"
                  : "bg-[#d8b76a]/20"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {showAddModal && (
        <AddFgModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            fetchFGs(); 
          }}
        />
      )}

    </Dashboard>
  );
};

export default FgMaster;
