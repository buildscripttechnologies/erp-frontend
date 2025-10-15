// src/components/CustomerMaster.jsx
import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";
import Dashboard from "../../../pages/Dashboard";
import AddCustomerModal from "./AddCustomerModel";
import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import Toggle from "react-toggle";
import PaginationControls from "../../PaginationControls";
import EditCustomerModal from "./EditCustomerModal";
import CustomerDetailsSection from "./CustomerDetailsView";
import { useAuth } from "../../../context/AuthContext";
import { useRef } from "react";

import { debounce } from "lodash";

const CustomerMaster = ({ isOpen }) => {
  const { hasPermission } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);

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
      fetchCustomers(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchCustomers = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/customers/get-all?page=${page}&search=${search}&limit=${limit}`
      );
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      setCustomers(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  ScrollLock(showModal || editingCustomer != null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchCustomers(page);
  };

  // const filtered = customers.filter(
  //   (c) =>
  //     c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.customerCode?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.aliasName?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.natureOfBusiness?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.city?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.state?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.country?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.postalCode?.includes(search)
  // );

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    try {
      const res = await axios.patch(`/customers/update/${id}`, {
        isActive: newStatus,
      });
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        toast.success(`Customer status updated`);

        // ✅ Update local state without refetch
        setCustomers((prev) =>
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
    if (!window.confirm("Are you sure you want to delete this Customer?"))
      return;
    try {
      let res = await axios.delete(`/customers/delete/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Customer deleted");
      fetchCustomers();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      {showModal && (
        <AddCustomerModal
          onClose={() => setShowModal(false)}
          onAdded={() => fetchCustomers(pagination.currentPage)}
        />
      )}

      <div className="p-3 max-w-[99vw] mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Customers{" "}
          <span className="text-gray-500">({pagination.totalResults})</span>
        </h2>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-[#d8b76a]" />
            <input
              type="text"
              placeholder="Search by Customer Code or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1 border border-[#d8b76a] rounded focus:outline-none"
            />{" "}
            {search && (
              <FiX
                className="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-primary transition"
                onClick={() => setSearch("")}
                title="Clear"
              />
            )}
          </div>
          {hasPermission("Customer", "write") && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#d8b76a] hover:bg-[#b38a37]  justify-center text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 cursor-pointer"
            >
              <FiPlus /> Add Customer
            </button>
          )}
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
                  <th className="px-[8px] ">Cust. Code</th>
                  <th className="px-[8px] ">Cust. Name</th>
                  <th className="px-[8px] ">Alias</th>
                  <th className="px-[8px] ">NOB</th>
                  <th className="px-[8px] ">Address</th>
                  <th className="px-[8px] ">City</th>
                  <th className="px-[8px] ">State</th>
                  <th className="px-[8px] ">Country</th>
                  <th className="px-[8px] ">Postal Code</th>
                  <th className="px-[8px] ">GSTIN</th>
                  <th className="px-[8px] ">PAN</th>
                  <th className="px-[8px] ">Status</th>
                  <th className="px-[8px] ">Created By</th>
                  <th className="px-[8px] ">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton
                    rows={pagination.limit}
                    columns={Array(16).fill({})}
                  />
                ) : (
                  <>
                    {customers.map((c, i) => (
                      <React.Fragment key={c._id}>
                        <tr
                          className="border-t border-[#d8b76a] hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setExpandedCustomerId(
                              expandedCustomerId === c._id ? null : c._id
                            )
                          }
                        >
                          <td className="px-[8px] border-r border-[#d8b76a] py-1">
                            {(pagination.currentPage - 1) * pagination.limit +
                              i +
                              1}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {new Date(c.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {new Date(c.updatedAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.customerCode || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.customerName || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.aliasName || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.natureOfBusiness || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.address || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.city || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.state || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.country || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.postalCode || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.gst || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.pan || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            <Toggle
                              checked={c.isActive}
                              onChange={() =>
                                handleToggleStatus(c._id, c.isActive)
                              }
                            />
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {c.createdBy?.fullName || "-"}
                          </td>
                          <td className="px-[8px] pt-1.5 text-sm  flex gap-2 text-[#d8b76a]">
                            {hasPermission("Customer", "update") ? (
                              <FiEdit
                                onClick={() => setEditingCustomer(c)}
                                className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                              />
                            ) : (
                              "-"
                            )}
                            {hasPermission("Customer", "delete") ? (
                              <FiTrash2
                                onClick={() => handleDelete(c._id)}
                                className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                        {expandedCustomerId === c._id && (
                          <tr className="">
                            <td colSpan="100%">
                              <CustomerDetailsSection customerData={c} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td
                          colSpan="16"
                          className="text-center py-4 text-gray-500"
                        >
                          No customers found.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {editingCustomer && (
          <EditCustomerModal
            customer={editingCustomer}
            onClose={() => setEditingCustomer(null)}
            onUpdated={() => {
              fetchCustomers(); // re-fetch or refresh list
              setEditingCustomer(null);
            }}
          />
        )}

        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          entriesPerPage={pagination.limit}
          totalResults={pagination.totalResults}
          onEntriesChange={(limit) => {
            setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
            fetchCustomers(1, limit);
          }}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
            fetchCustomers(page, pagination.limit);
          }}
        />
      </div>
    </>
  );
};

export default CustomerMaster;
