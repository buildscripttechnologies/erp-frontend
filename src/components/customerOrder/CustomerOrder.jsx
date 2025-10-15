// src/components/BOMMaster.jsx
import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";
import TableSkeleton from "../TableSkeleton";
import ScrollLock from "../ScrollLock";
import Toggle from "react-toggle";
import PaginationControls from "../PaginationControls";
// import BomDetailsSection from "./BomDetailsSection";
// import AddBomModal from "./AddBOMModel";
// import UpdateBomModal from "./UpdateBomModal";
import { FaFileDownload } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
// import { generateBomLP } from "../../../utils/generateBomLP";
import { useAuth } from "../../context/AuthContext";
import { debounce } from "lodash";
import AttachmentsModal2 from "../AttachmentsModal2";
import AddCO from "./AddCO";
import { generateCOPdf } from "./generateCOPdf";
import { PulseLoader } from "react-spinners";

const CustomerOrder = ({ isOpen }) => {
  const { hasPermission } = useAuth();

  const [BOMs, setBOMs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingBOM, setEditingBOM] = useState(null);
  const [expandedBOMId, setExpandedBOMId] = useState(null);
  const [openAttachments, setOpenAttachments] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const [downloading, setDownloading] = useState();
  const [companyDetails, setCompanyDetails] = useState();

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const res = await axios.get("/settings/company-details");

        setCompanyDetails(res.data || []);
      } catch {
        toast.error("Failed to fetch company details");
      }
    };
    fetchCompanyDetails();
  }, []);

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      fetchBOMs(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchBOMs = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/boms/get-all?page=${page}&search=${search}&limit=${limit}`
      );
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      setBOMs(res.data.data || []);
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

  ScrollLock(showModal || editingBOM != null);

  useEffect(() => {
    fetchBOMs();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchBOMs(page);
  };

  // const filtered = BOMs.filter(
  //   (c) =>
  //     c.partyName?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.productName?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.bomNo?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.sampleNo?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.createdBy?.fullName.toLowerCase().includes(search.toLowerCase())
  // );

  const handleDownload = async (b) => {
    setDownloading(true);
    try {
      const res = await axios.get("/settings/letterpad");
      const letterpadUrl = res.data.path;
      let p = await generateCOPdf(b, letterpadUrl, companyDetails);
      const blob = p.blob;
      const url = window.URL.createObjectURL(blob);

      // Open in new tab for preview
      // window.open(url, "_blank");
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${b.prodNo || ""}.pdf`; // <-- custom filename here
      a.click();
      // Don’t revoke immediately, or the preview tab will break
      // Instead, revoke after some delay
      setTimeout(() => window.URL.revokeObjectURL(url), 60 * 1000);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="p-3 max-w-[99vw] mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Customer Order{" "}
          <span className="text-gray-500">({pagination.totalResults})</span>
        </h2>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-primary" />
            <input
              type="text"
              placeholder="Search by BOM Number or Partyname..."
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
          {hasPermission("Customer Order", "write") && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary hover:bg-primary/80 justify-center text-secondary font-semibold px-4 py-1.5 rounded flex items-center gap-2 cursor-pointer"
            >
              <FiPlus /> Add Customer Order
            </button>
          )}
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
                  <th className="px-[8px] ">BOM No.</th>
                  <th className="px-[8px] ">Prod No.</th>
                  <th className="px-[8px] ">Party Name</th>
                  <th className="px-[8px] ">Product Name</th>
                  <th className="px-[8px] ">Order Qty</th>
                  <th className="px-[8px] ">Product Size</th>
                  <th className="px-[8px] ">BOM Date</th>
                  <th className="px-[8px] ">Production Date</th>
                  <th className="px-[8px] ">Delivery Date</th>
                  <th className="px-[8px] ">Status</th>
                  <th className="px-[8px] ">Created By</th>
                  <th className="px-[8px] ">Attachments</th>
                  <th className="px-[8px] ">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton
                    rows={pagination.limit}
                    columns={Array(17).fill({})}
                  />
                ) : (
                  <>
                    {BOMs.map((b, i) => (
                      <React.Fragment key={b._id}>
                        <tr
                          className="border-t border-primary hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setExpandedBOMId(
                              expandedBOMId === b._id ? null : b._id
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
                            {b.bomNo || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary  ">
                            {b.prodNo || "-"}
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
                            {`${b.height ?? 0} x ${b.width ?? 0} x ${
                              b.depth ?? 0
                            }`}
                          </td>

                          <td className="px-[8px] border-r border-primary ">
                            {new Date(b.date).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }) || "-"}{" "}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {b.productionDate
                              ? new Date(b.productionDate).toLocaleString(
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
                                  : b.status == "In Progress" ||
                                    b.status == "Issued"
                                  ? "bg-orange-200"
                                  : "bg-green-200"
                              }  py-0.5 px-1 rounded font-bold capitalize `}
                            >
                              {b.status || "-"}
                            </span>
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {b.createdBy?.fullName || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {Array.isArray(b.file) && b.file.length > 0 ? (
                              <button
                                onClick={() => setOpenAttachments(b.file)}
                                className="cursor-pointer hover:text-primary hover:underline text-center items-center justify-center"
                              >
                                View
                              </button>
                            ) : (
                              "-"
                            )}

                            {openAttachments && (
                              <AttachmentsModal2
                                attachments={openAttachments}
                                onClose={() => setOpenAttachments(null)}
                              />
                            )}
                          </td>
                          <td className="px-[8px] pt-1.5 text-sm  flex gap-2 text-primary">
                            {b.status == "Completed" && (
                              <>
                                {expandedBOMId === b._id && downloading ? (
                                  <PulseLoader size={4} color="#d8b76a" />
                                ) : (
                                  <FaFileDownload
                                    onClick={() => handleDownload(b)}
                                    className="cursor-pointer text-primary hover:text-green-600"
                                  />
                                )}
                              </>
                            )}
                            {hasPermission("Customer Order", "update") ? (
                              <FiEdit
                                // onClick={() => setEditingBOM(b)}
                                className="cursor-pointer text-primary hover:text-blue-600"
                              />
                            ) : (
                              "-"
                            )}
                            {hasPermission("Customer Order", "delete") ? (
                              <FiTrash2
                                // onClick={() => handleDelete(b._id)}
                                className="cursor-pointer text-primary hover:text-red-600"
                              />
                            ) : (
                              "-"
                            )}
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
                    {BOMs.length === 0 && (
                      <tr>
                        <td
                          colSpan="16"
                          className="text-center py-4 text-gray-500"
                        >
                          No BOMs found.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {editingBOM && (
          <UpdateBomModal
            bom={editingBOM}
            onClose={() => setEditingBOM(null)}
            onSuccess={() => {
              fetchBOMs(pagination.currentPage); // re-fetch or refresh list
              setEditingBOM(null);
            }}
          />
        )}

        {showModal && (
          <AddCO onClose={() => setShowModal(false)} onSuccess={fetchBOMs} />
        )}

        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          entriesPerPage={pagination.limit}
          totalResults={pagination.totalResults}
          onEntriesChange={(limit) => {
            setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
            fetchBOMs(1, limit);
          }}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
            fetchBOMs(page, pagination.limit);
          }}
        />
      </div>
    </>
  );
};

export default CustomerOrder;
