import React, { useEffect, useState } from "react";
import Dashboard from "../../pages/Dashboard";
import {
  FiPlus,
  FiSearch,
  FiCheckCircle,
  FiUploadCloud,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import TableSkeleton from "../TableSkeleton";
import EditRawMaterialModal from "./EditRawMaterialModal";
import AddBulkRawMaterials from "./BulkRmPanel.jsx";
import BulkRmPanel from "./BulkRmPanel.jsx";
import Toggle from "react-toggle";
import { exportToExcel, exportToPDF } from "../../utils/exportData.js";
import AttachmentsModal from "../AttachmentsModal.jsx";
import ScrollLock from "../ScrollLock.js";
import PaginationControls from "../PaginationControls.jsx";
import { ClipLoader } from "react-spinners";
import { span } from "framer-motion/client";

// export const baseurl = "http://localhost:5000";

const RmMaster = ({ isOpen }) => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [openAttachments, setOpenAttachments] = useState(null);
  const [exportScope, setExportScope] = useState("current");
  const [exportFormat, setExportFormat] = useState("excel");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sampleDownloading, setSampleDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);

  ScrollLock(editData != null || showBulkPanel || openAttachments != null);

  const toggleExportOptions = () => {
    setShowExportOptions((prev) => !prev);
  };

  const [pagination, setPagination] = useState({
    totalResults: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
  });

  const fetchRawMaterials = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get("/rms/rm", {
        params: {
          page,
          limit: pagination.limit, // or dynamic
          search, // if you have search
        },
      });

      setRawMaterials(res.data.rawMaterials || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load data");
      setLoading(false);
    }
  };

  // console.log("Raw Materials:", rawMaterials);

  const handleSampleDownload = async () => {
    try {
      setSampleDownloading(true);
      const res = await axios.get("/rms/sample-excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "RawMaterial_Sample.xlsx");
      document.body.appendChild(link);
      link.click();
      toast.success("Sample downloaded");
      setSampleDownloading(false);
    } catch (err) {
      toast.error("Failed to download sample");
      sampleDownloading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return toast.error("Please select a file first");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post("/rms/upload-rm-excel", formData);
      toast.success("Raw materials uploaded");
      setFile(null);
      setUploading(false);
      fetchRawMaterials(); // reload list
    } catch (err) {
      toast.error("Upload failed");
      setUploading(false);
    }
  };

  const filteredData = rawMaterials.filter((rm) => {
    const query = search.toLowerCase();
    return (
      rm.itemName?.toLowerCase().includes(query) ||
      rm.skuCode?.toLowerCase().includes(query) ||
      rm.hsnSac?.toLowerCase().includes(query) ||
      rm.type?.toLowerCase().includes(query) ||
      rm.qualityInspection?.toLowerCase().includes(query) ||
      rm.location?.toLowerCase().includes(query) ||
      rm.gst?.toString().includes(query) ||
      rm.createdAt?.toLowerCase().includes(query) ||
      new Date(rm.createdAt).toLocaleString().toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    fetchRawMaterials(pagination.currentPage);
  }, [pagination.currentPage, showBulkPanel, pagination.limit]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this raw material?"))
      return;
    try {
      const res = await axios.delete(`/rms/delete-rm/${id}`);
      if (res.status == 200) {
        toast.success("Raw material deleted successfully");
        fetchRawMaterials(); // reload list
      } else {
        toast.error("Failed to delete raw material");
      }
    } catch (err) {
      toast.error("Failed to delete raw material");
    }
  };

  const handleToggleQualityInspection = async (id, currentValue) => {
    const newValue = !currentValue;

    try {
      const res = await axios.patch(`/rms/update-rm/${id}`, {
        qualityInspectionNeeded: newValue,
      });

      if (res.status === 200) {
        toast.success("Quality Inspection status updated");

        // ✅ Optimistically update the item locally in state
        setRawMaterials((prev) =>
          prev.map((rm) =>
            rm.id === id ? { ...rm, qualityInspectionNeeded: newValue } : rm
          )
        );
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      if (err.status == 403) {
        toast.error("You Dont Have Permissions For This");
      } else {
        toast.error("Failed to Update Q.I. Status");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await axios.patch(`/rms/update-rm/${id}`, {
        status: newStatus,
      });

      if (res.status === 200) {
        toast.success(`Raw material status updated to ${newStatus}`);

        // ✅ Update local state without refetch
        setRawMaterials((prev) =>
          prev.map((rm) => (rm.id === id ? { ...rm, status: newStatus } : rm))
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
  };

  const data = (data) => {
    return data.map((e) => ({
      skuCode: e.skuCode,
      itemName: e.itemName,
      description: e.description,
      hsnOrSac: e.hsnOrSac,
      type: e.type,
      location: e.location,
      moq: e.moq,
      gst: e.gst,
      stockQty: e.stockQty,
      baseQty: e.baseQty,
      pkgQty: e.pkgQty,
      purchaseUOM: e.purchaseUOM,
      stockUOM: e.stockUOM,
      qualityInspectionNeeded: e.qualityInspectionNeeded
        ? "Required"
        : "Not Required",
      attachments: e.attachments.map((att) => `${att.fileUrl}`).join(", "),
    }));
  };

  const handleExport = async () => {
    try {
      setDownloading(true);

      let exportData = [];

      if (exportScope === "current" || exportScope === "filtered") {
        exportData = data(filteredData);
        generateExportFile(exportData); // Synchronous export
        setDownloading(false);
      } else {
        // Export all: fetch full data from backend first
        const res = await axios.get("/rms/rm", {
          params: { limit: pagination.totalResults },
        });

        exportData = data(res.data.rawMaterials);
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
      exportToExcel(data);
    } else {
      exportToPDF(data);
    }
  };

  const TableHeaders = [
    { label: "#", className: "" },
    { lable: "Created At", className: "" },
    { label: "Updated At", className: "" },
    { label: "SKU Code", className: "" },
    { label: "Item Name", className: "" },
    { label: "Description", className: "" },
    { label: "HSN/SAC", className: "" },
    { label: "Type", className: "" },
    { label: "Qual. Insp.", className: "" },
    { label: "Location", className: "" },
    { label: "Base Qty", className: "" },
    { label: "Pkg Qty", className: "" },
    { label: "MOQ", className: "" },
    { label: "Pur. Uom", className: "" },
    { label: "GST", className: "" },
    { label: "Stock Qty", className: "" },
    { label: "Stock Uom", className: "" },
    { label: "Attachment", className: "" },
    { label: "Status", className: "" },
    { label: "Created By", className: "" },
    { label: "Action", className: "" },
  ];

  return (
    <div className={` p-3 max-w-[99vw] mx-auto overflow-x-hidden mt-4 `}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#292926]">
          Raw Materials{" "}
          <span className="text-gray-500">({rawMaterials.length})</span>
        </h2>

        <div className="flex gap-2 flex-wrap">
          {showExportOptions && (
            <div className="flex gap-2 items-center">
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value)}
                className="border border-[#d8b76a] px-3 py-1.5 rounded text-sm text-[#292926] cursor-pointer"
              >
                <option value="current">This Page</option>
                <option value="filtered">Filtered Data</option>
                <option value="all">All Data</option>
              </select>

              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="border border-[#d8b76a] px-3 py-1.5 rounded text-sm text-[#292926] cursor-pointer"
              >
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>

              <button
                disabled={downloading}
                onClick={handleExport}
                className="bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-black font-semibold px-4 py-1.5 rounded transition cursor-pointer"
              >
                {downloading ? (
                  <span className="flex justify-center items-center gap-1">
                    {/* Downloading */}
                    <ClipLoader size={20} color="#292926" />
                  </span>
                ) : (
                  "Download"
                )}
              </button>
            </div>
          )}
          <button
            onClick={toggleExportOptions}
            className="bg-[#d8b76a] cursor-pointer hover:bg-[#d8b76a]/80 text-black font-semibold px-4 py-1.5 rounded flex justify-center items-center whitespace-nowrap transition"
          >
            <FiDownload className="mr-2" /> Export
          </button>

          <button
            disabled={sampleDownloading}
            onClick={handleSampleDownload}
            className="flex items-center gap-2 bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-black font-semibold px-4 py-1.5 rounded transition cursor-pointer"
          >
            {sampleDownloading ? (
              <span className="flex justify-center items-center gap-1">
                {/* Downloading */}
                <ClipLoader size={20} color="#292926" />
              </span>
            ) : (
              <>
                <FiDownload /> Sample Excel
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 bg-[#d8b76a] hover:bg-[#d8b76a]/80 px-4 py-1.5 rounded cursor-pointer text-[#292926] font-semibold ">
            <label
              title={file ? file.name : "Upload Excel"}
              className="flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiUploadCloud />
              <span className="w-24 truncate">
                {file ? file.name : "Upload Excel"}
              </span>
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            {file && (
              <button
                onClick={() => setFile(null)}
                className="text-[#292926] border rounded-full p-1 hover:text-red-600 cursor-pointer"
                title="Remove file"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <button
            disabled={uploading}
            onClick={handleFileUpload}
            className="bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-black font-semibold px-4 py-1.5 rounded transition cursor-pointer"
          >
            {uploading ? (
              <span className="flex justify-center items-center gap-1">
                {/* Downloading */}
                <ClipLoader size={20} color="#292926" />
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col w-auto sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search raw materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-1 text-[#292926] border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
          />
          <FiSearch className="absolute left-2 top-2 text-[#d8b76a]" />
        </div>
        <button
          onClick={() => setShowBulkPanel(true)}
          className="w-full sm:w-40 justify-center bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-black font-semibold px-4 py-1.5 rounded flex items-center gap-2 cursor-pointer transition duration-200"
        >
          <FiPlus /> Add R.M.
        </button>
      </div>

      {/* Table */}
      <div
        className={`relative overflow-x-auto  overflow-y-auto rounded border border-[#d8b76a] shadow-sm`}
      >
        <div className={` ${isOpen ? `max-w-[40.8vw]` : `max-w-[99vw]`}`}>
          <table className={`text-[11px] min-w-[100vw]`}>
            <thead className="bg-[#d8b76a] text-[#292926] text-left">
              <tr>
                {[
                  "#",
                  "Created At",
                  "Updated At",
                  "SKU Code",
                  "Item Name",
                  "Description",
                  "HSN/SAC",
                  "Type",
                  "Qual. Insp.",
                  "Location",
                  "Base Qty",
                  "Pkg Qty",
                  "MOQ",
                  "Rate",
                  "Pur. Uom",
                  "GST",
                  "Stock Qty",
                  "Stock Uom",
                  "Attachment",
                  "Status",
                  "Created By",
                  "Action",
                ].map((th) => (
                  <th
                    key={th}
                    className="py-1.5 px-2 text-[11px] whitespace-nowrap"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={pagination.limit} columns={TableHeaders} />
              ) : (
                <>
                  {filteredData.map((rm, i) => (
                    <tr
                      key={rm._id}
                      className="border-b text-[11px] whitespace-nowrap border-[#d8b76a] hover:bg-gray-50"
                    >
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {Number(pagination.currentPage - 1) *
                          Number(pagination.limit) +
                          i +
                          1}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {new Date(rm.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {new Date(rm.updatedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.skuCode}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a] ">
                        {rm.itemName}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.description || "-"}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.hsnOrSac}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.type}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        <Toggle
                          checked={rm.qualityInspectionNeeded}
                          onChange={() =>
                            handleToggleQualityInspection(
                              rm.id,
                              rm.qualityInspectionNeeded
                            )
                          }
                        />
                      </td>

                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.location || "-"}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.baseQty}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.pkgQty}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.moq}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.rate}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.purchaseUOM || "-"}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.gst ? rm.gst + "%" : "-"}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.stockQty}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a] ">
                        {rm.stockUOM || "-"}
                      </td>

                      <td className="text-center items-center justify-center border-r border-r-[#d8b76a]">
                        {Array.isArray(rm.attachments) &&
                        rm.attachments.length > 0 ? (
                          <button
                            onClick={() => setOpenAttachments(rm.attachments)}
                            className="cursor-pointer hover:text-[#d8b76a] hover:underline text-center items-center justify-center"
                          >
                            View
                          </button>
                        ) : (
                          "-"
                        )}

                        {openAttachments && (
                          <AttachmentsModal
                            attachments={openAttachments}
                            onClose={() => setOpenAttachments(null)}
                          />
                        )}
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        <Toggle
                          checked={rm.status === "Active"}
                          onChange={() => handleToggleStatus(rm.id, rm.status)}
                        />
                      </td>
                      <td className="px-2 border-r border-r-[#d8b76a]">
                        {rm.createdByName || "-"}
                      </td>
                      <td className="px-2 ">
                        <div className="flex items-center gap-2 text-base text-[#d39c25]">
                          <FiEdit
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Edit"
                            onClick={() => setEditData(rm)}
                            className="hover:text-blue-500 cursor-pointer"
                          />
                          {editData && (
                            <EditRawMaterialModal
                              rawMaterial={editData}
                              onClose={() => setEditData(null)}
                              onUpdated={fetchRawMaterials}
                            />
                          )}
                          <FiTrash2
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Delete"
                            onClick={() => handleDelete(rm.id)}
                            className="hover:text-red-500 cursor-pointer"
                          />
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
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan="22"
                        className="text-center py-4 text-gray-500 w-full"
                      >
                        No RMs found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        totalResults={pagination.totalResults}
        onEntriesChange={(limit) => {
          setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
          fetchData(1, limit);
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
          fetchData(page, pagination.limit);
        }}
      />
      {showBulkPanel && <BulkRmPanel onClose={() => setShowBulkPanel(false)} />}
    </div>
  );
};

export default RmMaster;
