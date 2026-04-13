import { useCallback, useEffect, useState } from "react";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import {
  FiArrowUpRight,
  FiCalendar,
  FiCheckSquare,
  FiDownload,
  FiFilter,
  FiMail,
  FiMessageSquare,
  FiPlusCircle,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiTarget,
  FiUser,
  FiX,
} from "react-icons/fi";
import TableSkeleton from "../../TableSkeleton";
import ScrollLock from "../../ScrollLock";
import PaginationControls from "../../PaginationControls";
import { QUERY_TYPE_MAP } from "../../../data/dropdownData";
import { useAuth } from "../../../context/AuthContext";

const STORAGE_KEY = "indiamart-lead-management-meta";

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
  "Spam",
];

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];

const SOURCE_FILTERS = ["All", "Direct Enquiries", "Buy-Leads", "WhatsApp"];

const defaultMeta = {
  status: "New",
  priority: "Medium",
  owner: "",
  nextFollowUp: "",
  notes: "",
  budget: "",
  tags: "",
  lastContactedAt: "",
};

const readLeadMeta = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const getLeadKey = (lead) => lead?.UNIQUE_QUERY_ID || lead?._id;

const getLeadMeta = (leadMeta, lead) => {
  const key = getLeadKey(lead);
  return {
    ...defaultMeta,
    ...(key ? leadMeta[key] || {} : {}),
  };
};

const saveLeadMeta = (leadMeta) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leadMeta));
};

const getWhatsappHref = (lead) => {
  const phone = String(lead?.SENDER_MOBILE || "")
    .replace(/[^\d]/g, "")
    .replace(/^0+/, "");

  if (!phone) return "";

  const internationalPhone =
    phone.length === 10 ? `91${phone}` : phone;

  const name = lead?.SENDER_NAME || "there";
  const product = lead?.rawData?.QUERY_PRODUCT_NAME || "your requirement";
  const message = `Hello ${name}, regarding your IndiaMART enquiry for ${product}, our team is following up with you.`;

  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatLocation = (lead) => {
  const parts = [lead?.rawData?.SENDER_CITY, lead?.rawData?.SENDER_STATE].filter(
    Boolean
  );
  return parts.length ? parts.join(", ") : "-";
};

const formatQueryMessage = (message) => {
  if (!message) return [];

  return String(message)
    .split("<br>")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (!line.includes(":")) return { label: "", value: line };
      const [label, value] = line.split(/:(.+)/);
      return { label: label.trim(), value: value?.trim() || "-" };
    });
};

const getPriorityClasses = (priority) => {
  const map = {
    Low: "bg-slate-100 text-slate-700",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-amber-100 text-amber-800",
    Urgent: "bg-red-100 text-red-700",
  };
  return map[priority] || "bg-slate-100 text-slate-700";
};

const getStatusClasses = (status) => {
  const map = {
    New: "bg-slate-100 text-slate-700",
    Contacted: "bg-sky-100 text-sky-700",
    Qualified: "bg-emerald-100 text-emerald-700",
    "Proposal Sent": "bg-indigo-100 text-indigo-700",
    Negotiation: "bg-amber-100 text-amber-800",
    Won: "bg-green-100 text-green-700",
    Lost: "bg-rose-100 text-rose-700",
    Spam: "bg-zinc-200 text-zinc-700",
  };
  return map[status] || "bg-slate-100 text-slate-700";
};

const getReminderState = (value) => {
  if (!value) {
    return {
      label: "Not scheduled",
      classes: "bg-slate-100 text-slate-600",
      rowClasses: "",
    };
  }

  const followUp = new Date(value);
  if (Number.isNaN(followUp.getTime())) {
    return {
      label: "Invalid date",
      classes: "bg-slate-100 text-slate-600",
      rowClasses: "",
    };
  }

  const now = new Date();
  const todayKey = now.toDateString();

  if (followUp < now && followUp.toDateString() !== todayKey) {
    return {
      label: "Overdue",
      classes: "bg-red-100 text-red-700",
      rowClasses: "bg-red-50/40",
    };
  }

  if (followUp.toDateString() === todayKey) {
    return {
      label: "Due today",
      classes: "bg-amber-100 text-amber-800",
      rowClasses: "bg-amber-50/40",
    };
  }

  return {
    label: "Upcoming",
    classes: "bg-emerald-100 text-emerald-700",
    rowClasses: "",
  };
};

