import React, { useEffect, useState } from "react";
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
import BulkRmPanel from "./BulkRmPanel";
import Toggle from "react-toggle";
import { exportToExcel, exportToPDF } from "../../utils/exportData.js";
import AttachmentsModal from "../AttachmentsModal.jsx";
import ScrollLock from "../ScrollLock.js";
import PaginationControls from "../PaginationControls.jsx";
import { BeatLoader, ClipLoader, PulseLoader } from "react-spinners";
import AttachmentsModal2 from "../AttachmentsModal2.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { debounce } from "lodash";
import { useRef } from "react";
import { TbRestore } from "react-icons/tb";

const RmMaster = ({ isOpen }) => {
  const { hasPermission, user } = useAuth();
  console.log("user in RM Master:", user);

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
  const [uoms, setUoms] = useState([]);
  const [restore, setRestore] = useState(false);
  const [selectedRMs, setSelectedRMs] = useState([]);
  const [restoreId, setRestoreId] = useState();
  const [deleteId, setDeleteId] = useState();

  const hasMountedRef = useRef(false);

  ScrollLock(editData != null || showBulkPanel || openAttachments != null);
  useEffect(() => {
    const fetchUOMs = async () => {
      try {
        const res = await axios.get("/uoms/all-uoms"); // your UOM endpoint
        setUoms(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load UOMs");
      }
    };

    fetchUOMs();
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      if (restore) {
        fetchDeletedRawMaterials(1);
      } else {
        fetchRawMaterials(1); // Always fetch from page 1 for new search
      }
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

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
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

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

  const fetchDeletedRawMaterials = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get("/rms/deleted", {
        params: {
          page,
          limit: pagination.limit,
          search,
        },
      });
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

      setRawMaterials(res.data.rawMaterials || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
      setLoading(false);
    } catch (error) {}
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
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Raw materials uploaded");
      setFile(null);
      setUploading(false);
      fetchRawMaterials(); // reload list
    } catch (err) {
      toast.error(err.response?.data?.message);
      setUploading(false);
    }
  };

  useEffect(() => {
    if (restore) {
      fetchDeletedRawMaterials(pagination.currentPage);
    } else {
      fetchRawMaterials(pagination.currentPage);
    }
  }, [pagination.currentPage, showBulkPanel, pagination.limit, restore]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this raw material?"))
      return;
    try {
      setDeleteId(id);
      const res = await axios.delete(`/rms/delete-rm/${id}`);
      if (res.status == 200) {
        toast.success("Raw material deleted successfully");
        fetchRawMaterials(pagination.currentPage); // reload list
      } else {
        toast.error("Failed to delete raw material");
      }
    } catch (err) {
      toast.error("Failed to delete raw material");
    } finally {
      setDeleteId("");
    }
  };
  const handlePermanentDelete = async (id = "") => {
    if (
      !window.confirm(
        "Are you sure you want to Permanently Delete this raw materials?"
      )
    )
      return;
    try {
      setDeleteId(id);
      let payload;
      if (id != "") {
        payload = { ids: [...selectedRMs, id] };
      } else {
        payload = { ids: [...selectedRMs] };
      }
      const res = await axios.post(`/rms/permanent-delete/`, payload);
      if (res.status == 200) {
        toast.success("Raw materials deleted successfully");
        fetchDeletedRawMaterials(pagination.currentPage);
      } else {
        toast.error("Failed to delete raw materials");
      }
    } catch (err) {
      toast.error("Failed to delete raw materials");
    } finally {
      setDeleteId("");
      setSelectedRMs([]);
    }
  };
  const handleRestore = async (id = "") => {
    if (!window.confirm("Are you sure you want to Restore Raw Materials?"))
      return;
    try {
      setRestoreId(id);
      let payload;
      if (id != "") {
        payload = { ids: [...selectedRMs, id] };
      } else {
        payload = { ids: [...selectedRMs] };
      }
      const res = await axios.patch(`/rms/restore`, payload);
      if (res.status == 200) {
        toast.success("Raw materials Restored successfully");
        fetchDeletedRawMaterials(pagination.currentPage);
      } else {
        toast.error("Failed to Restore raw materials");
      }
    } catch (err) {
      toast.error("Failed to Restore raw materials");
    } finally {
      setRestoreId("");
      setSelectedRMs([]);
    }
  };

  const handleSelectRM = (id) => {
    setSelectedRMs((prev) =>
      prev.includes(id) ? prev.filter((rmId) => rmId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRMs.length === rawMaterials.length) {
      setSelectedRMs([]);
    } else {
      setSelectedRMs(rawMaterials.map((rm) => rm.id));
    }
  };

  const handleToggleQualityInspection = async (id, currentValue) => {
    const newValue = !currentValue;

    try {
      const res = await axios.patch(`/rms/update-rm/${id}`, {
        qualityInspectionNeeded: newValue,
      });
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

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
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

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
      itemCategory: e.itemCategory,
      itemColor: e.itemColor,
      hsnOrSac: e.hsnOrSac,
      type: e.type,
      location: e.location,
      moq: e.moq,
      panno: e.panno,
      sqInchRate: e.sqInchRate,
      baseRate: e.baseRate,
      gst: e.gst,
      rate: e.rate,
      stockQty: e.stockQty,
      baseQty: e.baseQty,
      pkgQty: e.pkgQty,
      purchaseUOM: e.purchaseUOM,
      stockUOM: e.stockUOM,
      qualityInspectionNeeded: e.qualityInspectionNeeded
        ? "Required"
        : "Not Required",
      attachments: e.attachments.map((att) => `${att.fileUrl}`).join(", "),
      totalRate: e.totalRate,
    }));
  };

  const handleExport = async () => {
    try {
      setDownloading(true);

      let exportData = [];

      if (exportScope === "current" || exportScope === "filtered") {
        exportData = data(rawMaterials);
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

  const userWarehouse = user?.warehouse;
  // const isAdmin = user?.userType.toLowerCase() == "admin";
  const isAdmin = false;

  const getVisibleWarehouseStock = (rm, isAdmin, userWarehouse) => {
    if (isAdmin) return rm.stockByWarehouse || [];

    // For normal user, show only his warehouse
    return (
      rm.stockByWarehouse?.filter((w) => w.warehouse === userWarehouse) || []
    );
  };


  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-[99vw] mx-auto overflow-x-hidden">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-1 h-6 sm:h-8 bg-primary rounded-full"></div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary">
                Raw Materials Master
              </h1>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm ml-3 sm:ml-4">
              Manage and track all raw materials in your inventory
              <span className="ml-2 font-semibold text-primary">
                ({pagination.totalResults} items)
              </span>
            </p>
            {restore && (
              <div className="mt-3 sm:mt-4 ml-3 sm:ml-4 flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 border border-amber-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                  <TbRestore className="text-amber-600 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm font-medium text-amber-800">
                    Restore Mode Active
                  </span>
                </div>
                {selectedRMs.length > 0 && (
                  <span className="text-xs sm:text-sm text-gray-600">
                    {selectedRMs.length} selected
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
            <button
              onClick={() => {
                setRestore((prev) => !prev);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
                setSelectedRMs([]);
              }}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm flex items-center gap-1.5 sm:gap-2 ${
                restore
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-secondary"
              }`}
            >
              {restore ? (
                <>
                  <FiX className="text-sm sm:text-base" /> 
                  <span className="whitespace-nowrap">Cancel</span>
                </>
              ) : (
                <>
                  <TbRestore className="text-sm sm:text-base" /> 
                  <span className="whitespace-nowrap">Restore</span>
                </>
              )}
            </button>
            {restore && (
              <>
                <button
                  onClick={() => handleRestore()}
                  disabled={selectedRMs.length === 0}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-green-500 hover:bg-green-600 text-white transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
                >
                  <TbRestore className="text-sm sm:text-base" /> 
                  <span className="whitespace-nowrap hidden sm:inline">Restore Selected</span>
                  <span className="whitespace-nowrap sm:hidden">Restore</span>
                </button>
                <button
                  onClick={() => handlePermanentDelete()}
                  disabled={selectedRMs.length === 0}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
                >
                  <FiTrash2 className="text-sm sm:text-base" /> 
                  <span className="whitespace-nowrap hidden sm:inline">Delete Permanently</span>
                  <span className="whitespace-nowrap sm:hidden">Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center">
          <div className="flex-1 relative w-full">
            <div className="relative">
              <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base sm:text-lg" />
              <input
                type="text"
                placeholder="Search by SKU, name, description, HSN/SAC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-secondary border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  title="Clear search"
                >
                  <FiX className="text-base sm:text-lg" />
                </button>
              )}
            </div>
          </div>

          {hasPermission("RawMaterial", "write") && (
            <button
              onClick={() => setShowBulkPanel(true)}
              className="w-full lg:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-secondary font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <FiPlus className="text-base sm:text-lg" /> 
              <span className="whitespace-nowrap">Add Raw Material</span>
            </button>
          )}
        </div>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {showExportOptions && (
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 w-full lg:w-auto">
                <select
                  value={exportScope}
                  onChange={(e) => setExportScope(e.target.value)}
                  className="border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-secondary cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all flex-1 sm:flex-none"
                >
                  <option value="current">This Page</option>
                  <option value="filtered">Filtered Data</option>
                  <option value="all">All Data</option>
                </select>

                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-secondary cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all flex-1 sm:flex-none"
                >
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>

                <button
                  disabled={downloading}
                  onClick={handleExport}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary hover:bg-primary/90 text-secondary font-semibold rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                >
                  {downloading ? (
                    <PulseLoader size={5} color="#292926" />
                  ) : (
                    <>
                      <FiDownload className="text-sm sm:text-base" /> 
                      <span className="whitespace-nowrap">Download</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              onClick={toggleExportOptions}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-secondary font-semibold rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all duration-200 text-xs sm:text-sm"
            >
              <FiDownload className="text-sm sm:text-base" /> 
              <span className="whitespace-nowrap">{showExportOptions ? "Hide" : "Export"}</span>
            </button>

            <button
              disabled={sampleDownloading}
              onClick={handleSampleDownload}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-secondary font-semibold rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {sampleDownloading ? (
                <PulseLoader size={5} color="#292926" />
              ) : (
                <>
                  <FiDownload className="text-sm sm:text-base" /> 
                  <span className="whitespace-nowrap hidden sm:inline">Sample Excel</span>
                  <span className="whitespace-nowrap sm:hidden">Sample</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 flex-1 sm:flex-none min-w-0">
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer text-secondary font-semibold min-w-0 flex-1">
                <FiUploadCloud className="text-base sm:text-lg flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate min-w-0">
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
                  className="text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Remove file"
                >
                  <FiX size={16} className="sm:hidden" />
                  <FiX size={18} className="hidden sm:block" />
                </button>
              )}
            </div>

            {file && (
              <button
                disabled={uploading}
                onClick={handleFileUpload}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary hover:bg-primary/90 text-secondary font-semibold rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                {uploading ? (
                  <PulseLoader size={5} color="#292926" />
                ) : (
                  "Submit"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full rm-table-scrollbar">
          <div className={`min-w-full ${isOpen ? `max-w-[40.8vw]` : `w-full`}`}>
            <table className="w-full text-[11px] min-w-max">
              <thead className="bg-gradient-to-r from-primary to-primary/90 text-secondary sticky top-0 z-20">
                <tr>
                  {restore && (
                    <th className="py-2.5 px-2 sticky left-0 z-30 bg-primary border-r border-primary/30">
                      <input
                        type="checkbox"
                        checked={selectedRMs.length === rawMaterials.length}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 accent-secondary cursor-pointer"
                      />
                    </th>
                  )}
                  {[
                    "#",
                    "Created At",
                    "Updated At",
                    "SKU Code",
                    "Item Name",
                    "Description",
                    "Item Category",
                    "Item Color",
                    "HSN/SAC",
                    "Type",
                    "Qual. Insp.",
                    "Location",
                    "Base Qty",
                    "Pkg Qty",
                    "MOQ",
                    "Panno",
                    "SqInch Rate",
                    "GST",
                    "Rate",
                    "Pur. Uom",
                    "Stock Qty",
                    "Stock Uom",
                    "Total Rate",
                    "Attachment",
                    "Status",
                    "Created By",
                    "Action",
                  ].map((th) => (
                    <th
                      key={th}
                      className="py-2.5 px-2 text-left font-semibold text-[11px] whitespace-nowrap border-r border-primary/30 last:border-r-0"
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={restore ? 28 : 27} className="p-8">
                      <TableSkeleton
                        rows={pagination.limit}
                        columns={restore ? Array(28).fill({}) : Array(27).fill({})}
                      />
                    </td>
                  </tr>
                ) : (
                  <>
                    {rawMaterials.map((rm, i) => (
                      <tr
                        key={rm.id}
                        className="hover:bg-gray-50 transition-colors duration-150 group"
                      >
                        {restore && (
                          <td className="px-2 py-2 sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r border-gray-200">
                            <input
                              type="checkbox"
                              checked={selectedRMs.includes(rm.id)}
                              onChange={() => handleSelectRM(rm.id)}
                              className="w-3.5 h-3.5 accent-primary cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="px-2 py-2 text-gray-600 font-medium border-r border-gray-200">
                          {Number(pagination.currentPage - 1) *
                            Number(pagination.limit) +
                            i +
                            1}
                        </td>
                        <td className="px-2 py-2 text-gray-600 border-r border-gray-200 whitespace-nowrap">
                          {new Date(rm.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="px-2 py-2 text-gray-600 border-r border-gray-200 whitespace-nowrap">
                          {new Date(rm.updatedAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <span className="font-semibold text-secondary bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                            {rm.skuCode}
                          </span>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <span className="font-medium text-secondary">
                            {rm.itemName}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-gray-600 max-w-[150px] truncate border-r border-gray-200">
                          {rm.description || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-gray-600 border-r border-gray-200">
                          {rm.itemCategory || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-gray-600 border-r border-gray-200">
                          {rm.itemColor || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <span className="text-secondary font-medium">
                            {rm.hsnOrSac}
                          </span>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                            {rm.type}
                          </span>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <div className="flex items-center justify-center">
                            <Toggle
                              checked={rm.qualityInspectionNeeded}
                              onChange={() =>
                                handleToggleQualityInspection(
                                  rm.id,
                                  rm.qualityInspectionNeeded
                                )
                              }
                            />
                          </div>
                        </td>
                        <td className="px-2 py-2 text-gray-600 border-r border-gray-200">
                          {rm.location || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-gray-600 font-medium border-r border-gray-200">
                          {rm.baseQty}
                        </td>
                        <td className="px-2 py-2 text-gray-600 font-medium border-r border-gray-200">
                          {rm.pkgQty}
                        </td>
                        <td className="px-2 py-2 text-gray-600 font-medium border-r border-gray-200">
                          {rm.moq}
                        </td>
                        <td className="px-2 py-2 text-gray-600 border-r border-gray-200">
                          {rm.panno || "0"}
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <span className="font-semibold text-secondary whitespace-nowrap">
                            ₹{(Number(rm.sqInchRate) || 0).toFixed(4)}
                          </span>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          {rm.gst ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                              {rm.gst}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <span className="font-semibold text-secondary whitespace-nowrap">
                            ₹{rm.rate || "0"}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-gray-600 border-r border-gray-200">
                          {rm.purchaseUOM || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          {isAdmin ? (
                            <div className="font-semibold text-secondary">
                              {rm.stockQty?.toFixed(2)}
                            </div>
                          ) : (
                            ""
                          )}
                          {getVisibleWarehouseStock(
                            rm,
                            isAdmin,
                            userWarehouse
                          ).map((w) => (
                            <div
                              key={w._id}
                              className="font-medium text-secondary"
                            >
                              {isAdmin
                                ? `${w.warehouse}: ${w.qty?.toFixed(2)}`
                                : `${w.qty?.toFixed(2)}`}
                            </div>
                          ))}
                          {!isAdmin &&
                            getVisibleWarehouseStock(rm, isAdmin, userWarehouse)
                              .length === 0 && (
                              <span className="text-gray-400">0</span>
                            )}
                        </td>
                        <td className="px-2 py-2 text-gray-600 border-r border-gray-200">
                          {rm.stockUOM || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <span className="font-bold text-primary whitespace-nowrap">
                            ₹{rm.totalRate?.toFixed(2) || "0"}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center border-r border-gray-200">
                          {Array.isArray(rm.attachments) &&
                          rm.attachments.length > 0 ? (
                            <button
                              onClick={() => setOpenAttachments(rm.attachments)}
                              className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors text-[11px]"
                            >
                              View ({rm.attachments.length})
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                          {openAttachments && (
                            <AttachmentsModal2
                              attachments={openAttachments}
                              onClose={() => setOpenAttachments(null)}
                            />
                          )}
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <div className="flex items-center justify-center gap-1">
                            <Toggle
                              checked={rm.status === "Active"}
                              onChange={() =>
                                handleToggleStatus(rm.id, rm.status)
                              }
                            />
                            <span
                              className={`text-[10px] font-medium ${
                                rm.status === "Active"
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {rm.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-gray-600 border-r border-gray-200">
                          {rm.createdByName || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-1.5 justify-center">
                            {hasPermission("RawMaterial", "update") &&
                            restore == false ? (
                              <button
                                onClick={() => setEditData(rm)}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Edit"
                              >
                                <FiEdit className="text-base" />
                              </button>
                            ) : restoreId == rm.id ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <button
                                onClick={() => handleRestore(rm.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Restore"
                              >
                                <TbRestore className="text-base" />
                              </button>
                            )}

                            {hasPermission("RawMaterial", "delete") &&
                            restore == false ? (
                              deleteId == rm.id ? (
                                <PulseLoader size={4} color="#d8b76a" />
                              ) : (
                                <button
                                  onClick={() => handleDelete(rm.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                  data-tooltip-id="statusTip"
                                  data-tooltip-content="Delete"
                                >
                                  <FiTrash2 className="text-base" />
                                </button>
                              )
                            ) : deleteId == rm.id ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <button
                                onClick={() => handlePermanentDelete(rm.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Permanent Delete"
                              >
                                <FiTrash2 className="text-base" />
                              </button>
                            )}
                            <Tooltip
                              id="statusTip"
                              place="top"
                              style={{
                                backgroundColor: "#292926",
                                color: "#d8b76a",
                                fontSize: "11px",
                                fontWeight: "bold",
                                borderRadius: "4px",
                                padding: "4px 8px",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rawMaterials.length === 0 && (
                      <tr>
                        <td
                          colSpan={restore ? 28 : 27}
                          className="px-4 py-8 text-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              <FiSearch className="text-xl text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium text-sm">
                              No raw materials found
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {search
                                ? "Try adjusting your search criteria"
                                : "Get started by adding a new raw material"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {openAttachments && (
          <AttachmentsModal2
            attachments={openAttachments}
            onClose={() => setOpenAttachments(null)}
          />
        )}
      </div>

      <div className="mt-6">
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          entriesPerPage={pagination.limit}
          totalResults={pagination.totalResults}
          onEntriesChange={(limit) => {
            setPagination((prev) => ({ ...prev, limit, currentPage: 1 }));
          }}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
          }}
        />
      </div>
      {showBulkPanel && <BulkRmPanel onClose={() => setShowBulkPanel(false)} />}
      {editData && (
        <EditRawMaterialModal
          rawMaterial={editData}
          onClose={() => setEditData(null)}
          onUpdated={fetchRawMaterials}
          uoms={uoms}
        />
      )}
    </div>
  );
};

export default RmMaster;
