import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";

import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import Toggle from "react-toggle";
import PaginationControls from "../../PaginationControls";
import { Tooltip } from "react-tooltip";
import { useAuth } from "../../../context/AuthContext";
import { debounce } from "lodash";

import { useRef } from "react";
import Inward from "./Inward";
// import AddAccessories from "./AddAccessories";
// import UpdateAccessories from "./UpdateAccessories";

const AccessoriesInward = () => {
  const { hasPermission } = useAuth();
  const [accessories, setAccessories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editAccessory, setEditAccessory] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });
  const hasMountedRef = useRef(false);
  ScrollLock(formOpen || editAccessory != null);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      fetchAccessories(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchAccessories = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/accessory-inward/get-all?page=${page}&limit=${limit}&search=${search}&status="all"`
      );
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        setAccessories(res.data.data || []);
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalResults: res.data.totalResults,
          limit: res.data.limit,
        });
      }
    } catch {
      toast.error("Failed to fetch Accessories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Accessory?"))
      return;
    try {
      let res = await axios.delete(`/accessories/delete-accessory/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        toast.success("Accessory deleted");
        fetchAccessories();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    try {
      const res = await axios.patch(`/accessories/update-accessory/${id}`, {
        status: newStatus,
      });
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

      if (res.data.status == 200) {
        toast.success(`Accessory status updated`);

        // ✅ Update local state without refetch
        setAccessories((prev) =>
          prev.map((accessory) =>
            accessory._id === id
              ? { ...accessory, status: newStatus }
              : accessory
          )
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchAccessories(page);
  };

  useEffect(() => {
    fetchAccessories(1);
  }, []);

  return (
    <div className="relative p-2 mt-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Accessories Inward{" "}
        <span className="text-gray-500">({pagination.totalResults})</span>
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-2 top-2 text-primary" />
          <input
            type="text"
            placeholder="Search Accessories"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
          />
          {search && (
            <FiX
              className="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-primary transition"
              onClick={() => setSearch("")}
              title="Clear"
            />
          )}
        </div>

        {hasPermission("Accessories Inward", "write") && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-primary hover:bg-primary/80 text-secondary font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            {formOpen ? "Close Form" : "Inward"}
          </button>
        )}
      </div>

      {formOpen && (
        <Inward onClose={() => setFormOpen(false)} onAdded={fetchAccessories} />
      )}

      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="min-w-full text-[11px]  whitespace-nowrap">
          <thead className="bg-primary  text-secondary text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5 ">#</th>
              <th className="px-2 py-1.5 ">Created At</th>
              <th className="px-2 py-1.5 ">Updated At</th>
              <th className="px-2 py-1.5 ">Accessory Name</th>
              <th className="px-2 py-1.5 ">Category</th>
              <th className="px-2 py-1.5 ">Description</th>
              {/* <th className="px-2 py-1.5 ">Qty</th> */}
              <th className="px-2 py-1.5 ">Price</th>
              <th className="px-2 py-1.5 ">Inward Qty</th>
              <th className="px-2 py-1.5 ">Stock Qty</th>
              {/* <th className="px-2 py-1.5 "></th> */}
              <th className="px-2 py-1.5 ">Created By</th>
              <th className="px-2 py-1.5 ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={Array(11).fill({})}
              />
            ) : (
              <>
                {accessories.map((accessory, index) => (
                  <tr
                    key={accessory._id}
                    className="border-t text-[11px] border-primary hover:bg-gray-50 whitespace-nowrap"
                  >
                    <td className="px-2 border-r border-primary">
                      {Number(pagination.currentPage - 1) *
                        Number(pagination.limit) +
                        index +
                        1}
                    </td>
                    <td className="px-2 hidden md:table-cell  border-r border-primary">
                      {new Date(accessory.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-2  hidden md:table-cell border-r border-primary">
                      {new Date(accessory.updatedAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-2 border-r border-primary">
                      {accessory.accessory.accessoryName || "-"}
                    </td>
                    <td className="px-2 border-r border-primary">
                      {accessory.accessory.category || "-"}
                    </td>
                    <td className="px-2 border-r border-primary">
                      {accessory.accessory.description || "-"}
                    </td>
                    {/* <td className="px-2 border-r border-primary">
                      {accessory.qty ?? "-"}
                    </td> */}
                    <td className="px-2 border-r border-primary">
                      ₹{accessory.accessory.price ?? "-"}
                    </td>
                    <td className="px-2 border-r border-primary">
                      {accessory.inwardQty || "-"}
                    </td>
                    <td className="px-2 border-r border-primary">
                      {accessory.accessory.stockQty || "-"}
                    </td>
                    <td className="px-2  hidden md:table-cell border-r border-primary">
                      {accessory.createdBy?.fullName || "-"}
                    </td>
                    <td className="px-2 mt-1.5 flex gap-3 text-sm text-primary">
                      {hasPermission("Accessories List", "update") ? (
                        <FiEdit
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Edit"
                          className="cursor-pointer text-primary hover:text-blue-600"
                          onClick={() => setEditAccessory(accessory)}
                        />
                      ) : (
                        "-"
                      )}
                      {hasPermission("Accessories List", "delete") ? (
                        <FiTrash2
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Delete"
                          className="cursor-pointer text-primary hover:text-red-600"
                          onClick={() => handleDelete(accessory._id)}
                        />
                      ) : (
                        "-"
                      )}
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
                {accessories.length === 0 && (
                  <tr>
                    <td colSpan="10" className="text-center py-4 text-gray-500">
                      No Accessories found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {editAccessory && (
        <UpdateAccessories
          accessory={editAccessory}
          onClose={() => setEditAccessory(null)}
          onUpdated={fetchAccessories}
        />
      )}

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        totalResults={pagination.totalResults}
        onEntriesChange={(limit) => {
          setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
          fetchAccessories(1, limit);
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
          fetchAccessories(page, pagination.limit);
        }}
      />
    </div>
  );
};

export default AccessoriesInward;
