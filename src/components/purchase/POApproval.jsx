import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import { FaCircleArrowDown, FaCircleArrowUp } from "react-icons/fa6";
import TableSkeleton from "../TableSkeleton";
import Toggle from "react-toggle";
// import AddSfgModal from "./AddSfgModel";
// import UpdateSfgModal from "./UpdateSFGModel";
import PaginationControls from "../PaginationControls";
import { FaFileDownload } from "react-icons/fa";
import ScrollLock from "../ScrollLock";
import AttachmentsModal from "../AttachmentsModal";
import { Tooltip } from "react-tooltip";
import { generateBOM } from "../../utils/generateBOMPdf";

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
          <td className={`px-2 border-r ${border}`}>{idx + 1}</td>
          <td
            className={`flex border-r ${border} rounded-bl-sm`}
            // style={{ paddingLeft: `${level * 21}px` }}
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
          <td className={`px-2 border-r ${border}`}>{mat.hsnOrSac}</td>
          <td className={`px-2 border-r ${border}`}>{mat.type}</td>
          <td className={`px-2 border-r ${border}`}>{mat.ss}</td>
          <td className={`px-2 border-r ${border}`}>{mat.uom}</td>
          <td className={`px-2 border-r ${border}`}>{mat.spqty}</td>
          <td className={`px-2 border-r ${border}`}>{mat.uom}</td>
          <td className={`px-2 border-r ${border}`}>{mat.smstock}</td>
          <td className={`px-2 border-r ${border}`}>{mat.uom}</td>
          <td className={`px-2 rounded-br-sm`}>{mat.rate}</td>
          <td className={`px-2 rounded-br-sm`}>{mat.total}</td>
          <td className={`px-2 rounded-br-sm`}>{mat.status}</td>
        </tr>

        {level === 1 &&
          isExpandedL2 &&
          (mat.rm?.length > 0 || mat.sfg?.length > 0) && (
            <tr>
              <td colSpan="10" className="px-2 pb-2">
                <div className=" border border-yellow-500 rounded-sm">
                  <table className="w-full text-[11px] text-left rounded-sm overflow-hidden">
                    <thead className="bg-yellow-100 rounded-sm">
                      <tr className="">
                        <th className="px-2 font-semibold rounded-tl-sm pl-18">
                          #
                        </th>
                        <th className="px-2 font-semibold rounded-tl-sm pl-18">
                          SKU Code
                        </th>
                        <th className="px-2 font-semibold ">Item Name</th>
                        <th className="px-2 font-semibold ">Description</th>
                        <th className="px-2 font-semibold">HSN/SAC</th>
                        <th className="px-2 font-semibold">Type</th>
                        <th className="px-2 font-semibold">S.S.</th>
                        <th className="px-2 font-semibold">uom</th>
                        <th className="px-2 font-semibold">S.P. Qty</th>
                        <th className="px-2 font-semibold">uom</th>
                        <th className="px-2 font-semibold">S.M. Stock</th>
                        <th className="px-2 font-semibold">uom</th>
                        <th className="px-2 font-semibold">rate</th>
                        <th className="px-2 font-semibold">total</th>
                        <th className="px-2 font-semibold rounded-tr-sm">
                          status
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
              <td colSpan="10">
                <div className="mt-2 border border-[#d8b76a]/30 rounded">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-[#d8b76a]/20">
                      <tr className="">
                        <th className="px-2 font-semibold rounded-tl-sm ">#</th>
                        <th className="px-2 font-semibold rounded-tl-sm ">
                          SKU Code
                        </th>
                        <th className="px-2 font-semibold ">Item Name</th>
                        <th className="px-2 font-semibold ">Description</th>
                        <th className="px-2 font-semibold">HSN/SAC</th>
                        <th className="px-2 font-semibold">Type</th>
                        <th className="px-2 font-semibold">S.S.</th>
                        <th className="px-2 font-semibold">uom</th>
                        <th className="px-2 font-semibold">S.P. Qty</th>
                        <th className="px-2 font-semibold">uom</th>
                        <th className="px-2 font-semibold">S.M. Stock</th>
                        <th className="px-2 font-semibold">uom</th>
                        <th className="px-2 font-semibold">rate</th>
                        <th className="px-2 font-semibold">total</th>
                        <th className="px-2 font-semibold rounded-tr-sm">
                          status
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

const SfgMaster = ({ isOpen }) => {
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

  const dummyPurchaseOrders = [
    {
      id: 1,
      createdAt: "2025-07-20",
      poNumber: "PO-1001",
      date: "2025-07-18",
      vendorName: "ABC Suppliers",
      lastDeliveryDate: "2025-07-30",
      totalAmount: 125000,
      pdf: "https://example.com/invoice1.pdf",
      status: "Pending",
      item: [
        {
          id: "mat-1-1-1",
          skuCode: "SKU-001-RM1-CHILD",
          itemName: "Sub Raw Mat A1-1",
          description: "Second level RM",
          hsnOrSac: "9999",
          type: "RM",
          ss: "",
          uom: "LTR",
          spqty: "",
          smstock: "",
          rate: "200",
          total: "",
          status: "",
        },
      ],
    },
    {
      id: 2,
      createdAt: "2025-07-19",
      poNumber: "PO-1002",
      date: "2025-07-17",
      vendorName: "XYZ Traders",
      lastDeliveryDate: "2025-07-28",
      totalAmount: 98000,
      pdf: "https://example.com/invoice2.pdf",
      status: "Completed",
      item: [
        {
          id: "mat-1-1-2",
          skuCode: "SKU-001-RM1-CHILD",
          itemName: "Sub Raw Mat A1-1",
          description: "Second level RM",
          hsnOrSac: "9999",
          type: "RM",
          ss: "",
          uom: "LTR",
          spqty: "",
          smstock: "",
          rate: "200",
          total: "",
          status: "",
        },
      ],
    },
    {
      id: 3,
      createdAt: "2025-07-15",
      poNumber: "PO-1003",
      date: "2025-07-14",
      vendorName: "Global Materials Ltd.",
      lastDeliveryDate: "2025-07-25",
      totalAmount: 172500,
      pdf: "https://example.com/invoice3.pdf",
      status: "Processing",
      item: [
        {
          id: "mat-1-1-3",
          skuCode: "SKU-001-RM1-CHILD",
          itemName: "Sub Raw Mat A1-1",
          description: "Second level RM",
          hsnOrSac: "9999",
          type: "RM",
          ss: "",
          uom: "LTR",
          spqty: "",
          smstock: "",
          rate: "200",
          total: "",
          status: "",
        },
      ],
    },
  ];

  return (
    <div className="p-3 max-w-[99vw] mx-auto overflow-x-hidden mt-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Purchase Order Approval{" "}
        <span className="text-gray-500">({sfgs.length})</span>
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-2 text-[#d8b76a]" />
          <input
            type="text"
            placeholder="Search by Order No, Vendor Name, etc..."
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
          onAdded={() => (fetchSFGs(), toogleAddSFG(showAddSFG))}
        />
      )}

      <div className="relative overflow-x-auto  overflow-y-auto rounded border border-[#d8b76a] shadow-sm">
        <div className={` ${isOpen ? `max-w-[40.8vw]` : `max-w-[98vw]`}`}>
          <table className={"text-[11px] whitespace-nowrap min-w-[100vw]"}>
            <thead className="bg-[#d8b76a] text-[#292926] text-left ">
              <tr>
                <th className="px-[8px] py-1">#</th>
                <th className="px-[8px] py-1">Created At</th>
                <th className="px-[8px] py-1">Purchase Order No</th>
                <th className="px-[8px] py-1">Date</th>
                <th className="px-[8px] py-1">Vendor Name</th>
                <th className="px-[8px] py-1">Last Delivery Date</th>
                <th className="px-[8px] py-1">Total Amount</th>
                <th className="px-[8px] py-1">PDF</th>
                <th className="px-[8px] py-1">Status</th>
                <th className="px-[8px] py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton
                  rows={pagination.limit}
                  columns={Array(10).fill({})}
                />
              ) : (
                <>
                  {dummyPurchaseOrders.map((po, index) => (
                    <React.Fragment key={po.id}>
                      <tr
                        onClick={() => toggleL1(po.id)}
                        className="border-t  border-[#d8b76a] hover:bg-gray-50 cursor-pointer "
                      >
                        <td className="px-[8px] py-1  border-r border-r-[#d8b76a] ">
                          {Number(pagination.currentPage - 1) *
                            Number(pagination.limit) +
                            index +
                            1}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {new Date(po.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {po.poNumber}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {po.date}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a] ">
                          {po.vendorName}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]  ">
                          {new Date(po.lastDeliveryDate).toLocaleString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              // hour: "2-digit",
                              // minute: "2-digit",
                              // hour12: true,
                            }
                          )}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {po.totalAmount || "-"}
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          <FaFileDownload
                            onClick={() => generateBOM(po)}
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Download"
                            className="cursor-pointer text-[#d8b76a] hover:text-green-600"
                          />
                        </td>
                        <td className="px-[8px]  border-r border-r-[#d8b76a]">
                          {po.status}
                        </td>
                        <td className="px-[8px] pt-1 text-sm flex gap-2 border-r border-r-[#d8b76a]/30">
                          <FiEdit
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Edit"
                            className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                            onClick={() => setEditingSfg(po)}
                          />
                          <FiTrash2
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Delete"
                            className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                            onClick={() => handleDelete(po.id)}
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
                      {expandedL1 === po.id && po.item.length !== 0 && (
                        <tr>
                          <td colSpan="10" className="px-2 pb-2">
                            <div className="border border-green-600 rounded overflow-x-auto">
                              <table className="min-w-full text-[11px] text-left">
                                <thead className=" bg-green-100">
                                  <tr className="">
                                    <th className="px-2 font-semibold  ">#</th>
                                    <th className="px-2 font-semibold  ">
                                      SKU Code
                                    </th>
                                    <th className="px-2 font-semibold ">
                                      Item Name
                                    </th>
                                    <th className="px-2 font-semibold ">
                                      Description
                                    </th>
                                    <th className="px-2 font-semibold">
                                      HSN/SAC
                                    </th>
                                    <th className="px-2 font-semibold">Type</th>
                                    <th className="px-2 font-semibold">
                                      S. S.
                                    </th>
                                    <th className="px-2 font-semibold">UOM</th>
                                    <th className="px-2 font-semibold">
                                      S.P. Qty.
                                    </th>
                                    <th className="px-2 font-semibold">UOM</th>
                                    <th className="px-2 font-semibold">
                                      S.M. Stock
                                    </th>
                                    <th className="px-2 font-semibold">Uom</th>
                                    <th className="px-2 font-semibold">Rate</th>
                                    <th className="px-2 font-semibold">
                                      Total
                                    </th>
                                    <th className="px-2 font-semibold">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {renderNestedMaterials(
                                    po.item,
                                    1,
                                    po.id,
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
                      <td
                        colSpan="10"
                        className="text-center text-gray-500 py-3"
                      >
                        No SFGs found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
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
  );
};

export default SfgMaster;
