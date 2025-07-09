import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import Dashboard from "../../../pages/Dashboard";
import TableSkeleton from "../../TableSkeleton";
import Toggle from "react-toggle";
import PaginationControls from "../../PaginationControls";
import { FaFileDownload } from "react-icons/fa";
import ScrollLock from "../../ScrollLock";
import AttachmentsModal from "../../AttachmentsModal";
import UpdateFgModal from "./UpdateFgModal";
import AddFgModal from "./AddFgModal";

const renderNestedMaterials = (
  materials,
  level = 1,
  parentIdx = "",
  expandedL2,
  expandedL3,
  toggleL2,
  toggleL3
) => {
  return materials.map((mat, idx) => {
    const currentKey = `${parentIdx}-${idx}`;
    const isExpandedL2 = expandedL2 === currentKey;
    const isExpandedL3 = expandedL3 === currentKey;

    // Map level number to label
    const levelLabel = `L${level}`;

    return (
      <React.Fragment key={`${mat.id}-${level}-${idx}`}>
        <tr
          className="border-t border-[#d8b76a]/50 cursor-pointer hover:bg-gray-50"
          onClick={() => {
            if (level === 1) toggleL2(currentKey);
            else if (level === 2) toggleL3(currentKey);
          }}
        >
          <td className="flex" style={{ paddingLeft: `${level * 15}px` }}>
            <span className="text-[#d8b76a] mr-2 font-bold pl-2 border-dashed border-l-2">
              {levelLabel}
            </span>
            <div className="flex items-center gap-1">
              {mat.skuCode}
              {(mat.rm?.length > 0 || mat.sfg?.length > 0) && (
                <span className="text-[#d8b76a] text-xs">
                  {level === 1 && expandedL2 === currentKey ? "▲" : ""}
                  {level === 1 && expandedL2 !== currentKey ? "▼" : ""}
                  {level === 2 && expandedL3 === currentKey ? "▲" : ""}
                  {level === 2 && expandedL3 !== currentKey ? "▼" : ""}
                </span>
              )}
            </div>
          </td>
          <td className="px-2">{mat.itemName}</td>
          <td className="px-2">{mat.description || "-"}</td>
          <td className="px-2">{mat.type}</td>
          <td className="px-2">{mat.hsnOrSac || mat.hsnSac}</td>
          <td className="px-2">{mat.stockUOM || mat.uom}</td>
          <td className="px-2">
            {mat.qualityInspectionNeeded ? "Required" : "Not Required"}
          </td>
          <td className="px-2">{mat.location}</td>
          <td className="px-2">{mat.qty}</td>
        </tr>

        {level === 1 &&
          isExpandedL2 &&
          (mat.rm?.length > 0 || mat.sfg?.length > 0) && (
            <tr>
              <td colSpan="17">
                <div className=" border border-[#d8b76a]/50 rounded">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-[#d8b76a]/30">
                      <tr>
                        <th
                          className="px-2 font-semibold"
                          style={{ paddingLeft: `${level * 15}px` }}
                        >
                          SKU Code
                        </th>
                        <th className="px-2 font-semibold">Item Name</th>
                        <th className="px-2 font-semibold">Description</th>
                        <th className="px-2 font-semibold">Type</th>
                        <th className="px-2 font-semibold">HSN/SAC</th>
                        <th className="px-2 font-semibold">UOM</th>
                        <th className="px-2 font-semibold">Quality Insp.</th>
                        <th className="px-2 font-semibold">Location</th>
                        <th className="px-2 font-semibold">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderNestedMaterials(
                        mat.rm || [],
                        2,
                        currentKey,
                        expandedL2,
                        expandedL3,
                        toggleL2,
                        toggleL3
                      )}
                      {renderNestedMaterials(
                        mat.sfg || [],
                        2,
                        currentKey,
                        expandedL2,
                        expandedL3,
                        toggleL2,
                        toggleL3
                      )}
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          )}

        {level === 2 &&
          isExpandedL3 &&
          (mat.rm?.length > 0 || mat.sfg?.length > 0) && (
            <tr>
              <td colSpan="17">
                <div className="mt-2 border border-[#d8b76a]/30 rounded">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-[#d8b76a]/20">
                      <tr>
                        <th
                          className="px-2 font-semibold"
                          style={{ paddingLeft: `${level * 15}px` }}
                        >
                          SKU Code
                        </th>
                        <th className="px-2 font-semibold">Item Name</th>
                        <th className="px-2 font-semibold">Description</th>
                        <th className="px-2 font-semibold">Type</th>
                        <th className="px-2 font-semibold">HSN/SAC</th>
                        <th className="px-2 font-semibold">UOM</th>
                        <th className="px-2 font-semibold">Quality Insp.</th>
                        <th className="px-2 font-semibold">Location</th>
                        <th className="px-2 font-semibold">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderNestedMaterials(
                        mat.rm || [],
                        3,
                        currentKey,
                        expandedL2,
                        expandedL3,
                        toggleL2,
                        toggleL3
                      )}
                      {renderNestedMaterials(
                        mat.sfg || [],
                        3,
                        currentKey,
                        expandedL2,
                        expandedL3,
                        toggleL2,
                        toggleL3
                      )}
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          )}
      </React.Fragment>
    );
  });
};

