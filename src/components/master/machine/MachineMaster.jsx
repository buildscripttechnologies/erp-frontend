import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import Toggle from "react-toggle";
import { debounce } from "lodash";
import { FiEdit, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { TbRestore } from "react-icons/tb";
import { PulseLoader } from "react-spinners";
import { Tooltip } from "react-tooltip";
import PaginationControls from "../../PaginationControls";
import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import { useAuth } from "../../../context/AuthContext";

const STATUS_OPTIONS = ["Idle", "Running", "Maintenance"];
const DEFAULT_FORM = {
  name: "",
  code: "",
  type: "",
  subType: "",
  status: "Idle",
  currentLoad: 0,
  capacityPerHour: 0,
  totalRunHours: 0,
  assignedOperator: "",
  assignedOperators: [],
  isActive: true,
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : 0;
};

function MachineFormModal({ machine, users, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    machine
      ? {
          ...DEFAULT_FORM,
          ...machine,
          assignedOperator: machine.assignedOperator?._id || machine.assignedOperator || "",
          assignedOperators: (machine.assignedOperators || []).map((operator) =>
            typeof operator === "string" ? operator : operator._id
          ),
        }
      : DEFAULT_FORM
  );
  const [saving, setSaving] = useState(false);

  const title = machine ? "Edit Machine" : "Add Machine";

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAssignedOperator = (id) => {
    setForm((prev) => {
      const selected = prev.assignedOperators || [];
      return {
        ...prev,
        assignedOperators: selected.includes(id)
          ? selected.filter((operatorId) => operatorId !== id)
          : [...selected, id],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.code.trim() || !form.type.trim()) {
      toast.error("Machine name, code, and type are required");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      type: form.type.trim(),
      subType: form.subType.trim(),
      currentLoad: toNumber(form.currentLoad),
      capacityPerHour: toNumber(form.capacityPerHour),
      totalRunHours: toNumber(form.totalRunHours),
      assignedOperator: form.assignedOperator || null,
      assignedOperators: form.assignedOperators || [],
      isActive: Boolean(form.isActive),
    };

    setSaving(true);
    try {
      const res = machine
        ? await axios.patch(`/machines/update/${machine._id}`, payload)
        : await axios.post("/machines/add", payload);

      if ([200, 201].includes(res.data.status)) {
        toast.success(res.data.message || "Machine saved");
        onSaved();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to save machine");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save machine");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-3">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-lg border border-primary shadow-xl">
        <div className="sticky top-0 bg-white border-b border-primary px-5 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm font-medium text-gray-700">
              Machine Name
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Cutting Table 1"
                required
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Machine Code
              <input
                value={form.code}
                onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="MC-001"
                required
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Stage Type
              <input
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Cutting / Stitching"
                required
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Sub Type
              <input
                value={form.subType}
                onChange={(e) => updateField("subType", e.target.value)}
                className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Slitting / Press / Laser"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Status
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-gray-700">
              Capacity / Hour
              <input
                type="number"
                min="0"
                value={form.capacityPerHour}
                onChange={(e) => updateField("capacityPerHour", e.target.value)}
                className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Current Load
              <input
                type="number"
                min="0"
                value={form.currentLoad}
                onChange={(e) => updateField("currentLoad", e.target.value)}
                className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Total Run Hours
              <input
                type="number"
                min="0"
                value={form.totalRunHours}
                onChange={(e) => updateField("totalRunHours", e.target.value)}
                className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Primary Operator
              <select
                value={form.assignedOperator}
                onChange={(e) => updateField("assignedOperator", e.target.value)}
                className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">No primary operator</option>
                {users.map((user) => (
                  <option key={user.id || user._id} value={user.id || user._id}>
                    {user.fullName || user.username}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Preferred Operators
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border border-primary rounded p-3 max-h-40 overflow-y-auto">
              {users.length ? (
                users.map((user) => {
                  const id = user.id || user._id;
                  return (
                    <label key={id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={(form.assignedOperators || []).includes(id)}
                        onChange={() => toggleAssignedOperator(id)}
                      />
                      <span>{user.fullName || user.username}</span>
                    </label>
                  );
                })
              ) : (
                <span className="text-sm text-gray-500">No users found.</span>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <Toggle
              checked={form.isActive}
              onChange={() => updateField("isActive", !form.isActive)}
            />
            Active machine
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-primary text-secondary text-sm font-semibold hover:bg-primary/90 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Machine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const MachineMaster = () => {
  const { hasPermission } = useAuth();
  const [machines, setMachines] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [restore, setRestore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [selected, setSelected] = useState([]);
  const [deleteId, setDeleteId] = useState("");
  const [restoreId, setRestoreId] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });
  const hasMountedRef = useRef(false);

  ScrollLock(formOpen || editingMachine != null);

  const selectedAll = useMemo(
    () => machines.length > 0 && selected.length === machines.length,
    [machines, selected]
  );

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users/all-users", {
        params: { page: 1, limit: 1000 },
      });
      setUsers(res.data.users || res.data.data || []);
    } catch {
      setUsers([]);
    }
  };

  const fetchMachines = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const endpoint = restore ? "/machines/deleted" : "/machines/get-all";
      const res = await axios.get(endpoint, {
        params: {
          page,
          limit,
          search,
          status,
          isActive: "all",
        },
      });

      if (res.data.status === 200) {
        setMachines(res.data.data || []);
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalResults: res.data.totalResults,
          limit: res.data.limit,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch machines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchMachines(pagination.currentPage, pagination.limit);
  }, [pagination.currentPage, pagination.limit, restore, status]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const debouncedSearch = debounce(() => {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchMachines(1, pagination.limit);
    }, 400);

    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [search]);

  const handleToggleStatus = async (id, currentStatus) => {
    const isActive = !currentStatus;
    try {
      const res = await axios.patch(`/machines/update/${id}`, { isActive });
      if (res.data.status === 200) {
        toast.success("Machine status updated");
        setMachines((prev) =>
          prev.map((machine) =>
            machine._id === id ? { ...machine, isActive } : machine
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machine?")) return;
    setDeleteId(id);
    try {
      const res = await axios.delete(`/machines/delete/${id}`);
      if (res.data.status === 200) {
        toast.success("Machine deleted");
        fetchMachines(pagination.currentPage, pagination.limit);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteId("");
    }
  };

  const handlePermanentDelete = async (id = "") => {
    if (!window.confirm("Are you sure you want to permanently delete?")) return;
    const ids = id ? [...selected, id] : [...selected];
    if (!ids.length) {
      toast.error("Select at least one machine");
      return;
    }

    setDeleteId(id);
    try {
      const res = await axios.post("/machines/permanent-delete", { ids });
      if (res.data.status === 200) {
        toast.success("Machine deleted permanently");
        setSelected([]);
        fetchMachines(pagination.currentPage, pagination.limit);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Permanent delete failed");
    } finally {
      setDeleteId("");
    }
  };

  const handleRestore = async (id = "") => {
    if (!window.confirm("Are you sure you want to restore?")) return;
    const ids = id ? [...selected, id] : [...selected];
    if (!ids.length) {
      toast.error("Select at least one machine");
      return;
    }

    setRestoreId(id);
    try {
      const res = await axios.patch("/machines/restore", { ids });
      if (res.data.status === 200) {
        toast.success("Machine restored");
        setSelected([]);
        fetchMachines(pagination.currentPage, pagination.limit);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Restore failed");
    } finally {
      setRestoreId("");
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected(selectedAll ? [] : machines.map((machine) => machine._id));
  };

  return (
    <div className="relative p-3 max-w-[99vw] mx-auto overflow-x-hidden">
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <h2 className="text-xl sm:text-2xl font-bold">
          Machine Master{" "}
          <span className="text-gray-500">({pagination.totalResults})</span>
        </h2>
        <button
          onClick={() => {
            setRestore((prev) => !prev);
            setSelected([]);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
          className="bg-primary text-secondary px-3 py-1 font-semibold rounded cursor-pointer hover:bg-primary/80"
        >
          {restore ? "Cancel" : "Restore"}
        </button>
        {restore && (
          <>
            <button
              onClick={() => handleRestore()}
              className="bg-primary text-secondary px-3 py-1 font-semibold rounded cursor-pointer hover:bg-primary/80"
            >
              Restore
            </button>
            <button
              onClick={() => handlePermanentDelete()}
              className="bg-primary text-secondary px-3 py-1 font-semibold rounded cursor-pointer hover:bg-primary/80"
            >
              Delete
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-primary" />
            <input
              type="text"
              placeholder="Search machines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
            {search && (
              <FiX
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-primary"
                onClick={() => setSearch("")}
                title="Clear"
              />
            )}
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
            className="border border-primary rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {hasPermission("Machine", "write") && !restore && (
          <button
            onClick={() => setFormOpen(true)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-primary hover:bg-primary/90 text-secondary font-semibold px-4 py-2 rounded flex items-center gap-2"
          >
            <FiPlus />
            Add Machine
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="min-w-full text-[11px]">
          <thead className="bg-primary text-secondary text-left whitespace-nowrap">
            <tr>
              {restore && (
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedAll}
                    onChange={toggleSelectAll}
                    className="accent-secondary"
                  />
                </th>
              )}
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Updated At</th>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Sub Type</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Load</th>
              <th className="px-4 py-2">Capacity/Hr</th>
              <th className="px-4 py-2">Primary Operator</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={restore ? Array(14).fill({}) : Array(13).fill({})}
              />
            ) : (
              <>
                {machines.map((machine, index) => (
                  <tr
                    key={machine._id}
                    className="border-t border-primary hover:bg-gray-50 whitespace-nowrap"
                  >
                    {restore && (
                      <td className="px-4 border-r border-primary">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={selected.includes(machine._id)}
                          onChange={() => handleSelect(machine._id)}
                        />
                      </td>
                    )}
                    <td className="px-4 border-r border-primary">
                      {(pagination.currentPage - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-4 border-r border-primary">
                      {formatDate(machine.createdAt)}
                    </td>
                    <td className="px-4 border-r border-primary">
                      {formatDate(machine.updatedAt)}
                    </td>
                    <td className="px-4 border-r border-primary font-semibold">
                      {machine.code || "-"}
                    </td>
                    <td className="px-4 border-r border-primary">
                      {machine.name || "-"}
                    </td>
                    <td className="px-4 border-r border-primary">
                      {machine.type || "-"}
                    </td>
                    <td className="px-4 border-r border-primary">
                      {machine.subType || "-"}
                    </td>
                    <td className="px-4 border-r border-primary">
                      <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold">
                        {machine.status || "-"}
                      </span>
                    </td>
                    <td className="px-4 border-r border-primary">
                      {machine.currentLoad ?? 0}
                    </td>
                    <td className="px-4 border-r border-primary">
                      {machine.capacityPerHour ?? 0}
                    </td>
                    <td className="px-4 border-r border-primary">
                      {machine.assignedOperator?.fullName || "-"}
                    </td>
                    <td className="px-4 border-r border-primary">
                      <Toggle
                        checked={Boolean(machine.isActive)}
                        disabled={restore || !hasPermission("Machine", "update")}
                        onChange={() =>
                          handleToggleStatus(machine._id, machine.isActive)
                        }
                      />
                    </td>
                    <td className="px-4 py-2 flex gap-3 text-sm items-center text-primary">
                      {restore ? (
                        restoreId === machine._id ? (
                          <PulseLoader size={4} color="#d8b76a" />
                        ) : (
                          <TbRestore
                            data-tooltip-id="machineTip"
                            data-tooltip-content="Restore"
                            onClick={() => handleRestore(machine._id)}
                            className="hover:text-green-500 cursor-pointer"
                          />
                        )
                      ) : (
                        hasPermission("Machine", "update") && (
                          <FiEdit
                            data-tooltip-id="machineTip"
                            data-tooltip-content="Edit"
                            onClick={() => setEditingMachine(machine)}
                            className="cursor-pointer hover:text-blue-600"
                          />
                        )
                      )}

                      {deleteId === machine._id ? (
                        <PulseLoader size={4} color="#d8b76a" />
                      ) : restore ? (
                        <FiTrash2
                          data-tooltip-id="machineTip"
                          data-tooltip-content="Permanent Delete"
                          onClick={() => handlePermanentDelete(machine._id)}
                          className="hover:text-red-500 cursor-pointer"
                        />
                      ) : (
                        hasPermission("Machine", "delete") && (
                          <FiTrash2
                            data-tooltip-id="machineTip"
                            data-tooltip-content="Delete"
                            onClick={() => handleDelete(machine._id)}
                            className="cursor-pointer hover:text-red-600"
                          />
                        )
                      )}
                      <Tooltip
                        id="machineTip"
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
                {!machines.length && (
                  <tr>
                    <td
                      colSpan={restore ? 14 : 13}
                      className="text-center py-4 text-gray-500"
                    >
                      No machines found.
                    </td>
                  </tr>
                )}
              </>
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
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
        }}
      />

      {formOpen && (
        <MachineFormModal
          users={users}
          onClose={() => setFormOpen(false)}
          onSaved={() => fetchMachines(1, pagination.limit)}
        />
      )}

      {editingMachine && (
        <MachineFormModal
          machine={editingMachine}
          users={users}
          onClose={() => setEditingMachine(null)}
          onSaved={() => fetchMachines(pagination.currentPage, pagination.limit)}
        />
      )}
    </div>
  );
};

export default MachineMaster;
