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
  const [detailData, setDetailData] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  const hasMountedRef = useRef(false);
  const tableScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Handle table scroll with buttons
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

  ScrollLock(editData != null || showBulkPanel || openAttachments != null);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this raw material?"))
      return;
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
    <div className="p-2 sm:p-4 lg:p-6 max-w-[100vw] mx-auto">

      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg sm:rounded-xl border border-primary/20 p-2 sm:p-3 lg:p-4 mb-2 sm:mb-3 lg:mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-1 h-5 sm:h-6 md:h-8 bg-primary rounded-full"></div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight">
                Raw Materials Master
              </h1>
            </div>
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

<div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-2 mb-4">
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
        onClick={handleExport}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-primary text-secondary font-semibold rounded-lg shadow hover:bg-primary/90 transition-all duration-150 text-xs sm:text-sm whitespace-nowrap"
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
        className="px-3 sm:px-4 py-2 bg-primary hover:bg-primary/90 text-secondary font-semibold rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap"
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
                        onClick={() => handleDelete(rm.id)}
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

                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-1">Product Name</p>
                    <p className="text-base font-bold text-secondary leading-tight">{rm.itemName}</p>
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Category</p>
                      {rm.itemCategory ? (
                        <span className="inline-block px-2.5 py-1 text-xs font-bold bg-primary text-secondary rounded">
                          {rm.itemCategory}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Color</p>
                      <p className="text-sm font-semibold text-secondary">{rm.itemColor || "—"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Rate</p>
                      <p className="text-base font-bold text-secondary">₹{rm.rate || "0"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Total Rate</p>
                      <p className="text-base font-bold text-green-600">₹{rm.totalRate?.toFixed(2) || "0.00"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Stock UOM</p>
                      <p className="text-sm font-semibold text-secondary">{rm.stockUOM || "—"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Status</p>
                      <Toggle
                        checked={rm.status === "Active"}
                        onChange={() => handleToggleStatus(rm.id, rm.status)}
                      />
                    </div>
                  </div>


                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Created By</p>
                    <span className="text-sm font-semibold text-secondary bg-gray-100 px-3 py-1 rounded">{rm.createdByName || "—"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="hidden lg:block bg-white rounded-xl shadow-xl border border-gray-200/60 overflow-hidden">
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
          className="w-full overflow-x-auto rm-table-scrollbar"
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
                  <tr>
                    <td colSpan={restore ? 21 : 20} className="p-8">
                      <TableSkeleton
                        rows={pagination.limit}
                        columns={restore ? Array(21).fill({}) : Array(20).fill({})}
                      />
                    </td>
                  </tr>
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
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Edit"
                              >
                                <FiEdit className="text-sm" />
                              </button>
                            ) : restoreId == rm.id ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <button
                                onClick={() => handleRestore(rm.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors border border-green-200"
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Restore"
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
                                  onClick={() => handleDelete(rm.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors border border-red-200"
                                  data-tooltip-id="statusTip"
                                  data-tooltip-content="Delete"
                                >
                                  <FiTrash2 className="text-sm" />
                                </button>
                              )
                            ) : deleteId == rm.id ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <button
                                onClick={() => handlePermanentDelete(rm.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200"
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

      {detailData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/90 text-secondary px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-lg font-bold">Raw Material Details</h2>
              <button
                onClick={() => setDetailData(null)}
                className="text-secondary hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="font-bold text-secondary text-base">{detailData.itemName}</h3>
                <p className="text-sm text-gray-500">{detailData.skuCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Created At</p>
                  <p className="text-sm font-medium text-secondary">
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
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Updated At</p>
                  <p className="text-sm font-medium text-secondary">
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
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">HSN/SAC Code</p>
                  <p className="text-sm font-medium text-secondary">{detailData.hsnOrSac || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Base Qty</p>
                  <p className="text-sm font-medium text-secondary">{detailData.baseQty || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Pkg Qty</p>
                  <p className="text-sm font-medium text-secondary">{detailData.pkgQty || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">GST</p>
                  <p className="text-sm font-medium text-secondary">
                    {detailData.gst ? `${detailData.gst}%` : "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Purchase UOM</p>
                  <p className="text-sm font-medium text-secondary">{detailData.purchaseUOM || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Stock Qty</p>
                  <p className="text-sm font-medium text-secondary">
                    {detailData.stockQty?.toFixed(2) || "0"} {detailData.stockUOM || ""}
                  </p>
                </div>
              </div>
              {detailData.warehouseStock && detailData.warehouseStock.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Warehouse Stock</p>
                  <div className="space-y-2">
                    {detailData.warehouseStock.map((w) => (
                      <div key={w._id} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-600">{w.warehouse}</span>
                        <span className="text-sm font-medium text-secondary">{w.qty?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setDetailData(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-secondary font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RmMaster;