const LeadManagementCard = ({ title, value, hint, icon: Icon }) => (
  <div className="rounded-2xl border border-primary/30 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
        {title}
      </span>
      <span className="rounded-full bg-primary/15 p-2 text-primary">
        <Icon size={16} />
      </span>
    </div>
    <div className="text-2xl font-bold text-secondary">{value}</div>
    <div className="mt-1 text-xs text-gray-500">{hint}</div>
  </div>
);

LeadManagementCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  hint: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
};

const IndiaMartLeads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [leadMeta, setLeadMeta] = useState(() => readLeadMeta());
  const [teamMembers, setTeamMembers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  });

  ScrollLock(Boolean(selectedLead));

  const mergeLeadWithMeta = (lead) => ({
    ...lead,
    management: getLeadMeta(leadMeta, lead),
  });

  const persistLeadMeta = (updater) => {
    setLeadMeta((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveLeadMeta(next);
      return next;
    });
  };

  const fetchLeads = useCallback(
    async (page = pagination.currentPage, limit = pagination.limit) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (search.trim()) {
          query.set("search", search.trim());
        }

        const res = await axios.get(`/indiamart/leads?${query.toString()}`);

        if (res.data.status == 403) {
          toast.error(res.data.message);
          return;
        }

        if (res.status === 200) {
          setLeads(res.data.data || []);
          setPagination({
            currentPage: res.data.currentPage || page,
            totalPages: res.data.totalPages || 1,
            totalResults: res.data.totalResults || 0,
            limit: res.data.limit || limit,
          });
        }
      } catch {
        toast.error("Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    },
    [pagination.currentPage, pagination.limit, search]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads(pagination.currentPage, pagination.limit);
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchLeads, pagination.currentPage, pagination.limit]);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => leads.some((lead) => getLeadKey(lead) === id))
    );
  }, [leads]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await axios.get("/users/all-users", {
          params: { page: 1, limit: 100 },
        });

        if (res.data.status === 200) {
          setTeamMembers(res.data.users || []);
        }
      } catch {
        setTeamMembers([]);
      }
    };

    fetchTeamMembers();
  }, []);

  const mergedLeads = leads.map(mergeLeadWithMeta);

  const visibleLeads = mergedLeads.filter((lead) => {
    const mappedSource = QUERY_TYPE_MAP[lead.QUERY_TYPE] || lead.QUERY_TYPE || "-";

    const matchesStatus =
      statusFilter === "All" || lead.management.status === statusFilter;
    const matchesPriority =
      priorityFilter === "All" || lead.management.priority === priorityFilter;
    const matchesSource =
      sourceFilter === "All" ||
      mappedSource === sourceFilter ||
      (sourceFilter === "WhatsApp" && mappedSource?.includes("WhatsApp"));

    return matchesStatus && matchesPriority && matchesSource;
  });

  const summary = mergedLeads.reduce(
    (acc, lead) => {
      acc.total += 1;

      if (lead.management.status === "New") acc.new += 1;
      if (lead.management.status === "Qualified") acc.qualified += 1;
      if (lead.management.status === "Won") acc.won += 1;

      if (lead.management.nextFollowUp) {
        const followUp = new Date(lead.management.nextFollowUp);
        const now = new Date();
        if (!Number.isNaN(followUp.getTime()) && followUp < now) {
          acc.overdue += 1;
        }
      }

      return acc;
    },
    { total: 0, new: 0, qualified: 0, won: 0, overdue: 0 }
  );

  const updateLeadManagement = (lead, updates) => {
    const key = getLeadKey(lead);
    if (!key) return;

    persistLeadMeta((prev) => ({
      ...prev,
      [key]: {
        ...defaultMeta,
        ...(prev[key] || {}),
        ...updates,
      },
    }));

    if (selectedLead && getLeadKey(selectedLead) === key) {
      setSelectedLead((prev) => ({
        ...prev,
        management: {
          ...prev.management,
          ...updates,
        },
      }));
    }
  };

  const applyBulkUpdate = (field, value) => {
    if (!selectedIds.length) {
      toast.error("Select at least one lead first");
      return;
    }

    persistLeadMeta((prev) => {
      const next = { ...prev };

      selectedIds.forEach((id) => {
        next[id] = {
          ...defaultMeta,
          ...(next[id] || {}),
          [field]: value,
        };
      });

      return next;
    });

    if (selectedLead && selectedIds.includes(getLeadKey(selectedLead))) {
      setSelectedLead((prev) => ({
        ...prev,
        management: {
          ...prev.management,
          [field]: value,
        },
      }));
    }

    toast.success(`Updated ${selectedIds.length} lead(s)`);
  };

  const convertLeadToCustomer = async (lead) => {
    const meta = getLeadMeta(leadMeta, lead);
    const customerName = lead.SENDER_NAME?.trim();

    if (!customerName) {
      toast.error("Lead name is required to create a customer");
      return;
    }

    setActionLoading(`customer-${getLeadKey(lead)}`);
    try {
      const payload = {
        customers: [
          {
            customerName,
            aliasName: customerName,
            natureOfBusiness:
              lead.rawData?.QUERY_MCAT_NAME ||
              lead.rawData?.QUERY_PRODUCT_NAME ||
              "IndiaMart Lead",
            address: lead.rawData?.SENDER_ADDRESS || "",
            country: "India",
            state: lead.rawData?.SENDER_STATE || "",
            city: lead.rawData?.SENDER_CITY || "",
            postalCode: lead.rawData?.SENDER_PINCODE || "",
            gst: "",
            pan: "",
            paymentTerms: "",
            leadCompetitor: meta.tags || "IndiaMart",
            transportationTime: "",
            contactPersons: [
              {
                contactPerson: lead.SENDER_NAME || "",
                designation: "",
                phone: lead.SENDER_MOBILE || "",
                email: lead.SENDER_EMAIL || "",
              },
            ],
            deliveryLocations: [
              {
                consigneeName: lead.SENDER_NAME || "",
                consigneeAddress: lead.rawData?.SENDER_ADDRESS || "",
                country: "India",
                state: lead.rawData?.SENDER_STATE || "",
                city: lead.rawData?.SENDER_CITY || "",
                pinCode: lead.rawData?.SENDER_PINCODE || "",
                gstinOfConsignee: "",
                storeIncharge: lead.SENDER_NAME || "",
                contactNo: lead.SENDER_MOBILE || "",
                email: lead.SENDER_EMAIL || "",
              },
            ],
          },
        ],
      };

      const res = await axios.post("/customers/add-many", payload);

      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

      if (res.status === 201) {
        updateLeadManagement(lead, {
          status: meta.status === "New" ? "Qualified" : meta.status,
          notes: `${meta.notes ? `${meta.notes}\n` : ""}Converted to customer on ${new Date().toLocaleString(
            "en-IN"
          )}.`,
        });
        toast.success("Customer created from lead");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create customer");
    } finally {
      setActionLoading("");
    }
  };

  const convertLeadToQuotation = async (lead) => {
    const meta = getLeadMeta(leadMeta, lead);
    const partyName = lead.SENDER_NAME?.trim();

    if (!partyName) {
      toast.error("Lead name is required to create a quotation");
      return;
    }

    setActionLoading(`quotation-${getLeadKey(lead)}`);
    try {
      const quotationDraft = {
        productName:
          lead.rawData?.QUERY_PRODUCT_NAME ||
          lead.rawData?.QUERY_MCAT_NAME ||
          "IndiaMart Requirement",
        description: lead.rawData?.SUBJECT || lead.rawData?.QUERY_MESSAGE || "",
        sampleNo: lead.UNIQUE_QUERY_ID || "",
        hsnOrSac: "",
        gst: 18,
        orderQty: 1,
        date: new Date().toISOString().split("T")[0],
        deliveryDate: meta.nextFollowUp
          ? new Date(meta.nextFollowUp).toISOString().split("T")[0]
          : "",
        height: 0,
        width: 0,
        depth: 0,
        B2B: 0,
        D2C: 0,
        rejection: 2,
        QC: 0.75,
        machineMaintainance: 1.75,
        materialHandling: 1.75,
        packaging: 2,
        shipping: 1,
        companyOverHead: 4,
        indirectExpense: 1.75,
        stitching: 0,
        printing: 0,
        others: 0,
        unitRate: 0,
        unitB2BRate: 0,
        unitD2CRate: 0,
        totalRate: 0,
        totalB2BRate: 0,
        totalD2CRate: 0,
        productDetails: [],
        consumptionTable: [],
      };

      const res = await axios.post("/quotation/add", {
        partyName,
        date: new Date().toISOString().split("T")[0],
        quotations: [quotationDraft],
      });

      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }

      if (res.status === 200 || res.status === 201) {
        updateLeadManagement(lead, {
          status:
            meta.status === "New" || meta.status === "Contacted"
              ? "Proposal Sent"
              : meta.status,
          notes: `${meta.notes ? `${meta.notes}\n` : ""}Draft quotation created on ${new Date().toLocaleString(
            "en-IN"
          )}.`,
        });
        toast.success("Quotation draft created from lead");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create quotation");
    } finally {
      setActionLoading("");
    }
  };

  const toggleSelectAll = () => {
    const ids = visibleLeads.map((lead) => getLeadKey(lead)).filter(Boolean);

    if (ids.length && ids.every((id) => selectedIds.includes(id))) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const toggleSelectLead = (lead) => {
    const key = getLeadKey(lead);
    if (!key) return;

    setSelectedIds((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  };

  const exportVisibleLeads = () => {
    if (!visibleLeads.length) {
      toast.error("No leads available to export");
      return;
    }

    const rows = [
      [
        "Query Time",
        "Query ID",
        "Sender Name",
        "Email",
        "Mobile",
        "City/State",
        "Source",
        "Status",
        "Priority",
        "Owner",
        "Next Follow Up",
        "Product",
        "Subject",
      ],
      ...visibleLeads.map((lead) => [
        formatDateTime(lead.QUERY_TIME),
        lead.UNIQUE_QUERY_ID || "-",
        lead.SENDER_NAME || "-",
        lead.SENDER_EMAIL || "-",
        lead.SENDER_MOBILE || "-",
        formatLocation(lead),
        QUERY_TYPE_MAP[lead.QUERY_TYPE] || lead.QUERY_TYPE || "-",
        lead.management.status,
        lead.management.priority,
        lead.management.owner || "-",
        lead.management.nextFollowUp || "-",
        lead.rawData?.QUERY_PRODUCT_NAME || "-",
        lead.rawData?.SUBJECT || "-",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "-").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `indiamart-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedLeadDetails = selectedLead
    ? mergeLeadWithMeta(selectedLead)
    : null;

  return (
    <div className="relative mx-auto mt-4 max-w-[99vw] overflow-x-hidden p-2 md:px-4">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary">IndiaMart Lead Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track enquiries, assign follow-ups, and keep the team on the same page.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchLeads(1, pagination.limit)}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm font-medium text-secondary transition hover:border-primary hover:bg-primary/10"
          >
            <FiRefreshCw size={15} />
            Refresh
          </button>
          <button
            onClick={exportVisibleLeads}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-secondary transition hover:bg-[#caa854]"
          >
            <FiDownload size={15} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <LeadManagementCard
          title="Loaded Leads"
          value={summary.total}
          hint="Current page after sync"
          icon={FiTarget}
        />
        <LeadManagementCard
          title="New"
          value={summary.new}
          hint="Fresh enquiries to review"
          icon={FiMessageSquare}
        />
        <LeadManagementCard
          title="Qualified"
          value={summary.qualified}
          hint="Promising leads on this page"
          icon={FiCheckSquare}
        />
        <LeadManagementCard
          title="Won"
          value={summary.won}
          hint="Closed successfully"
          icon={FiArrowUpRight}
        />
        <LeadManagementCard
          title="Overdue"
          value={summary.overdue}
          hint="Follow-up date has passed"
          icon={FiCalendar}
        />
      </div>

      <div className="mb-4 rounded-2xl border border-primary/30 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <FiSearch className="absolute left-3 top-3.5 text-primary" />
            <input
              type="text"
              placeholder="Search by name, mobile, email, query ID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full rounded-xl border border-primary/40 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-primary"
            />
            {search && (
              <FiX
                className="absolute right-3 top-3.5 cursor-pointer text-gray-500 transition hover:text-primary"
                onClick={() => {
                  setSearch("");
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
              />
            )}
          </div>

          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-primary/40 px-3 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-xl border border-primary/40 px-3 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="All">All Priorities</option>
              {PRIORITY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full rounded-xl border border-primary/40 px-3 py-3 text-sm outline-none focus:border-primary"
            >
              {SOURCE_FILTERS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 lg:col-span-2">
            <span className="rounded-lg bg-primary/10 p-3 text-primary">
              <FiFilter size={16} />
            </span>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-gray-500">
                Visible
              </div>
              <div className="text-lg font-semibold text-secondary">
                {visibleLeads.length}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-primary/30 bg-[#fcfaf3] p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-gray-600">
            {selectedIds.length} lead(s) selected for bulk updates on this page.
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  applyBulkUpdate("status", e.target.value);
                  e.target.value = "";
                }
              }}
              className="rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Bulk status</option>
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  applyBulkUpdate("priority", e.target.value);
                  e.target.value = "";
                }
              }}
              className="rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Bulk priority</option>
              {PRIORITY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSelectedIds([])}
              className="rounded-lg border border-primary/30 px-3 py-2 text-sm font-medium text-secondary transition hover:bg-primary/10"
            >
              Clear selection
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-primary/30 bg-white shadow-sm">
        <table className="min-w-full text-[12px]">
          <thead className="bg-primary/95 text-left text-secondary">
            <tr className="whitespace-nowrap">
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={
                    visibleLeads.length > 0 &&
                    visibleLeads.every((lead) =>
                      selectedIds.includes(getLeadKey(lead))
                    )
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Lead</th>
              <th className="px-3 py-3">Query</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Owner</th>
              <th className="px-3 py-3">Follow-up</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={pagination.limit} columns={Array(10).fill({})} />
            ) : visibleLeads.length ? (
              visibleLeads.map((lead, index) => {
                const key = getLeadKey(lead);
                const sourceLabel =
                  QUERY_TYPE_MAP[lead.QUERY_TYPE] || lead.QUERY_TYPE || "-";

                return (
                  <tr
                    key={key || index}
                    className={`border-t border-primary/20 align-top transition hover:bg-[#fcfaf3] ${getReminderState(
                      lead.management.nextFollowUp
                    ).rowClasses}`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(key)}
                        onChange={() => toggleSelectLead(lead)}
                      />
                    </td>
                    <td className="px-3 py-3 text-gray-500">
                      {(pagination.currentPage - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-secondary">
                        {lead.SENDER_NAME || "-"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {lead.SENDER_EMAIL || "-"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {lead.SENDER_MOBILE || "-"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatLocation(lead)}
                      </div>
                    </td>
                    <td className="max-w-[280px] px-3 py-3">
                      <div className="font-medium text-secondary">
                        {lead.rawData?.SUBJECT || "No subject"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {lead.UNIQUE_QUERY_ID || "-"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatDateTime(lead.QUERY_TIME)}
                      </div>
                      <div className="mt-2 line-clamp-2 text-xs text-gray-600">
                        {lead.rawData?.QUERY_MESSAGE
                          ?.replaceAll("<br>", " ")
                          ?.trim() || "No query message"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {sourceLabel}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={lead.management.status}
                        onChange={(e) =>
                          updateLeadManagement(lead, { status: e.target.value })
                        }
                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${getStatusClasses(
                          lead.management.status
                        )}`}
                      >
                        {STATUS_OPTIONS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={lead.management.priority}
                        onChange={(e) =>
                          updateLeadManagement(lead, { priority: e.target.value })
                        }
                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${getPriorityClasses(
                          lead.management.priority
                        )}`}
                      >
                        {PRIORITY_OPTIONS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      {lead.management.owner || "-"}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      <div>
                        {lead.management.nextFollowUp
                          ? formatDateTime(lead.management.nextFollowUp)
                          : "Not scheduled"}
                      </div>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${getReminderState(
                          lead.management.nextFollowUp
                        ).classes}`}
                      >
                        {getReminderState(lead.management.nextFollowUp).label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-secondary transition hover:bg-primary/10"
                        >
                          Manage
                        </button>
                        {lead.SENDER_MOBILE && (
                          <a
                            href={`tel:${lead.SENDER_MOBILE}`}
                            className="rounded-lg border border-primary/30 p-2 text-primary transition hover:bg-primary/10"
                            title="Call lead"
                          >
                            <FiPhone size={14} />
                          </a>
                        )}
                        {lead.SENDER_EMAIL && (
                          <a
                            href={`mailto:${lead.SENDER_EMAIL}`}
                            className="rounded-lg border border-primary/30 p-2 text-primary transition hover:bg-primary/10"
                            title="Email lead"
                          >
                            <FiMail size={14} />
                          </a>
                        )}
                        {getWhatsappHref(lead) && (
                          <a
                            href={getWhatsappHref(lead)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-green-200 p-2 text-green-600 transition hover:bg-green-50"
                            title="WhatsApp lead"
                            onClick={() =>
                              updateLeadManagement(lead, {
                                lastContactedAt: new Date().toISOString(),
                              })
                            }
                          >
                            <FiMessageSquare size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="px-4 py-10 text-center text-sm text-gray-500">
                  No leads found for the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        totalResults={pagination.totalResults}
        onEntriesChange={(limit) => {
          setPagination((prev) => ({ ...prev, currentPage: 1, limit }));
        }}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }));
        }}
      />

      {selectedLeadDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]">
          <div className="h-full w-full overflow-y-auto bg-white shadow-2xl sm:max-w-2xl">
            <div className="sticky top-0 z-10 border-b border-primary/20 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-gray-500">
                    Lead Profile
                  </div>
                  <h3 className="mt-1 text-xl font-bold text-secondary">
                    {selectedLeadDetails.SENDER_NAME || "Unnamed Lead"}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        selectedLeadDetails.management.status
                      )}`}
                    >
                      {selectedLeadDetails.management.status}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClasses(
                        selectedLeadDetails.management.priority
                      )}`}
                    >
                      {selectedLeadDetails.management.priority}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="rounded-lg border border-primary/30 p-2 text-secondary transition hover:bg-primary/10"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-primary/20 bg-[#fcfaf3] p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Contact
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <FiUser size={14} className="text-primary" />
                      {selectedLeadDetails.SENDER_NAME || "-"}
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMail size={14} className="text-primary" />
                      {selectedLeadDetails.SENDER_EMAIL || "-"}
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone size={14} className="text-primary" />
                      {selectedLeadDetails.SENDER_MOBILE || "-"}
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMessageSquare size={14} className="text-primary" />
                      {formatLocation(selectedLeadDetails)}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-[#fcfaf3] p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Query Snapshot
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>Query ID: {selectedLeadDetails.UNIQUE_QUERY_ID || "-"}</div>
                    <div>
                      Query Time: {formatDateTime(selectedLeadDetails.QUERY_TIME)}
                    </div>
                    <div>
                      Source:{" "}
                      {QUERY_TYPE_MAP[selectedLeadDetails.QUERY_TYPE] ||
                        selectedLeadDetails.QUERY_TYPE ||
                        "-"}
                    </div>
                    <div>
                      Product: {selectedLeadDetails.rawData?.QUERY_PRODUCT_NAME || "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-secondary">
                  Lead Status
                  <select
                    value={selectedLeadDetails.management.status}
                    onChange={(e) =>
                      updateLeadManagement(selectedLeadDetails, {
                        status: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-primary/30 px-3 py-2.5 outline-none focus:border-primary"
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-secondary">
                  Priority
                  <select
                    value={selectedLeadDetails.management.priority}
                    onChange={(e) =>
                      updateLeadManagement(selectedLeadDetails, {
                        priority: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-primary/30 px-3 py-2.5 outline-none focus:border-primary"
                  >
                    {PRIORITY_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-secondary">
                  Lead Owner
                  <select
                    value={selectedLeadDetails.management.owner}
                    onChange={(e) =>
                      updateLeadManagement(selectedLeadDetails, {
                        owner: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-primary/30 px-3 py-2.5 outline-none focus:border-primary"
                  >
                    <option value="">Unassigned</option>
                    {user?.fullName && (
                      <option value={user.fullName}>Me ({user.fullName})</option>
                    )}
                    {teamMembers.map((member) => {
                      const label =
                        member.fullName || member.username || member.email || "User";
                      return (
                        <option key={member._id || member.id || label} value={label}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <label className="text-sm font-medium text-secondary">
                  Next Follow-up
                  <input
                    type="datetime-local"
                    value={selectedLeadDetails.management.nextFollowUp}
                    onChange={(e) =>
                      updateLeadManagement(selectedLeadDetails, {
                        nextFollowUp: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-primary/30 px-3 py-2.5 outline-none focus:border-primary"
                  />
                </label>

                <label className="text-sm font-medium text-secondary">
                  Expected Budget
                  <input
                    type="text"
                    value={selectedLeadDetails.management.budget}
                    onChange={(e) =>
                      updateLeadManagement(selectedLeadDetails, {
                        budget: e.target.value,
                      })
                    }
                    placeholder="Approx. deal size"
                    className="mt-2 w-full rounded-xl border border-primary/30 px-3 py-2.5 outline-none focus:border-primary"
                  />
                </label>

                <label className="text-sm font-medium text-secondary">
                  Tags
                  <input
                    type="text"
                    value={selectedLeadDetails.management.tags}
                    onChange={(e) =>
                      updateLeadManagement(selectedLeadDetails, {
                        tags: e.target.value,
                      })
                    }
                    placeholder="bulk order, urgent, fabric"
                    className="mt-2 w-full rounded-xl border border-primary/30 px-3 py-2.5 outline-none focus:border-primary"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-primary/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Team Notes
                    </div>
                    <div className="text-sm text-gray-500">
                      Saved in browser for quick follow-up continuity.
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      updateLeadManagement(selectedLeadDetails, {
                        lastContactedAt: new Date().toISOString(),
                      })
                    }
                    className="rounded-lg border border-primary/30 px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-primary/10"
                  >
                    Mark Contacted Now
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={selectedLeadDetails.management.notes}
                  onChange={(e) =>
                    updateLeadManagement(selectedLeadDetails, {
                      notes: e.target.value,
                    })
                  }
                  placeholder="Add call summary, next action, pricing discussion, objections, or internal context"
                  className="w-full rounded-xl border border-primary/30 px-3 py-3 outline-none focus:border-primary"
                />

                <div className="mt-3 text-xs text-gray-500">
                  Last contacted:{" "}
                  {formatDateTime(selectedLeadDetails.management.lastContactedAt)}
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Quick Conversions
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => convertLeadToCustomer(selectedLeadDetails)}
                    disabled={actionLoading === `customer-${getLeadKey(selectedLeadDetails)}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-secondary transition hover:bg-[#caa854] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <FiPlusCircle size={15} />
                    {actionLoading === `customer-${getLeadKey(selectedLeadDetails)}`
                      ? "Creating Customer..."
                      : "Convert To Customer"}
                  </button>
                  <button
                    onClick={() => convertLeadToQuotation(selectedLeadDetails)}
                    disabled={actionLoading === `quotation-${getLeadKey(selectedLeadDetails)}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-4 py-2.5 text-sm font-semibold text-secondary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <FiArrowUpRight size={15} />
                    {actionLoading === `quotation-${getLeadKey(selectedLeadDetails)}`
                      ? "Creating Quotation..."
                      : "Create Quotation Draft"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Subject
                </div>
                <div className="text-sm text-secondary">
                  {selectedLeadDetails.rawData?.SUBJECT || "No subject available"}
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Query Message
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  {formatQueryMessage(selectedLeadDetails.rawData?.QUERY_MESSAGE).map(
                    (item, index) => (
                      <div
                        key={`${item.label}-${index}`}
                        className="rounded-lg bg-[#fcfaf3] px-3 py-2"
                      >
                        {item.label ? (
                          <>
                            <span className="font-semibold text-secondary">
                              {item.label}:
                            </span>{" "}
                            <span>{item.value}</span>
                          </>
                        ) : (
                          item.value
                        )}
                      </div>
                    )
                  )}
                  {!formatQueryMessage(selectedLeadDetails.rawData?.QUERY_MESSAGE)
                    .length && <div>No message available</div>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedLeadDetails.SENDER_MOBILE && (
                  <a
                    href={`tel:${selectedLeadDetails.SENDER_MOBILE}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-secondary transition hover:bg-[#caa854]"
                  >
                    <FiPhone size={15} />
                    Call Lead
                  </a>
                )}
                {getWhatsappHref(selectedLeadDetails) && (
                  <a
                    href={getWhatsappHref(selectedLeadDetails)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      updateLeadManagement(selectedLeadDetails, {
                        lastContactedAt: new Date().toISOString(),
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    <FiMessageSquare size={15} />
                    WhatsApp Lead
                  </a>
                )}
                {selectedLeadDetails.SENDER_EMAIL && (
                  <a
                    href={`mailto:${selectedLeadDetails.SENDER_EMAIL}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-4 py-2.5 text-sm font-semibold text-secondary transition hover:bg-primary/10"
                  >
                    <FiMail size={15} />
                    Send Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndiaMartLeads;
