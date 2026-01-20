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
import { QUERY_TYPE_MAP } from "../../../data/dropdownData";

const IndiaMartLeads = () => {
  const { hasPermission } = useAuth();
  const [leads, setLeads] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editUom, setEditUom] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const [selectedMessage, setSelectedMessage] = useState(null);

  const hasMountedRef = useRef(false);
  ScrollLock(formOpen || editUom != null);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      fetchLeads(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchLeads = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/indiamart/leads?page=${page}&limit=${limit}`
      );

      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.status == 200) {
        setLeads(res.data.data || []);
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalResults: res.data.totalResults,
          limit: res.data.limit,
        });
      }
    } catch {
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      let res = await axios.delete(`/leads/delete-lead/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        toast.success("lead deleted");
        fetchLeads();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchLeads(1);
  }, []);

  function formatQueryMessage(msg) {
    if (!msg) return "-";

    return msg
      .split("<br>") // split into lines
      .map((line) => {
        if (line.includes(":")) {
          const [title, value] = line.split(/:(.+)/); // split only at first colon
          return `<b>${title.trim()}:</b> ${value.trim()}`;
        }
        return line;
      })
      .join("<br>");
  }

  return (
    <div className="relative p-2 mt-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        IndiaMart Leads
        <span className="text-gray-500">({pagination.totalResults})</span>
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-2 top-2 text-primary" />
          <input
            type="text"
            placeholder="Search Leads"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
          />{" "}
          {search && (
            <FiX
              className="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-primary transition"
              onClick={() => setSearch("")}
              title="Clear"
            />
          )}
        </div>

        {/* {hasPermission("User", "create") && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-primary hover:bg-[#b38a37] text-black font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            {formOpen ? "Close Form" : "Add lead"}
          </button>
        )} */}
      </div>

      {/* {formOpen && (
        <AddUomModal onClose={() => setFormOpen(false)} onAdded={fetchLeads} />
      )} */}

      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="min-w-full text-[11px] ">
          <thead className="bg-primary  text-secondary text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5 ">#</th>
              <th className="px-2 py-1.5  ">Query Time</th>
              <th className="px-2 py-1.5  ">Query ID</th>
              <th className="px-2 py-1.5  ">Query Type</th>
              <th className="px-2 py-1.5 ">Sender Name</th>
              <th className="px-2 py-1.5 ">Sender Email</th>
              <th className="px-2 py-1.5 ">Sender Mobile</th>
              <th className="px-2 py-1.5 ">Sender City/State</th>
              <th className="px-2 py-1.5 ">Subject</th>
              <th className="px-2 py-1.5 ">Query Message</th>
              <th className="px-2 py-1.5 ">Query Product</th>
              <th className="px-2 py-1.5 ">Query MCAT Name</th>
              {/* <th className="px-2 py-1.5  ">Created By</th> */}
              <th className="px-2 py-1.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={Array(13).fill({})}
              />
            ) : (
              <>
                {leads.map((lead, index) => (
                  <tr
                    key={lead._id}
                    className="border-t text-[11px] border-primary hover:bg-gray-50 whitespace-nowrap"
                  >
                    <td className="px-2 border-r border-primary">
                      {Number(pagination.currentPage - 1) *
                        Number(pagination.limit) +
                        index +
                        1}
                    </td>
                    <td className="px-2   border-r border-primary">
                      {new Date(lead.QUERY_TIME).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-2   border-r border-primary">
                      {lead.UNIQUE_QUERY_ID}
                    </td>
                    <td className="px-2 border-r border-primary">
                      {QUERY_TYPE_MAP[lead.QUERY_TYPE] ||
                        lead.QUERY_TYPE ||
                        "-"}
                    </td>
                    <td className="px-2  border-r border-primary">
                      {lead.SENDER_NAME || "-"}
                    </td>
                    <td className="px-2  border-r border-primary">
                      {lead.SENDER_EMAIL || "-"}
                    </td>
                    <td className="px-2  border-r border-primary">
                      {lead.SENDER_MOBILE || "-"}
                    </td>

                    <td className="px-2   border-r border-primary">
                      {lead.rawData?.SENDER_CITY +
                        ", " +
                        lead.rawData?.SENDER_STATE || "-"}
                    </td>
                    <td className="px-2  border-r border-primary">
                      {lead.rawData.SUBJECT || "-"}
                    </td>
                    <td
                      className="px-2 py-2 border-r border-primary max-w-xs md:max-w-[50px] truncate cursor-pointer text-blue-600 hover:underline"
                      onClick={() =>
                        setSelectedMessage(lead.rawData.QUERY_MESSAGE || "-")
                      }
                    >
                      {(lead.rawData.QUERY_MESSAGE && "View") || "-"}
                    </td>
                    <td className="px-2  border-r border-primary">
                      {lead.rawData.QUERY_PRODUCT_NAME || "-"}
                    </td>
                    <td className="px-2  border-r border-primary">
                      {lead.rawData.QUERY_MCAT_NAME || "-"}
                    </td>

                    <td className="px-2 mt-1.5 flex gap-3 text-sm text-primary">
                      {/* {hasPermission("lead", "update") ? (
                        <FiEdit
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Edit"
                          className="cursor-pointer text-primary hover:text-blue-600"
                          onClick={() => setEditUom(lead)}
                        />
                      ) : (
                        "-"
                      )} */}
                      {/* {hasPermission("lead", "delete") ? (
                        <FiTrash2
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Delete"
                          className="cursor-pointer text-primary hover:text-red-600"
                          onClick={() => handleDelete(lead._id)}
                        />
                      ) : (
                        "-"
                      )} */}
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
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No leads found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {editUom && (
        <EditUomModal
          lead={editUom}
          onClose={() => setEditUom(null)}
          onUpdated={fetchLeads}
        />
      )}
      {/* Modal for full message */}
      {selectedMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100/50 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full relative border-primary border">
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-2 right-2 "
            >
              <span className="text-black text-2xl hover:text-red-600 cursor-pointer">
                ×
              </span>
            </button>
            <h2 className="text-lg font-bold mb-2 text-primary">
              Query Message
            </h2>
            <div
              className="whitespace-pre-wrap text-sm text-gray-700"
              dangerouslySetInnerHTML={{
                __html: formatQueryMessage(selectedMessage),
              }}
            />
          </div>
        </div>
      )}

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        totalResults={pagination.totalResults}
        onEntriesChange={(limit) => {
          setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
          fetchLeads(1, limit);
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
          fetchLeads(page, pagination.limit);
        }}
      />
    </div>
  );
};

export default IndiaMartLeads;
