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

import { FaCircleArrowDown, FaCircleArrowUp } from "react-icons/fa6";
import AttachmentsModal2 from "../../AttachmentsModal2";
import { useAuth } from "../../../context/AuthContext";
import { debounce } from "lodash";

import { useRef } from "react";
import FgDetailSection from "./FgDetailSection";

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
    const isExpandedL2 = expandedL2[currentKey];
    const isExpandedL3 = expandedL3[currentKey];

    // Map level number to label
    const levelLabel = `L${level}`;

    let border, text;
    if (level == 1 || level == "1") {
      border = `border-green-600`;
      text = `text-green-600`;
    } else if (level == 2 || level == "2") {
      border = `border-yellow-600`;
      text = `text-yellow-600`;
    } else if (level == 3 || level == "3") {
      border = `border-blue-600`;
      text = `text-blue-600`;
    }

    return (
      <React.Fragment key={`${mat.id}-${level}-${idx}`}>
        <tr
          className={`border-t ${border} cursor-pointer hover:bg-gray-50 text-[11px] rounded-sm border-separate`}
          onClick={() => {
            if (level === 1) toggleL2(currentKey);
            else if (level === 2) toggleL3(currentKey);
          }}
        >
          <td
            className={`flex border-r ${border} rounded-bl-sm overflow-hidden`}
            style={{ paddingLeft: `${level * 21}px` }}
          >
            <span
              className={`${text} mr-2 font-bold pl-2 ${border} border-dashed border-l-2 `}
            >
              {levelLabel}
            </span>
            <div className="flex items-center gap-1 rounded-bl-sm">
              {mat.skuCode || "-"}
              {(mat.rm?.length > 0 || mat.sfg?.length > 0) && (
                <span className={`${text} text-[12px] overflow-auto`}>
                  {level === 1 &&
                    (expandedL2[currentKey] ? (
                      <FaCircleArrowUp />
                    ) : (
                      <FaCircleArrowDown />
                    ))}
                  {level === 2 &&
                    (expandedL3[currentKey] ? (
                      <FaCircleArrowUp />
                    ) : (
                      <FaCircleArrowDown />
                    ))}
                </span>
              )}
            </div>
          </td>
          <td className={`px-2 border-r ${border}`}>{mat.itemName || "-"}</td>
          <td className={`px-2 border-r ${border}`}>
            {mat.description || "-"}
          </td>
          <td className={`px-2 border-r ${border}`}>{mat.type || "-"}</td>
          <td className={`px-2 border-r ${border}`}>{mat.category || "-"}</td>
          <td className={`px-2 border-r ${border}`}>{mat.partName || "-"}</td>
          <td className={`px-2 border-r ${border}`}>
            {mat.stockUOM || mat.uom || "-"}
          </td>
          <td className={`px-2 border-r ${border}`}>
            {mat.qualityInspectionNeeded ? "Required" : "Not Required" || "-"}
          </td>
          <td className={`px-2 border-r ${border}`}>{mat.location || "-"}</td>
          <td className={`px-2 border-r ${border}`}>{mat.height || "-"}</td>
          <td className={`px-2 border-r ${border}`}>{mat.width || "-"}</td>
          <td className={`px-2 border-r ${border}`}>{mat.qty || "-"}</td>
          <td className={`px-2 border-r ${border}`}>
            {mat.grams ? `${mat.grams / 1000} kg` : "N/A"}
          </td>
          <td className={`px-2 rounded-br-sm `}>
            {Number(mat.rate).toFixed(2) || "-"}
          </td>
        </tr>

        {level === 1 &&
          isExpandedL2 &&
          (mat.rm?.length > 0 || mat.sfg?.length > 0) && (
            <tr>
              <td colSpan="17" className="px-2 pb-2 rounded-sm">
                <div className=" border border-yellow-500 rounded-sm">
                  <table className="min-w-full text-[11px] text-left rounded-sm overflow-hidden">
                    <thead className="bg-yellow-100 rounded-sm">
                      <tr className="">
                        <th className="px-2 font-semibold  pl-18 rounded-tl-sm">
                          SKU Code
                        </th>
                        <th className="px-2 font-semibold min-w-[150px]">
                          Item Name
                        </th>
                        <th className="px-2 font-semibold min-w-[120px]">
                          Description
                        </th>
                        <th className="px-2 font-semibold">Type</th>
                        <th className="px-2 font-semibold">Category</th>
                        <th className="px-2 font-semibold">Part Name</th>
                        <th className="px-2 font-semibold">UOM</th>
                        <th className="px-2 font-semibold">Quality Insp.</th>
                        <th className="px-2 font-semibold">Location</th>
                        <th className="px-2 font-semibold">Height (Inch)</th>
                        <th className="px-2 font-semibold">Width (Inch)</th>
                        <th className="px-2 font-semibold">Qty</th>
                        <th className="px-2 font-semibold">Weight</th>
                        <th className="px-2 font-semibold rounded-tr-sm">
                          Rate (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="rounded-sm">
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
              <td colSpan="17" className="px-2 pb-2">
                <div className=" border border-blue-600 rounded">
                  <table className="min-w-full  text-left rounded-sm overflow-hidden">
                    <thead className="bg-blue-100 ">
                      <tr className="rounded-sm">
                        <th className="px-2 font-semibold  pl-23.5 rounded-tl-sm">
                          SKU Code
                        </th>
                        <th className="px-2 font-semibold min-w-[140px]">
                          Item Name
                        </th>
                        <th className="px-2 font-semibold min-w-[120px]">
                          Description
                        </th>
                        <th className="px-2 font-semibold">Type</th>
                        <th className="px-2 font-semibold">Category</th>
                        <th className="px-2 font-semibold">Part Name</th>
                        <th className="px-2 font-semibold">UOM</th>
                        <th className="px-2 font-semibold">Quality Insp.</th>
                        <th className="px-2 font-semibold">Location</th>
                        <th className="px-2 font-semibold">Height (Inch)</th>
                        <th className="px-2 font-semibold">Width (Inch)</th>
                        <th className="px-2 font-semibold">Qty</th>
                        <th className="px-2 font-semibold">Weight</th>
                        <th className="px-2 font-semibold rounded-tr-sm">
                          Rate (₹)
                        </th>
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

const FgMaster = ({ isOpen }) => {
  const { hasPermission } = useAuth();

  const [fgs, setFgs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAttachments, setOpenAttachments] = useState(null);
  const [expandedL1, setExpandedL1] = useState(null); // Only one FG open
  const [expandedL2, setExpandedL2] = useState({}); // Multiple SFGs per FG
  const [expandedL3, setExpandedL3] = useState({}); // Multiple SFGs per SFG
  const [showAddFG, setShowAddFG] = useState(false);
  const [editingFg, setEditingFg] = useState(null);
  const [expandedFgId, setExpandedFgId] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  const hasMountedRef = useRef(false);

  ScrollLock(showAddFG == true || editingFg != null);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }

    const debouncedSearch = debounce(() => {
      fetchFGs(1); // Always fetch from page 1 for new search
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const toogleAddFG = (prev) => {
    setShowAddFG(!prev);
  };

  const toggleL1 = (fgId) => {
    if (expandedL1 === fgId) {
      setExpandedL1(null);
      setExpandedL2({});
      setExpandedL3({});
    } else {
      setExpandedL1(fgId);
    }
  };

  const toggleL2 = (key) => {
    setExpandedL2((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleL3 = (key) => {
    setExpandedL3((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchFGs = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/fgs/get-all?page=${page}&search=${search}&limit=${limit}`
      );
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
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

  // const filteredFGs = fgs.filter((fg) => {
  //   const query = search.toLowerCase();
  //   return (
  //     fg.itemName?.toLowerCase().includes(query) ||
  //     fg.description?.toLowerCase().includes(query) ||
  //     fg.skuCode?.toLowerCase().includes(query) ||
  //     fg.hsnOrSac?.toLowerCase().includes(query) ||
  //     fg.type?.toLowerCase().includes(query) ||
  //     fg.basePrice == query ||
  //     fg.qualityInspection?.toLowerCase().includes(query) ||
  //     fg.location?.toLowerCase().includes(query) ||
  //     fg.gst?.toString().includes(query) ||
  //     fg.createdAt?.toLowerCase().includes(query)
  //   );
  // });

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await axios.patch(`/fgs/update/${id}`, {
        status: newStatus,
      });
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

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
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

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
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      if (res.status == 200) {
        toast.success("FG deleted successfully");
        fetchFGs(); // reload list
      } else {
        toast.error("Failed to delete FG");
      }
    } catch (err) {
      toast.error("Failed to delete FG");
    }
  };

  return (
    <div className="relative p-3 max-w-[99vw] mx-auto overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Finished Goods (FG){" "}
        <span className="text-gray-500">({pagination.totalResults})</span>
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-2 text-primary" />
          <input
            type="text"
            placeholder="Search by SKU, Item Name, etc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1 border border-primary rounded focus:border-2 focus:border-primary focus:outline-none transition duration-200"
          />
        </div>
        {hasPermission("FG", "write") && (
          <button
            onClick={() => toogleAddFG(showAddFG)}
            className="w-full sm:w-auto justify-center bg-primary hover:bg-[#b38a37] text-secondary font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200 cursor-pointer"
          >
            <FiPlus /> Add FG
          </button>
        )}
      </div>
      {showAddFG && (
        <AddFgModal
          onClose={() => toogleAddFG(showAddFG)}
          onAdded={() => (fetchFGs(), toogleAddFG(showAddFG))}
        />
      )}

      <div className="relative overflow-x-auto  overflow-y-auto rounded border border-primary shadow-sm">
        <div className={` ${isOpen ? `max-w-[40.8vw]` : `max-w-[98vw]`}`}>
          <table className={"text-[11px] whitespace-nowrap min-w-[100vw]"}>
            <thead className="bg-primary text-secondary text-left ">
              <tr>
                <th className="px-[8px] py-1">#</th>
                <th className="px-[8px] ">Created At</th>
                <th className="px-[8px] ">Updated At</th>
                <th className="px-[8px] ">SKU Code</th>
                <th className="px-[8px] ">Item Name</th>
                <th className="px-[8px] ">Description</th>
                <th className="px-[8px] ">HSN/SAC</th>
                <th className="px-[8px] ">Quality Insp.</th>
                <th className="px-[8px] ">Location</th>
                <th className="px-[8px] ">GST</th>
                <th className="px-[8px] ">Type</th>
                <th className="px-[8px] ">UOM</th>
                <th className="px-[8px] ">Size</th>
                <th className="px-[8px] ">Rate (₹)</th>
                <th className="px-[8px] ">Status</th>
                <th className="px-[8px] ">Files</th>
                <th className="px-[8px] ">Created By</th>
                <th className="px-[8px] ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton
                  rows={pagination.limit}
                  columns={Array(18).fill({})}
                />
              ) : (
                <>
                  {fgs.map((fg, index) => (
                    <React.Fragment key={fg.id}>
                      <tr
                        onClick={() => {
                          toggleL1(fg.id);
                          setExpandedFgId(
                            expandedFgId === fg.id ? null : fg.id
                          ); // second function
                        }}
                        className="border-t border-primary hover:bg-gray-50 cursor-pointer "
                      >
                        <td className="px-[8px] border-r border-primary">
                          {Number(pagination.currentPage - 1) *
                            Number(pagination.limit) +
                            index +
                            1}
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          {new Date(fg.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          {new Date(fg.updatedAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          {fg.skuCode}
                        </td>
                        <td className="px-[8px] border-r border-primary ">
                          {fg.itemName}
                        </td>
                        <td className="px-[8px] border-r border-primary ">
                          {fg.description || "-"}
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          {fg.hsnOrSac || "-"}
                        </td>
                        <td className="px-[8px] border-r border-primary">
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
                        <td className="px-[8px] border-r border-primary">
                          {fg.location || "-"}
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          {fg.gst}
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          {fg.type}
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          {fg.uom}
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          {fg.height + " x " + fg.width + " x " + fg.depth}
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          {Number(fg.unitRate).toFixed(2)}
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          <Toggle
                            checked={fg.status == "Active"}
                            onChange={() =>
                              handleToggleStatus(fg.id, fg.status)
                            }
                          />
                        </td>
                        <td className="px-[8px] border-r border-primary">
                          {Array.isArray(fg.files) && fg.files.length > 0 ? (
                            <button
                              onClick={() => setOpenAttachments(fg.files)}
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
                        <td className="px-[8px] border-r border-primary">
                          {fg.createdBy?.fullName || "-"}
                        </td>
                        <td className="px-[8px]  pt-2 text-sm flex gap-2 text-primary">
                          <FaFileDownload className="cursor-pointer text-primary hover:text-green-600" />
                          {hasPermission("FG", "update") ? (
                            <FiEdit
                              className="cursor-pointer text-primary hover:text-blue-600"
                              onClick={() => setEditingFg(fg)}
                            />
                          ) : (
                            "-"
                          )}
                          {hasPermission("FG", "delete") ? (
                            <FiTrash2
                              className="cursor-pointer text-primary hover:text-red-600"
                              onClick={() => handleDelete(fg.id)}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                      {expandedL1 == fg.id &&
                        (fg.rm.length !== 0 || fg.sfg.length !== 0) && (
                          <tr>
                            <td colSpan="18" className="px-2">
                              <div className="border border-green-600 rounded overflow-x-auto mb-2 ">
                                <table className="min-w-full text-[11px] text-left rounded">
                                  <thead className="bg-green-100 rounded">
                                    <tr className="">
                                      <th className="px-2 font-semibold  pl-13">
                                        SKU Code
                                      </th>
                                      <th className="px-2 font-semibold min-w-[160px]">
                                        Item Name
                                      </th>
                                      <th className="px-2 font-semibold min-w-[120px]">
                                        Description
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Type
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Category
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Part Name
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
                                        Height (Inch)
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Width (Inch)
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Qty
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Weight
                                      </th>
                                      <th className="px-2 font-semibold">
                                        Rate (₹)
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {renderNestedMaterials(
                                      [...fg.rm, ...fg.sfg],
                                      1,
                                      fg.id,
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
                      {expandedFgId == fg.id && (
                        <tr className="">
                          <td colSpan="100%">
                            <FgDetailSection fgData={fg} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {fgs.length === 0 && (
                    <tr>
                      <td
                        colSpan="16"
                        className="text-center py-3 text-gray-500"
                      >
                        No FGs found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
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
  );
};

export default FgMaster;
