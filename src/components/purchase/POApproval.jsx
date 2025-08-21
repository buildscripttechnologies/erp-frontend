import React, { useEffect, useRef, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import { FaCircleArrowDown, FaCircleArrowUp } from "react-icons/fa6";
import TableSkeleton from "../TableSkeleton";
import Toggle from "react-toggle";
// import AddSfgModal from "./AddSfgModel";
// import UpdateSfgModal from "./UpdateSFGModel";
import PaginationControls from "../PaginationControls";
import { FaFileDownload } from "react-icons/fa";
import ScrollLock from "../ScrollLock";
import AttachmentsModal from "../AttachmentsModal";
import { Tooltip } from "react-tooltip";
import { generateBOM } from "../../utils/generateBOMPdf";
import { debounce } from "lodash";
import AddPO from "./AddPO";
import POADetails from "./POADetails";
import PurchaseOrderBill from "./POBill";

const POApprovel = ({ isOpen }) => {
  const [pos, setPos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  // const [openAttachments, setOpenAttachments] = useState(null);
  const [poBill, setPObill] = useState(null);
  const [showAddPO, setShowAddPO] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [expandedPOId, setExpandedPOId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const hasMountedRef = useRef(false);
  ScrollLock(showAddPO == true || editingPO != null);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      fetchPOs(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const toogleAddPO = (prev) => {
    setShowAddPO(!prev);
  };

  const fetchPOs = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/pos/get-all?page=${page}&limit=${limit}&search=${search}`
      );
      setPos(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch POs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchPOs(page);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await axios.patch(`/pos/update/${id}`, {
        status: newStatus,
      });

      if (res.data.status == 200) {
        toast.success(`SFG status updated`);

        // ✅ Update local state without refetch
        setSfgs((prev) =>
          prev.map((sfg) =>
            sfg.id === id ? { ...sfg, status: newStatus } : sfg
          )
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PO?")) return;
    try {
      let res = await axios.delete(`/pos/delete/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.data.status == 200) {
        toast.success("PO deleted");
        fetchPOs();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-3 max-w-[99vw] mx-auto overflow-x-hidden mt-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        PO Approval <span className="text-gray-500">({pos.length})</span>
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-2 text-primary" />
          <input
            type="text"
            placeholder="Search by Order No, Vendor Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
          />
        </div>
        {/* <button
          onClick={() => toogleAddPO(showAddPO)}
          className="w-full sm:w-auto justify-center bg-primary hover:bg-primary/80 text-secondary font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200 cursor-pointer"
        >
          <FiPlus /> Add PO
        </button> */}
      </div>
      {/* {showAddPO && (
        <AddPO
          onClose={() => toogleAddPO(showAddPO)}
          onAdded={() => (fetchPOs(), toogleAddPO(showAddPO))}
        />
      )} */}

      <div className="relative overflow-x-auto  overflow-y-auto rounded border border-primary shadow-sm">
        <div className={` ${isOpen ? `max-w-[40.8vw]` : `max-w-[98vw]`}`}>
          <table
            className={"text-[11px] whitespace-nowrap min-w-[100vw] capitalize"}
          >
            <thead className="bg-primary text-secondary text-left ">
              <tr>
                <th className="px-[8px] py-1">#</th>
                <th className="px-[8px] py-1">Created At</th>
                <th className="px-[8px] py-1">Purchase Order No</th>
                <th className="px-[8px] py-1">Date</th>
                <th className="px-[8px] py-1">Vendor Name</th>
                <th className="px-[8px] py-1">Total Amount (₹)</th>
                <th className="px-[8px] py-1">Status</th>
                <th className="px-[8px] py-1">Created By</th>
                <th className="px-[8px] py-1">Action</th>
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
                  {pos.map((po, index) => (
                    <React.Fragment key={po._id}>
                      <tr
                        onClick={() =>
                          setExpandedPOId(
                            expandedPOId === po._id ? null : po._id
                          )
                        }
                        className="border-t  border-primary hover:bg-gray-50 cursor-pointer "
                      >
                        <td className="px-[8px] py-1  border-r border-r-primary ">
                          {Number(pagination.currentPage - 1) *
                            Number(pagination.limit) +
                            index +
                            1}
                        </td>
                        <td className="px-[8px]  border-r border-r-primary">
                          {new Date(po.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="px-[8px]  border-r border-r-primary">
                          {po.poNo}
                        </td>
                        <td className="px-[8px]  border-r border-r-primary">
                          {new Date(po.date).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-[8px]  border-r border-r-primary ">
                          {po.vendor?.vendorName || "-"}
                        </td>

                        <td className="px-[8px]  border-r border-r-primary">
                          {po.totalAmount || "-"}
                        </td>

                        <td
                          className={`px-[8px] border-r font-bold border-r-primary capitalize `}
                        >
                          <span
                            className={`${
                              po.status == "pending"
                                ? "bg-yellow-200"
                                : po.status == "rejected"
                                ? "bg-red-200"
                                : "bg-green-200"
                            }  py-0.5 px-1 rounded`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="px-[8px]  border-r border-r-primary">
                          {po.createdBy?.fullName || "-"}
                        </td>
                        <td className="px-[8px] pt-1 text-sm flex gap-2 border-r border-r-primary/30">
                          <FaFileDownload
                            onClick={() => generateBOM(po)}
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Download"
                            className="cursor-pointer text-primary hover:text-green-600"
                          />
                          {/* <FiEdit
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Edit"
                            className="cursor-pointer text-primary hover:text-blue-600"
                            onClick={() => setEditingSfg(po)}
                          />
                          <FiTrash2
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Delete"
                            className="cursor-pointer text-primary hover:text-red-600"
                            onClick={() => handleDelete(po._id)}
                          /> */}
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
                      {expandedPOId === po._id && (
                        <>
                          <tr className="">
                            <td colSpan="100%">
                              <POADetails PO={po} />
                            </td>
                          </tr>
                          <tr className="">
                            <td colSpan={7}></td>
                            <td className="max-w-[70px] pb-2 font-bold">
                              <button
                                onClick={() => setPObill(po)}
                                className="px-4 py-1 mr-2  bg-green-200 hover:bg-green-300 text-[#292926]  rounded cursor-pointer"
                              >
                                Approve
                              </button>
                              <button className="px-4 py-1 bg-red-200 hover:bg-red-300 text-[#292926]  rounded cursor-pointer">
                                Reject
                              </button>
                            </td>
                          </tr>
                        </>
                      )}
                    </React.Fragment>
                  ))}
                  {pos.length === 0 && (
                    <tr>
                      <td
                        colSpan="14"
                        className="text-center py-4 text-gray-500"
                      >
                        No Purchase Order found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {poBill != null && (
        <PurchaseOrderBill po={poBill} onClose={() => setPObill(null)} />
      )}

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        totalResults={pagination.totalResults}
        onEntriesChange={(limit) => {
          setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
          fetchPOs(1, limit);
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
          fetchPOs(page, pagination.limit);
        }}
      />
    </div>
  );
};

export default POApprovel;
