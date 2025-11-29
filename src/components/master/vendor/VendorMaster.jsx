import React, { Fragment, useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiX,
  FiPrinter,
} from "react-icons/fi";
import Dashboard from "../../../pages/Dashboard";
import AddVendorModal from "./AddVendorModel";
import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import Toggle from "react-toggle";
import PaginationControls from "../../PaginationControls";
import { Tooltip } from "react-tooltip";
import UpdateVendorModal from "./UpdateVendorModal";
import ViewVendorModal from "./VendorDetailsSection";
import VendorDetailsSection from "./VendorDetailsSection";
import { useAuth } from "../../../context/AuthContext";
import { useRef } from "react";

import { debounce } from "lodash";
import { PulseLoader } from "react-spinners";
import { TbRestore } from "react-icons/tb";
import {
  generateEnvelopePdf,
  generateEnvelopePdfWithoutBG,
} from "./generateEnvelopePdf";
import PreviewEnvelope from "../customer/EnvelopePreview";

const VendorMaster = ({ isOpen }) => {
  const { hasPermission } = useAuth();

  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uoms, setUoms] = useState([]);
  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [expandedVendorId, setExpandedVendorId] = useState(null);

  const [restore, setRestore] = useState(false);
  const [selected, setSelected] = useState([]);
  const [restoreId, setRestoreId] = useState();
  const [deleteId, setDeleteId] = useState();

  const hasMountedRef = useRef(false);
  ScrollLock(showModal || showUpdateModal);
  // Function to open modal
  const handleEdit = (vendor) => {
    setSelectedVendor(vendor); // vendor object from the list
    setShowUpdateModal(true);
  };
  const [pdfUrl, setPdfUrl] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const handlePreviewEnvelope = async (vendor) => {
    const fields = {
      vendorName: "Vendor Name is required",
      address: "Address is required",
      city: "City is required",
      state: "State is required",
      postalCode: "Postal code is required",
      country: "Country is required",
      mobile: "Mobile number is required",
    };

    for (const [key, message] of Object.entries(fields)) {
      if (!vendor[key] && key !== "mobile") {
        toast.error(message);
        return;
      }
    }

    if (!vendor.contactPersons?.[0]?.phone) {
      toast.error("Mobile number is required");
      return;
    }

    setLoadingPdf(true);
    try {
      const { url } = await generateEnvelopePdf(vendor, "/env.pdf");
      setPdfUrl(url);
      setPreviewItem(vendor);
    } catch (err) {
      toast.error("Failed to generate envelope");
    } finally {
      setLoadingPdf(false);
    }
  };

  const handlePrintEnvelope = async () => {
    const { url } = await generateEnvelopePdfWithoutBG(previewItem, "");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${previewItem.vendorName || "Receipt"}.pdf`; // <-- custom filename here
    a.click();
  };

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // skip first debounce on mount
    }
    const debouncedSearch = debounce(() => {
      if (restore) {
        fetchDeletedVendors(1);
      } else {
        fetchVendors(1);
      }
    }, 400); // 400ms delay

    debouncedSearch();

    return () => debouncedSearch.cancel(); // Cleanup on unmount/change
  }, [search]); // Re-run on search change

  const fetchVendors = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/vendors/get-all?page=${page}&search=${search}&limit=${limit}`
      );
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      setVendors(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };
  const fetchDeletedVendors = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/vendors/deleted?page=${page}&search=${search}&limit=${limit}`
      );
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      setVendors(res.data.data || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalResults: res.data.totalResults,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaData = async () => {
    try {
      const [uomRes, rmRes, sfgRes, fgRes] = await Promise.all([
        axios.get("/uoms/all-uoms?status=all"),
        axios.get("/rms/rm?limit=1000"),
        axios.get("fgs/get-all?limit=1000"),
        axios.get("/sfgs/get-all?limit=1000"),
      ]);
      setUoms(uomRes.data.data || []);
      setRms(rmRes.data.rawMaterials || []);
      setSfgs(sfgRes.data.data || []);
      setFgs(fgRes.data.data || []);
    } catch {
      toast.error("Failed to fetch dropdown metadata");
    }
  };

  useEffect(() => {
    if (restore) {
      fetchDeletedVendors(pagination.currentPage);
    } else {
      fetchVendors(pagination.currentPage);
    }
  }, [pagination.currentPage, pagination.limit, restore]);
  useEffect(() => {
    fetchMetaData();
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchVendors(page);
  };

  // const filtered = vendors.filter(
  //   (v) =>
  //     v.vendorName.toLowerCase().includes(search.toLowerCase()) ||
  //     v.natureOfBusiness.toLowerCase().includes(search.toLowerCase()) ||
  //     v.city.toLowerCase().includes(search.toLowerCase()) ||
  //     v.state.toLowerCase().includes(search.toLowerCase()) ||
  //     v.venderCode.toLowerCase().includes(search.toLowerCase()) ||
  //     v.country.toLowerCase().includes(search.toLowerCase()) ||
  //     v.postalCode.toLowerCase().includes(search.toLowerCase())
  // );

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    try {
      const res = await axios.patch(`/vendors/update/${id}`, {
        isActive: newStatus,
      });
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

      if (res.data.status == 200) {
        toast.success(`Vendor status updated`);

        // ✅ Update local state without refetch
        setVendors((prev) =>
          prev.map((v) => (v._id === id ? { ...v, isActive: newStatus } : v))
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Vendor?")) return;
    try {
      let res = await axios.delete(`/vendors/delete/${id}`);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Vendor deleted");
      fetchVendors();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handlePermanentDelete = async (id = "") => {
    if (!window.confirm("Are you sure you want to Delete Permanently?")) return;
    try {
      setDeleteId(id);
      let payload;
      if (id != "") {
        payload = { ids: [...selected, id] };
      } else {
        payload = { ids: [...selected] };
      }
      const res = await axios.post(`/vendors/permanent-delete/`, payload);
      if (res.status == 200) {
        toast.success("deleted successfully");
        fetchDeletedVendors(pagination.currentPage);
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setDeleteId("");
      setSelected([]);
    }
  };
  const handleRestore = async (id = "") => {
    if (!window.confirm("Are you sure you want to Restore?")) return;
    try {
      setRestoreId(id);
      let payload;
      if (id != "") {
        payload = { ids: [...selected, id] };
      } else {
        payload = { ids: [...selected] };
      }
      const res = await axios.patch(`/vendors/restore`, payload);
      if (res.status == 200) {
        toast.success("Restore successfully");
        fetchDeletedVendors(pagination.currentPage);
      } else {
        toast.error("Failed to Restore");
      }
    } catch (err) {
      toast.error("Failed to Restore");
    } finally {
      setRestoreId("");
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === vendors.length) {
      setSelected([]);
    } else {
      setSelected(vendors.map((item) => item._id));
    }
  };

  return (
    <>
      {showModal && (
        <AddVendorModal
          onClose={() => setShowModal(false)}
          onAdded={() => fetchVendors(pagination.currentPage)}
          uoms={uoms}
          // sfgs={sfgs}
          // rms={rms}
          // fgs={fgs}
        />
      )}
      <div className="p-3 max-w-[99vw] mx-auto">
        <div className="flex fex-wrap gap-2 mb-4">
          <h2 className="text-2xl font-bold">
            Vendors{" "}
            <span className="text-gray-500">({pagination.totalResults})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setRestore((prev) => !prev);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
                setSelected([]);
              }}
              className="bg-primary text-secondary  px-2 font-semibold rounded cursor-pointer hover:bg-primary/80 "
            >
              {restore ? "Cancel" : "Restore"}
            </button>
            {restore ? (
              <>
                <button
                  onClick={() => handleRestore()}
                  className="bg-primary text-secondary px-2 font-semibold rounded cursor-pointer hover:bg-primary/80 "
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete()}
                  className="bg-primary text-secondary px-2 font-semibold rounded cursor-pointer hover:bg-primary/80 "
                >
                  Delete
                </button>
              </>
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-2 text-[#d8b76a]" />
            <input
              type="text"
              placeholder="Search by Vendor Code or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1 border border-[#d8b76a] rounded focus:outline-none"
            />
            {search && (
              <FiX
                className="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-primary transition"
                onClick={() => setSearch("")}
                title="Clear"
              />
            )}
          </div>
          {hasPermission("Vendor", "write") && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#d8b76a]   hover:bg-[#b38a37] text-[#292926] font-semibold px-4 py-1.5 rounded flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiPlus /> Add Vendor
            </button>
          )}
        </div>

        <div className="relative overflow-x-auto  overflow-y-auto rounded border border-[#d8b76a] shadow-sm">
          <div className={` ${isOpen ? `max-w-[40.8vw]` : `max-w-[98vw]`}`}>
            <table className={"text-[11px] whitespace-nowrap min-w-[100vw]"}>
              <thead className="bg-[#d8b76a] text-[#292926] text-left ">
                <tr>
                  {restore && (
                    <th className="px-[8px] py-1">
                      <input
                        type="checkbox"
                        checked={selected.length === vendors.length}
                        onChange={toggleSelectAll}
                        className="accent-primary"
                      />
                    </th>
                  )}
                  <th className="px-2 py-1.5">#</th>
                  <th className="px-2 py-1.5">Created At</th>
                  <th className="px-2 py-1.5">Updated At</th>
                  <th className="px-2 py-1.5">Vendor Code</th>
                  <th className="px-2 py-1.5">Vendor Name</th>
                  <th className="px-2 py-1.5">Nature of Business</th>
                  <th className="px-2 py-1.5">Address</th>
                  <th className="px-2 py-1.5">City</th>
                  <th className="px-2 py-1.5">State</th>
                  <th className="px-2 py-1.5">Country</th>
                  <th className="px-2 py-1.5">Postal Code</th>
                  <th className="px-2 py-1.5">GSTIN</th>
                  <th className="px-2 py-1.5">PAN</th>
                  <th className="px-1 py-1.5">Status</th>
                  <th className="px-2 py-1.5">Created By</th>
                  <th className="px-2 py-1.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton
                    rows={pagination.limit}
                    columns={restore ? Array(17).fill({}) : Array(16).fill({})}
                  />
                ) : (
                  <>
                    {vendors.map((v, i) => (
                      <Fragment key={v._id}>
                        <tr
                          onClick={() =>
                            setExpandedVendorId(
                              expandedVendorId === v._id ? null : v._id
                            )
                          }
                          key={v._id}
                          className=" border-t border-t-[#d8b76a] hover:bg-gray-50 cursor-pointer"
                        >
                          {restore && (
                            <td className="px-[8px] border-r border-primary">
                              <input
                                type="checkbox"
                                name=""
                                id=""
                                className=" accent-primary"
                                checked={selected.includes(v._id)}
                                onChange={() => handleSelect(v._id)}
                              />
                            </td>
                          )}

                          <td className="px-2 border-r border-[#d8b76a]">
                            {(pagination.currentPage - 1) * pagination.limit +
                              i +
                              1}
                          </td>
                          <td className="px-2  border-r border-[#d8b76a]">
                            {new Date(v.createdAt || "-").toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {new Date(v.updatedAt || "-").toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.venderCode || "-"}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.vendorName || "-"}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.natureOfBusiness || "-"}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.address || "-"}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.city || "-"}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.state || "-"}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.country || "-"}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.postalCode || "-"}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.gst || "-"}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.pan || "-"}
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            <span className="rounded">
                              <Toggle
                                checked={v.isActive}
                                onChange={() =>
                                  handleToggleStatus(v._id, v.isActive)
                                }
                              />
                            </span>
                          </td>
                          <td className="px-2 border-r border-[#d8b76a]">
                            {v.createdBy?.fullName || "-"}
                          </td>
                          <td className="px-2 mt-1.5 text-sm  flex gap-2 text-[#d8b76a]">
                            {hasPermission("Vendor", "update") &&
                            restore == false ? (
                              <FiEdit
                                onClick={() => handleEdit(v)}
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Edit"
                                className="cursor-pointer text-[#d8b76a] hover:text-blue-600"
                              />
                            ) : restoreId == v._id ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <TbRestore
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Restore"
                                onClick={() => handleRestore(v._id)}
                                className="hover:text-green-500 cursor-pointer"
                              />
                            )}
                            {hasPermission("Vendor", "delete") &&
                            restore == false ? (
                              deleteId == v._id ? (
                                <PulseLoader size={4} color="#d8b76a" />
                              ) : (
                                <FiTrash2
                                  data-tooltip-id="statusTip"
                                  data-tooltip-content="Delete"
                                  onClick={() => handleDelete(v._id)}
                                  className="cursor-pointer text-[#d8b76a] hover:text-red-600"
                                />
                              )
                            ) : deleteId == v._id ? (
                              <PulseLoader size={4} color="#d8b76a" />
                            ) : (
                              <FiTrash2
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Permanent Delete"
                                onClick={() => handlePermanentDelete(v._id)}
                                className="hover:text-red-500 cursor-pointer"
                              />
                            )}
                            {!restore && (
                              <FiPrinter
                                onClick={() => handlePreviewEnvelope(v)}
                                className="cursor-pointer text-primary hover:text-green-600"
                                title="Print Envelope"
                              />
                            )}
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
                        {expandedVendorId === v._id && (
                          <tr className="">
                            <td colSpan="100%">
                              <VendorDetailsSection vendorData={v} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                    {vendors.length === 0 && (
                      <tr>
                        <td
                          colSpan="15"
                          className="text-center py-4 text-gray-500"
                        >
                          No vendors found.
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
          }}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, currentPage: page }));
          }}
        />
        {showUpdateModal && (
          <UpdateVendorModal
            vendorData={selectedVendor}
            rms={rms}
            sfgs={sfgs}
            fgs={fgs}
            uoms={uoms}
            onClose={() => setShowUpdateModal(false)}
            onSuccess={() => {
              fetchVendors(); // optional: refresh table
              setShowUpdateModal(false);
            }}
          />
        )}
        {pdfUrl && previewItem && (
          <PreviewEnvelope
            pdfUrl={pdfUrl}
            previewItem={previewItem}
            onClose={() => {
              setPdfUrl(null);
              setPreviewItem(null);
            }}
            onPrint={handlePrintEnvelope}
          />
        )}
      </div>
    </>
  );
};

export default VendorMaster;
