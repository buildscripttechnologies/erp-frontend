import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";

// import EditstockModal from "./EditstockModal";
import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import Toggle from "react-toggle";
import PaginationControls from "../../PaginationControls";
import { Tooltip } from "react-tooltip";
import { useAuth } from "../../../context/AuthContext";
import { debounce } from "lodash";
// import LabelPrint from "./LabelPrint";
import { FaBarcode } from "react-icons/fa";

import { useRef } from "react";
import MIdetails from "../../materialIssue/Midetails";
import JobDetails from "../JobDetails";

// import UpdateMI from "./UpdateMI";
// import Add from "./Add";

const QualityCheck = () => {
  const { hasPermission } = useAuth();
  const [mi, setMis] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editstock, setEditstock] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMIData, setEditMIData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedMIId, setExpandedMIId] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const [filters, setFilters] = useState({
    type: "",
    uom: "",
    fromDate: "",
    toDate: "",
  });

  const handleResetFilters = () => {
    setFilters({
      type: "",
      uom: "",
      fromDate: "",
      toDate: "",
    });
    // call API without filters
  };

  useEffect(() => {
    fetchMis();
  }, [filters]);

  const [selectedStock, setSelectedStock] = useState(null);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [uoms, setUoms] = useState([]);

  const hasMountedRef = useRef(false);

  const handleViewBarcodes = (stock) => {
    setSelectedStock(stock); // this should include barcode list
    setBarcodeModalOpen(true);
  };

  ScrollLock(
    formOpen ||
      editMIData != null ||
      barcodeModalOpen ||
      selectedStock != null ||
      showModal ||
      editModalOpen
  );

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      fetchMis(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchMis = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        // status: "all",
        // type: filters.type,
        // uom: filters.uom,
        // fromDate: filters.fromDate,
        // toDate: filters.toDate,
      });

      const res = await axios.get(
        `/mi/quality-check?${queryParams.toString()}`
      );
      // console.log("mis res", res);

      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        setMis(res.data.data || []);
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalResults: res.data.totalResults,
          limit: res.data.limit,
        });
      }
    } catch {
      toast.error("Failed to fetch Material Issue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMis();
  }, []);

  function getJobTableStatus(items, table) {
    if (!Array.isArray(items) || items.length === 0) return "Pending";

    // Normalize stage name (case insensitive)
    const stageName = table;

    // Check every item's stage
    const allCompleted = items.every((item) => {
      if (!Array.isArray(item.stages)) return false;

      // Find the stage for this item
      const stage = item.stages.find((s) => s.stage && s.stage === stageName);

      // Consider completed only if stage exists AND its status = "Completed"
      return stage && stage.status === "Completed";
    });

    return allCompleted ? "Completed" : "Pending";
  }

  return (
    <div className="relative p-2 mt-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Quality Check{" "}
        <span className="text-gray-500">({pagination.totalResults})</span>
      </h2>

      <div className="flex flex-wrap gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-2 top-2 text-primary" />
          <input
            type="text"
            placeholder="Search Products"
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
      </div>

      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="min-w-full text-[11px] ">
          <thead className="bg-primary  text-secondary text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5 ">#</th>
              <th className="px-2 py-1.5  ">Created At</th>
              <th className="px-2 py-1.5  ">Updated At</th>
              <th className="px-2 py-1.5 ">Prod No</th>
              <th className="px-2 py-1.5 ">BOM No</th>
              <th className="px-2 py-1.5 ">Product Name</th>
              <th className="px-2 py-1.5 ">Status</th>
              <th className="px-2 py-1.5 ">Created By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={Array(8).fill({})}
              />
            ) : (
              <>
                {mi.map((mi, index) => (
                  <React.Fragment key={mi._id}>
                    <tr
                      key={mi._id}
                      className="border-t text-[11px] border-primary hover:bg-gray-50 whitespace-nowrap"
                      onClick={() =>
                        setExpandedMIId(expandedMIId === mi._id ? null : mi._id)
                      }
                    >
                      <td className="px-2 border-r border-primary">
                        {Number(pagination.currentPage - 1) *
                          Number(pagination.limit) +
                          index +
                          1}
                      </td>
                      <td className="px-2   border-r border-primary">
                        {new Date(mi.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-2   border-r border-primary">
                        {new Date(mi.updatedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {mi.prodNo || "-"}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {mi.bomNo || "-"}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {mi?.bom?.productName || "-"}
                      </td>
                      <td className="px-2 border-r border-primary py-1">
                        {(() => {
                          const tableStatus = getJobTableStatus(
                            mi.itemDetails || [],
                            "Checking"
                          );

                          return (
                            <span
                              className={`${
                                tableStatus === "Pending"
                                  ? "bg-yellow-200"
                                  : tableStatus === "In Progress"
                                  ? "bg-orange-200"
                                  : "bg-green-200"
                              } py-0.5 px-1 rounded font-bold capitalize`}
                            >
                              {tableStatus}
                            </span>
                          );
                        })()}
                      </td>

                      <td className="px-2  border-r border-primary">
                        {mi.createdBy?.fullName || "-"}
                      </td>
                    </tr>
                    {expandedMIId === mi._id && (
                      <tr className="">
                        <td colSpan="100%">
                          <JobDetails
                            MI={mi}
                            filter="checking"
                            fetchMis={fetchMis}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {mi.length === 0 && (
                  <tr>
                    <td colSpan="14" className="text-center py-4 text-gray-500">
                      No Products Found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* {barcodeModalOpen && selectedStock && (
        <LabelPrint
          stock={selectedStock}
          onClose={() => setBarcodeModalOpen(false)}
        />
      )} */}
      {editModalOpen && (
        <UpdateMI
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          MIData={editMIData}
          onUpdated={fetchMis}
        />
      )}

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        totalResults={pagination.totalResults}
        onEntriesChange={(limit) => {
          setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
          fetchMis(1, limit);
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
          fetchMis(page, pagination.limit);
        }}
      />
    </div>
  );
};

export default QualityCheck;
