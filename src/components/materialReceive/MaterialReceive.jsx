import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";

// import EditstockModal from "./EditstockModal";
import TableSkeleton from "../TableSkeleton";
import ScrollLock from "../ScrollLock";
import Toggle from "react-toggle";
import PaginationControls from "../PaginationControls";
import { Tooltip } from "react-tooltip";
import { useAuth } from "../../context/AuthContext";
import { debounce } from "lodash";
// import LabelPrint from "./LabelPrint";
import { FaBarcode } from "react-icons/fa";

import { useRef } from "react";

import MIdetails from "./MRdetails";
import UpdateMI from "./UpdateMI";
import Receive from "./Receive";
import MRdetails from "./MRdetails";

const MaterialReceive = () => {
  const { hasPermission } = useAuth();
  const [mr, setMrs] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editstock, setEditstock] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMIData, setEditMIData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedMRId, setExpandedMRId] = useState(null);

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
    fetchMrs();
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
      fetchMrs(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchMrs = async (page = 1, limit = pagination.limit) => {
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

      const res = await axios.get(`/mr/get-all?${queryParams.toString()}`);

      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        setMrs(res.data.data || []);
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
    fetchMrs();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this Material Receive?")
    )
      return;
    try {
      let res = await axios.delete(`/mr/delete/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        toast.success("Material Receive deleted");
        fetchMrs();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchMrs(1);
    // fetchUoms();
  }, []);

  return (
    <div className="relative p-2 mt-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Material Receive{" "}
        <span className="text-gray-500">({pagination.totalResults})</span>
      </h2>

      <div className="flex flex-wrap gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-2 top-2 text-primary" />
          <input
            type="text"
            placeholder="Search Material"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
          />
        </div>
        {/* <div className="flex flex-wrap gap-4 items-center ">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-primary rounded px-2 py-1.5 text-sm"
          >
            <option value="">All Types</option>
            <option value="RM">RM</option>
            <option value="SFG">SFG</option>
            <option value="FG">FG</option>
          </select>

          <select
            value={filters.uom}
            onChange={(e) => setFilters({ ...filters, uom: e.target.value })}
            className="border border-primary rounded px-2 py-1.5 text-sm"
          >
            <option value="">All UOM</option>
            {uoms.map((u) => (
              <option key={u._id} value={u.unitName}>
                {u.unitName}
              </option>
            ))}
          </select>

          <div>
            <label htmlFor="date from">From : </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="border border-primary rounded px-2 py-1.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="to date">To : </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="border border-primary rounded px-2 py-1.5 text-sm"
            />
          </div>

          <button
            disabled={
              filters.type == "" &&
              filters.fromDate == "" &&
              filters.toDate == "" &&
              filters.uom == ""
            }
            onClick={handleResetFilters}
            className="bg-primary hover:bg-[#b38a37] disabled:hover:bg-primary/50 disabled:bg-primary/50 disabled:cursor-not-allowed text-secondary font-semibold px-4 py-1.5 rounded transition duration-200 cursor-pointer"
          >
            Reset Filters
          </button>
        </div> */}

        {hasPermission("Material Receive", "write") && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-primary hover:bg-[#b38a37] text-secondary font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            {formOpen ? "Close Form" : "Receive Material"}
          </button>
        )}
      </div>

      {formOpen && (
        <Receive
          isOpen={formOpen}
          setIsOpen={setFormOpen}
          onClose={() => setFormOpen(false)}
          onAdded={fetchMrs}
        />
      )}

      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="min-w-full text-[11px] ">
          <thead className="bg-primary  text-secondary text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5 ">#</th>
              <th className="px-2 py-1.5  ">Created At</th>
              {/* <th className="px-2 py-1.5  ">Updated At</th> */}
              <th className="px-2 py-1.5 ">Prod No</th>
              <th className="px-2 py-1.5 ">BOM No</th>
              <th className="px-2 py-1.5 ">Product Name</th>
              {/* <th className="px-2 py-1.5 ">Status</th> */}
              <th className="px-2 py-1.5 ">Created By</th>
              <th className="px-2 py-1.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={Array(7).fill({})}
              />
            ) : (
              <>
                {mr.map((mr, index) => (
                  <React.Fragment key={mr._id}>
                    <tr
                      key={mr._id}
                      className="border-t text-[11px] border-primary hover:bg-gray-50 whitespace-nowrap"
                      onClick={() =>
                        setExpandedMRId(expandedMRId === mr._id ? null : mr._id)
                      }
                    >
                      <td className="px-2 border-r border-primary">
                        {Number(pagination.currentPage - 1) *
                          Number(pagination.limit) +
                          index +
                          1}
                      </td>
                      <td className="px-2   border-r border-primary">
                        {new Date(mr.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      {/* <td className="px-2  hidden md:table-cell border-r border-primary">
                        {new Date(mr.updatedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td> */}
                      <td className="px-2  border-r border-primary">
                        {mr.prodNo || "-"}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {mr.bomNo}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {mr.bom?.productName || ""}
                      </td>
                      {/* <td className="px-2  border-r border-primary">
                        <span
                          className={`${
                            mr.status == "pending"
                              ? "bg-yellow-200"
                              : "bg-green-200"
                          }  py-0.5 px-1 rounded font-bold capitalize `}
                        >
                          {mr.status || "-"}
                        </span>
                      </td> */}

                      <td className="px-2  border-r border-primary">
                        {mr.createdBy?.fullName || "-"}
                      </td>

                      <td className="px-2 py-1 flex gap-3 text-sm text-primary">
                        {/* <button
                        disabled={generatingId === mr._id}
                        onClick={() => handlePrint(mr)}
                        className="text-primary hover:underline text-[11px] cursor-pointer"
                      >
                        {generatingId === stock._id ? (
                          <ClipLoader size={11} color="primary" />
                        ) : (
                          <FaBarcode
                            data-tooltip-id="statusTip"
                            data-tooltip-content="View Barcodes"
                          />
                        )}
                      </button> */}

                        {/* {hasPermission("Material Receive", "update") ? (
                          <FiEdit
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Edit"
                            className="hover:text-blue-500 cursor-pointer"
                            onClick={() => {
                              setEditMIData(mi);
                              setEditModalOpen(true);
                            }}
                          />
                        ) : (
                          "-"
                        )} */}

                        {hasPermission("Material Receive", "delete") ? (
                          <FiTrash2
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Delete"
                            className="cursor-pointer text-primary hover:text-red-600"
                            onClick={() => handleDelete(mr._id)}
                          />
                        ) : (
                          "-"
                        )}
                        <Tooltip
                          id="statusTip"
                          place="top"
                          style={{
                            backgroundColor: "black",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        />
                      </td>
                    </tr>
                    {expandedMRId === mr._id && (
                      <tr className="">
                        <td colSpan="100%">
                          <MRdetails MR={mr} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {mr.length === 0 && (
                  <tr>
                    <td colSpan="14" className="text-center py-4 text-gray-500">
                      No Material Issue found.
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

export default MaterialReceive;
