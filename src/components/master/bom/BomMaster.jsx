// src/components/BOMMaster.jsx
import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import Dashboard from "../../../pages/Dashboard";
import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import Toggle from "react-toggle";
import PaginationControls from "../../PaginationControls";
import BomDetailsSection from "./BomDetailsSection";
import AddBomForm from "./AddBOMModel";
import AddBomModal from "./AddBOMModel";

const BomMaster = ({ isOpen }) => {
  const [BOMs, setBOMs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingBOM, setEditingBOM] = useState(null);
  const [expandedBOMId, setExpandedBOMId] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const fetchBOMs = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(`/boms/get-all?page=${page}&limit=${limit}`);
      setBOMs(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch BOMs");
    } finally {
      setLoading(false);
    }
  };

  ScrollLock(showModal || editingBOM != null);

  useEffect(() => {
    fetchBOMs();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchBOMs(page);
  };

  const filtered = BOMs.filter(
    (c) =>
      c.partyName.toLowerCase().includes(search.toLowerCase()) ||
      c.productName.toLowerCase().includes(search.toLowerCase()) ||
      c.bomNo.toLowerCase().includes(search.toLowerCase()) ||
      c.sampleNo.toLowerCase().includes(search.toLowerCase()) ||
      c.createdBy?.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    try {
      const res = await axios.patch(`/boms/edit/${id}`, {
        isActive: newStatus,
      });

      if (res.data.status == 200) {
        toast.success(`BOM status updated`);

        // ✅ Update local state without refetch
        setBOMs((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isActive: newStatus } : c))
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this BOM?")) return;
    try {
      const res = await axios.patch(`/boms/edit/${id}`, {
        isDeleted: true,
      });

      if (res.data.status == 200) {
        toast.success(`BOM Deleted Successfully`);
        fetchBOMs();
      } else {
        toast.error("Failed to Delete BOM");
      }
    } catch (err) {
      toast.error("Failed to Delete BOM");
    }
  };

  return (
    <>
      {showModal && (
        // <AddBomModal
        //   onClose={() => setShowModal(false)}
        //   onAdded={() => fetchBOMs(pagination.currentPage)}
        // />
        <AddBomModal
          // rms={rawMaterials}
          // sfgs={sfgList}
          onClose={() => setShowModal(false)}
          onSuccess={fetchBOMs}
        />
      )}

      <div className="p-3 max-w-[99vw] mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Bill Of Materials{" "}
          <span className="text-gray-500">({pagination.totalResults})</span>
        </h2>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-[#d8b76a]" />
            <input
              type="text"
              placeholder="Search by BOM Number or Partyname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1 border border-[#d8b76a] rounded focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#d8b76a] hover:bg-[#b38a37]  justify-center text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 cursor-pointer"
          >
            <FiPlus /> Add BOM
          </button>
        </div>

        <div className="relative overflow-x-auto  overflow-y-auto rounded border border-[#d8b76a] shadow-sm">
          <div className={` ${isOpen ? `max-w-[40.8vw]` : `max-w-[98vw]`}`}>
            <table
              className={
                "text-[11px] whitespace-nowrap min-w-[100vw] text-left"
              }
            >
              <thead className="bg-[#d8b76a] text-[#292926]">
                <tr>
                  <th className="px-[8px] py-1.5 ">#</th>
                  <th className="px-[8px] ">Created At</th>
                  <th className="px-[8px] ">Updated At</th>
                  <th className="px-[8px] ">Party Name</th>
                  <th className="px-[8px] ">Order Qty</th>
                  <th className="px-[8px] ">Product Name</th>
                  <th className="px-[8px] ">Sample No.</th>
                  <th className="px-[8px] ">BOM No.</th>
                  <th className="px-[8px] ">Date</th>
                  <th className="px-[8px] ">Status</th>
                  <th className="px-[8px] ">Created By</th>
                  <th className="px-[8px] ">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton
                    rows={pagination.limit}
                    columns={Array(12).fill({})}
                  />
                ) : (
                  <>
                    {filtered.map((b, i) => (
                      <React.Fragment key={b._id}>
                        <tr
                          className="border-t border-[#d8b76a] hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setExpandedBOMId(
                              expandedBOMId === b._id ? null : b._id
                            )
                          }
                        >
                          <td className="px-[8px] border-r border-[#d8b76a] py-1">
                            {(pagination.currentPage - 1) * pagination.limit +
                              i +
                              1}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {new Date(b.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {new Date(b.updatedAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {b.partyName || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {b.orderQty || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {b.productName || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {b.sampleNo || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {b.bomNo || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {new Date(b.date).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            <Toggle
                              checked={b.isActive}
                              onChange={() =>
                                handleToggleStatus(b._id, b.isActive)
                              }
                            />
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {b.createdBy?.fullName || "-"}
                          </td>
                          <td className="px-[8px] pt-1.5 text-sm  flex gap-2">
                            <FiEdit
                              onClick={() => setEditingBOM(b)}
                              className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                            />
                            <FiTrash2
                              onClick={() => handleDelete(b._id)}
                              className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                            />
                          </td>
                        </tr>
                        {expandedBOMId === b._id && (
                          <tr className="">
                            <td colSpan="100%">
                              <BomDetailsSection bomData={b} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan="16"
                          className="text-center py-4 text-gray-500"
                        >
                          No BOMs found.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* {editingBOM && (
          <EditBOMModal
            BOM={editingBOM}
            onClose={() => setEditingBOM(null)}
            onUpdated={() => {
              fetchBOMs(); // re-fetch or refresh list
              setEditingBOM(null);
            }}
          />
        )} */}

        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          entriesPerPage={pagination.limit}
          totalResults={pagination.totalResults}
          onEntriesChange={(limit) => {
            setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
            fetchBOMs(1, limit);
          }}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
            fetchBOMs(page, pagination.limit);
          }}
        />
      </div>
    </>
  );
};

export default BomMaster;
