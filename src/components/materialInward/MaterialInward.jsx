import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";

import AddStockModal from "./AddStock";
// import EditstockModal from "./EditstockModal";
import TableSkeleton from "../TableSkeleton";
import ScrollLock from "../ScrollLock";
import Toggle from "react-toggle";
import PaginationControls from "../PaginationControls";
import { Tooltip } from "react-tooltip";
import { useAuth } from "../../context/AuthContext";
import { debounce } from "lodash";
import BarcodeModal from "./BarcodeModal";
import LabelPrint from "./LabelPrint";
import { FaBarcode } from "react-icons/fa";

import { useRef } from "react";

const MaterialInward = () => {
  const { hasPermission } = useAuth();
  const [stocks, setstocks] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editstock, setEditstock] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
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
    fetchstocks();
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
      editstock != null ||
      barcodeModalOpen ||
      selectedStock != null ||
      showModal
  );

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      fetchstocks(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchstocks = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        status: "all",
        type: filters.type,
        uom: filters.uom,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });

      const res = await axios.get(`/stocks/get-all?${queryParams.toString()}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        setstocks(res.data.data || []);
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalResults: res.data.totalResults,
          limit: res.data.limit,
        });
      }
    } catch {
      toast.error("Failed to fetch stocks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchstocks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock?")) return;
    try {
      let res = await axios.delete(`/stocks/delete/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        toast.success("stock deleted");
        fetchstocks();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  //   const handleToggleStatus = async (id, currentStatus) => {
  //     const newStatus = currentStatus === true ? false : true;
  //     try {
  //       const res = await axios.patch(`/stocks/update-stock/${id}`, {
  //         status: newStatus,
  //       });
  //       if (res.data.status == 403) {
  //         toast.error(res.data.message);
  //         return;
  //       }

  //       if (res.data.status == 200) {
  //         toast.success(`stock status updated`);

  //         // ✅ Update local state without refetch
  //         setstocks((prev) =>
  //           prev.map((stock) =>
  //             stock._id === id ? { ...stock, status: newStatus } : stock
  //           )
  //         );
  //       } else {
  //         toast.error("Failed to update status");
  //       }
  //     } catch (err) {
  //       toast.error("Failed to update status");
  //     }
  //   };

  // const filteredstocks = stocks.filter(
  //   (u) =>
  //     u.unitName?.toLowerCase().includes(search.toLowerCase()) ||
  //     u.unitDescription?.toLowerCase().includes(search.toLowerCase()) ||
  //     u.createdBy?.fullName.toLowerCase().includes(search.toLocaleLowerCase())
  // );

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchstocks(page);
  };

  useEffect(() => {
    fetchstocks(1);
    fetchUoms();
  }, []);

  const fetchUoms = async () => {
    try {
      const res = await axios.get("/uoms/all-uoms");
      setUoms(res.data.data || []);
    } catch {
      toast.error("Failed to load UOMs");
    }
  };

  const stockTableHeaders = [
    { label: "#", className: "" },
    { label: "Created At	", className: "hidden md:table-cell" },
    { label: "Updated At	", className: "hidden md:table-cell" },
    { label: "Item Name", className: "" },
    { label: "Type", className: "" },
    { label: "Barcodes", className: "" },
    // { label: "Description", className: "" },
    // { label: "Satus", className: "" },
    { label: "Created By	", className: "hidden md:table-cell" },
    { label: "Actions", className: "" },
  ];

  return (
    <div className="relative p-2 mt-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Material Inward <span className="text-gray-500">({stocks.length})</span>
      </h2>

      <div className="flex flex-wrap gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-2 top-2 text-[#d8b76a]" />
          <input
            type="text"
            placeholder="Search Material"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
          />
        </div>
        <div className="flex flex-wrap gap-4 items-center ">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-[#d8b76a] rounded px-2 py-1.5 text-sm"
          >
            <option value="">All Types</option>
            <option value="RM">RM</option>
            <option value="SFG">SFG</option>
            <option value="FG">FG</option>
          </select>

          <select
            value={filters.uom}
            onChange={(e) => setFilters({ ...filters, uom: e.target.value })}
            className="border border-[#d8b76a] rounded px-2 py-1.5 text-sm"
          >
            <option value="">All UOM</option>
            {uoms.map((u) => (
              <option key={u._id} value={u.unitName}>
                {u.unitName}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters({ ...filters, fromDate: e.target.value })
            }
            className="border border-[#d8b76a] rounded px-2 py-1.5 text-sm"
          />

          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
            className="border border-[#d8b76a] rounded px-2 py-1.5 text-sm"
          />

          {/* <button
            disabled={
              filters.type == "" &&
              filters.fromDate == "" &&
              filters.toDate == "" &&
              filters.uom == ""
            }
            onClick={() => fetchstocks(1)}
            className="bg-[#d8b76a] hover:bg-[#b38a37] disabled:hover:bg-[#d8b76a]/50 disabled:bg-[#d8b76a]/50 disabled:cursor-not-allowed text-[#292926] font-semibold px-4 py-1.5 rounded transition duration-200 cursor-pointer"
          >
            Apply Filters
          </button> */}
          <button
            disabled={
              filters.type == "" &&
              filters.fromDate == "" &&
              filters.toDate == "" &&
              filters.uom == ""
            }
            onClick={handleResetFilters}
            className="bg-[#d8b76a] hover:bg-[#b38a37] disabled:hover:bg-[#d8b76a]/50 disabled:bg-[#d8b76a]/50 disabled:cursor-not-allowed text-[#292926] font-semibold px-4 py-1.5 rounded transition duration-200 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        {hasPermission("Material Inward", "create") && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            {formOpen ? "Close Form" : "Inward"}
          </button>
        )}
      </div>

      {formOpen && (
        <AddStockModal
          onClose={() => setFormOpen(false)}
          onAdded={fetchstocks}
        />
      )}

      <div className="overflow-x-auto rounded border border-[#d8b76a] shadow-sm">
        <table className="min-w-full text-[11px] ">
          <thead className="bg-[#d8b76a]  text-[#292926] text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5 ">#</th>
              <th className="px-2 py-1.5  hidden md:table-cell">Created At</th>
              <th className="px-2 py-1.5  hidden md:table-cell">Updated At</th>
              <th className="px-2 py-1.5 ">Type</th>
              <th className="px-2 py-1.5 ">Sku Code</th>
              <th className="px-2 py-1.5 ">Item Name</th>
              <th className="px-2 py-1.5 ">Description</th>
              <th className="px-2 py-1.5 ">Stock UOM</th>
              <th className="px-2 py-1.5 ">Stock Qty</th>
              <th className="px-2 py-1.5 ">Available Qty</th>
              <th className="px-2 py-1.5 ">Used Qty</th>
              <th className="px-2 py-1.5 ">Damaged Qty</th>
              <th className="px-2 py-1.5  hidden md:table-cell">Created By</th>
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
                {stocks.map((stock, index) => (
                  <tr
                    key={stock._id}
                    className="border-t text-[11px] border-[#d8b76a] hover:bg-gray-50 whitespace-nowrap"
                  >
                    <td className="px-2 border-r border-[#d8b76a]">
                      {Number(pagination.currentPage - 1) *
                        Number(pagination.limit) +
                        index +
                        1}
                    </td>
                    <td className="px-2 hidden md:table-cell  border-r border-[#d8b76a]">
                      {new Date(stock.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-2  hidden md:table-cell border-r border-[#d8b76a]">
                      {new Date(stock.updatedAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {stock.type || "-"}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {stock.skuCode}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {stock.itemName}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {stock.description || "-"}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {stock.stockUOM?.unitName || "-"}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {stock.stockQty}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {/* {stock.availableQty || 0} */}0
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {/* {stock.usedQty || 0} */}0
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {/* {stock.damagedQty || 0} */}0
                    </td>

                    <td className="px-2  border-r border-[#d8b76a]">
                      {" "}
                      {stock.createdBy?.fullName || "-"}
                    </td>

                    <td className="px-2 py-1 flex gap-3 text-sm text-[#d8b76a]">
                      <button
                        onClick={() => handleViewBarcodes(stock)}
                        className="text-[#d8b76a] hover:underline text-[11px] cursor-pointer"
                      >
                        <FaBarcode
                          data-tooltip-id="statusTip"
                          data-tooltip-content="View Barcodes"
                        />
                      </button>
                      {hasPermission("Material Inward", "update") ? (
                        <FiEdit
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Edit"
                          className="hover:text-blue-500 cursor-pointer"
                        />
                      ) : (
                        "-"
                      )}

                      {hasPermission("Material Inward", "delete") ? (
                        <FiTrash2
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Delete"
                          className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                          onClick={() => handleDelete(stock._id)}
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
                ))}
                {stocks.length === 0 && (
                  <tr>
                    <td colSpan="14" className="text-center py-4 text-gray-500">
                      No stocks found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {barcodeModalOpen && selectedStock && (
        <LabelPrint
          stock={selectedStock}
          onClose={() => setBarcodeModalOpen(false)}
        />
      )}

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        totalResults={pagination.totalResults}
        onEntriesChange={(limit) => {
          setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
          fetchstocks(1, limit);
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
          fetchstocks(page, pagination.limit);
        }}
      />
    </div>
  );
};

export default MaterialInward;
