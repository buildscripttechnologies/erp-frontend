import React, { useEffect, useState, useRef } from "react";
import {
  FiPlus,
  FiSearch,
  FiCheckCircle,
  FiUploadCloud,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiX,
  FiEye,
  FiFilter,
  FiCopy,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
} from "react-icons/fi";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
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
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: 'soft', sku: '', name: '' });
  const [detailData, setDetailData] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  const hasMountedRef = useRef(false);
  const tableScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleTableScroll = (direction) => {
    if (!tableScrollRef.current) return;
    const scrollAmount = 400;
    const container = tableScrollRef.current;
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  const updateScrollButtons = () => {
    if (!tableScrollRef.current) return;
    const container = tableScrollRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    const container = tableScrollRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [rawMaterials]);

  ScrollLock(editData != null || showBulkPanel || openAttachments != null || showExportOptions);
  useEffect(() => {
    const fetchUOMs = async () => {
      try {
        const res = await axios.get("/uoms/all-uoms"); 
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
      return;
    }
    const debouncedSearch = debounce(() => {
      if (restore) {
        fetchDeletedRawMaterials(1);
      } else {
        fetchRawMaterials(1);
      }
    }, 400);

    debouncedSearch();

    return () => debouncedSearch.cancel();
  }, [search]);

  const toggleExportOptions = () => {
    setShowExportOptions((prev) => !prev);
  };

  const [pagination, setPagination] = useState({
    totalResults: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const fetchRawMaterials = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get("/rms/rm", {
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
      fetchRawMaterials();
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

  const handleDelete = async (id, sku = '', name = '') => {
    setDeleteModal({ open: true, id, type: 'soft', sku, name });
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ open: false, id: null, type: 'soft', sku: '', name: '' });
    try {
      setDeleteId(id);
      const res = await axios.delete(`/rms/delete-rm/${id}`);
      if (res.status == 200) {
        toast.success("Raw material deleted successfully");
        fetchRawMaterials(pagination.currentPage);
      } else {
        toast.error("Failed to delete raw material");
      }
    } catch (err) {
      toast.error("Failed to delete raw material");
    } finally {
      setDeleteId("");
    }
  };
  const handlePermanentDelete = async (id = "", sku = '', name = '') => {
    setDeleteModal({ open: true, id, type: 'permanent', sku, name });
  };

  const confirmPermanentDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ open: false, id: null, type: 'soft' });
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
        generateExportFile(exportData);
        setDownloading(false);
      } else {

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

  const isAdmin = false;

  const getVisibleWarehouseStock = (rm, isAdmin, userWarehouse) => {
    if (isAdmin) return rm.stockByWarehouse || [];

    return (
      rm.stockByWarehouse?.filter((w) => w.warehouse === userWarehouse) || []
    );
  };


  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[100vw] mx-auto h-full flex flex-col">

      <div className="bg-white rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 mb-1.5 sm:mb-2 flex-shrink-0 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 lg:gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-secondary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary leading-tight">
                  Raw Materials Master
                </h1>
                <div className="h-5 w-px bg-gray-300"></div>
                <span className="text-primary font-bold text-base sm:text-lg">
                  {pagination.totalResults}
                </span>
              </div>
            </div>
            {restore && (
              <div className="mt-2.5 ml-12 flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1">
                  <TbRestore className="text-amber-600 text-sm" />
                  <span className="text-xs font-medium text-amber-700">
                    Restore Mode
                  </span>
                </div>
                {selectedRMs.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {selectedRMs.length} selected
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <button
              onClick={() => {
                setRestore((prev) => !prev);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
                setSelectedRMs([]);
              }}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-1.5 ${
                restore
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "border border-gray-200 hover:border-primary hover:text-primary text-gray-600"
              }`}
            >
              {restore ? (
                <>
                  <FiX className="text-sm" /> 
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <TbRestore className="text-sm" /> 
                  <span>Restore</span>
                </>
              )}
            </button>
            {restore && (
              <>
                <button
                  onClick={() => handleRestore()}
                  disabled={selectedRMs.length === 0}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-medium text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <TbRestore className="text-sm" /> 
                  <span className="hidden sm:inline">Restore Selected</span>
                  <span className="sm:hidden">Restore</span>
                </button>
                <button
                  onClick={() => handlePermanentDelete()}
                  disabled={selectedRMs.length === 0}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-medium text-sm bg-red-500 hover:bg-red-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <FiTrash2 className="text-sm" /> 
                  <span className="whitespace-nowrap hidden sm:inline">Delete Permanently</span>
                  <span className="whitespace-nowrap sm:hidden">Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

<div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-2 mb-4 flex-shrink-0">
  <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 sm:p-4">
    <div className="w-full lg:flex-1 lg:min-w-0">
      <input
        type="text"
        placeholder="Search by SKU, name, description, HSN/SAC..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-4 pr-2 py-2 text-secondary border border-gray-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
      />
    </div>
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:flex-shrink-0">
      <button
        onClick={() => setShowExportOptions(true)}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-primary dark:bg-primary/30 text-secondary dark:text-primary dark:border dark:border-primary font-semibold rounded-lg shadow hover:bg-primary/90 dark:hover:bg-primary/40 transition-all duration-150 text-xs sm:text-sm whitespace-nowrap"
      >
        <FiDownload className="text-sm sm:text-base" /> Export
      </button>
      <button
        onClick={handleSampleDownload}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition-all duration-150 text-xs sm:text-sm whitespace-nowrap"
      >
        <FiDownload className="text-sm sm:text-base" /> Sample Excel
      </button>
      <label className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition-all duration-150 text-xs sm:text-sm whitespace-nowrap cursor-pointer">
        <FiUploadCloud className="text-sm sm:text-base" /> Upload Excel
        <input
          type="file"
          accept=".xlsx, .xls"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>
      <button
        className="px-3 sm:px-4 py-2 bg-primary dark:bg-primary/30 dark:border dark:border-primary text-secondary dark:text-primary hover:bg-primary/90 dark:hover:bg-primary/40 font-semibold rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap"
        onClick={() => setShowBulkPanel(true)}
      >
        <FiPlus className="text-sm sm:text-base" /> Add Raw Material
      </button>
    </div>
  </div>
</div>


      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4 shadow-sm">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 text-secondary hover:text-primary font-medium text-sm transition-colors"
          >
            <FiFilter className="text-base" />
            <span>Filter or search</span>
          </button>
          <div className="w-px h-5 bg-gray-300"></div>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-2 text-secondary hover:text-primary font-medium text-sm transition-colors"
          >
            {sortOrder === "asc" ? (
              <HiSortAscending className="text-base" />
            ) : (
              <HiSortDescending className="text-base" />
            )}
            <span>Sort Order</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {loading ? (
            <div className="flex justify-center py-10 col-span-full">
              <BeatLoader color="#d8b76a" size={10} />
            </div>
          ) : rawMaterials.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm col-span-full">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiSearch className="text-xl text-primary" />
              </div>
              <p className="text-secondary font-semibold text-sm">No raw materials found</p>
              <p className="text-gray-500 text-xs mt-1">
                {search ? "Try adjusting your search criteria" : "Get started by adding a new raw material"}
              </p>
            </div>
          ) : (
            rawMaterials.map((rm, i) => (
              <div
                key={rm.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >

                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {restore && (
                      <input
                        type="checkbox"
                        checked={selectedRMs.includes(rm.id)}
                        onChange={() => handleSelectRM(rm.id)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-primary font-semibold uppercase">SKU</span>
                      <span className="font-bold text-secondary text-sm">{rm.skuCode}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setDetailData(rm)}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                    >
                      <FiEye className="text-lg" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(rm.skuCode);
                        toast.success("SKU copied!");
                      }}
                      className="p-2 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <FiCopy className="text-lg" />
                    </button>
                    {hasPermission("RawMaterial", "delete") && !restore && (
                      <button
                        onClick={() => handleDelete(rm.id, rm.skuCode, rm.itemName)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    )}
                    {hasPermission("RawMaterial", "update") && !restore && (
                      <button
                        onClick={() => setEditData(rm)}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                      >
                        <FiEdit className="text-lg" />
                      </button>
                    )}
                    {restore && (
                      <>
                        <button
                          onClick={() => handleRestore(rm.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        >
                          <TbRestore className="text-lg" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(rm.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex gap-3 mb-3">

                    <div className="flex-shrink-0">
                      {Array.isArray(rm.attachments) && rm.attachments.length > 0 ? (
                        <button
                          onClick={() => setOpenAttachments(rm.attachments)}
                          className="relative group"
                        >
                          <img 
                            src={rm.attachments[0]?.fileUrl || rm.attachments[0]} 
                            alt="Attachment"
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 hover:border-primary transition-all duration-200 hover:shadow-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-16 h-16 bg-primary/10 rounded-lg border-2 border-gray-200 items-center justify-center hidden">
                            <FiEye className="text-primary text-lg" />
                          </div>
                          {rm.attachments.length > 1 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-secondary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                              {rm.attachments.length}
                            </span>
                          )}
                        </button>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <FiImage className="text-gray-400 text-xl" />
                        </div>
                      )}
                    </div>


                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Product Name</p>
                      <p className="text-sm font-bold text-secondary leading-tight">{rm.itemName}</p>
                      {rm.description && (
                        <div className="mt-1.5">
                          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Description</p>
                          <p className="text-xs font-medium text-green-600">{rm.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-x-2 gap-y-2 text-xs">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Category</p>
                      {rm.itemCategory ? (
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-primary text-secondary rounded">
                          {rm.itemCategory}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Color</p>
                      <p className="font-semibold text-secondary">{rm.itemColor || "—"}</p>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Location</p>
                      <p className="font-semibold text-secondary truncate">{rm.location || "—"}</p>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">MOQ</p>
                      <p className="font-semibold text-secondary">{rm.moq || "—"}</p>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Panno</p>
                      <p className="font-semibold text-secondary">{rm.panno || "0"}</p>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Stock UOM</p>
                      <p className="font-semibold text-secondary">{rm.stockUOM || "—"}</p>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">SqInch Rate</p>
                      <p className="font-bold text-secondary">₹{(Number(rm.sqInchRate) || 0).toFixed(4)}</p>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Rate</p>
                      <p className="font-bold text-secondary">₹{rm.rate || "0"}</p>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Total Rate</p>
                      <p className="font-bold text-green-600">₹{rm.totalRate?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-gray-400 uppercase">Qual. Insp.</span>
                        <Toggle
                          checked={rm.qualityInspectionNeeded}
                          onChange={() => handleToggleQualityInspection(rm.id, rm.qualityInspectionNeeded)}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-gray-400 uppercase">Status</span>
                        <Toggle
                          checked={rm.status === "Active"}
                          onChange={() => handleToggleStatus(rm.id, rm.status)}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-secondary bg-gray-100 px-2 py-0.5 rounded">{rm.createdByName || "—"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="hidden lg:block bg-white rounded-xl shadow-xl border border-gray-200/60 overflow-hidden" style={{ height: 'calc(100vh - 340px)' }}>
        <div className="flex items-center justify-end gap-2 px-3 py-1 bg-gray-50/50 border-b border-gray-100">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mr-auto">
            {canScrollRight ? '← Scroll →' : ''}
          </span>
          <div className="flex items-center">
            <button
              onClick={() => handleTableScroll('left')}
              disabled={!canScrollLeft}
              className={`p-1 rounded transition-all duration-200 ${canScrollLeft ? 'text-primary hover:bg-primary/10' : 'text-gray-300 cursor-not-allowed'}`}
            >
              <FiChevronLeft className="text-sm" />
            </button>
            <button
              onClick={() => handleTableScroll('right')}
              disabled={!canScrollRight}
              className={`p-1 rounded transition-all duration-200 ${canScrollRight ? 'text-primary hover:bg-primary/10' : 'text-gray-300 cursor-not-allowed'}`}
            >
              <FiChevronRight className="text-sm" />
            </button>
          </div>
        </div>
        
        <div 
          ref={tableScrollRef}
          className="w-full rm-table-scrollbar overflow-auto"
          style={{ height: 'calc(100% - 32px)' }}
        >
          <table className="w-full text-[12px]" style={{ minWidth: '1800px' }}>
              <thead className="bg-primary text-secondary sticky top-0 z-20">
                <tr>
                  {restore && (
                    <th className="py-2 px-1.5 sm:px-2 sticky left-0 z-30 bg-primary border-r border-primary/20">
                      <input
                        type="checkbox"
                        checked={selectedRMs.length === rawMaterials.length}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-secondary cursor-pointer"
                      />
                    </th>
                  )}
                  {[
                    { label: "ID", width: "50px", center: true },
                    { label: "Attachment", width: null, center: true },
                    { label: "SKU Code", width: "140px" },
                    { label: "Item Name", width: null },
                    { label: "Description", width: null },
                    { label: "Item Category", width: null },
                    { label: "Item Color", width: null },
                    { label: "Qual. Insp.", width: null, center: true },
                    { label: "Location", width: null },
                    { label: "MOQ", width: null, center: true },
                    { label: "Panno", width: null, center: true },
                    { label: "SqInch Rate", width: null },
                    { label: "Rate", width: null },
                    { label: "Stock Uom", width: null, center: true },
                    { label: "Total Rate", width: null },
                    { label: "Status", width: null, center: true },
                    { label: "Created By", width: null },
                    { label: "Detail", width: null, center: true },
                    { label: "Action", width: null, center: true },
                  ].map((th) => (
                    <th
                      key={th.label}
                      className={`py-2 px-2 font-semibold text-[12px] whitespace-nowrap border-r border-primary/20 last:border-r-0 uppercase tracking-wide ${th.center ? 'text-center' : 'text-left'}`}
                      style={th.width ? { minWidth: th.width } : {}}
                    >
                      {th.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <TableSkeleton
                    rows={pagination.limit}
                    columns={restore ? Array(21).fill({}) : Array(20).fill({})}
                  />
                ) : (
                  <>
                    {rawMaterials.map((rm, i) => (
                      <tr
                        key={rm.id}
                        className={`hover:bg-primary/5 transition-colors duration-150 group border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        {restore && (
                          <td className={`px-2 py-1.5 sticky left-0 z-10 group-hover:bg-primary/5 border-r border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <input
                              type="checkbox"
                              checked={selectedRMs.includes(rm.id)}
                              onChange={() => handleSelectRM(rm.id)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="px-2 py-1.5 text-gray-500 font-medium border-r border-gray-100 text-center" style={{ minWidth: '50px' }}>
                          {Number(pagination.currentPage - 1) *
                            Number(pagination.limit) +
                            i +
                            1}
                        </td>
                        <td className="px-2 py-1.5 text-center border-r border-gray-100">
                          {Array.isArray(rm.attachments) &&
                          rm.attachments.length > 0 ? (
                            <button
                              onClick={() => setOpenAttachments(rm.attachments)}
                              className="relative group"
                            >
                              <img 
                                src={rm.attachments[0]?.fileUrl || rm.attachments[0]} 
                                alt="Attachment"
                                className="w-10 h-10 object-cover rounded border border-gray-200 hover:border-primary transition-all duration-200 hover:shadow-md"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-10 h-10 bg-primary/10 rounded border border-gray-200 items-center justify-center hidden">
                                <FiEye className="text-primary text-sm" />
                              </div>
                              {rm.attachments.length > 1 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-secondary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                  {rm.attachments.length}
                                </span>
                              )}
                            </button>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center mx-auto">
                              <FiImage className="text-gray-400 text-sm" />
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-1.5 border-r border-gray-100" style={{ minWidth: '140px' }}>
                          <span className="font-semibold text-secondary bg-primary/10 px-2 py-1 rounded text-[11px]">
                            {rm.skuCode}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 border-r border-gray-100">
                          <span className="font-semibold text-gray-800">
                            {rm.itemName}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-gray-600 max-w-[180px] truncate border-r border-gray-100">
                          {rm.description || (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 border-r border-gray-100">
                          {rm.itemCategory ? (
                            <span className="inline-block px-2 py-1 text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full whitespace-nowrap">
                              {rm.itemCategory}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-gray-600 border-r border-gray-100">
                          {rm.itemColor || (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 border-r border-gray-100">
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
                        <td className="px-2 py-1.5 text-gray-600 border-r border-gray-100">
                          {rm.location || (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-gray-700 font-medium border-r border-gray-100 text-center">
                          {rm.moq}
                        </td>
                        <td className="px-2 py-1.5 text-gray-600 border-r border-gray-100 text-center">
                          {rm.panno || "0"}
                        </td>
                        <td className="px-2 py-1.5 border-r border-gray-100">
                          <span className="font-semibold text-gray-700 whitespace-nowrap">
                            ₹{(Number(rm.sqInchRate) || 0).toFixed(4)}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 border-r border-gray-100">
                          <span className="font-semibold text-gray-700 whitespace-nowrap">
                            ₹{rm.rate || "0"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-gray-600 border-r border-gray-100 text-center">
                          {rm.stockUOM || (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 border-r border-gray-100">
                          <span className="font-bold text-green-600 whitespace-nowrap bg-green-50 px-2 py-1 rounded">
                            ₹{rm.totalRate?.toFixed(2) || "0"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 border-r border-gray-100">
                          <div className="flex items-center justify-center">
                            <Toggle
                              checked={rm.status === "Active"}
                              onChange={() =>
                                handleToggleStatus(rm.id, rm.status)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-gray-600 border-r border-gray-100">
                          {rm.createdByName || (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 border-r border-gray-100">
                          <button
                            onClick={() => setDetailData(rm)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-md flex items-center gap-1.5 transition-colors text-[11px] border border-blue-200"
                          >
                            <FiEye className="text-sm" /> View
                          </button>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-2 justify-center">
                            {hasPermission("RawMaterial", "update") &&
                            restore == false ? (
                              <button
                                onClick={() => setEditData(rm)}
                                className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors border border-primary/20"
                              >
                                <FiEdit className="text-sm" />
                              </button>
                            ) : restoreId == rm.id ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <button
                                onClick={() => handleRestore(rm.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors border border-green-200"
                              >
                                <TbRestore className="text-sm" />
                              </button>
                            )}

                            {hasPermission("RawMaterial", "delete") &&
                            restore == false ? (
                              deleteId == rm.id ? (
                                <PulseLoader size={4} color="#d8b76a" />
                              ) : (
                                <button
                                  onClick={() => handleDelete(rm.id, rm.skuCode, rm.itemName)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors border border-red-200"
                                >
                                  <FiTrash2 className="text-sm" />
                                </button>
                              )
                            ) : deleteId == rm.id ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <button
                                onClick={() => handlePermanentDelete(rm.id, rm.skuCode, rm.itemName)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200"
                              >
                                <FiTrash2 className="text-base" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rawMaterials.length === 0 && (
                      <tr>
                        <td
                          colSpan={restore ? 21 : 20}
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

      <div className="mt-4 flex-shrink-0">
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

      {detailData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-primary px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
                  <FiEye className="text-black text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">Raw Material Details</h2>
                  <p className="text-black/70 text-xs">View complete information</p>
                </div>
              </div>
              <button
                onClick={() => setDetailData(null)}
                className="w-9 h-9 flex items-center justify-center hover:bg-black/10 rounded-xl text-black/80 hover:text-black transition-all"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
              {/* Item Header Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      {detailData.itemName?.charAt(0)?.toUpperCase() || "R"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{detailData.itemName}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">SKU:</span>
                          <span className="font-medium text-primary">{detailData.skuCode}</span>
                        </span>
                        {detailData.itemCategory && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {detailData.itemCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  <div className="px-5 py-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Created</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(detailData.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Last Updated</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(detailData.updatedAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                  <h4 className="text-sm font-semibold text-gray-700">Material Information</h4>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">HSN/SAC</p>
                      <p className="text-sm font-semibold text-gray-800">{detailData.hsnOrSac || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">GST</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {detailData.gst ? `${detailData.gst}%` : "-"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Color</p>
                      <p className="text-sm font-semibold text-gray-800">{detailData.itemColor || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Location</p>
                      <p className="text-sm font-semibold text-gray-800">{detailData.location || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Base Qty</p>
                      <p className="text-sm font-semibold text-gray-800">{detailData.baseQty || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Package Qty</p>
                      <p className="text-sm font-semibold text-gray-800">{detailData.pkgQty || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">MOQ</p>
                      <p className="text-sm font-semibold text-gray-800">{detailData.moq || "-"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Purchase UOM</p>
                      <p className="text-sm font-semibold text-gray-800">{detailData.purchaseUOM || "-"}</p>
                    </div>
                  </div>

                  {/* Stock Info - Highlighted */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3 border border-emerald-200 dark:border-emerald-700/50">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Stock Qty</p>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                        {detailData.stockQty?.toFixed(2) || "0"}
                        <span className="text-xs font-medium ml-1">{detailData.stockUOM || ""}</span>
                      </p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3 border border-primary/30">
                      <p className="text-[10px] text-primary uppercase tracking-wide mb-1">Rate</p>
                      <p className="text-lg font-bold text-primary">₹{detailData.rate || "0"}</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3 border border-primary/30">
                      <p className="text-[10px] text-primary uppercase tracking-wide mb-1">Total Value</p>
                      <p className="text-lg font-bold text-primary">
                        ₹{(Number(detailData.stockQty || 0) * Number(detailData.rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warehouse Stock */}
              {detailData.warehouseStock && detailData.warehouseStock.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-4">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                    <h4 className="text-sm font-semibold text-gray-700">Warehouse Stock</h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {detailData.warehouseStock.map((w) => (
                      <div key={w._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                        <span className="text-sm font-medium text-gray-700">{w.warehouse}</span>
                        <span className="text-sm font-bold text-primary">{w.qty?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setDetailData(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-primary px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                    <FiDownload className="text-black text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-black">Export Data</h2>
                    <p className="text-xs text-black/70">Choose export options</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportOptions(false)}
                  className="p-2 hover:bg-black/10 rounded-full transition-colors"
                >
                  <FiX className="text-black/80 text-lg" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">
                  Select Data Range
                </label>
                <div className="space-y-2">
                  {[
                    { value: "current", label: "This Page", desc: `Export ${rawMaterials.length} items from current page` },
                    { value: "filtered", label: "Filtered Data", desc: "Export data based on current search/filter" },
                    { value: "all", label: "All Data", desc: `Export all ${pagination.totalResults} items` },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        exportScope === option.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="exportScope"
                        value={option.value}
                        checked={exportScope === option.value}
                        onChange={(e) => setExportScope(e.target.value)}
                        className="mt-1 accent-primary"
                      />
                      <div>
                        <p className="font-medium text-secondary">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">
                  Export Format
                </label>
                <div className="flex gap-3">
                  {[
                    { value: "excel", label: "Excel", icon: "📊", color: "green" },
                    { value: "pdf", label: "PDF", icon: "📄", color: "red" },
                  ].map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setExportFormat(format.value)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                        exportFormat === format.value
                          ? format.value === "excel"
                            ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <span className="text-xl">{format.icon}</span>
                      <span>{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExportOptions(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleExport();
                  setShowExportOptions(false);
                }}
                disabled={downloading}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <ClipLoader size={16} color="#292926" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <FiDownload className="text-base" />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className={`px-6 py-4 ${deleteModal.type === 'permanent' ? 'bg-red-500' : 'bg-red-400'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FiTrash2 className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {deleteModal.type === 'permanent' ? 'Permanent Delete' : 'Delete Raw Material'}
                  </h3>
                  <p className="text-white/70 text-xs">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-5">
              {(deleteModal.sku || deleteModal.name) && (
                <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">SKU:</span>
                    <span className="font-semibold text-gray-800">{deleteModal.sku || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-semibold text-gray-800">{deleteModal.name || '-'}</span>
                  </div>
                </div>
              )}
              <p className="text-gray-600 text-sm">
                {deleteModal.type === 'permanent' 
                  ? 'Are you sure you want to permanently delete this raw material? This will remove all associated data and cannot be recovered.'
                  : 'Are you sure you want to delete this raw material? You can restore it later from the trash.'
                }
              </p>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, id: null, type: 'soft', sku: '', name: '' })}
                className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteModal.type === 'permanent' ? confirmPermanentDelete() : confirmDelete()}
                className={`px-5 py-2.5 text-white font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 ${
                  deleteModal.type === 'permanent' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-red-400 hover:bg-red-500'
                }`}
              >
                <FiTrash2 className="text-base" />
                {deleteModal.type === 'permanent' ? 'Delete Permanently' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RmMaster;
