import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";

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

const Cutting = () => {
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

      const res = await axios.get(`/mi/cutting?${queryParams.toString()}`);
      console.log("mis res", res);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Material Issue?"))
      return;
    try {
      let res = await axios.delete(`/mi/delete/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        toast.success("Material Issue deleted");
        fetchMis();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchMis(1);
    // fetchUoms();
  }, []);

  return (
    <div className="relative p-2 mt-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Cutting Job{" "}
        <span className="text-gray-500">({pagination.totalResults})</span>
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

        {/* {hasPermission("Material Issue", "create") && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full sm:w-auto justify-center cursor-pointer bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200"
          >
            <FiPlus />
            {formOpen ? "Close Form" : "Issue Material"}
          </button>
        )} */}
      </div>

      {formOpen && (
        <Add
          isOpen={formOpen}
          setIsOpen={setFormOpen}
          onClose={() => setFormOpen(false)}
          onAdded={fetchMis}
        />
      )}

      <div className="overflow-x-auto rounded border border-[#d8b76a] shadow-sm">
        <table className="min-w-full text-[11px] ">
          <thead className="bg-[#d8b76a]  text-[#292926] text-left whitespace-nowrap">
            <tr>
              <th className="px-2 py-1.5 ">#</th>
              <th className="px-2 py-1.5  ">Created At</th>
              <th className="px-2 py-1.5  ">Updated At</th>
              <th className="px-2 py-1.5 ">Prod No</th>
              <th className="px-2 py-1.5 ">BOM No</th>
              <th className="px-2 py-1.5 ">Product Name</th>
              <th className="px-2 py-1.5 ">Status</th>
              <th className="px-2 py-1.5 ">Created By</th>
              <th className="px-2 py-1.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                rows={pagination.limit}
                columns={Array(9).fill({})}
              />
            ) : (
              <>
                {mi.map((mi, index) => (
                  <React.Fragment key={mi._id}>
                    <tr
                      key={mi._id}
                      className="border-t text-[11px] border-[#d8b76a] hover:bg-gray-50 whitespace-nowrap"
                      onClick={() =>
                        setExpandedMIId(expandedMIId === mi._id ? null : mi._id)
                      }
                    >
                      <td className="px-2 border-r border-[#d8b76a]">
                        {Number(pagination.currentPage - 1) *
                          Number(pagination.limit) +
                          index +
                          1}
                      </td>
                      <td className="px-2 hidden md:table-cell  border-r border-[#d8b76a]">
                        {new Date(mi.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-2  hidden md:table-cell border-r border-[#d8b76a]">
                        {new Date(mi.updatedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-2  border-r border-[#d8b76a]">
                        {mi.prodNo || "-"}
                      </td>
                      <td className="px-2  border-r border-[#d8b76a]">
                        {mi.bomNo}
                      </td>
                      <td className="px-2  border-r border-[#d8b76a]">
                        {mi.bom.productName}
                      </td>
                      <td className="px-2  border-r border-[#d8b76a]">
                        <span
                          className={`${
                            mi.status == "pending"
                              ? "bg-yellow-200"
                              : "bg-green-200"
                          }  py-0.5 px-1 rounded font-bold capitalize `}
                        >
                          {mi.status || "-"}
                        </span>
                      </td>

                      <td className="px-2  border-r border-[#d8b76a]">
                        {mi.createdBy?.fullName || "-"}
                      </td>

                      <td className="px-2 py-1 flex gap-3 text-sm text-[#d8b76a]">
                        {hasPermission("Material Inward", "update") ? (
                          <FiEdit
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Edit"
                            className="hover:text-blue-500 cursor-pointer"
                            // onClick={() => {
                            //   setEditMIData(mi);
                            //   setEditModalOpen(true);
                            // }}
                          />
                        ) : (
                          "-"
                        )}

                        {hasPermission("Material Inward", "delete") ? (
                          <FiTrash2
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Delete"
                            className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                            // onClick={() => handleDelete(mi._id)}
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
                    {expandedMIId === mi._id && (
                      <tr className="">
                        <td colSpan="100%">
                          <MIdetails MI={mi} filter="cutting" />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {mi.length === 0 && (
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

export default Cutting;
