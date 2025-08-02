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

import { useRef } from "react";

const StockRegister = () => {
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

  const [selectedStock, setSelectedStock] = useState(null);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
      const res = await axios.get(
        `/stocks/get-all?page=${page}&limit=${limit}&search=${search}&status="all"`
      );
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
  }, []);

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
        Stock Register <span className="text-gray-500">({stocks.length})</span>
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-2 top-2 text-[#d8b76a]" />
          <input
            type="text"
            placeholder="Search Unit of Measure"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
          />
        </div>

        {hasPermission("User", "create") && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            {formOpen ? "Close Form" : "Add stock"}
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
              <th className="px-2 py-1.5 ">Item Name</th>
              <th className="px-2 py-1.5 ">Sku Code</th>
              <th className="px-2 py-1.5 ">Type</th>
              <th className="px-2 py-1.5 ">Barcodes</th>
              {/* <th className="px-2 py-1.5 ">Description</th> */}
              {/* <th className="px-2 py-1.5 ">Status</th> */}
              <th className="px-2 py-1.5  hidden md:table-cell">Created By</th>
              <th className="px-2 py-1.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={stockTableHeaders}
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
                      {stock.itemName}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {stock.skuCode}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      {stock.type || "-"}
                    </td>
                    <td className="px-2  border-r border-[#d8b76a]">
                      <button
                        onClick={() => handleViewBarcodes(stock)}
                        className="text-[#d8b76a] hover:underline text-[11px] cursor-pointer"
                      >
                        View Barcodes
                      </button>
                      {barcodeModalOpen && selectedStock && (
                        <LabelPrint
                          stock={selectedStock}
                          onClose={() => setBarcodeModalOpen(false)}
                        />
                      )}
                      {/* {barcodeModalOpen && selectedStock && (
                        <BarcodeModal
                          stock={selectedStock}
                          onClose={() => setBarcodeModalOpen(false)}
                        />
                      )} */}
                    </td>
                    {/* <td className="px-2  border-r border-[#d8b76a]">
                      <Toggle
                        checked={stock.status}
                        onChange={() =>
                          handleToggleStatus(stock._id, stock.status)
                        }
                      />
                    </td> */}
                    <td className="px-2  hidden md:table-cell border-r border-[#d8b76a]">
                      {stock.createdBy?.fullName || "-"}
                    </td>
                    <td className="px-2 py-1 flex gap-3 text-sm text-[#d8b76a]">
                      {/* {hasPermission("stock", "update") ? (
                        <FiEdit
                          data-tooltip-id="statusTip"
                          data-tooltip-content="Edit"
                          className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                          onClick={() => setEditstock(stock)}
                        />
                      ) : (
                        "-"
                      )} */}
                      {hasPermission("stock", "delete") ? (
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
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No stocks found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {editstock && (
        <EditstockModal
          stock={editstock}
          onClose={() => setEditstock(null)}
          onUpdated={fetchstocks}
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
