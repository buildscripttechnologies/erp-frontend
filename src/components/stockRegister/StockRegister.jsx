import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiDownload,
  FiX,
} from "react-icons/fi";

import TableSkeleton from "../TableSkeleton";
import ScrollLock from "../ScrollLock";
import PaginationControls from "../PaginationControls";
import { debounce } from "lodash";

import { useRef } from "react";
import { exportStockToPDF, exportToExcel } from "../../utils/exportData";
import { TbTransfer } from "react-icons/tb";
import StockTransfer from "./StockTransfer";

const StockRegister = () => {
  const [stocks, setstocks] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editstock] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });
  const [overallTotalAmount, setOverallTotalAmount] = useState();
  const [expandedStockId, setExpandedStockId] = useState(null);
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
  const [downloading, setDownloading] = useState(false);
  const [uoms, setUoms] = useState([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportScope, setExportScope] = useState("current");
  const [exportFormat, setExportFormat] = useState("excel");
  const hasMountedRef = useRef(false);

  const [openTransferModal, setOpenTransferModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);


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

      const res = await axios.get(
        `/stocks/get-all-merged?${queryParams.toString()}`
      );
      console.log("stock res", res.data);

      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        setOverallTotalAmount(res.data.overallTotalAmount || "");
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

  const data = (data) => {
    return data.map((e) => ({
      skuCode: e.skuCode || "",
      itemName: e.itemName || "",
      description: e.description || "",
      stockUOM: e.stockUOM?.unitName || "",
      stockQty: e.stockQty || 0,
      availableQty: e.availableQty || 0,
      damagedQty: e.damagedQty || 0,
      moq: e.moq || 0,
      amount: e.amount || 0,
    }));
  };

  const handleExport = async () => {
    try {
      setDownloading(true);

      let exportData = [];

      if (exportScope === "current" || exportScope === "filtered") {
        exportData = data(stocks);
        generateExportFile(exportData); // Synchronous export
        setDownloading(false);
      } else {
        // Export all: fetch full data from backend first
        const res = await axios.get("/stocks/get-all-merged", {
          params: { limit: pagination.totalResults },
        });

        exportData = data(res.data.data);
        generateExportFile(exportData);
        setDownloading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to export data");
      setDownloading(false);
    }
  };

  const generateExportFile = (data) => {
    if (exportFormat === "excel") {
      exportToExcel(data, "Stock");
    } else {
      exportStockToPDF(data);
    }
  };
  const toggleExportOptions = () => {
    setShowExportOptions((prev) => !prev);
  };

  return (
    <div className="relative p-2 mt-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Stock <span className="text-gray-500">({pagination.totalResults})</span>
      </h2>

      <div className="flex flex-wrap gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-2 top-2 text-primary" />
          <input
            type="text"
            placeholder="Search Stock"
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
            <label htmlFor="From Date">From : </label>
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
            <label htmlFor="To Date">To : </label>
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
            className="bg-primary hover:bg-[#b38a37] disabled:hover:bg-primary/50 disabled:bg-primary/50 disabled:cursor-not-allowed text-[#292926] font-semibold px-4 py-1.5 rounded transition duration-200 cursor-pointer"
          >
            Reset Filters
          </button>{" "}
          {showExportOptions && (
            <div className="flex gap-2 items-center">
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value)}
                className="border border-primary px-3 py-1.5 rounded text-sm text-black cursor-pointer"
              >
                <option value="current">This Page</option>
                <option value="filtered">Filtered Data</option>
                <option value="all">All Data</option>
              </select>

              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="border border-primary px-3 py-1.5 rounded text-sm text-black cursor-pointer"
              >
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>

              <button
                disabled={downloading}
                onClick={handleExport}
                className="bg-primary hover:bg-primary/80 text-secondary font-semibold px-4 py-1.5 rounded transition cursor-pointer"
              >
                {downloading ? (
                  <span className="flex justify-center items-center gap-1">
                    {/* Downloading */}
                    <BeatLoader size={4} color="#292926" />
                  </span>
                ) : (
                  "Download"
                )}
              </button>
            </div>
          )}
          <button
            onClick={toggleExportOptions}
            className="bg-primary cursor-pointer hover:bg-primary/80 text-secondary font-semibold px-4 py-1.5 rounded flex justify-center items-center whitespace-nowrap transition"
          >
            <FiDownload className="mr-2" /> Export
          </button>
        </div>
      </div>

      {formOpen && (
        <AddStockModal
          onClose={() => setFormOpen(false)}
          onAdded={fetchstocks}
        />
      )}
      <div className="flex justify-end">
        <p className="text-red-600 font-bold text-sm">
          {overallTotalAmount ? `TotalAmount : ₹${overallTotalAmount}` : ""}
        </p>
      </div>
      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="min-w-full text-[11px] ">
          <thead className="bg-primary  text-[#292926] text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5 ">#</th>
              <th className="px-2 py-1.5 ">Type</th>
              {/* <th className="px-2 py-1.5 ">Image</th> */}
              <th className="px-2 py-1.5 ">Sku Code</th>
              <th className="px-2 py-1.5 ">Item Name</th>
              <th className="px-2 py-1.5 ">Description</th>
              <th className="px-2 py-1.5 ">Stock UOM</th>
              <th className="px-2 py-1.5 ">Stock Qty</th>
              <th className="px-2 py-1.5 ">Available Qty</th>
              <th className="px-2 py-1.5 ">Damaged Qty</th>
              <th className="px-2 py-1.5 ">MOQ</th>
              {/* <th className="px-2 py-1.5 ">Base Rate</th> */}
              <th className="px-2 py-1.5 ">GST (%)</th>
              <th className="px-2 py-1.5 ">Rate</th>
              <th className="px-2 py-1.5 ">Net Amount</th>
              <th className="px-2 py-1.5 ">GST Amount</th>
              <th className="px-2 py-1.5 ">Total Amount</th>
              <th className="px-2 py-1.5 ">Transfer</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={Array(15).fill({})}
              />
            ) : (
              <>
                {stocks.map((stock, index) => (
                  <React.Fragment key={stock._id}>
                    <tr
                      key={stock._id}
                      onClick={() =>
                        setExpandedStockId(
                          expandedStockId === stock._id ? null : stock._id
                        )
                      }
                      className="border-t text-[11px] border-primary hover:bg-gray-50 whitespace-nowrap"
                    >
                      <td className="px-2 py-1 border-r border-primary">
                        {Number(pagination.currentPage - 1) *
                          Number(pagination.limit) +
                          index +
                          1}
                      </td>

                      <td className="px-2  border-r border-primary">
                        {stock.type || "-"}
                      </td>                        
                      <td className="px-2  border-r border-primary">
                        {stock.skuCode}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {stock.itemName}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {stock.description || "-"}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {stock.stockUOM?.unitName || "-"}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {stock.stockQty?.toFixed(2) || 0}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {stock.availableQty?.toFixed(2) || 0}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {stock.damagedQty.toFixed(2) || 0}
                      </td>

                      <td className="px-2  border-r border-primary ">
                        {stock.moq || 0}
                      </td>
                      <td className="px-2  border-r border-primary  ">
                        {stock.gst?.toFixed(2) || 0}
                      </td>
                      <td className="px-2   border-r border-primary ">
                        {stock.rate?.toFixed(2) || 0}
                      </td>
                      <td className="px-2   border-r border-primary ">
                        {stock.baseAmount?.toFixed(2) || 0}
                      </td>
                      <td className="px-2   border-r border-primary ">
                        {stock.gstAmount?.toFixed(2) || 0}
                      </td>
                      <td className="px-2  border-r border-primary">
                        {stock.totalAmount?.toFixed(2) || 0}
                      </td>
                      <td className="px-2 ">
                        <TbTransfer
                          className="text-primary hover:text-blue-500 text-base cursor-pointer"
                          onClick={() => {
                            setSelectedItem(stock); // set the row item you clicked
                            setOpenTransferModal(true);
                          }}
                        />
                      </td>
                    </tr>
                    {expandedStockId === stock._id && (
                      <tr className="border-t border-primary">
                        <td colSpan="100%" className="px-4 py-2 ">
                          {stock?.attachments?.[0]?.fileUrl ? (
                            <img
                              src={stock?.attachments?.[0]?.fileUrl}
                              alt={stock?.itemName}
                              className="w-30 h-30 object-contain pl-5 rounded"
                            />
                          ) : (
                            <div className=" flex items-center justify-center">
                              No Image Available
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {stocks.length === 0 && (
                  <tr>
                    <td
                      colSpan="100%"
                      className="text-center py-4 text-gray-500"
                    >
                      No stocks found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {openTransferModal && selectedItem && (
        <StockTransfer
          item={selectedItem}
          onTransfer={() => {
            fetchstocks();
            setOpenTransferModal(false);
          }}
          onClose={() => setOpenTransferModal(false)}
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

export default StockRegister;
