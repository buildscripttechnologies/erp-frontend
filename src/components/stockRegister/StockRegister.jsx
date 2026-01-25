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
    <div className="relative p-2 mt-2 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <div className="mb-2 pt-4">
        <h2 className="text-lg sm:text-xl font-bold mb-3 bg-gray-800 text-white px-4 py-3 rounded-t-lg">
          Stock Register
          <span className="text-gray-300 ml-2 font-normal">({pagination.totalResults})</span>
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between mb-3">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Stock"
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

        <div className="flex flex-wrap gap-2 items-center justify-end">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none pr-6 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg%20fill=%22%23666%22%20height=%2224%22%20viewBox=%220%200%2024%2024%22%20width=%2224%22%20xmlns=%22http://www.w3.org/2000/svg%22><path%20d=%22M7%2010l5%205%205-5z%22/></svg>')] bg-right bg-contain"
          >
            <option value="">All Types</option>
            <option value="RM">RM</option>
            <option value="SFG">SFG</option>
            <option value="FG">FG</option>
          </select>
          <select
            value={filters.uom}
            onChange={(e) => setFilters({ ...filters, uom: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none pr-6 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg%20fill=%22%23666%22%20height=%2224%22%20viewBox=%220%200%2024%2024%22%20width=%2224%22%20xmlns=%22http://www.w3.org/2000/svg%22><path%20d=%22M7%2010l5%205%205-5z%22/></svg>')] bg-right bg-contain"
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
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
            placeholder="From"
          />
          <input
            type="date"
            value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
              placeholder="To"
            />
          <button
            disabled={
              filters.type == "" &&
              filters.fromDate == "" &&
              filters.toDate == "" &&
              filters.uom == ""
            }
            onClick={handleResetFilters}
            className="bg-primary hover:bg-[#b38a37] disabled:hover:bg-primary/50 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-semibold px-3 py-1.5 rounded transition duration-200 cursor-pointer text-xs"
          >
            Reset
          </button>
          {showExportOptions && (
            <div className="flex gap-2 items-center">
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value)}
                className="border border-gray-300 px-2 py-1.5 rounded text-xs text-black cursor-pointer"
              >
                <option value="current">This Page</option>
                <option value="filtered">Filtered</option>
                <option value="all">All</option>
              </select>

              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="border border-gray-300 px-2 py-1.5 rounded text-xs text-black cursor-pointer"
              >
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>

              <button
                disabled={downloading}
                onClick={handleExport}
                className="bg-primary hover:bg-[#b38a37] text-white font-semibold px-3 py-1.5 rounded transition cursor-pointer text-xs"
              >
                {downloading ? (
                  <span className="flex justify-center items-center gap-1">
                    <ClipLoader size={4} color="white" />
                  </span>
                ) : (
                  "Download"
                )}
              </button>
            </div>
          )}
          <button
            onClick={toggleExportOptions}
            className="bg-primary cursor-pointer hover:bg-[#b38a37] text-white font-semibold px-3 py-1.5 rounded flex justify-center items-center whitespace-nowrap transition text-xs"
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

      <div className="overflow-x-auto border border-gray-300 rounded-b-lg shadow-sm bg-white">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-800 text-white text-left sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 font-semibold">#</th>
              <th className="px-3 py-2 font-semibold">Type</th>
              <th className="px-3 py-2 font-semibold">Sku Code</th>
              <th className="px-3 py-2 font-semibold">Item Name</th>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 font-semibold">Stock UOM</th>
              <th className="px-3 py-2 font-semibold">Stock Qty</th>
              <th className="px-3 py-2 font-semibold">Available Qty</th>
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
                      className={`text-xs transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50 cursor-pointer`}
                    >
                      <td className="px-3 py-2 font-medium text-gray-700">
                        {Number(pagination.currentPage - 1) *
                          Number(pagination.limit) +
                          index +
                          1}
                      </td>

                      <td className="px-3 py-2 text-gray-600">
                        {stock.type || "-"}
                      </td>
                      <td className="px-3 py-2 text-gray-700 font-mono">
                        {stock.skuCode}
                      </td>
                      <td className="px-3 py-2 text-gray-800 font-medium">
                        {stock.itemName}
                      </td>
                      <td className="px-3 py-2 text-gray-600 truncate max-w-xs">
                        {stock.description || "-"}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {stock.stockUOM?.unitName || "-"}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {stock.stockQty?.toFixed(2) || 0}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {stock.availableQty?.toFixed(2) || 0}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {stock.damagedQty.toFixed(2) || 0}
                      </td>

                      <td className="px-3 py-2 text-gray-600">
                        {stock.moq || 0}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {stock.gst?.toFixed(2) || 0}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {stock.rate?.toFixed(2) || 0}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {stock.baseAmount?.toFixed(2) || 0}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {stock.gstAmount?.toFixed(2) || 0}
                      </td>
                      <td className="px-3 py-2 text-gray-800 font-semibold">
                        {stock.totalAmount?.toFixed(2) || 0}
                      </td>
                      <td className="px-3 py-2">
                        <TbTransfer
                          className="text-primary hover:text-[#b38a37] text-base cursor-pointer transition"
                          onClick={() => {
                            setSelectedItem(stock); // set the row item you clicked
                            setOpenTransferModal(true);
                          }}
                        />
                      </td>
                    </tr>
                    {expandedStockId === stock._id && (
                      <tr className="bg-blue-50">
                        <td colSpan="100%" className="px-4 py-3">
                          {stock?.attachments?.[0]?.fileUrl ? (
                            <img
                              src={stock?.attachments?.[0]?.fileUrl}
                              alt={stock?.itemName}
                              className="w-30 h-30 object-contain pl-5 rounded"
                            />
                          ) : (
                            <div className="flex items-center justify-center text-gray-500">
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

      <div className="mt-3">
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
    </div>
  );
};

export default StockRegister;
