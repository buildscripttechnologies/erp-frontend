import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";
import axios from "../../../utils/axios";
import Dashboard from "../../../pages/Dashboard";
import toast from "react-hot-toast";
import EditRoleModal from "./EditRoleModal";
import AddRoleModal from "./AddRoleModal";
import { useAuth } from "../../../context/AuthContext";
import Toggle from "react-toggle";
import ScrollLock from "../../ScrollLock";
import PaginationControls from "../../PaginationControls";
import { Tooltip } from "react-tooltip";
import TableSkeleton from "../../TableSkeleton";
import { debounce } from "lodash";
import { useRef } from "react";

const RoleMaster = () => {
  const [roles, setRoles] = useState([]);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });
  const hasMountedRef = useRef(false);
  ScrollLock(showAddModal || editData != null);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      fetchRoles(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchRoles = async (page = 1, limit = pagination.limit) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/roles/all-roles/?page=${page}&limit=${limit}&search=${search}&status="all"`
      );
      setRoles(res.data.roles);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch (err) {
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      const res = await axios.delete(`/roles/delete-role/${id}`);
      if (res.status === 200) {
        toast.success("Role deleted successfully");
        fetchRoles();
      } else {
        toast.error("Failed to delete role");
      }
    } catch (err) {
      toast.error("Delete request failed");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    try {
      const res = await axios.patch(`/roles/update-role/${id}`, {
        isActive: newStatus,
      });

      if (res.data.status == 200) {
        toast.success(`Role status updated`);

        // ✅ Update local state without refetch
        setRoles((prev) =>
          prev.map((role) =>
            role._id === id ? { ...role, isActive: newStatus } : role
          )
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // const filteredRoles = roles.filter(
  //   (r) => r.name?.toLowerCase().includes(search.toLowerCase()) || ""
  // );

  const userTableHeaders = [
    { label: "#", className: "" },
    { label: "Created At", className: "hidden md:table-cell" },
    { label: "Updated At", className: "hidden md:table-cell" },
    { label: "Role Name", className: "" },
    { label: "Status", className: "" },
    { label: "Created By", className: "" },
    { label: "Action", className: "" },
  ];

  return (
    <div className="p-2 md:px-4  mt-3 max-w-[99vw] mx-auto overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#292926]">
          Role Master{" "}
          <span className="text-gray-500">({pagination.totalResults})</span>
        </h2>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#d8b76a] text-black font-semibold px-4 py-1.5 rounded flex items-center gap-2 hover:bg-[#d8b76a]/80 cursor-pointer"
          >
            <FiPlus /> Add Role
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-1/3 mb-4">
        <input
          type="text"
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-4 py-1 border border-[#d8b76a] rounded focus:border-2 focus:outline-none text-[#292926]"
        />
        <FiSearch className="absolute left-2.5 top-2 text-[#d8b76a]" />{" "}
        {search && (
          <FiX
            className="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-primary transition"
            onClick={() => setSearch("")}
            title="Clear"
          />
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto border border-[#d8b76a] rounded text-left whitespace-nowrap">
        <table className="min-w-full text-[11px]">
          <thead className="bg-[#d8b76a] text-[#292926]">
            <tr>
              <th className="py-1.5 px-3">#</th>
              <th className="py-1.5 px-3 hidden md:table-cell">Created At</th>
              <th className="py-1.5 px-3 hidden md:table-cell">Updated At</th>
              <th className="py-1.5 px-3">Role Name</th>
              <th className="py-1.5 px-3">Status</th>
              <th className="py-1.5 px-3">Created By</th>
              <th className="py-1.5 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={userTableHeaders}
              />
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.map((role, idx) => (
                <tr
                  key={role._id}
                  className="border-b border-[#d8b76a] hover:bg-gray-50"
                >
                  <td className="px-2   border-r border-[#d8b76a]">
                    {Number(pagination.currentPage - 1) *
                      Number(pagination.limit) +
                      idx +
                      1}
                  </td>
                  <td className="px-2  border-r border-[#d8b76a] hidden md:table-cell">
                    {new Date(role.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="px-2  border-r border-[#d8b76a] hidden md:table-cell">
                    {new Date(role.updatedAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="px-2  border-r border-[#d8b76a]">
                    {role.name}
                  </td>
                  <td className="px-2 border-r border-[#d8b76a] ">
                    <Toggle
                      checked={role.isActive}
                      onChange={() =>
                        handleToggleStatus(role._id, role.isActive)
                      }
                    />
                  </td>
                  <td className="px-2  border-r border-[#d8b76a]">
                    {role.createdBy?.fullName || "-"}
                  </td>
                  <td className="px-2 py-1">
                    <div className="flex items-center gap-2 text-sm text-[#d39c25]">
                      <FiEdit
                        data-tooltip-id="statusTip"
                        data-tooltip-content="Edit"
                        className="cursor-pointer hover:text-blue-500"
                        onClick={() => setEditData(role)}
                      />
                      <FiTrash2
                        data-tooltip-id="statusTip"
                        data-tooltip-content="Delete"
                        className="cursor-pointer hover:text-red-500"
                        onClick={() => handleDelete(role._id)}
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        totalResults={pagination.totalResults}
        onEntriesChange={(limit) => {
          setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
          fetchRoles(1, limit);
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
          fetchRoles(page, pagination.limit);
        }}
      />

      {/* Modals */}
      {showAddModal && (
        <AddRoleModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchRoles}
        />
      )}
      {editData && (
        <EditRoleModal
          role={editData}
          onClose={() => setEditData(null)}
          onUpdated={fetchRoles}
        />
      )}
    </div>
  );
};

export default RoleMaster;
