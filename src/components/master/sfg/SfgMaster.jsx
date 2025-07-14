import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import { FaCircleArrowDown, FaCircleArrowUp } from "react-icons/fa6";
import Dashboard from "../../../pages/Dashboard";
import TableSkeleton from "../../TableSkeleton";
import Toggle from "react-toggle";
import AddSfgModal from "./AddSfgModel";
import UpdateSfgModal from "./UpdateSFGModel";
import PaginationControls from "../../PaginationControls";
import { FaFileDownload } from "react-icons/fa";
import ScrollLock from "../../ScrollLock";
import AttachmentsModal from "../../AttachmentsModal";
import { Tooltip } from "react-tooltip";

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

    // Map level number to label
    const levelLabel = `L${level}`;

    return (
      <React.Fragment key={`${mat.id}-${level}-${idx}`}>
        <tr
          className={`border-t ${border} cursor-pointer hover:bg-gray-50 hover:rounded-sm`}
          onClick={() => {
            if (level === 1) toggleL2(currentKey);
            else if (level === 2) toggleL3(currentKey);
          }}
        >
          <td
            className={`flex border-r ${border} rounded-bl-sm`}
            style={{ paddingLeft: `${level * 21}px` }}
          >
            <span
              className={`${text} mr-2 font-bold pl-2 ${border} border-dashed border-l-2`}
            >
              {levelLabel}
            </span>
            <div className="flex items-center gap-1 rounded-bl-sm">
              {mat.skuCode}
              {(mat.rm?.length > 0 || mat.sfg?.length > 0) && (
                <span className={`${text} text-[12px] rounded-bl-sm`}>
                  {level === 1 &&
                    (expandedL2[currentKey] ? (
                      <FaCircleArrowUp />
                    ) : (
                      <FaCircleArrowDown />
                    ))}
                  {/* {level === 2 &&
                    (expandedL3[currentKey] ? (
                      <FaCircleArrowUp />
                    ) : (
                      <FaCircleArrowDown />
                    ))} */}
                </span>
              )}
            </div>
          </td>
          <td className={`px-2 border-r ${border}`}>{mat.itemName}</td>
          <td className={`px-2 border-r ${border}`}>
            {mat.description || "-"}
          </td>
          <td className={`px-2 border-r ${border}`}>{mat.type}</td>
          <td className={`px-2 border-r ${border}`}>
            {mat.hsnOrSac || mat.hsnSac}
          </td>
          <td className={`px-2 border-r ${border}`}>
            {mat.stockUOM || mat.uom}
          </td>
          <td className={`px-2 border-r ${border}`}>
            {mat.qualityInspectionNeeded ? "Required" : "Not Required"}
          </td>
          <td className={`px-2 border-r ${border}`}>{mat.location}</td>
          <td className={`px-2 rounded-br-sm`}>{mat.qty}</td>
        </tr>

        {level === 1 &&
          isExpandedL2 &&
          (mat.rm?.length > 0 || mat.sfg?.length > 0) && (
            <tr>
              <td colSpan="9" className="px-2 pb-2">
                <div className=" border border-yellow-500 rounded-sm">
                  <table className="w-full text-[11px] text-left rounded-sm overflow-hidden">
                    <thead className="bg-yellow-100 rounded-sm">
                      <tr className="">
                        <th className="px-2 font-semibold rounded-tl-sm pl-18">
                          SKU Code
                        </th>
                        <th className="px-2 font-semibold min-w-[220px]">
                          Item Name
                        </th>
                        <th className="px-2 font-semibold min-w-[190px]">
                          Description
                        </th>
                        <th className="px-2 font-semibold">Type</th>
                        <th className="px-2 font-semibold">HSN/SAC</th>
                        <th className="px-2 font-semibold">UOM</th>
                        <th className="px-2 font-semibold">Quality Insp.</th>
                        <th className="px-2 font-semibold">Location</th>
                        <th className="px-2 font-semibold rounded-tr-sm">
                          Qty
                        </th>
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
              <td colSpan="9">
                <div className="mt-2 border border-[#d8b76a]/30 rounded">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-[#d8b76a]/20">
                      <tr className="">
                        <th className="px-2 font-semibold rounded-sm pl-18">
                          SKU Code
                        </th>
                        <th className="px-2 font-semibold min-w-[220px]">
                          Item Name
                        </th>
                        <th className="px-2 font-semibold min-w-[190px]">
                          Description
                        </th>
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
  const [sfgs, setSfgs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAttachments, setOpenAttachments] = useState(null);
  const [expandedL1, setExpandedL1] = useState(null);
  const [expandedL2, setExpandedL2] = useState({});
  const [expandedL3, setExpandedL3] = useState({});

  const [showAddSFG, setShowAddSFG] = useState(false);
  const [editingSfg, setEditingSfg] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  ScrollLock(showAddSFG == true || editingSfg != null);

  const toogleAddSFG = (prev) => {
    setShowAddSFG(!prev);
  };

  const fetchSFGs = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(`/sfgs/get-all?page=${page}&limit=${limit}`);
      setSfgs(res.data.data || []);
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
    fetchSFGs();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchSFGs(page);
  };

  const filteredSFGs = sfgs.filter((sfg) => {
    const query = search.toLowerCase();
    return (
      sfg.itemName?.toLowerCase().includes(query) ||
      sfg.description?.toLowerCase().includes(query) ||
      sfg.skuCode?.toLowerCase().includes(query) ||
      sfg.hsnOrSac?.toLowerCase().includes(query) ||
      sfg.type?.toLowerCase().includes(query) ||
      sfg.basePrice == query ||
      sfg.qualityInspection?.toLowerCase().includes(query) ||
      sfg.location?.toLowerCase().includes(query) ||
      sfg.gst?.toString().includes(query) ||
      sfg.createdAt?.toLowerCase().includes(query)
    );
  });

  const toggleL1 = (sfgId) => {
    if (expandedL1 === sfgId) {
      setExpandedL1(null);
      setExpandedL2({});
      setExpandedL3({});
    } else {
      setExpandedL1(sfgId);
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

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await axios.patch(`/sfgs/update/${id}`, {
        status: newStatus,
      });

      if (res.data.status == 200) {
        toast.success(`SFG status updated`);

        // ✅ Update local state without refetch
        setSfgs((prev) =>
          prev.map((sfg) =>
            sfg.id === id ? { ...sfg, status: newStatus } : sfg
          )
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
      const res = await axios.patch(`/sfgs/update/${id}`, {
        qualityInspectionNeeded: newValue,
      });

      if (res.status === 200) {
        toast.success("Quality Inspection status updated");

        // ✅ Optimistically update the item locally in state
        setSfgs((prev) =>
          prev.map((sfg) =>
            sfg.id === id ? { ...sfg, qualityInspectionNeeded: newValue } : sfg
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
    if (!window.confirm("Are you sure you want to delete this SFG ?")) return;
    try {
      const res = await axios.delete(`/sfgs/delete/${id}`);
      if (res.status == 200) {
        toast.success("SFG deleted successfully");
        fetchSFGs();
      } else {
        toast.error("Failed to delete SFG");
      }
    } catch (err) {
      toast.error("Failed to delete SFG");
    }
  };

  return (
    <Dashboard>
      <div className="relative p-3 max-w-[99vw] mx-auto overflow-x-hidden">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Semi Finished Goods (SFG){" "}
          <span className="text-gray-500">({sfgs.length})</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-2 text-[#d8b76a]" />
            <input
              type="text"
              placeholder="Search by SKU, Item Name, etc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1 border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
            />
          </div>
          <button
            onClick={() => toogleAddSFG(showAddSFG)}
            className="w-full sm:w-auto justify-center bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition duration-200 cursor-pointer"
          >
            <FiPlus /> Add SFG
          </button>
        </div>
        {showAddSFG && (
          <AddSfgModal
            onClose={() => toogleAddSFG(showAddSFG)}
            onAdded={fetchSFGs}
          />
        )}

        <div className="overflow-x-auto border border-[#d8b76a] rounded shadow-sm">
          <table className="w-full text-[11px] whitespace-nowrap ">
            <thead className="bg-[#d8b76a] text-[#292926] text-left ">
              <tr>
                <th className="px-[8px] py-1">#</th>
                <th className="px-[8px] py-1">Created At</th>
                <th className="px-[8px] py-1">Updated At</th>
                <th className="px-[8px] py-1">SKU Code</th>
                <th className="px-[8px] py-1">Item Name</th>
                <th className="px-[8px] py-1">Description</th>
                <th className="px-[8px] py-1">HSN/SAC</th>
                <th className="px-[8px] py-1">Quality Insp.</th>
                <th className="px-[8px] py-1">Location</th>
                <th className="px-[8px] py-1">BP</th>
                <th className="px-[8px] py-1">MOQ</th>
                <th className="px-[8px] py-1">Type</th>
                <th className="px-[8px] py-1">UOM</th>
                <th className="px-[8px] py-1">Status</th>
                <th className="px-[8px] py-1">Files</th>
                <th className="px-[8px] py-1">Created By</th>
                <th className="px-[8px] py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} columns={Array(15).fill({})} />
              ) : (
                <>
                  {filteredSFGs.map((sfg, index) => (
                    <React.Fragment key={sfg.id}>
                      <tr
                        onClick={() => toggleL1(sfg.id)}
                        className="border-t  border-[#d8b76a] hover:bg-gray-50 cursor-pointer "
                      >
                        <td className="px-[8px]  border-r border-r-[#d8b76a] ">
                          {Number(pagination.currentPage - 1) *
                            Number(pagination.limit) +
                            index +
                            1}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {new Date(sfg.createdAt).toLocaleString()}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {new Date(sfg.updatedAt).toLocaleString()}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {sfg.skuCode}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a] md:max-w-[120px] md:truncate  hover:max-w-[1000px] transition-all duration-200">
                          {sfg.itemName}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a] md:max-w-[120px] md:truncate hover:max-w-[1000px] transition-all duration-200 ">
                          {sfg.description || "-"}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {sfg.hsnOrSac || "-"}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          <Toggle
                            checked={sfg.qualityInspectionNeeded}
                            onChange={() =>
                              handleToggleQualityInspection(
                                sfg.id,
                                sfg.qualityInspectionNeeded
                              )
                            }
                          />
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {sfg.location}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {sfg.basePrice}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {sfg.moq || "-"}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {sfg.type}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {sfg.uom}
                        </td>
                        <td className="px-[8px]   border-r border-r-[#d8b76a]">
                          <Toggle
                            className=""
                            checked={sfg.status == "Active"}
                            onChange={() =>
                              handleToggleStatus(sfg.id, sfg.status)
                            }
                          />
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {Array.isArray(sfg.files) && sfg.files.length > 0 ? (
                            <button
                              onClick={() => setOpenAttachments(sfg.files)}
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
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {sfg.createdBy?.fullName || "-"}
                        </td>
                        <td className="px-[8px] pt-2 text-sm flex gap-2 border-r border-r-[#d8b76a]/30">
                          <FaFileDownload
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Download"
                            className="cursor-pointer text-[#d8b76a] hover:text-green-600"
                          />
                          <FiEdit
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Edit"
                            className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                            onClick={() => setEditingSfg(sfg)}
                          />
                          <FiTrash2
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Delete"
                            className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                            onClick={() => handleDelete(sfg.id)}
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
                        </td>
                      </tr>
                      {expandedL1 === sfg.id &&
                        (sfg.rm.length !== 0 || sfg.sfg.length !== 0) && (
                          <tr>
                            <td colSpan="17" className="px-2 pb-2">
                              <div className="border border-green-600 rounded overflow-x-auto">
                                <table className="min-w-full text-[11px] text-left">
                                  <thead className=" bg-green-100">
                                    <tr className="">
                                      <th className="px-2 font-semibold  pl-13">
                                        SKU Code
                                      </th>
                                      <th className="px-2 font-semibold min-w-[220px]">
                                        Item Name
                                      </th>
                                      <th className="px-2 font-semibold min-w-[190px]">
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
                                      [...sfg.rm, ...sfg.sfg],
                                      1,
                                      sfg.id,
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
                  {filteredSFGs.length === 0 && (
                    <tr>
                      <td colSpan="15" className="text-center text-gray-500">
                        No SFGs found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {editingSfg && (
          <UpdateSfgModal
            sfg={editingSfg}
            onClose={() => setEditingSfg(null)}
            onUpdated={() => {
              fetchSFGs(pagination.currentPage);
              setEditingSfg(null);
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
            fetchSFGs(1, limit);
          }}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
            fetchSFGs(page, pagination.limit);
          }}
        />
      </div>
    </Dashboard>
  );
};

export default SfgMaster;
