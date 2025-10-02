import React, { useState } from "react";
import axios from "../../utils/axios";
import { FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { availableActions, availableModules } from "../../data/dropdownData";

export default function UserPermissionForm({
  userId,
  onClose,
  currentPermissions = [],
  fetchUsers,
}) {
  const [permissions, setPermissions] = useState(currentPermissions);
  const [loading, setLoading] = useState(false);

  const handleAddPermission = () => {
    setPermissions([...permissions, { module: "", actions: [] }]);
  };

  const handleModuleChange = (index, value) => {
    const updated = [...permissions];
    updated[index].module = value;
    setPermissions(updated);
  };

  const handleActionToggle = (index, action) => {
    const updated = [...permissions];
    const currentActions = updated[index].actions || [];
    updated[index].actions = currentActions.includes(action)
      ? currentActions.filter((a) => a !== action)
      : [...currentActions, action];
    setPermissions(updated);
  };

  const handleRemove = (index) => {
    const updated = [...permissions];
    updated.splice(index, 1);
    setPermissions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.patch(`/users/update-user-permission/${userId}`, {
        permissions,
      });
      console.log("res", res.data);

      if (res.data.status == 403) {
        toast.error(res.data.message);
        onClose();
        return;
      }
      if (res.data.status == 200) {
        toast.success(res.data.message || "Permissions updated successfully");
        if (fetchUsers) fetchUsers();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl border border-primary overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold text-black mb-4">
          Set User Permissions
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {permissions.map((perm, index) => (
            <div
              key={index}
              className="border border-primary rounded-xl p-4 space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <select
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-1/2 focus:border-2 focus:border-primary focus:outline-none transition cursor-pointer"
                  value={perm.module}
                  onChange={(e) => handleModuleChange(index, e.target.value)}
                  required
                >
                  <option value="">Select Module</option>
                  {availableModules
                    .filter(
                      (mod) =>
                        mod === perm.module || // keep current selection
                        !permissions.some((p) => p.module === mod) // exclude already used
                    )
                    .map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                </select>

                <div className="flex flex-wrap gap-4">
                  {availableActions.map((action) => (
                    <label
                      key={action}
                      className="flex items-center space-x-2 text-sm capitalize"
                    >
                      <input
                        type="checkbox"
                        checked={perm.actions.includes(action)}
                        onChange={() => handleActionToggle(index, action)}
                        className="accent-primary"
                      />
                      <span>{action}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-red-600 text-sm flex items-center gap-1 hover:underline cursor-pointer"
              >
                <FiTrash2 size={16} /> Remove
              </button>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <button
              type="button"
              className="bg-primary text-secondary text-sm font-medium px-4 py-2 rounded hover:bg-primary/90 cursor-pointer"
              onClick={handleAddPermission}
            >
              + Add Permission
            </button>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-secondary font-semibold text-sm rounded hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
