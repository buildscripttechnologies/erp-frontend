import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";

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
// import LabelPrint from "./LabelPrint";
import { FaBarcode } from "react-icons/fa";

import { useRef } from "react";
import UpdateStockModal from "./UpdateStockModal";
import { makeLabelPdf } from "./makeStickerPdf";
import { ClipLoader, PulseLoader } from "react-spinners";

const MaterialInward = () => {
  const { hasPermission } = useAuth();
  const [stocks, setstocks] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editstock, setEditStock] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const [filters, setFilters] = useState({
    movementType: "",
    uom: "",
    fromDate: "",
    toDate: "",
  });

  const handleResetFilters = () => {
    setFilters({
      movementType: "",
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
    showModal ||
    showEditModal
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
        movementType: filters.movementType,
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
        console.log("stocks fetched:", res.data.data);
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
    if (!window.confirm("Are you sure you want to delete this material?"))
      return;
    try {
      let res = await axios.delete(`/stocks/delete/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        toast.success("material deleted");
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

  const handleEdit = (stock) => {
    setEditStock(stock);
    setShowEditModal(true);
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

  const handlePrint = async (stock) => {
    if (stock.movementType !== "GRN") {
      alert("Barcodes can only be printed from GRN entries");
      return;
    }

    if (!stock.barcodes?.length) {
      alert("No barcode data available");
      return;
    }

    try {
      setGeneratingId(stock._id);   // 🔥 correct id
      await makeLabelPdf(stock);
    } finally {
      setGeneratingId(null);
    }
  };



  return (
    <div className="relative p-2 mt-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">
        Material Stock Ledger <span className="text-primary">({stocks.length})</span>
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
          />{" "}
          {search && (
            <FiX
              className="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-primary transition"
              onClick={() => setSearch("")}
              title="Clear"
            />
          )}
        </div>
        <div className="flex flex-wrap gap-4 items-center ">
          <select
            value={filters.movementType}
            onChange={(e) =>
              setFilters({ ...filters, movementType: e.target.value })
            }
            className="border border-primary rounded px-2 py-1.5 text-sm"
          >
            <option value="">All Movements</option>
            <option value="GRN">GRN</option>
            <option value="ISSUE">ISSUE</option>
            <option value="SALE">SALE</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="DAMAGE">DAMAGE</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
            <option value="REVERSAL">REVERSAL</option>
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

          {/* <button
            disabled={
              filters.type == "" &&
              filters.fromDate == "" &&
              filters.toDate == "" &&
              filters.uom == ""
            }
            onClick={() => fetchstocks(1)}
            className="bg-primary hover:bg-[#b38a37] disabled:hover:bg-primary/50 disabled:bg-primary/50 disabled:cursor-not-allowed text-[#292926] font-semibold px-4 py-1.5 rounded transition duration-200 cursor-pointer"
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
            className="bg-primary hover:bg-primary/80  disabled:bg-primary/50 disabled:cursor-not-allowed text-secondary font-semibold px-4 py-1.5 rounded transition duration-200 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        {hasPermission("Material Inward", "write") && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-primary hover:bg-primary/80 text-secondary font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            {formOpen ? "Close Form" : "Inward"}
          </button>
        )}
      </div>

      {formOpen && (
        <AddStockModal
          isOpen={formOpen}
          setIsOpen={setFormOpen}
          onClose={() => setFormOpen(false)}
          onAdded={fetchstocks}
        />
      )}

      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="min-w-full text-[11px]">
          <thead className="bg-primary text-secondary text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5">#</th>
              <th className="px-2 py-1.5">Date</th>
              <th className="px-2 py-1.5">SKU</th>
              <th className="px-2 py-1.5">Item Name</th>
              <th className="px-2 py-1.5">Movement</th>
              <th className="px-2 py-1.5">Qty</th>
              <th className="px-2 py-1.5">UOM</th>
              <th className="px-2 py-1.5">Warehouse</th>
              <th className="px-2 py-1.5">Reference</th>
              <th className="px-2 py-1.5">Remarks</th>
              <th className="px-2 py-1.5">GRN Number</th>
              <th className="px-2 py-1.5">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableSkeleton rows={pagination.limit} columns={Array(10).fill({})} />
            ) : (
              <>
                {stocks.map((stock, index) => (
                  <tr
                    key={stock._id}
                    className="border-t border-primary hover:bg-gray-50 whitespace-nowrap"
                  >
                    {/* SR NO */}
                    <td className="px-2 py-1 border-r border-primary">
                      {Number(pagination.currentPage - 1) *
                        Number(pagination.limit) +
                        index +
                        1}
                    </td>

                    {/* DATE */}
                    <td className="px-2 py-1 border-r border-primary">
                      {new Date(stock.date).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>

                    {/* SKU */}
                    <td className="px-2 py-1 border-r border-primary">
                      {stock.skuCode}
                    </td>

                    {/* ITEM */}
                    <td className="px-2 py-1 border-r border-primary">
                      {stock.itemName}
                    </td>

                    {/* MOVEMENT */}
                    <td className="px-2 py-1 border-r border-primary">
                      <span
                        className={`px-2 py-0.5 rounded text-white font-bold ${stock.qty > 0 ? "bg-green-600" : "bg-red-600"
                          }`}
                      >
                        {stock.movementType}
                      </span>
                    </td>

                    {/* QTY */}
                    <td className="px-2 py-1 border-r border-primary font-bold">
                      {stock.qty > 0 ? "+" : ""}
                      {stock.qty}
                    </td>

                    {/* UOM */}
                    <td className="px-2  py-1 border-r border-primary">
                      {stock.stockUOM}
                    </td>

                    {/* WAREHOUSE */}
                    <td className="px-2  py-1 border-r border-primary">
                      {stock.warehouse}
                    </td>

                    {/* REFERENCE */}
                    {/* <td className="px-2 border-r border-primary text-blue-600">
                      {stock.referenceId || "-"}
                    </td> */}

                    {/* MOVEMENT */}
                    <td className="px-2 py-1 border-r border-primary">
                      <span
                        className={`px-2 py-0.5 rounded text-white font-bold ${stock.qty > 0 ? "bg-green-600" : "bg-red-600"
                          }`}
                      >
                        {stock.referenceId}
                      </span>
                    </td>

                    {/* REMARKS */}
                    <td className="px-2 py-1 border-r border-primary">
                      {stock.remarks || "-"}
                    </td>

                    {/* GRN Number */}
                    <td className="px-2 py-1 border-r border-primary">
                      <span
                        className={`px-2 py-0.5 rounded text-white font-bold ${stock.qty > 0 ? "bg-green-600" : "bg-red-600"
                          }`}
                      >
                        {stock.grnNumber}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-2 py-1 flex gap-3 text-sm text-primary">
                      {/* <button
                        onClick={() => handleView(stock)}
                        className="hover:underline text-[11px]"
                      >
                        View
                      </button> */}

                      <button disabled={generatingId === stock._id} onClick={() => handlePrint(stock)} className="text-[#287278] hover:underline text-[11px] cursor-pointer" > {generatingId === stock._id ? (<PulseLoader size={4} color="#287278" />) : (<FaBarcode data-tooltip-id="statusTip" data-tooltip-content="View Barcodes" />)} </button>


                      {/* {hasPermission("Stock Register", "delete") ? (
                        <FiTrash2
                          className="cursor-pointer hover:text-red-600"
                          onClick={() => handleDelete(stock.referenceId)}
                        />
                      ) : (
                        "-"
                      )} */}
                    </td>
                  </tr>
                ))}

                {stocks.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center py-4 text-gray-500">
                      No stock movements found.
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
      {/* Update Stock Modal */}
      {showEditModal && (
        <UpdateStockModal
          stockData={editstock}
          onClose={() => setShowEditModal(false)}
          onUpdated={fetchstocks} // refetch after update
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