const SfgMaster = () => {
  const [fgs, setFgs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAttachments, setOpenAttachments] = useState(null);
  const [expandedL1, setExpandedL1] = useState(null);
  const [expandedL2, setExpandedL2] = useState(null);
  const [expandedL3, setExpandedL3] = useState(null);
  const [showAddFG, setShowAddFG] = useState(false);
  const [editingFg, setEditingFg] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  ScrollLock(showAddFG == true || editingFg != null);

  const toogleAddFG = (prev) => {
    setShowAddFG(!prev);
  };

  const fetchFGs = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(`/fgs/get-all?page=${page}&limit=${limit}`);
      setFgs(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch SFGs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFGs();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchFGs(page);
  };

  const filteredFGs = fgs.filter((fg) => {
    const query = search.toLowerCase();
    return (
      fg.itemName?.toLowerCase().includes(query) ||
      fg.description?.toLowerCase().includes(query) ||
      fg.skuCode?.toLowerCase().includes(query) ||
      fg.hsnOrSac?.toLowerCase().includes(query) ||
      fg.type?.toLowerCase().includes(query) ||
      fg.basePrice == query ||
      fg.qualityInspection?.toLowerCase().includes(query) ||
      fg.location?.toLowerCase().includes(query) ||
      fg.gst?.toString().includes(query) ||
      fg.createdAt?.toLowerCase().includes(query)
    );
  });

  const toggleL1 = (index) => {
    setExpandedL1(expandedL1 === index ? null : index);
  };
  const toggleL2 = (index) => {
    setExpandedL2(expandedL2 === index ? null : index);
  };
  const toggleL3 = (index) => {
    setExpandedL3(expandedL3 === index ? null : index);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await axios.patch(`/fgs/update/${id}`, {
        status: newStatus,
      });

      if (res.data.status == 200) {
        toast.success(`FG status updated`);

        // ✅ Update local state without refetch
        setFgs((prev) =>
          prev.map((fg) => (fg.id === id ? { ...fg, status: newStatus } : fg))
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };
  const handleToggleQualityInspection = async (id, currentValue) => {
    const newValue = !currentValue;

    try {
      const res = await axios.patch(`/fgs/update/${id}`, {
        qualityInspectionNeeded: newValue,
      });

      if (res.status === 200) {
        toast.success("Quality Inspection status updated");

        // ✅ Optimistically update the item locally in state
        setFgs((prev) =>
          prev.map((fg) =>
            fg.id === id ? { ...fg, qualityInspectionNeeded: newValue } : fg
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FG ?")) return;
    try {
      const res = await axios.delete(`/fgs/delete/${id}`);
      if (res.status == 200) {
        toast.success("FG deleted successfully");
        fetchSFGs(); // reload list
      } else {
        toast.error("Failed to delete FG");
      }
    } catch (err) {
      toast.error("Failed to delete FG");
    }
  };

  return (
    <Dashboard>
      <div className="relative p-3 max-w-[99vw] mx-auto overflow-x-hidden">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Finished Goods (FG){" "}
          <span className="text-gray-500">({fgs.length})</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-3 text-[#d8b76a]" />
            <input
              type="text"
              placeholder="Search by SKU, Item Name, etc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
            />
          </div>
          <button
            onClick={() => toogleAddFG(showAddFG)}
            className="w-full sm:w-auto justify-center bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-2 rounded flex items-center gap-2 transition duration-200 cursor-pointer"
          >
            <FiPlus /> Add FG
          </button>
        </div>
        {showAddFG && (
          <AddFgModal
            onClose={() => toogleAddFG(showAddFG)}
            onAdded={fetchFGs}
          />
        )}

        <div className="overflow-x-auto border border-[#d8b76a] rounded shadow-sm">
          <table className="min-w-full text-sm whitespace-nowrap">
            <thead className="bg-[#d8b76a] text-[#292926] text-left whitespace-nowrap">
              <tr>
                <th className="px-3 py-1.5">#</th>
                <th className="px-3 py-1.5">Created At</th>
                <th className="px-3 py-1.5">Updated At</th>
                <th className="px-3 py-1.5">SKU Code</th>
                <th className="px-3 py-1.5">Item Name</th>
                <th className="px-3 py-1.5">Description</th>
                <th className="px-3 py-1.5">HSN/SAC</th>
                <th className="px-3 py-1.5">Quality Insp.</th>
                <th className="px-3 py-1.5">Location</th>
                <th className="px-3 py-1.5">GST</th>
                <th className="px-3 py-1.5">Type</th>
                <th className="px-3 py-1.5">UOM</th>
                <th className="px-3 py-1.5">Status</th>
                <th className="px-3 py-1.5">Files</th>
                <th className="px-3 py-1.5">Created By</th>
                <th className="px-3 py-1.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} columns={Array(15).fill({})} />
              ) : (
                <>
                  {filteredFGs.map((fg, index) => (
                    <React.Fragment key={fg.id}>
                      <tr
                        onClick={() => toggleL1(index)}
                        className="border-t border-[#d8b76a] hover:bg-gray-50 cursor-pointer "
                      >
                        <td className="px-3 py-1">
                          {Number(pagination.currentPage - 1) *
                            Number(pagination.limit) +
                            index +
                            1}
                        </td>
                        <td className="px-3 py-1">
                          {new Date(fg.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-1">
                          {new Date(fg.updatedAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-1">{fg.skuCode}</td>
                        <td className="px-3 py-1">{fg.itemName}</td>
                        <td className="px-3 py-1">{fg.description || "-"}</td>
                        <td className="px-3 py-1">{fg.hsnOrSac || "-"}</td>
                        <td className="px-3 ">
                          <Toggle
                            checked={fg.qualityInspectionNeeded}
                            onChange={() =>
                              handleToggleQualityInspection(
                                fg.id,
                                fg.qualityInspectionNeeded
                              )
                            }
                          />
                        </td>
                        <td className="px-3 py-1">{fg.location || "-"}</td>
                        <td className="px-3 py-1">{fg.gst}</td>
                        <td className="px-3 py-1">{fg.type}</td>
                        <td className="px-3 py-1">{fg.uom}</td>
                        <td className="px-3 ">
                          <Toggle
                            checked={fg.status == "Active"}
                            onChange={() =>
                              handleToggleStatus(fg.id, fg.status)
                            }
                          />
                        </td>
                        <td className="px-3 py-1">
                          {Array.isArray(fg.files) && fg.files.length > 0 ? (
                            <button
                              onClick={() => setOpenAttachments(fg.files)}
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
                        <td className="px-3 py-1">
                          {fg.createdBy?.fullName || "-"}
                        </td>
                        <td className="px-3 py-1 flex gap-2">
                          <FaFileDownload className="cursor-pointer text-[#d8b76a]" />
                          <FiEdit
                            className="cursor-pointer text-[#d8b76a]"
                            onClick={() => setEditingFg(fg)}
                          />
                          <FiTrash2
                            className="cursor-pointer text-[#d8b76a]"
                            onClick={() => handleDelete(fg.id)}
                          />
                        </td>
                      </tr>
                      {expandedL1 === index &&
                        (fg.rm.length !== 0 || fg.sfg.length !== 0) && (
                          <tr>
                            <td colSpan="17" className="px-2">
                              <div className="border border-[#d8b76a] rounded overflow-x-auto mb-2">
                                <table className="min-w-full text-sm text-left">
                                  <thead className="bg-[#d8b76a]/50">
                                    <tr>
                                      <th className="px-2 font-semibold">
                                        SKU Code
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Item Name
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Description
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Type
                                      </th>
                                      <th className="px-2 font-semibold">
                                        HSN/SAC
                                      </th>
                                      <th className="px-2 font-semibold">
                                        UOM
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Quality Insp.
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Location
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Qty
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {renderNestedMaterials(
                                      [...fg.rm, ...fg.sfg],
                                      1,
                                      `${index}`,
                                      expandedL2,
                                      expandedL3,
                                      toggleL2,
                                      toggleL3
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  ))}
                  {filteredFGs.length === 0 && (
                    <tr>
                      <td colSpan="15" className="text-center text-gray-500">
                        No FGs found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {editingFg && (
          <UpdateFgModal
            fg={editingFg}
            onClose={() => setEditingFg(null)}
            onUpdated={() => {
              fetchFGs(pagination.currentPage);
              setEditingFg(null);
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
            fetchFGs(1, limit);
          }}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
            fetchFGs(page, pagination.limit);
          }}
        />
      </div>
    </Dashboard>
  );
};

export default SfgMaster;
