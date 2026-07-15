import React from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import {
  FaArrowCircleRight,
  FaPauseCircle,
  FaPlayCircle,
} from "react-icons/fa";
import { FiUserCheck, FiX } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import StageModal from "./StageModal";

// 🔹 Stage order with new "Pasting" stage after Printing
const STAGE_ORDER = [
  "Material Issue",
  "Cutting",
  "Printing",
  "Pasting", // 🔹 NEW optional stage
  "Stitching",
  "Checking",
  "Completed",
];

const JobDetails = ({ MI, filter, fetchMis }) => {
  const [openStageModal, setOpenStageModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [bulkAction, setBulkAction] = React.useState(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = React.useState(false);
  const [assignmentTask, setAssignmentTask] = React.useState(null);
  const [assignmentOptions, setAssignmentOptions] = React.useState({
    operators: [],
    machines: [],
  });
  const [assignmentForm, setAssignmentForm] = React.useState({
    assignedUser: "",
    assignedMachine: "",
    assignmentNote: "",
  });
  const [assignmentSaving, setAssignmentSaving] = React.useState(false);
  const [retryingTaskId, setRetryingTaskId] = React.useState("");
  const [freshProductionTasks, setFreshProductionTasks] = React.useState([]);

  const filteredDetails = MI.itemDetails || [];
  const productionTasks = React.useMemo(
    () =>
      freshProductionTasks.length
        ? freshProductionTasks
        : MI.productionTasks || [],
    [MI.productionTasks, freshProductionTasks]
  );

  React.useEffect(() => {
    let isMounted = true;

    const fetchProductionTasks = async () => {
      if (!MI?._id) return;

      try {
        const res = await axios.get(`/production/by-mi/${MI._id}`);
        if (isMounted) {
          if (res.data.status === 200) {
            setFreshProductionTasks(res.data.data || []);
          } else {
            setFreshProductionTasks(MI.productionTasks || []);
          }
        }
      } catch {
        if (isMounted) setFreshProductionTasks(MI.productionTasks || []);
      }
    };

    fetchProductionTasks();

    return () => {
      isMounted = false;
    };
  }, [MI?._id]);

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "object") return String(value._id || value.id || value);
    return String(value);
  };

  const normalizeStage = (value) => String(value || "").toLowerCase();

  const getTaskForStage = (item, stageName) => {
    const stageKey = normalizeStage(stageName);
    const itemIds = [
      item?._id,
      item?.id,
      item?.itemDetailId,
      item?.itemId?._id,
      item?.itemId,
    ]
      .map(normalizeId)
      .filter(Boolean);

    const stageTasks = productionTasks.filter(
      (task) => normalizeStage(task.stage) === stageKey
    );

    const idMatch = stageTasks.find((task) =>
      itemIds.includes(normalizeId(task.itemDetailId))
    );
    if (idMatch) return idMatch;

    return stageTasks.find((task) => {
      const samePart =
        String(task.partName || "").trim().toLowerCase() ===
        String(item?.partName || "").trim().toLowerCase();
      const sameCategory =
        !task.category ||
        !item?.category ||
        String(task.category).trim().toLowerCase() ===
          String(item.category).trim().toLowerCase();
      const sameQty =
        Number(task.qty || 0) === Number(item?.qty || 0) ||
        Number(item?.qty || 0) === 0;

      return samePart && sameCategory && sameQty;
    });
  };

  const closeAssignmentModal = () => {
    setAssignmentModalOpen(false);
    setAssignmentTask(null);
    setAssignmentOptions({ operators: [], machines: [] });
    setAssignmentForm({
      assignedUser: "",
      assignedMachine: "",
      assignmentNote: "",
    });
  };

  const openAssignmentModal = async (task, stageName) => {
    if (!task?._id) {
      toast.error("Production task is not generated yet");
      return;
    }

    setAssignmentTask(task);
    setAssignmentForm({
      assignedUser: task.assignedUser?._id || task.assignedUser || "",
      assignedMachine: task.assignedMachine?._id || task.assignedMachine || "",
      assignmentNote: task.assignmentNote || "",
    });
    setAssignmentModalOpen(true);

    try {
      const res = await axios.get("/production/assignment-options", {
        params: { stage: stageName },
      });
      setAssignmentOptions({
        operators: res.data.operators || [],
        machines: res.data.machines || [],
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load assignment options"
      );
      setAssignmentOptions({ operators: [], machines: [] });
    }
  };

  const submitManualAssignment = async (event) => {
    event.preventDefault();
    if (!assignmentForm.assignedUser) {
      toast.error("Select operator");
      return;
    }

    setAssignmentSaving(true);
    try {
      const res = await axios.patch(
        `/production/${assignmentTask._id}/manual-assign`,
        assignmentForm
      );

      if (res.data.status === 200) {
        toast.success("Operator assigned manually");
        if (res.data.data) {
          setFreshProductionTasks((prev) =>
            prev.map((task) =>
              task._id === res.data.data._id ? res.data.data : task
            )
          );
        }
        closeAssignmentModal();
        if (fetchMis) fetchMis();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Manual assignment failed");
    } finally {
      setAssignmentSaving(false);
    }
  };

  const retryAssignment = async (taskId) => {
    setRetryingTaskId(taskId);
    try {
      const res = await axios.post(`/production/${taskId}/retry-assign`);
      if (res.data.status === 200) {
        toast.success(res.data.message || "Assignment retried");
        if (res.data.data) {
          setFreshProductionTasks((prev) =>
            prev.map((task) =>
              task._id === res.data.data._id ? res.data.data : task
            )
          );
        }
        if (fetchMis) fetchMis();
      } else {
        toast.error(res.data.message || "Assignment retry failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Assignment retry failed"
      );
    } finally {
      setRetryingTaskId("");
    }
  };

  // ✅ Helper: get stage based on filter
  const getStageByFilter = (item, filter) => {
    if (!item.stages || item.stages.length === 0) {
      return { stage: "Material Issue", status: "Pending" };
    }
    if (filter === "production") {
      return item.stages[item.stages.length - 1];
    }

    const filterStage = filter === "outside" ? "Cutting" : filter;
    const filterIndex = STAGE_ORDER.findIndex(
      (s) => s.toLowerCase() === filterStage.toLowerCase()
    );

    const lastStage = item.stages[item.stages.length - 1];
    const lastStageIndex = STAGE_ORDER.findIndex(
      (s) => s.toLowerCase() === lastStage.stage.toLowerCase()
    );

    if (lastStageIndex === filterIndex) return lastStage;
    if (lastStageIndex < filterIndex) return lastStage;
    return { stage: STAGE_ORDER[filterIndex], status: "Completed" };
  };

  // ✅ Check if item is in the current filter stage
  const isInFilterStage = (item) => {
    if (filter === "production") return true;
    const stage = getStageByFilter(
      item,
      filter === "outside" ? "Cutting" : filter
    );
    return (
      stage &&
      stage.stage.toLowerCase() ===
        (filter === "outside" ? "cutting" : filter.toLowerCase())
    );
  };

  // ✅ Determine items to display
  const showAll =
    filteredDetails.some((item) => isInFilterStage(item)) ||
    filter === "production";
  const displayedItems = showAll
    ? filteredDetails
    : filteredDetails.filter(isInFilterStage);

  // ✅ Determine if all displayed items are in the same stage (for bulk actions)
  const allSameStage = displayedItems.every(
    (item) =>
      getStageByFilter(item, filter).stage ===
      getStageByFilter(displayedItems[0], filter).stage
  );

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const eligibleItems = displayedItems
      .filter(
        (item) =>
          isInFilterStage(item) &&
          getStageByFilter(item, filter).status !== "Completed" &&
          !(
            filter.toLowerCase() === "cutting" &&
            item.jobWorkType === "Outside Company"
          )
      )
      .map((i) => i._id);
    setSelectedItems(
      selectedItems.length === eligibleItems.length ? [] : eligibleItems
    );
  };

  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) return;
    setBulkAction(action);
    setSelectedItem(null);
    setOpenStageModal(true);
  };

  // ✅ Allowed bulk actions
  const allowedActions = (items, filter) => {
    if (!items || items.length === 0 || filter === "production")
      return { start: false, pause: false, next: false };

    const eligibleItems = items.filter(
      (item) =>
        isInFilterStage(item) &&
        getStageByFilter(item, filter).status !== "Completed" &&
        !(
          filter.toLowerCase() === "cutting" &&
          item.jobWorkType === "Outside Company"
        )
    );

    if (eligibleItems.length === 0)
      return { start: false, pause: false, next: false };

    const statuses = eligibleItems.map(
      (item) => getStageByFilter(item, filter).status
    );

    return {
      start: statuses.some((s) => s === "Yet to Start" || s === "Paused"),
      pause: statuses.every((s) => s === "In Progress"),
      next: statuses.every((s) => s === "In Progress"),
    };
  };

  const actions = allowedActions(displayedItems, filter);
  const shouldShowAssignment = filter !== "outside";

  const fmt = (val) => {
    if (val === "N/A" || val === null || val === undefined) return "-";
    const num = Number(val);
    if (isNaN(num)) return val; // if it's text, return as-is
    return parseFloat(num.toFixed(4)); // removes trailing zeros
  };

  return (
    <div className="bg-white border border-primary rounded shadow pt-3 pb-4 px-4 mx-2 mb-2 text-[11px] text-black whitespace-nowrap">
      {/* Header + Bulk Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-primary text-[14px] underline underline-offset-4 capitalize">
          Product Details ({filter})
        </div>

        {filter !== "production" &&
          selectedItems.length > 0 &&
          allSameStage && (
            <div className="flex gap-2 text-sm">
              {actions.start && (
                <FaPlayCircle
                  className="cursor-pointer text-primary hover:text-green-600"
                  data-tooltip-id="statusTip"
                  data-tooltip-content="Start / Resume Selected"
                  onClick={() => handleBulkAction("start")}
                />
              )}
              {actions.pause && (
                <FaPauseCircle
                  className="cursor-pointer text-primary hover:text-orange-600"
                  data-tooltip-id="statusTip"
                  data-tooltip-content="Pause Selected"
                  onClick={() => handleBulkAction("pause")}
                />
              )}
              {actions.next && (
                <FaArrowCircleRight
                  className="cursor-pointer text-primary hover:text-blue-600"
                  data-tooltip-id="statusTip"
                  data-tooltip-content="Next Stage"
                  onClick={() => handleBulkAction("next")}
                />
              )}
            </div>
          )}
      </div>

      {/* Table */}
      <table className="w-full text-[11px] border text-left">
        <thead className="bg-primary/70">
          <tr>
            {filter !== "production" && allSameStage && (
              <th className="px-2 py-1 border-r border-primary flex gap-1">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.length ===
                      displayedItems.filter(
                        (item) =>
                          isInFilterStage(item) &&
                          getStageByFilter(item, filter).status !==
                            "Completed" &&
                          !(
                            filter.toLowerCase() === "cutting" &&
                            item.jobWorkType === "Outside Company"
                          )
                      ).length &&
                    displayedItems.filter(
                      (item) =>
                        isInFilterStage(item) &&
                        getStageByFilter(item, filter).status !== "Completed" &&
                        !(
                          filter.toLowerCase() === "cutting" &&
                          item.jobWorkType === "Outside Company"
                        )
                    ).length > 0
                  }
                  onChange={handleSelectAll}
                  className="accent-black"
                />
              </th>
            )}
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">Sku Code</th>
            <th className="px-2 py-1 border-r border-primary">Item Name</th>
            {filter !== "production" && (
              <>
                <th className="px-2 py-1 border-r border-primary">Type</th>
                <th className="px-2 py-1 border-r border-primary">Location</th>
              </>
            )}
            <th className="px-2 py-1 border-r border-primary">Part Name</th>
            <th className="px-2 py-1 border-r border-primary">Height</th>
            <th className="px-2 py-1 border-r border-primary">Width</th>
            <th className="px-2 py-1 border-r border-primary">Quantity</th>
            {filter !== "printing" && filter !== "stitching" && (
              <th className="px-2 py-1 border-r border-primary">
                Cutting Type
              </th>
            )}
            {filter === "production" && (
              <th className="px-2 py-1 border-r border-primary">
                Latest Stage
              </th>
            )}
            {shouldShowAssignment && (
              <>
                <th className="px-2 py-1 border-r border-primary">Operator</th>
                <th className="px-2 py-1 border-r border-primary">Machine</th>
                <th className="px-2 py-1 border-r border-primary">
                  Assignment
                </th>
                <th className="px-2 py-1 border-r border-primary">
                  Assign Action
                </th>
              </>
            )}
            <th className="px-2 py-1 border-r border-primary">Status</th>
            {filter !== "production" && (
              <th className="px-2 py-1 border-r border-primary">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {displayedItems.length > 0 ? (
            displayedItems.map((item, idx) => {
              const stage = getStageByFilter(item, filter);
              if (!stage) return null;
              const productionTask = shouldShowAssignment
                ? getTaskForStage(item, stage.stage)
                : null;
              const assignedUser =
                productionTask?.assignedUser || item.assignee || null;
              const assignedUserName =
                assignedUser?.fullName || assignedUser?.username || "-";
              const assignedUserSkills = assignedUser?.skills || [];

              const inStage = isInFilterStage(item);
              const isOutsideCutting =
                filter.toLowerCase() === "cutting" &&
                item.jobWorkType === "Outside Company";

              const statusLabel =
                filter === "production" && productionTask?.status
                  ? productionTask.status
                  : stage.status === "Completed"
                  ? stage.status
                  : `${stage.stage} - ${stage.status}`;

              return (
                <tr
                  key={item._id}
                  className={`border-b border-primary ${
                    !inStage || stage.status === "Completed" || isOutsideCutting
                      ? "bg-gray-100 text-gray-500"
                      : ""
                  }`}
                >
                  {filter !== "production" && allSameStage && (
                    <td className="px-2 py-1 border-r border-primary accent-primary">
                      {!isOutsideCutting && (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleCheckboxChange(item._id)}
                          disabled={!inStage || stage.status === "Completed"}
                        />
                      )}
                    </td>
                  )}
                  <td className="px-2 py-1 border-r border-primary">
                    {idx + 1}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.itemId.skuCode || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.itemId.itemName || "-"}
                  </td>
                  {filter !== "production" && (
                    <>
                      <td className="px-2 py-1 border-r border-primary">
                        {item.type || "-"}
                      </td>
                      <td className="px-2 py-1 border-r border-primary">
                        {item.itemId.location?.locationId || "-"}
                      </td>
                    </>
                  )}
                  <td className="px-2 py-1 border-r border-primary">
                    {item.partName || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.height || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.width || "-"}
                  </td>
                  <td className="px-2 py-1 border-r border-primary">
                    {item.grams
                      ? `${fmt(item.weight)}`
                      : `${fmt(item.qty)}` || "-"}
                  </td>
                  {filter !== "printing" && filter !== "stitching" && (
                    <td className="px-2 py-1 border-r border-primary">
                      {item.cuttingType || "-"}
                    </td>
                  )}
                  {filter === "production" && (
                    <td className="px-2 py-1 border-r border-primary font-semibold">
                      {stage.stage}
                    </td>
                  )}
                  {shouldShowAssignment && (
                    <>
                      <td className="px-2 py-1 border-r border-primary">
                        <div className="font-semibold">
                          {assignedUserName}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {assignedUserSkills.join(", ") || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-1 border-r border-primary">
                        <div className="font-semibold">
                          {productionTask?.assignedMachine?.code || "-"}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {productionTask?.assignedMachine?.name || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-1 border-r border-primary">
                        <div className="font-semibold">
                          {productionTask?.assignmentMode || "-"}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {productionTask?.assignedBy?.fullName
                            ? `By ${productionTask.assignedBy.fullName}`
                            : productionTask?.assignedAt
                            ? new Date(productionTask.assignedAt).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )
                            : "-"}
                        </div>
                      </td>
                      <td className="px-2 py-1 border-r border-primary">
                        {productionTask &&
                        productionTask.status !== "Completed" &&
                        (!productionTask.assignedUser ||
                          !productionTask.assignedMachine) ? (
                          <button
                            type="button"
                            disabled={retryingTaskId === productionTask._id}
                            onClick={() => retryAssignment(productionTask._id)}
                            className="px-2 py-1 rounded bg-primary text-secondary font-semibold disabled:opacity-60"
                          >
                            {retryingTaskId === productionTask._id
                              ? "Trying..."
                              : "Try Assign"}
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-2 py-1 border-r border-primary">
                    <span
                      className={`${
                        stage?.status?.includes("Yet")
                          ? "bg-gray-200"
                          : stage?.status?.includes("In Progress")
                          ? "bg-yellow-200"
                          : stage?.status?.includes("Paused")
                          ? "bg-orange-200"
                          : stage?.status?.includes("Completed")
                          ? "bg-green-200"
                          : "bg-gray-100"
                      } py-0.5 px-1 rounded font-bold`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  {filter !== "production" && (
                    <td className="px-2 py-1 flex gap-1 text-[12px]">
                      {!isOutsideCutting &&
                        (filter.toLowerCase() === "stitching" ||
                        filter.toLowerCase() === "checking"
                          ? allSameStage
                          : true) && (
                          <>
                            {inStage && stage.status === "Yet to Start" && (
                              <FaPlayCircle
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Start"
                                className="cursor-pointer text-primary hover:text-green-600"
                                onClick={() => {
                                  setSelectedItem({
                                    ...item,
                                    action: "start",
                                    stage: stage.stage,
                                  });
                                  setBulkAction(null);
                                  setOpenStageModal(true);
                                }}
                              />
                            )}
                            {inStage && stage.status === "Paused" && (
                              <FaPlayCircle
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Resume"
                                className="cursor-pointer text-primary hover:text-green-600"
                                onClick={() => {
                                  setSelectedItem({
                                    ...item,
                                    action: "start",
                                    stage: stage.stage,
                                  });
                                  setBulkAction(null);
                                  setOpenStageModal(true);
                                }}
                              />
                            )}
                            {inStage && stage.status === "In Progress" && (
                              <>
                                <FaPauseCircle
                                  data-tooltip-id="statusTip"
                                  data-tooltip-content="Pause"
                                  className="cursor-pointer text-primary hover:text-red-600"
                                  onClick={() => {
                                    setSelectedItem({
                                      ...item,
                                      action: "pause",
                                      stage: stage.stage,
                                    });
                                    setBulkAction(null);
                                    setOpenStageModal(true);
                                  }}
                                />
                                <FaArrowCircleRight
                                  data-tooltip-id="statusTip"
                                  data-tooltip-content="Next Stage"
                                  className="cursor-pointer text-primary hover:text-blue-600"
                                  onClick={() => {
                                    setSelectedItem({
                                      ...item,
                                      action: "next",
                                      stage: stage.stage,
                                    });
                                    setBulkAction(null);
                                    setOpenStageModal(true);
                                  }}
                                />
                              </>
                            )}
                          </>
                        )}
                      <Tooltip
                        id="statusTip"
                        place="top"
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      />
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="px-2 py-1 text-center" colSpan={12}>
                No product details available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* StageModal */}
      <StageModal
        open={openStageModal}
        onClose={() => setOpenStageModal(false)}
        item={selectedItem}
        items={
          bulkAction
            ? displayedItems.filter((i) => selectedItems.includes(i._id))
            : []
        }
        bulkAction={bulkAction}
        fetchData={fetchMis}
        miId={MI._id}
        MI={MI}
      />
      <Tooltip
        id="statusTip"
        place="top"
        style={{
          backgroundColor: "black",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      />
      {assignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-3">
          <div className="w-full max-w-2xl bg-white rounded-lg border border-primary shadow-xl">
            <div className="flex items-center justify-between border-b border-primary px-5 py-3">
              <div>
                <h3 className="text-base font-bold text-primary">
                  Manual Operator Assignment
                </h3>
                <div className="text-[11px] text-gray-600">
                  {assignmentTask?.stage} | {assignmentTask?.partName} | Qty{" "}
                  {assignmentTask?.qty}
                </div>
              </div>
              <button
                type="button"
                onClick={closeAssignmentModal}
                className="p-1.5 rounded hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={submitManualAssignment} className="p-5 space-y-4">
              <label className="block text-sm font-semibold text-[#292926]">
                Operator
                <select
                  value={assignmentForm.assignedUser}
                  onChange={(e) =>
                    setAssignmentForm((prev) => ({
                      ...prev,
                      assignedUser: e.target.value,
                    }))
                  }
                  className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Select operator</option>
                  {assignmentOptions.operators.map((operator) => (
                    <option key={operator._id} value={operator._id}>
                      {operator.fullName || operator.username} | Load{" "}
                      {operator.currentLoad || 0} | Eff{" "}
                      {operator.efficiencyScore || 1}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-[#292926]">
                Machine
                <select
                  value={assignmentForm.assignedMachine}
                  onChange={(e) =>
                    setAssignmentForm((prev) => ({
                      ...prev,
                      assignedMachine: e.target.value,
                    }))
                  }
                  className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Keep without machine</option>
                  {assignmentOptions.machines.map((machine) => (
                    <option key={machine._id} value={machine._id}>
                      {machine.code} - {machine.name} | {machine.status} | Load{" "}
                      {machine.currentLoad || 0}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-[#292926]">
                Note
                <textarea
                  value={assignmentForm.assignmentNote}
                  onChange={(e) =>
                    setAssignmentForm((prev) => ({
                      ...prev,
                      assignmentNote: e.target.value,
                    }))
                  }
                  className="mt-1 w-full border border-primary rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                  placeholder="Optional reason or instruction"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="border border-primary rounded p-3">
                  <div className="font-bold text-primary mb-1">
                    Current Operator
                  </div>
                  <div>{assignmentTask?.assignedUser?.fullName || "-"}</div>
                  <div className="text-gray-500">
                    {(assignmentTask?.assignedUser?.skills || []).join(", ") ||
                      "-"}
                  </div>
                </div>
                <div className="border border-primary rounded p-3">
                  <div className="font-bold text-primary mb-1">
                    Current Machine
                  </div>
                  <div>{assignmentTask?.assignedMachine?.code || "-"}</div>
                  <div className="text-gray-500">
                    {assignmentTask?.assignedMachine?.name || "-"}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAssignmentModal}
                  className="px-4 py-2 rounded border border-gray-300 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignmentSaving}
                  className="px-4 py-2 rounded bg-primary text-secondary text-sm font-semibold hover:bg-primary/90 disabled:opacity-70"
                >
                  {assignmentSaving ? "Assigning..." : "Assign Manually"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
