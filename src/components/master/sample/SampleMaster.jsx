// src/components/SampleMaster.jsx
import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import PaginationControls from "../../PaginationControls";
import { FaFileDownload } from "react-icons/fa";
import AddSampleModal from "./AddSampleModel";
import SampleDetailsSection from "./SampleDetailsSection";
import UpdateSampleModal from "./UpdateSampleMaster";
import { generateSample } from "../../../utils/generateSample";
import AttachmentsModal2 from "../../AttachmentsModal2";
import { useAuth } from "../../../context/AuthContext";
import { debounce } from "lodash";

import { useRef } from "react";

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
    try {
      const blobUrl = await generateSample(SampleData);

      // Open a new tab with preview and print/download buttons
      const printWindow = window.open("", "_blank");

      const html = `
        <html>
          <head>
            <title>Sample Preview</title>
            <style>
              body { margin: 0; font-family: sans-serif; }
              .controls {
                padding: 10px;
                background-color: #292926;
                color: #d8b76a;
                display: flex;
                gap: 10px;
                justify-content: center;
              }
              .controls button {
                padding: 6px 12px;
                font-size: 14px;
                border: none;
                cursor: pointer;
                background-color: #d8b76a;
                color: #292926;
                border-radius: 4px;
              }
              iframe {
                width: 100%;
                height: calc(100vh - 50px);
                border: none;
              }
            </style>
          </head>
          <body>
            <div class="controls">
              <button onclick="document.getElementById('pdfFrame').contentWindow.print()">🖨️ Print</button>
              <button onclick="downloadPdf()">⬇️ Download</button>
            </div>
            <iframe id="pdfFrame" src="${blobUrl}"></iframe>
            <script>
              function downloadPdf() {
                const link = document.createElement('a');
                link.href = '${blobUrl}';
                link.download = '${
                  SampleData.sampleNo + "_" + SampleData.partyName || "Details"
                }.pdf';
                link.click();
              }
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) {
      console.error("Error generating Sample PDF preview:", err);
      toast.error("Failed to generate PDF preview.");
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
            <FiSearch className="absolute left-3 top-2.5 text-[#d8b76a]" />
            <input
              type="text"
              placeholder="Search by Sample Number or Partyname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1 border border-[#d8b76a] rounded focus:outline-none"
            />
          </div>
          {hasPermission("Sample", "write") && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#d8b76a] hover:bg-[#b38a37]  justify-center text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 cursor-pointer"
            >
              <FiPlus /> Add Sample
            </button>
          )}
        </div>

        <div className="relative overflow-x-auto  overflow-y-auto rounded border border-[#d8b76a] shadow-sm">
          <div className={` ${isOpen ? `max-w-[40.8vw]` : `max-w-[98vw]`}`}>
            <table
              className={
                "text-[11px] whitespace-nowrap min-w-[100vw] text-left"
              }
            >
              <thead className="bg-[#d8b76a] text-[#292926]">
                <tr>
                  <th className="px-[8px] py-1.5 ">#</th>
                  <th className="px-[8px] ">Created At</th>
                  <th className="px-[8px] ">Updated At</th>
                  <th className="px-[8px] ">Sample No.</th>
                  <th className="px-[8px] ">Party Name</th>
                  <th className="px-[8px] ">Product Name</th>
                  <th className="px-[8px] ">Product Size</th>
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
                    columns={Array(9).fill({})}
                  />
                ) : (
                  <>
                    {Samples.map((b, i) => (
                      <React.Fragment key={b._id}>
                        <tr
                          className="border-t border-[#d8b76a] hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setExpandedSampleId(
                              expandedSampleId === b._id ? null : b._id
                            )
                          }
                        >
                          <td className="px-[8px] border-r border-[#d8b76a] py-1">
                            {(pagination.currentPage - 1) * pagination.limit +
                              i +
                              1}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {new Date(b.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {new Date(b.updatedAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {b.sampleNo || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {b.partyName || "-"}
                          </td>

                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {b.product?.name || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {`${b.height ?? 0} x ${b.width ?? 0} x ${
                              b.depth ?? 0
                            }`}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {new Date(b.date).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          {/* <td className="px-[8px] border-r border-[#d8b76a] ">
                            <Toggle
                              checked={b.isActive}
                              onChange={() =>
                                handleToggleStatus(b._id, b.isActive)
                              }
                            />
                          </td> */}
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {b.createdBy?.fullName || "-"}
                          </td>
                          <td className="px-[8px] border-r border-[#d8b76a] ">
                            {Array.isArray(b.file) && b.file.length > 0 ? (
                              <button
                                onClick={() => setOpenAttachments(b.file)}
                                className="cursor-pointer hover:text-[#d8b76a] hover:underline text-center items-center justify-center"
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
                          <td className="px-[8px] pt-1.5 text-sm  flex gap-2 text-[#d8b76a]">
                            <FaFileDownload
                              onClick={() => handlePreviewSample(b)}
                              className="cursor-pointer text-[#d8b76a] hover:text-green-600"
                            />
                            {hasPermission("Sample", "update") ? (
                              <FiEdit
                                onClick={() => setEditingSample(b)}
                                className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                              />
                            ) : (
                              "-"
                            )}
                            {hasPermission("Sample", "delete") ? (
                              <FiTrash2
                                onClick={() => handleDelete(b._id)}
                                className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                              />
                            ) : (
                              "-"
                            )}
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
        )}

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
