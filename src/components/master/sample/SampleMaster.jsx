// src/components/SampleMaster.jsx
import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";
import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import PaginationControls from "../../PaginationControls";
import { FaFileDownload, FaFilePdf } from "react-icons/fa";
import AddSampleModal from "./AddSampleModel";
import SampleDetailsSection from "./SampleDetailsSection";
import UpdateSampleModal from "./UpdateSampleMaster";
import { generateSample } from "../../../utils/generateSample";
import AttachmentsModal2 from "../../AttachmentsModal2";
import { useAuth } from "../../../context/AuthContext";
import { debounce } from "lodash";

import { useRef } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { generateSampleEstimate } from "../../../utils/generateSampleEstimate";
import { Tooltip } from "react-tooltip";
import PdfOptionsModal from "./PdfOptionsModal";

const SampleMaster = ({ isOpen }) => {
  const { hasPermission } = useAuth();

  const [Samples, setSamples] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  const [expandedSampleId, setExpandedSampleId] = useState(null);
  const [openAttachments, setOpenAttachments] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });
  const [downloading, setDownloading] = useState();
  const [downloading2, setDownloading2] = useState();
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.showModal) {
      setShowModal(true);

      // Remove showModal from location state so refresh doesn't reopen
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      fetchSamples(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchSamples = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/samples/get-all?page=${page}&search=${search}&limit=${limit}`
      );
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      setSamples(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch Samples");
    } finally {
      setLoading(false);
    }
  };

  ScrollLock(showModal || editingSample != null || openAttachments != null);

  useEffect(() => {
    fetchSamples();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchSamples(page);
  };

  // const filtered = Samples.filter(
  //   (c) =>
  //     c.partyName?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.sampleNo?.toLowerCase().includes(search.toLowerCase()) ||
  //     c.createdBy?.fullName.toLowerCase().includes(search.toLowerCase())
  // );

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    try {
      const res = await axios.patch(`/Samples/edit/${id}`, {
        isActive: newStatus,
      });

      if (res.data.status == 200) {
        toast.success(`Sample status updated`);

        // ✅ Update local state without refetch
        setSamples((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isActive: newStatus } : c))
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Sample?")) return;
    try {
      const res = await axios.delete(`/samples/delete/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

      if (res.data.status == 200) {
        toast.success(`Sample Deleted Successfully`);
        fetchSamples();
      } else {
        toast.error("Failed to Delete Sample");
      }
    } catch (err) {
      toast.error("Failed to Delete Sample");
    }
  };

  const handlePreviewSample = async (SampleData) => {
    setDownloading(true);
    try {
      const res = await axios.get("/settings/letterpad");
      const letterpadUrl = res.data.path;
      const blobUrl = await generateSample(SampleData, letterpadUrl);

      // window.open(blobUrl, "_blank");
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${
        SampleData.sampleNo + "-" + SampleData.product?.name || "Sample"
      }.pdf`; // <-- custom filename here
      a.click();
    } catch (err) {
      console.error("Error generating Sample PDF preview:", err);
      toast.error("Failed to generate PDF preview.");
    } finally {
      setDownloading(false);
    }
  };
  const handlePreviewSampleEstimate = async (SampleData, options) => {
    try {
      setDownloading2(true);

      const res = await axios.get("/settings/letterpad");
      const letterpadUrl = res.data.path;
      const blobUrl = await generateSampleEstimate(SampleData, letterpadUrl);

      const fileName = `${SampleData.sampleNo}-${
        SampleData.product?.name || "Sample Estimate"
      }.pdf`;
      const blob = await (await fetch(blobUrl)).blob();
      const file = new File([blob], fileName, { type: "application/pdf" });

      // 1️⃣ Download
      if (options.download) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
      }

      // 2️⃣ Send WhatsApp
      if (options.sendWhatsapp) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result.split(",")[1]; // base64 part
          try {
            await axios.post("/wati/pdf/send-pdf-whatsapp", {
              phone: "+919157425585",
              fileName,
              base64Data,
              caption: `Here’s your Sample Estimate: ${fileName}`,
            });
            toast.success("PDF sent via WhatsApp!");
          } catch (err) {
            console.error("WhatsApp sending error:", err);
            toast.error("Failed to send PDF via WhatsApp.");
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Error generating Sample PDF preview:", err);
      toast.error("Failed to generate PDF preview.");
    } finally {
      setDownloading2(false);
    }
  };

  return (
    <>
      <div className="p-3 max-w-[99vw] mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Product Samples
          <span className="text-gray-500">({pagination.totalResults})</span>
        </h2>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-primary" />
            <input
              type="text"
              placeholder="Search by Sample Number or Partyname..."
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
          {hasPermission("Sample", "write") && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary hover:bg-primary/80  justify-center text-secondary font-semibold px-4 py-1.5 rounded flex items-center gap-2 cursor-pointer"
            >
              <FiPlus /> Add Sample
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
                  <th className="px-[8px] ">Sample No.</th>
                  <th className="px-[8px] ">Party Name</th>
                  <th className="px-[8px] ">Product Name</th>
                  <th className="px-[8px] ">Product Size</th>
                  <th className="px-[8px] ">HSN / SAC</th>
                  <th className="px-[8px] ">GST (%)</th>
                  <th className="px-[8px] ">Date</th>
                  {/* <th className="px-[8px] ">Status</th> */}
                  <th className="px-[8px] ">Created By</th>
                  <th className="px-[8px] ">Attachments</th>
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
                    {Samples.map((b, i) => (
                      <React.Fragment key={b._id}>
                        <tr
                          className="border-t border-primary hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setExpandedSampleId(
                              expandedSampleId === b._id ? null : b._id
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
                            {b.partyName || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary  ">
                            {b.product?.name || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {`${b.height ?? 0} x ${b.width ?? 0} x ${
                              b.depth ?? 0
                            }`}
                          </td>
                          <td className="px-[8px] border-r border-primary  ">
                            {b.hsnOrSac || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary  ">
                            {b.gst || "-"}
                          </td>
                          <td className="px-[8px] border-r border-primary ">
                            {new Date(b.date).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          {/* <td className="px-[8px] border-r border-primary ">
                            <Toggle
                              checked={b.isActive}
                              onChange={() =>
                                handleToggleStatus(b._id, b.isActive)
                              }
                            />
                          </td> */}
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
                            {/* {expandedSampleId === b._id && downloading2 ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <>
                                <FaFilePdf
                                  data-tooltip-id="statusTip"
                                  data-tooltip-content="Download Estimate"
                                  onClick={() => setOptionModalOpen(true)}
                                  className="cursor-pointer text-primary hover:text-green-600"
                                />{" "}
                                {optionModalOpen && (
                                  <PdfOptionsModal
                                    sampleData={b}
                                    onClose={() => setOptionModalOpen(false)}
                                    onConfirm={(options) =>
                                      handlePreviewSampleEstimate(b, options)
                                    }
                                  />
                                )}
                              </>
                            )} */}
                            {expandedSampleId === b._id && downloading ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <FaFileDownload
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Download"
                                onClick={() => handlePreviewSample(b)}
                                className="cursor-pointer text-primary hover:text-green-600"
                              />
                            )}
                            {hasPermission("Sample", "update") ? (
                              <FiEdit
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Edit"
                                onClick={() => setEditingSample(b)}
                                className="cursor-pointer text-primary hover:text-blue-600"
                              />
                            ) : (
                              "-"
                            )}
                            {hasPermission("Sample", "delete") ? (
                              <FiTrash2
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Delete"
                                onClick={() => handleDelete(b._id)}
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
                                color: "white",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            />
                          </td>
                        </tr>
                        {expandedSampleId === b._id && (
                          <tr className="">
                            <td colSpan="100%">
                              <SampleDetailsSection SampleData={b} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {Samples.length === 0 && (
                      <tr>
                        <td
                          colSpan="16"
                          className="text-center py-4 text-gray-500"
                        >
                          No Samples found.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {editingSample && (
          <UpdateSampleModal
            sampleData={editingSample}
            onClose={() => setEditingSample(null)}
            onSuccess={() => {
              fetchSamples(); // re-fetch or refresh list
              setEditingSample(null);
            }}
          />
        )}
        {showModal && (
          <AddSampleModal
            onClose={() => setShowModal(false)}
            onSuccess={fetchSamples}
          />
        )}{" "}
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          entriesPerPage={pagination.limit}
          totalResults={pagination.totalResults}
          onEntriesChange={(limit) => {
            setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
            fetchSamples(1, limit);
          }}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
            fetchSamples(page, pagination.limit);
          }}
        />
      </div>
    </>
  );
};

export default SampleMaster;
