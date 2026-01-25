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
    <div className="relative p-2 mt-2 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <div className="mb-2 pt-4">
        <h2 className="text-lg sm:text-xl font-bold mb-3 bg-gray-800 text-white px-4 py-3 rounded-t-lg">
          IndiaMart Leads
          <span className="text-gray-300 ml-2 font-normal">({pagination.totalResults})</span>
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between mb-3">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Leads"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200 text-sm"
          />
          {search && (
            <FiX
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition"
              onClick={() => setSearch("")}
              title="Clear"
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded-b-lg shadow-sm bg-white">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-800 text-white text-left sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 font-semibold">#</th>
              <th className="px-3 py-2 font-semibold">Query Time</th>
              <th className="px-3 py-2 font-semibold">Query ID</th>
              <th className="px-3 py-2 font-semibold">Query Type</th>
              <th className="px-3 py-2 font-semibold">Sender Name</th>
              <th className="px-3 py-2 font-semibold">Sender Email</th>
              <th className="px-3 py-2 font-semibold">Sender Mobile</th>
              <th className="px-3 py-2 font-semibold">Sender City/State</th>
              <th className="px-3 py-2 font-semibold">Subject</th>
              <th className="px-3 py-2 font-semibold">Query Message</th>
              <th className="px-3 py-2 font-semibold">Query Product</th>
              <th className="px-3 py-2 font-semibold">Query MCAT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
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
                    className={`text-xs transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50`}
                  >
                    <td className="px-3 py-2 font-medium text-gray-700">
                      {Number(pagination.currentPage - 1) * Number(pagination.limit) + index + 1}
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {new Date(lead.QUERY_TIME).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-3 py-2 text-gray-700 font-mono">{lead.UNIQUE_QUERY_ID}</td>
                    <td className="px-3 py-2 text-gray-600">{QUERY_TYPE_MAP[lead.QUERY_TYPE] || lead.QUERY_TYPE || "-"}</td>
                    <td className="px-3 py-2 text-gray-800 font-medium">{lead.SENDER_NAME || "-"}</td>
                    <td className="px-3 py-2 text-gray-600 truncate">{lead.SENDER_EMAIL || "-"}</td>
                    <td className="px-3 py-2 text-gray-600">{lead.SENDER_MOBILE || "-"}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {lead.rawData?.SENDER_CITY + ", " + lead.rawData?.SENDER_STATE || "-"}
                    </td>
                    <td className="px-3 py-2 text-gray-700 truncate max-w-xs">{lead.rawData.SUBJECT || "-"}</td>
                    <td className="px-3 py-2">
                      {lead.rawData.QUERY_MESSAGE ? (
                        <button
                          onClick={() => setSelectedMessage(lead.rawData.QUERY_MESSAGE || "-")}
                          className="inline-flex items-center justify-center px-2 py-1 bg-primary hover:bg-[#b38a37] text-white font-semibold rounded transition duration-200 border border-[#b38a37] hover:shadow-md text-xs"
                        >
                          View
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-700 truncate">{lead.rawData.QUERY_PRODUCT_NAME || "-"}</td>
                    <td className="px-3 py-2 text-gray-600 truncate">{lead.rawData.QUERY_MCAT_NAME || "-"}</td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="12" className="text-center py-6 text-gray-500">
                      No leads found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full relative border border-gray-300">
            <div className="bg-gradient-to-r from-secondary to-gray-900 px-6 py-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Query Message Details</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-300 hover:text-white text-2xl transition duration-200 hover:bg-primary/30 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div
                className="whitespace-pre-wrap text-sm text-gray-700 bg-primary/10 p-4 rounded-lg border-l-4 border-primary font-mono leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatQueryMessage(selectedMessage),
                }}
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-primary hover:bg-[#b38a37] text-black font-semibold rounded transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3">
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalResults={pagination.totalResults}
          entriesPerPage={pagination.limit}
          onPageChange={fetchLeads}
          onEntriesChange={(newLimit) => fetchLeads(1, newLimit)}
        />
      </div>
    </div>
  );
};

export default IndiaMartLeads;