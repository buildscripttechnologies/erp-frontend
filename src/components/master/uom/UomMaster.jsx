import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import Dashboard from "../../../pages/Dashboard";
import AddUomModal from "./AddUomModal";
import EditUomModal from "./EditUomModal";
import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import Toggle from "react-toggle";
import PaginationControls from "../../PaginationControls";
import { Tooltip } from "react-tooltip";

const UomMaster = () => {
  const [uoms, setUoms] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editUom, setEditUom] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  ScrollLock(formOpen || editUom != null);

  const fetchUOMs = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/uoms/all-uoms?page=${page}&limit=${limit}&status="all"`
      );
      setUoms(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch UOMs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUOMs();
  }, []);

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

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    try {
      const res = await axios.patch(`/uoms/update-uom/${id}`, {
        status: newStatus,
      });

      if (res.data.status == 200) {
        toast.success(`UOM status updated`);

        // ✅ Update local state without refetch
        setUoms((prev) =>
          prev.map((uom) =>
            uom._id === id ? { ...uom, status: newStatus } : uom
          )
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredUoms = uoms.filter(
    (u) =>
      u.unitName?.toLowerCase().includes(search.toLowerCase()) ||
      u.unitDescription?.toLowerCase().includes(search.toLowerCase()) ||
      u.createdBy?.fullName.toLowerCase().includes(search.toLocaleLowerCase())
  );

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchUOMs(page);
  };

  useEffect(() => {
    fetchUOMs(1);
  }, []);

  const uomTableHeaders = [
    { label: "#", className: "" },
    { label: "Created At	", className: "hidden md:table-cell" },
    { label: "Updated At	", className: "hidden md:table-cell" },
    { label: "UOM", className: "" },
    { label: "Description", className: "" },
    { label: "Satus", className: "" },
    { label: "Created By	", className: "hidden md:table-cell" },
    { label: "Actions", className: "" },
  ];

  return (
    <div className="relative p-2 mt-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Units of Measure <span className="text-gray-500">({uoms.length})</span>
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-2 top-2 text-[#d8b76a]" />
          <input
            type="text"
            placeholder="Search Unit of Measure"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
          />
        </div>

        <button
          onClick={() => setFormOpen(!formOpen)}
          className="w-full sm:w-auto justify-center cursor-pointer bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200"
        >
          <FiPlus />
          {formOpen ? "Close Form" : "Add UOM"}
        </button>
      </div>

      {formOpen && (
        <AddUomModal onClose={() => setFormOpen(false)} onAdded={fetchUOMs} />
      )}

      <div className="overflow-x-auto rounded border border-[#d8b76a] shadow-sm">
        <table className="min-w-full text-[11px] ">
          <thead className="bg-[#d8b76a]  text-[#292926] text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5 ">#</th>
              <th className="px-2 py-1.5  hidden md:table-cell">Created At</th>
              <th className="px-2 py-1.5  hidden md:table-cell">Updated At</th>
              <th className="px-2 py-1.5 ">UOM</th>
              <th className="px-2 py-1.5 ">Description</th>
              <th className="px-2 py-1.5 ">Status</th>
              <th className="px-2 py-1.5  hidden md:table-cell">Created By</th>
              <th className="px-2 py-1.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={uomTableHeaders}
              />
            ) : (
              <>
                {filteredUoms.map((uom, index) => (
                  <tr
                    key={uom._id}
                    className="border-t text-[11px] border-[#d8b76a] hover:bg-gray-50 whitespace-nowrap"
                  >
                    <td className="px-2 border-r border-[#d8b76a]">
                      {Number(pagination.currentPage - 1) *
                        Number(pagination.limit) +
                        index +
                        1}
                    </td>
                    <td className="px-2 hidden md:table-cell  border-r border-[#d8b76a]">
                      {new Date(uom.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-2  hidden md:table-cell border-r border-[#d8b76a]">
                      {new Date(uom.updatedAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {uom.unitName}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {uom.unitDescription || "-"}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      <Toggle
                        checked={uom.status}
                        onChange={() => handleToggleStatus(uom._id, uom.status)}
                      />
                    </td>
                    <td className="px-2  hidden md:table-cell border-r border-[#d8b76a]">
                      {uom.createdBy?.fullName || "-"}
                    </td>
                    <td className="px-2 mt-1.5 flex gap-3 text-sm ">
                      <FiEdit
                        data-tooltip-id="statusTip"
                        data-tooltip-content="Edit"
                        className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                        onClick={() => setEditUom(uom)}
                      />
                      <FiTrash2
                        data-tooltip-id="statusTip"
                        data-tooltip-content="Delete"
                        className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                        onClick={() => handleDelete(uom._id)}
                      />
                      <Tooltip
                        id="statusTip"
                        place="top"
                        style={{
                          backgroundColor: "#292926",
                          color: "#d8b76a",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      />
                    </td>
                  </tr>
                ))}
                {filteredUoms.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No UOMs found.
                    </td>
                  </tr>
                )}
              </>
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

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        totalResults={pagination.totalResults}
        onEntriesChange={(limit) => {
          setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
          fetchUOMs(1, limit);
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
          fetchUOMs(page, pagination.limit);
        }}
      />
    </div>
  );
};

export default UomMaster;
