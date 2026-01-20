// src/components/BOMMaster.jsx
import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import {FiSearch, FiX } from "react-icons/fi";
import TableSkeleton from "../TableSkeleton";
import ScrollLock from "../ScrollLock";
import PaginationControls from "../PaginationControls";
import UpdateBomModal from "../master/bom/UpdateBomModal";
import { useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { debounce } from "lodash";
import AddBomModal from "../master/bom/AddBOMModel";
import { MdCancel } from "react-icons/md";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { Tooltip } from "react-tooltip";

const COP = ({ isOpen }) => {
  const { hasPermission } = useAuth();

  const [COs, setCOs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [bomModalItem, setBomModalItem] = useState(false);
  const [editingBOM, setEditingBOM] = useState(null);
  const [expandedCOId, setExpandedCOId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      fetchCOs(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchCOs = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/cos/get-all?page=${page}&search=${search}&limit=${limit}`
      );
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      setCOs(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch BOMs");
    } finally {
      setLoading(false);
    }
  };

  ScrollLock(bomModalItem != null);

  useEffect(() => {
    fetchCOs();
  }, []);

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to Reject this CO?")) return;
    try {
      const res = await axios.patch(`/cos/update/${id}`, {
        status: "Rejected",
      });
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

      if (res.data.status == 200) {
        toast.success(`CO Status Updated`);

        // ✅ Update local state without refetch
        setCOs((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: "Rejected" } : c))
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };


  return (
    <>
      <div className="p-3 max-w-[99vw] mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          CO Pendency
          <span className="text-gray-500">({pagination.totalResults})</span>
        </h2>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-primary" />
            <input
              type="text"
              placeholder="Search by CO Number or Partyname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1 border border-primary rounded focus:outline-none"
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

        <div className="relative overflow-x-auto  overflow-y-auto rounded border border-primary shadow-sm">
          <div className={` ${isOpen ? `max-w-[40.8vw]` : `max-w-[98vw]`}`}>
            <table
              className={
                "text-[11px] whitespace-nowrap min-w-[100vw] text-left"
              }
            >
              <thead className="bg-primary text-secondary">
                <tr>
                  <th className="px-[8px] py-1.5 ">#</th>
                  <th className="px-[8px] ">Created At</th>
                  <th className="px-[8px] ">Updated At</th>
                  <th className="px-[8px] ">SMP / FG No</th>
                  <th className="px-[8px] ">CO No.</th>
                  {/* <th className="px-[8px] ">Prod No.</th> */}
                  <th className="px-[8px] ">Party Name</th>
                  <th className="px-[8px] ">Product Name</th>
                  <th className="px-[8px] ">Order Qty</th>
                  {/* <th className="px-[8px] ">Product Size</th> */}
                  <th className="px-[8px] ">Date</th>
                  <th className="px-[8px] ">Delivery Date</th>
                  <th className="px-[8px] ">Status</th>
                  <th className="px-[8px] ">Created By</th>
                  {/* <th className="px-[8px] ">Attachments</th> */}
                  <th className="px-[8px] ">Actions</th>
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
                    {COs.map((b, i) => (
                      <React.Fragment key={b._id}>
                        <tr
                          className="border-t border-primary hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setExpandedCOId(
                              expandedCOId === b._id ? null : b._id
                            )
                          }
                        >
                          <td className="px-[8px] border-r border-primary py-1">
                            {(pagination.currentPage - 1) * pagination.limit +
                              i +
                              1}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {new Date(b.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {new Date(b.updatedAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-primary  ">
                            {b.sampleNo || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary  ">
                            {b.coNo || "-"}
                          </td>

                          <td className="px-[8px] border-r border-primary  ">
                            {b.partyName || "-"}
                          </td>

                          <td className="px-[8px] border-r border-primary  ">
                            {b.productName || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary  ">
                            {b.orderQty || "-"}
                          </td>

                          <td className="px-[8px] border-r border-primary ">
                            {new Date(b.date).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }) || "-"}{" "}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {b.deliveryDate
                              ? new Date(b.deliveryDate).toLocaleString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            <span
                              className={`${
                                b.status == "Pending"
                                  ? "bg-yellow-200"
                                  : b.status == "Rejected"
                                  ? "bg-red-200"
                                  : "bg-green-200"
                              }  py-0.5 px-1 rounded font-bold capitalize `}
                            >
                              {b.status || "-"}
                            </span>
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {b.createdBy?.fullName || "-"}
                          </td>

                          <td className="px-[8px] pt-1.5   flex gap-2 text-primary text-base">
                            {/* <FaFileDownload
                              //   onClick={() => handlePreviewBom(b)}
                              className="cursor-pointer text-primary hover:text-green-600"
                            /> */}
                            {hasPermission("CO Pendency", "update") &&
                            b.status == "Pending" ? (
                              <IoMdCheckmarkCircle
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Approve"
                                onClick={() => setBomModalItem(b)}
                                className="cursor-pointer text-primary hover:text-blue-600"
                              />
                            ) : (
                              "-"
                            )}
                            {hasPermission("CO Pendency", "update") &&
                            b.status == "Pending" ? (
                              <MdCancel
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Reject"
                                onClick={() => handleReject(b._id)}
                                className="cursor-pointer text-primary hover:text-red-600"
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

                        {/* {expandedBOMId === b._id && (
                          <tr className="">
                            <td colSpan="100%">
                              <BomDetailsSection bomData={b} />
                            </td>
                          </tr>
                        )} */}
                      </React.Fragment>
                    ))}
                    {COs.length === 0 && (
                      <tr>
                        <td
                          colSpan="16"
                          className="text-center py-4 text-gray-500"
                        >
                          No COs found.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {bomModalItem && (
          <AddBomModal
            coData={bomModalItem}
            onClose={() => setBomModalItem(null)}
            onSuccess={() => {
              fetchCOs(pagination.currentPage); // re-fetch or refresh list
              setEditingBOM(null);
            }}
          />
        )}

        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          entriesPerPage={pagination.limit}
          totalResults={pagination.totalResults}
          onEntriesChange={(limit) => {
            setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
            fetchCOs(1, limit);
          }}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
            fetchCOs(page, pagination.limit);
          }}
        />
      </div>
    </>
  );
};

export default COP;
