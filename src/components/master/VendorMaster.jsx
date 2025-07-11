import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import Dashboard from "../../pages/Dashboard";
import AddVendorModal from "./AddVendorModel";
import TableSkeleton from "../TableSkeleton";
import ScrollLock from "../../components/ScrollLock";
import Toggle from "react-toggle";
import PaginationControls from "../PaginationControls";
import { Tooltip } from "react-tooltip";

const VendorMaster = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uoms, setUoms] = useState([]);
  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const fetchVendors = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/vendors/get-all?page=${page}&limit=${limit}`
      );
      setVendors(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaData = async () => {
    try {
      const [uomRes, rmRes, sfgRes, fgRes] = await Promise.all([
        axios.get("/uoms/all-uoms?status=all"),
        axios.get("/rms/rm"),
        axios.get("fgs/get-all"),
        axios.get("/sfgs/get-all"),
      ]);
      setUoms(uomRes.data || []);
      setRms(rmRes.data || []);
      setSfgs(sfgRes.data || []);
      setFgs(fgRes.data || []);
    } catch {
      toast.error("Failed to fetch dropdown metadata");
    }
  };

  ScrollLock(showModal);

  useEffect(() => {
    fetchVendors();
    fetchMetaData();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchVendors(page);
  };

  const filtered = vendors.filter(
    (v) =>
      v.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      v.vendorCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    try {
      const res = await axios.patch(`/vendors/update/${id}`, {
        isActive: newStatus,
      });

      if (res.data.status == 200) {
        toast.success(`Vendor status updated`);

        // ✅ Update local state without refetch
        setVendors((prev) =>
          prev.map((v) => (v._id === id ? { ...v, isActive: newStatus } : v))
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Vendor?")) return;
    try {
      await axios.delete(`/vendors/delete/${id}`);
      toast.success("Vendor deleted");
      fetchVendors();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <Dashboard>
      <>
        {showModal && (
          <AddVendorModal
            onClose={() => setShowModal(false)}
            onAdded={() => fetchVendors(pagination.currentPage)}
            uoms={uoms}
            // sfgs={sfgs}
            // rms={rms}
            // fgs={fgs}
          />
        )}
        <div className="p-3 max-w-[99vw] mx-auto">
          <h2 className="text-2xl font-bold mb-4">
            Vendors{" "}
            <span className="text-gray-500">({pagination.totalResults})</span>
          </h2>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-2 text-[#d8b76a]" />
              <input
                type="text"
                placeholder="Search by Vendor Code or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-1 border border-[#d8b76a] rounded focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 cursor-pointer"
            >
              <FiPlus /> Add Vendor
            </button>
          </div>

          <div className="overflow-x-auto border border-[#d8b76a] rounded">
            <table className="min-w-full text-[11px] whitespace-nowrap ">
              <thead className="bg-[#d8b76a] text-left text-[#292926]">
                <tr>
                  <th className="px-2 py-1.5">#</th>
                  <th className="px-2 py-1.5">Created At</th>
                  <th className="px-2 py-1.5">Updated At</th>
                  <th className="px-2 py-1.5">Vendor Code</th>
                  <th className="px-2 py-1.5">Vendor Name</th>
                  <th className="px-2 py-1.5">Nature of Business</th>
                  <th className="px-2 py-1.5">Address</th>
                  <th className="px-2 py-1.5">City</th>
                  <th className="px-2 py-1.5">State</th>
                  <th className="px-2 py-1.5">Country</th>
                  <th className="px-2 py-1.5">Postal Code</th>
                  <th className="px-2 py-1.5">GSTIN</th>
                  <th className="px-1 py-1.5">Status</th>
                  <th className="px-2 py-1.5">Created By</th>
                  <th className="px-2 py-1.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton rows={6} columns={Array(15).fill({})} />
                ) : (
                  <>
                    {filtered.map((v, i) => (
                      <tr
                        key={v._id}
                        className=" border-t border-t-[#d8b76a] hover:bg-gray-50"
                      >
                        <td className="px-2 border-r border-[#d8b76a]">
                          {(pagination.currentPage - 1) * pagination.limit +
                            i +
                            1}
                        </td>
                        <td className="px-2  border-r border-[#d8b76a]">
                          {new Date(v.createdAt).toLocaleString()}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {new Date(v.updatedAt).toLocaleString()}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {v.venderCode}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {v.vendorName}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {v.natureOfBusiness || "-"}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {v.address || "-"}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {v.city}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {v.state}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {v.country}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {v.postalCode}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {v.gst}
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          <span className="rounded">
                            <Toggle
                              checked={v.isActive}
                              onChange={() =>
                                handleToggleStatus(v._id, v.isActive)
                              }
                            />
                          </span>
                        </td>
                        <td className="px-2 border-r border-[#d8b76a]">
                          {v.createdBy.fullName || "-"}
                        </td>
                        <td className="px-2 mt-1.5 text-sm  flex gap-2">
                          <FiEdit
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Edit"
                            className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                          />
                          <FiTrash2
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Delete"
                            onClick={() => handleDelete(v._id)}
                            className="cursor-pointer text-[#d8b76a] hover:text-red-600"
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
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan="15"
                          className="text-center py-4 text-gray-500"
                        >
                          No vendors found.
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
              fetchVendors(1, limit);
            }}
            onPageChange={(page) => {
              setPagination((prev) => ({ ...prev, currentPage: page }));
              fetchVendors(page, pagination.limit);
            }}
          />
        </div>
      </>
    </Dashboard>
  );
};

export default VendorMaster;
