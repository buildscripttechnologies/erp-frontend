import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import Dashboard from "../../pages/Dashboard";
import AddLocationModal from "./AddLocation";
import TableSkeleton from "../TableSkeleton";

const LocationMaster = () => {
  const [locations, setLocations] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const fetchLocations = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/locations/all?page=${page}&limit=${pagination.limit}`
      );
      setLocations(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      //toast.error("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;
    try {
      await axios.delete(`/locations/delete/${id}`);
      toast.success("Location deleted");
      fetchLocations();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredLocations = locations.filter(
    (l) =>
      l.storeNo.toLowerCase().includes(search.toLowerCase()) ||
      l.storeRackNo.toLowerCase().includes(search.toLowerCase()) ||
      l.binNo.toLowerCase().includes(search.toLowerCase()) ||
      l.createdBy?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchLocations(page);
  };

  return (
    <Dashboard>
      <div className="relative p-4 sm:p-6 max-w-[99vw] mx-auto overflow-x-hidden">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Location Master <span className="text-gray-500">({locations.length})</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-3 text-[#d8b76a]" />
            <input
              type="text"
              placeholder="Search Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
            />
          </div>

          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-2 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            {formOpen ? "Close Form" : "Add Location"}
          </button>
        </div>

        {formOpen && (
          <AddLocationModal onClose={() => setFormOpen(false)} onAdded={fetchLocations} />
        )}

        <div className="overflow-x-auto rounded border border-[#d8b76a] shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-[#d8b76a] text-[#292926] text-left whitespace-nowrap">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2 hidden md:table-cell">Created At</th>
                <th className="px-4 py-2 hidden md:table-cell">Updated At</th>
                <th className="px-4 py-2">Store No</th>
                <th className="px-4 py-2">Store Rack No</th>
                <th className="px-4 py-2">Bin No</th>
                <th className="px-4 py-2 hidden md:table-cell">Created By</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} columns={Array(8).fill({})} />
              ) : (
                <>
                  {filteredLocations.map((loc, index) => (
                    <tr
                      key={loc._id}
                      className="border-t border-[#d8b76a] hover:bg-gray-50 whitespace-nowrap"
                    >
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        {new Date(loc.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }) || "-"}
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        {new Date(loc.updatedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }) || "-"}
                      </td>
                      <td className="px-4 py-2">{loc.storeNo || "-"}</td>
                      <td className="px-4 py-2">{loc.storeRackNo || "-"}</td>
                      <td className="px-4 py-2">{loc.binNo || "-"}</td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        {loc.createdBy?.fullName || "-"}
                      </td>
                      <td className="px-4 py-2 flex gap-3">
                        <FiEdit className="cursor-pointer text-[#d8b76a] hover:text-blue-600" />
                        <FiTrash2
                          className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                          onClick={() => handleDelete(loc._id)}
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredLocations.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-gray-500">
                        No locations found.
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
            className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Prev
          </button>

          {[...Array(pagination.totalPages).keys()].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              className={`px-5 py-2 rounded text-base cursor-pointer ${
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
            className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </Dashboard>
  );
};

export default LocationMaster;
