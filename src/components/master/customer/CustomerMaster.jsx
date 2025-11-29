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

import {
  generateEnvelopePdf,
  generateEnvelopePdfWithoutBG,
} from "./generateEnvelopePdf"; // adjust path if needed
import { FiPrinter } from "react-icons/fi";
import PreviewEnvelope from "./EnvelopePreview";
import { PulseLoader } from "react-spinners";
import { TbRestore } from "react-icons/tb";

const CustomerMaster = ({ isOpen }) => {
  const { hasPermission } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const handlePreviewEnvelope = async (customer) => {
    const fields = {
      customerName: "Customer name is required",
      address: "Address is required",
      city: "City is required",
      state: "State is required",
      postalCode: "Postal code is required",
      country: "Country is required",
      mobile: "Mobile number is required",
    };

    for (const [key, message] of Object.entries(fields)) {
      if (!customer[key] && key !== "mobile") {
        toast.error(message);
        return;
      }
    }

    if (!customer.contactPersons?.[0]?.phone) {
      toast.error("Mobile number is required");
      return;
    }

    setLoadingPdf(true);
    try {
      const { url } = await generateEnvelopePdf(customer, "/env.pdf");
      setPdfUrl(url);
      setPreviewItem(customer);
    } catch (err) {
      toast.error("Failed to generate envelope");
    } finally {
      setLoadingPdf(false);
    }
  };

  const handlePrintEnvelope = async () => {
    const { url } = await generateEnvelopePdfWithoutBG(previewItem, "");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${previewItem.customerName || "Receipt"}.pdf`; // <-- custom filename here
    a.click();
  };

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const [restore, setRestore] = useState(false);
  const [selected, setSelected] = useState([]);
  const [restoreId, setRestoreId] = useState();
  const [deleteId, setDeleteId] = useState();

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      if (restore) {
        fetchDeletedCustomers(1);
      } else {
        fetchCustomers(1);
      }
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
  const fetchDeletedCustomers = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/customers/deleted?page=${page}&search=${search}&limit=${limit}`
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

  ScrollLock(
    showModal ||
      editingCustomer != null ||
      previewItem != null ||
      pdfUrl != null
  );

  useEffect(() => {
    if (restore) {
      fetchDeletedCustomers(pagination.currentPage);
    } else {
      fetchCustomers(pagination.currentPage);
    }
  }, [pagination.currentPage, pagination.limit, restore]);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchCustomers(page);
  };

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

  const handlePermanentDelete = async (id = "") => {
    if (!window.confirm("Are you sure you want to Delete Permanently?")) return;
    try {
      setDeleteId(id);
      let payload;
      if (id != "") {
        payload = { ids: [...selected, id] };
      } else {
        payload = { ids: [...selected] };
      }
      const res = await axios.post(`/customers/permanent-delete/`, payload);
      if (res.status == 200) {
        toast.success("deleted successfully");
        fetchDeletedCustomers(pagination.currentPage);
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setDeleteId("");
      setSelected([]);
    }
  };
  const handleRestore = async (id = "") => {
    if (!window.confirm("Are you sure you want to Restore?")) return;
    try {
      setRestoreId(id);
      let payload;
      if (id != "") {
        payload = { ids: [...selected, id] };
      } else {
        payload = { ids: [...selected] };
      }
      const res = await axios.patch(`/customers/restore`, payload);
      if (res.status == 200) {
        toast.success("Restore successfully");
        fetchDeletedCustomers(pagination.currentPage);
      } else {
        toast.error("Failed to Restore");
      }
    } catch (err) {
      toast.error("Failed to Restore");
    } finally {
      setRestoreId("");
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === customers.length) {
      setSelected([]);
    } else {
      setSelected(customers.map((item) => item._id));
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
        <div className="flex fex-wrap gap-2 mb-4">
          <h2 className="text-2xl font-bold ">
            Customers{" "}
            <span className="text-gray-500">({pagination.totalResults})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setRestore((prev) => !prev);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
                setSelected([]);
              }}
              className="bg-primary text-secondary  px-2 font-semibold rounded cursor-pointer hover:bg-primary/80 "
            >
              {restore ? "Cancel" : "Restore"}
            </button>
            {restore ? (
              <>
                <button
                  onClick={() => handleRestore()}
                  className="bg-primary text-secondary px-2 font-semibold rounded cursor-pointer hover:bg-primary/80 "
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete()}
                  className="bg-primary text-secondary px-2 font-semibold rounded cursor-pointer hover:bg-primary/80 "
                >
                  Delete
                </button>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-primary" />
            <input
              type="text"
              placeholder="Search by Customer Code or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1 border border-primary rounded focus:outline-none"
            />
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
              className="bg-primary hover:bg-[#b38a37]  justify-center text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 cursor-pointer"
            >
              <FiPlus /> Add Customer
            </button>
          )}
        </div>

        <div className="relative overflow-x-auto  overflow-y-auto rounded border border-primary shadow-sm">
          <div className={` ${isOpen ? `max-w-[40.8vw]` : `max-w-[98vw]`}`}>
            <table
              className={
                "text-[11px] whitespace-nowrap min-w-[100vw] text-left"
              }
            >
              <thead className="bg-primary text-[#292926]">
                <tr>
                  {restore && (
                    <th className="px-[8px] py-1">
                      <input
                        type="checkbox"
                        checked={selected.length === customers.length}
                        onChange={toggleSelectAll}
                        className="accent-primary"
                      />
                    </th>
                  )}
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
                    columns={restore ? Array(18).fill({}) : Array(17).fill({})}
                  />
                ) : (
                  <>
                    {customers.map((c, i) => (
                      <React.Fragment key={c._id}>
                        <tr
                          className="border-t border-primary hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setExpandedCustomerId(
                              expandedCustomerId === c._id ? null : c._id
                            )
                          }
                        >
                          {restore && (
                            <td className="px-[8px] border-r border-primary">
                              <input
                                type="checkbox"
                                name=""
                                id=""
                                className=" accent-primary"
                                checked={selected.includes(c._id)}
                                onChange={() => handleSelect(c._id)}
                              />
                            </td>
                          )}

                          <td className="px-[8px] border-r border-primary py-1">
                            {(pagination.currentPage - 1) * pagination.limit +
                              i +
                              1}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {new Date(c.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {new Date(c.updatedAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.customerCode || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.customerName || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.aliasName || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.natureOfBusiness || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.address || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.city || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.state || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.country || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.postalCode || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.gst || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.pan || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            <Toggle
                              checked={c.isActive}
                              onChange={() =>
                                handleToggleStatus(c._id, c.isActive)
                              }
                            />
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {c.createdBy?.fullName || "-"}
                          </td>
                          <td className="px-[8px] pt-1.5 text-sm  flex gap-2 text-primary">
                            {hasPermission("Customer", "update") &&
                            restore == false ? (
                              <FiEdit
                                onClick={() => setEditingCustomer(c)}
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Edit"
                                className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                              />
                            ) : restoreId == c._id ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <TbRestore
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Restore"
                                onClick={() => handleRestore(c._id)}
                                className="hover:text-green-500 cursor-pointer"
                              />
                            )}

                            {hasPermission("Customer", "delete") &&
                            restore == false ? (
                              deleteId == c._id ? (
                                <PulseLoader size={4} color="#d8b76a" />
                              ) : (
                                <FiTrash2
                                  data-tooltip-id="statusTip"
                                  data-tooltip-content="Delete"
                                  onClick={() => handleDelete(c._id)}
                                  className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                                />
                              )
                            ) : deleteId == c._id ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <FiTrash2
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Permanent Delete"
                                onClick={() => handlePermanentDelete(c._id)}
                                className="hover:text-red-500 cursor-pointer"
                              />
                            )}

                            {!restore && (
                              <FiPrinter
                                onClick={() => handlePreviewEnvelope(c)}
                                className="cursor-pointer text-primary hover:text-green-600"
                                title="Print Envelope"
                              />
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
          }}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
          }}
        />
        {pdfUrl && previewItem && (
          <PreviewEnvelope
            pdfUrl={pdfUrl}
            previewItem={previewItem}
            onClose={() => {
              setPdfUrl(null);
              setPreviewItem(null);
            }}
            onPrint={handlePrintEnvelope}
          />
        )}
      </div>
    </>
  );
};

export default CustomerMaster;
