// src/components/CustomerMaster.jsx
import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import Dashboard from "../../pages/Dashboard";
import AddCustomerModal from "./AddCustomerModel";
import TableSkeleton from "../TableSkeleton";
import ScrollLock from "../../components/ScrollLock";

const CustomerMaster = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/customers?page=${page}&limit=${pagination.limit}`);
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

  ScrollLock(showModal);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchCustomers(page);
  };

  const filtered = customers.filter(
    (c) =>
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dashboard>
      {showModal && (
        <AddCustomerModal
          onClose={() => setShowModal(false)}
          onAdded={() => fetchCustomers(pagination.currentPage)}
        />
      )}

      <div className="p-4 sm:p-6 max-w-[99vw] mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Customers <span className="text-gray-500">({pagination.totalResults})</span>
        </h2>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-3 text-[#d8b76a]" />
            <input
              type="text"
              placeholder="Search by Customer Code or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#d8b76a] rounded focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-2 rounded flex items-center gap-2"
          >
            <FiPlus /> Add Customer
          </button>
        </div>

        <div className="overflow-x-auto border border-[#d8b76a] rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-[#d8b76a] text-[#292926]">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Created At</th>
                <th className="px-3 py-2">Updated At</th>
                <th className="px-3 py-2">Cust. Code</th>
                <th className="px-3 py-2">Cust. Name</th>
                <th className="px-3 py-2">Alias</th>
                <th className="px-3 py-2">NOB</th>
                <th className="px-3 py-2">Address</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">State</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Postal Code</th>
                <th className="px-3 py-2">GSTIN</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created By</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={6} columns={Array(16).fill({})} />
              ) : (
                <>
                  {filtered.map((c, i) => (
                    <React.Fragment key={c._id}>
                      <tr
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === c._id ? null : c._id)}
                      >
                        <td className="px-3 py-2">{(pagination.currentPage - 1) * pagination.limit + i + 1}</td>
                        <td className="px-3 py-2">{new Date(c.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">{new Date(c.updatedAt).toLocaleString()}</td>
                        <td className="px-3 py-2">{c.customerCode}</td>
                        <td className="px-3 py-2">{c.customerName}</td>
                        <td className="px-3 py-2">{c.alias || "-"}</td>
                        <td className="px-3 py-2">{c.nature || "-"}</td>
                        <td className="px-3 py-2">{c.address}</td>
                        <td className="px-3 py-2">{c.city}</td>
                        <td className="px-3 py-2">{c.state}</td>
                        <td className="px-3 py-2">{c.country}</td>
                        <td className="px-3 py-2">{c.postalCode}</td>
                        <td className="px-3 py-2">{c.gstin}</td>
                        <td className="px-3 py-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {c.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">{c.createdBy || "-"}</td>
                        <td className="px-3 py-2 flex gap-2">
                          <FiEdit className="cursor-pointer text-[#d8b76a]" />
                          <FiTrash2 className="cursor-pointer text-[#d8b76a]" />
                        </td>
                      </tr>
                      {expandedRow === c._id && (
                        <tr className="bg-gray-50 border-t">
                          <td colSpan="16" className="px-4 py-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <strong>Bank Name:</strong> {c.bankName || "-"}<br />
                                <strong>Branch:</strong> {c.branch || "-"}<br />
                                <strong>IFSC Code:</strong> {c.ifscCode || "-"}<br />
                                <strong>Account No:</strong> {c.accountNo || "-"}
                              </div>
                              <div>
                                <strong>Contact Persons:</strong>
                                <ul className="list-disc pl-5">
                                  {(c.contacts || []).map((ct, idx) => (
                                    <li key={idx}>{ct.name} ({ct.designation}) - {ct.phone}</li>
                                  ))}
                                </ul>
                                <strong>Delivery Locations:</strong>
                                <ul className="list-disc pl-5">
                                  {(c.deliveryLocations || []).map((loc, idx) => (
                                    <li key={idx}>{loc.name} - {loc.city}, {loc.state}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="16" className="text-center py-4 text-gray-500">
                        No customers found.
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
            className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(pagination.totalPages).keys()].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              className={`px-5 py-2 rounded text-base ${
                pagination.currentPage === i + 1 ? "bg-[#d8b76a] text-white font-semibold" : "bg-[#d8b76a]/20"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Dashboard>
  );
};

export default CustomerMaster;
