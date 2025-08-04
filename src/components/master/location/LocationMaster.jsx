import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import Dashboard from "../../../pages/Dashboard";
import AddLocationModal from "./AddLocation";
import TableSkeleton from "../../TableSkeleton";
import Toggle from "react-toggle";
import PaginationControls from "../../PaginationControls";
import UpdateLocationModal from "./UpdateLocationModal";
import { Tooltip } from "react-tooltip";
import { useAuth } from "../../../context/AuthContext";
import { debounce } from "lodash";

import { useRef } from "react";

const LocationMaster = () => {
  const { hasPermission } = useAuth();
  const [locations, setLocations] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      fetchLocations(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchLocations = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/locations/get-all?page=${page}&limit=${limit}&search=${search}&isActive=all`
      );
      setLocations(res.data.data || []);

      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?"))
      return;
    try {
      let res = await axios.delete(`/locations/delete-location/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Location deleted");
      fetchLocations();
    } catch {
      toast.error("Delete failed");
    }
  };

  // const filteredLocations = locations.filter(
  //   (l) =>
  //     l.locationId.toLowerCase().includes(search.toLowerCase()) ||
  //     l.storeNo.toLowerCase().includes(search.toLowerCase()) ||
  //     l.storeRno.toLowerCase().includes(search.toLowerCase()) ||
  //     l.binNo.toLowerCase().includes(search.toLowerCase()) ||
  //     l.createdBy?.fullName?.toLowerCase().includes(search.toLowerCase())
  // );

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchLocations(page);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    try {
      let res = await axios.patch(`/locations/update-location/${id}`, {
        isActive: newStatus,
      });

      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

      if (res.data.status == 200) {
        toast.success(`Location status updated`);

        // ✅ Update local state without refetch
        setLocations((prev) =>
          prev.map((loc) =>
            loc._id == id ? { ...loc, isActive: newStatus } : loc
          )
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="relative p-3 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Location Master{" "}
        <span className="text-gray-500">({locations.length})</span>
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-2 text-[#d8b76a]" />
          <input
            type="text"
            placeholder="Search Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
          />
        </div>

        {hasPermission("Location", "write") && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            {formOpen ? "Close Form" : "Add Location"}
          </button>
        )}
      </div>

      {formOpen && (
        <AddLocationModal
          onClose={() => setFormOpen(false)}
          onAdded={fetchLocations}
        />
      )}

      <div className="overflow-x-auto rounded border border-[#d8b76a] shadow-sm">
        <table className="min-w-full text-[11px]">
          <thead className="bg-[#d8b76a] text-[#292926] text-left whitespace-nowrap">
            <tr>
              <th className="px-4 py-1.5">#</th>
              <th className="px-4 py-1.5 hidden md:table-cell">Created At</th>
              <th className="px-4 py-1.5 hidden md:table-cell">Updated At</th>
              <th className="px-4 py-1.5">Location ID</th>
              <th className="px-4 py-1.5">Store No.</th>
              <th className="px-4 py-1.5">Store R. No.</th>
              <th className="px-4 py-1.5">Bin No.</th>
              <th className="px-4 py-1.5">Status</th>
              <th className="px-4 py-1.5 hidden md:table-cell">Created By</th>
              <th className="px-4 py-1.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={Array(10).fill({})}
              />
            ) : (
              <>
                {locations.map((loc, index) => (
                  <tr
                    key={loc._id}
                    className="border-t border-[#d8b76a] hover:bg-gray-50 whitespace-nowrap"
                  >
                    <td className="px-4  border-r border-[#d8b76a]">
                      {Number(pagination.currentPage - 1) *
                        Number(pagination.limit) +
                        index +
                        1}
                    </td>
                    <td className="px-4  border-r border-[#d8b76a] hidden md:table-cell">
                      {new Date(loc.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }) || "-"}
                    </td>
                    <td className="px-4  border-r border-[#d8b76a] hidden md:table-cell">
                      {new Date(loc.updatedAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }) || "-"}
                    </td>
                    <td className="px-4  border-r border-[#d8b76a] ">
                      {loc.locationId || "-"}
                    </td>
                    <td className="px-4  border-r border-[#d8b76a]">
                      {loc.storeNo || "-"}
                    </td>
                    <td className="px-4  border-r border-[#d8b76a]">
                      {loc.storeRno || "-"}
                    </td>
                    <td className="px-4  border-r border-[#d8b76a]">
                      {loc.binNo || "-"}
                    </td>
                    <td className="px-4  border-r border-[#d8b76a]">
                      <Toggle
                        checked={loc.isActive}
                        onChange={() =>
                          handleToggleStatus(loc._id, loc.isActive)
                        }
                      />
                    </td>
                    <td className="px-4  border-r border-[#d8b76a] hidden md:table-cell">
                      {loc.createdBy?.fullName || "-"}
                    </td>
                    <td className="px-4 mt-1.5 flex gap-3 text-sm  items-center text-[#d8b76a]">
                      {hasPermission("Location", "update") ? (
                        <FiEdit
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Edit"
                          onClick={() => setEditingLocation(loc)}
                          className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                        />
                      ) : (
                        "-"
                      )}
                      {hasPermission("Location", "update") ? (
                        <FiTrash2
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Delete"
                          className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                          onClick={() => handleDelete(loc._id)}
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
                {locations.length === 0 && (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center py-3  text-gray-500"
                    >
                      No locations found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      {editingLocation && (
        <UpdateLocationModal
          location={editingLocation}
          onClose={() => setEditingLocation(null)}
          onUpdated={fetchLocations}
        />
      )}

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        totalResults={pagination.totalResults}
        onEntriesChange={(limit) => {
          setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
          fetchLocations(1, limit);
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
          fetchLocations(page, pagination.limit);
        }}
      />
    </div>
  );
};

export default LocationMaster;
