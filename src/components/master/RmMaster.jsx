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
} from "react-icons/fi";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import TableSkeleton from "../TableSkeleton";
import EditRawMaterialModal from "./EditRawMaterialModal";
import AddBulkRawMaterials from "./BulkRmPanel.jsx";
import BulkRmPanel from "./BulkRmPanel.jsx";
import Toggle from "react-toggle";

const RmMaster = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
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
          limit: 20, // or dynamic
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
    } catch (err) {
      toast.error("Failed to download sample");
    }
  };

  const handleFileUpload = async () => {
    if (!file) return toast.error("Please select a file first");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/rms/upload-rm-excel", formData);
      toast.success("Raw materials uploaded");
      setFile(null);
      fetchRawMaterials(); // reload list
    } catch (err) {
      toast.error("Upload failed");
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
  }, [pagination.currentPage]);

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
    const newValue = currentValue == true ? false : true;

    try {
      const res = await axios.patch(`/rms/update-rm/${id}`, {
        qualityInspectionNeeded: newValue,
      });

      if (res.status === 200) {
        toast.success("Quality Inspection status updated");
        fetchRawMaterials(); // refresh the table
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Failed to update inspection status");
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
        fetchRawMaterials(); // refresh the table
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
    <Dashboard>
      <div className="relative p-4 sm:p-6 max-w-[92vw] mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#292926]">
            Raw Materials{" "}
            <span className="text-gray-500">({rawMaterials.length})</span>
          </h2>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSampleDownload}
              className="flex items-center gap-2 bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-black font-semibold px-4 py-2 rounded transition"
            >
              <FiDownload /> Sample Excel
            </button>

            <label className="flex items-center gap-2 bg-[#d8b76a]/20 px-4 py-2 rounded cursor-pointer text-[#292926] font-semibold">
              <FiUploadCloud />
              <span>Upload Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            <button
              onClick={handleFileUpload}
              className="bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-black font-semibold px-4 py-2 rounded transition"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col w-full sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Search raw materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 pl-10 pr-4 py-2 text-[#292926] border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
            />
            <FiSearch className="absolute left-3 top-3 text-[#d8b76a]" />
          </div>
          <button
            onClick={() => setShowBulkPanel(true)}
            className="w-full sm:w-40 justify-center bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-black font-semibold px-4 py-2 rounded flex items-center gap-2 cursor-pointer transition duration-200"
          >
            <FiPlus /> Add R.M.
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm sm:text-base">
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
                  "Pur. Uom",
                  "GST",
                  "Stock Qty",
                  "Stock Uom",
                  "Attachment",
                  "Status",
                  "Created By",
                  "Action",
                ].map((th) => (
                  <th key={th} className="py-2 px-4 whitespace-nowrap">
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={50} columns={TableHeaders} />
              ) : (
                <>
                  {filteredData.map((rm, i) => (
                    <tr
                      key={rm._id}
                      className="border-b border-[#d8b76a] hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">
                        {Number(pagination.currentPage - 1) *
                          Number(pagination.limit) +
                          i +
                          1}
                      </td>
                      <td className="px-2 py-2">
                        {new Date(rm.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-2 py-2">
                        {new Date(rm.updatedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-4 py-2">{rm.skuCode}</td>
                      <td className="px-4 py-2">{rm.itemName}</td>
                      <td className="px-4 py-2">{rm.description || "-"}</td>
                      <td className="px-4 py-2">{rm.hsnOrSac}</td>
                      <td className="px-4 py-2">{rm.type}</td>
                      <td className="px-4 py-2">
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

                      <td className="px-4 py-2">{rm.location || "-"}</td>
                      <td className="px-4 py-2">{rm.baseQty}</td>
                      <td className="px-4 py-2">{rm.pkgQty}</td>
                      <td className="px-4 py-2">{rm.moq}</td>
                      <td className="px-4 py-2">{rm.purchaseUOM || "-"}</td>
                      <td className="px-4 py-2">{rm.gst}%</td>
                      <td className="px-4 py-2">{rm.stockQty}</td>
                      <td className="px-4 py-2">{rm.stockUOM || "-"}</td>
                      <td className="px-4 py-2">
                        {rm.attachments != "" ? (
                          <a
                            href={rm.attachments}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Attachment
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Toggle
                          checked={rm.status === "Active"}
                          onChange={() => handleToggleStatus(rm.id, rm.status)}
                        />
                      </td>
                      <td className="px-4 py-2">{rm.createdByName || "-"}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2 text-xl text-[#d39c25]">
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
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center sm:justify-end items-center gap-2 text-sm">
        <button
          onClick={() => goToPage(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
          className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer "
        >
          Prev
        </button>

        {[...Array(pagination.totalPages).keys()].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => goToPage(i + 1)}
            className={`px-5 py-2 rounded text-base cursor-pointer ${
              pagination.currentPage === i + 1
                ? "bg-[#d8b76a] text-white font-semibold"
                : "bg-[#d8b76a]/20"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => goToPage(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Next
        </button>
      </div>
      {showBulkPanel && <BulkRmPanel onClose={() => setShowBulkPanel(false)} />}
    </Dashboard>
  );
};

export default RmMaster;
