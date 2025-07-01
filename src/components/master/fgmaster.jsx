import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import Dashboard from "../../pages/Dashboard";
import TableSkeleton from "../TableSkeleton";
import AddFgModal from "./addfgmodel"; // Update the path as needed

const FgMaster = () => {
  const [fgs, setFgs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [nestedExpanded, setNestedExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const fetchFGs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/fgs?page=${page}&limit=${pagination.limit}`);
      setFgs(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      //toast.error("Failed to fetch FGs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFGs();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchFGs(page);
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
    setNestedExpanded(null);
  };

  const toggleNested = (idx) => {
    setNestedExpanded(nestedExpanded === idx ? null : idx);
  };

  const filteredFGs = fgs.filter((fg) =>
    fg.itemName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dashboard>
      {showModal && (
        <AddFgModal onClose={() => setShowModal(false)} onAdded={fetchFGs} />
      )}
      <div className="relative p-4 sm:p-6 max-w-[92vw] mx-auto overflow-x-hidden">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Finished Goods (FG) <span className="text-gray-500">({fgs.length})</span>
        </h2>

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
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto justify-center bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-2 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus /> Add FG
          </button>
        </div>

        <div className="overflow-x-auto border border-[#d8b76a] rounded shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-[#d8b76a] text-[#292926] text-left whitespace-nowrap">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">SKU Code</th>
                <th className="px-3 py-2">Item Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">UOM</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} columns={Array(6).fill({})} />
              ) : (
                <>
                  {filteredFGs.map((fg, index) => (
                    <React.Fragment key={fg._id}>
                      <tr
                        onClick={() => toggleRow(index)}
                        className="border-t border-[#d8b76a] hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">{fg.skuCode}</td>
                        <td className="px-3 py-2">{fg.itemName}</td>
                        <td className="px-3 py-2">{fg.type}</td>
                        <td className="px-3 py-2">{fg.uom}</td>
                        <td className="px-3 py-2 flex gap-2">
                          <FiEdit className="cursor-pointer text-[#d8b76a]" />
                          <FiTrash2 className="cursor-pointer text-[#d8b76a]" />
                        </td>
                      </tr>
                      {expandedRow === index && (
                        <tr className="bg-gray-100">
                          <td colSpan="6" className="px-4 py-3">
                            <div className="border border-[#d8b76a] rounded p-3 overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="bg-gray-200">
                                  <tr>
                                    <th className="px-2 py-1">Type</th>
                                    <th className="px-2 py-1">SKU Code</th>
                                    <th className="px-2 py-1">Item Name</th>
                                    <th className="px-2 py-1">Qty</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {fg.materials.map((mat, idx) => (
                                    <React.Fragment key={idx}>
                                      <tr
                                        onClick={() => mat.type === "SFG" && toggleNested(idx)}
                                        className={`border-t cursor-pointer ${mat.type === "SFG" ? "hover:bg-yellow-50" : ""}`}
                                      >
                                        <td className="px-2 py-1">{mat.type}</td>
                                        <td className="px-2 py-1">{mat.skuCode}</td>
                                        <td className="px-2 py-1">{mat.itemName}</td>
                                        <td className="px-2 py-1">{mat.qty}</td>
                                      </tr>
                                      {nestedExpanded === idx && mat.children && (
                                        <tr className="bg-gray-50">
                                          <td colSpan="4">
                                            <table className="ml-4 border border-[#d8b76a] w-full">
                                              <thead className="bg-gray-100">
                                                <tr>
                                                  <th className="px-2 py-1">SKU Code</th>
                                                  <th className="px-2 py-1">Item Name</th>
                                                  <th className="px-2 py-1">Qty</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {mat.children.map((child, cIdx) => (
                                                  <tr key={cIdx} className="border-t">
                                                    <td className="px-2 py-1">{child.skuCode}</td>
                                                    <td className="px-2 py-1">{child.itemName}</td>
                                                    <td className="px-2 py-1">{child.qty}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredFGs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">
                        No FGs found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

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
    </Dashboard>
  );
};

export default FgMaster;