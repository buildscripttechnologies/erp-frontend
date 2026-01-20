import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";

import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import PaginationControls from "../../PaginationControls";
import { Tooltip } from "react-tooltip";
import { useAuth } from "../../../context/AuthContext";
import { debounce } from "lodash";

import { useRef } from "react";
import Issue from "./Issue";
import { FaFileDownload } from "react-icons/fa";
import { PulseLoader } from "react-spinners";
import IssueDetails from "./IssueDetails";
import { generateIssueSlip } from "./generateIssueSlip";

const AccessoriesIssue = () => {
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
  const [expandedAccessoryId, setExpandedAccessoryId] = useState(null);
  const [downloading, setDownloading] = useState();

  const [companyDetails, setCompanyDetails] = useState();

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const res = await axios.get("/settings/company-details");

        setCompanyDetails(res.data || []);
      } catch {
        toast.error("Failed to fetch company details");
      }
    };
    fetchCompanyDetails();
  }, []);

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
        `/accessory-issue/get-all?page=${page}&limit=${limit}&search=${search}&status="all"`
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
      let res = await axios.delete(`/accessory-issue/delete/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        toast.success("Accessory Issue deleted");
        fetchAccessories();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchAccessories(1);
  }, []);

  const handleDownload = async (b) => {
    setDownloading(true);
    try {
      const res = await axios.get("/settings/letterpad");
      const letterpadUrl = res.data.path;
      const url = await generateIssueSlip(b, letterpadUrl, companyDetails);

      // Open in new tab for preview
      // window.open(url, "_blank");
      const a = document.createElement("a");
      a.href = url;
      a.download = `Accessory Issue -${
        b.issueNo || "Accessory Issue Slip"
      }.pdf`; // <-- custom filename here
      a.click();
      // Don’t revoke immediately, or the preview tab will break
      // Instead, revoke after some delay
      setTimeout(() => window.URL.revokeObjectURL(url), 60 * 1000);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative p-2 mt-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Accessories Issue{" "}
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

        {hasPermission("Accessories Issue", "write") && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-primary hover:bg-primary/80 text-secondary font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            {formOpen ? "Close Form" : "Issue"}
          </button>
        )}
      </div>

      {formOpen && (
        <Issue onClose={() => setFormOpen(false)} onAdded={fetchAccessories} />
      )}

      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="min-w-full text-[11px]  whitespace-nowrap">
          <thead className="bg-primary  text-secondary text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5 ">#</th>
              <th className="px-2 py-1.5 ">Created At</th>
              <th className="px-2 py-1.5 ">Updated At</th>
              <th className="px-2 py-1.5 ">Issue No</th>
              <th className="px-2 py-1.5 ">Labour / Employee Name</th>
              <th className="px-2 py-1.5 ">Department</th>
              <th className="px-2 py-1.5 ">Issue Reason</th>
              <th className="px-2 py-1.5 ">Received By</th>
              <th className="px-2 py-1.5 ">Supervisor</th>
              <th className="px-2 py-1.5 ">Issued By</th>
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
                  <React.Fragment key={accessory._id}>
                    <tr
                      onClick={() =>
                        setExpandedAccessoryId(
                          expandedAccessoryId === accessory._id
                            ? null
                            : accessory._id
                        )
                      }
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
                        {accessory.issueNo || "-"}
                      </td>
                      <td className="px-2 border-r border-primary">
                        {accessory.personName || "-"}
                      </td>
                      <td className="px-2 border-r border-primary">
                        {accessory.department || "-"}
                      </td>
                      <td className="px-2 border-r border-primary">
                        {accessory.issueReason || "-"}
                      </td>
                      <td className="px-2 border-r border-primary">
                        {accessory.receivedBy || "-"}
                      </td>
                      <td className="px-2 border-r border-primary">
                        {accessory.supervisor || "-"}
                      </td>
                      <td className="px-2  hidden md:table-cell border-r border-primary">
                        {accessory.createdBy?.fullName || "-"}
                      </td>
                      <td className="px-2 mt-1.5 flex gap-3 text-sm text-primary">
                        {expandedAccessoryId === accessory._id &&
                        downloading ? (
                          <PulseLoader size={4} color="#d8b76a" />
                        ) : (
                          <FaFileDownload
                            onClick={() => handleDownload(accessory)}
                            className="cursor-pointer text-primary hover:text-green-600"
                          />
                        )}
                        {hasPermission("Accessories Issue", "update") ? (
                          <FiEdit
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Edit"
                            className="cursor-pointer text-primary hover:text-blue-600"
                            // onClick={() => setEditAccessory(accessory)}
                          />
                        ) : (
                          "-"
                        )}
                        {hasPermission("Accessories Issue", "delete") ? (
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
                    {expandedAccessoryId === accessory._id && (
                      <tr className="">
                        <td colSpan="100%">
                          <IssueDetails
                            accessoriesData={accessory.accessories}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

export default AccessoriesIssue;
