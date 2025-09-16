import React from "react";
import {
  FaArrowCircleRight,
  FaPauseCircle,
  FaPlayCircle,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import StageModal from "./StageModal";

import axios from "../../utils/axios";

const JobDetails = ({ MI, filter, fetchMis }) => {
  const [openStageModal, setOpenStageModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null); // ✅ single item
  const [selectedItems, setSelectedItems] = React.useState([]); // ✅ bulk items
  const [bulkAction, setBulkAction] = React.useState(null);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  let filteredDetails = MI.itemDetails || [];

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredDetails.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredDetails.map((i) => i._id));
    }
  };

  // ✅ bulk stage update
  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) return;
    setBulkAction(action);
    setSelectedItem(null); // reset single item
    setOpenStageModal(true);
  };

  return (
    <div className="bg-white border border-primary rounded shadow pt-3 pb-4 px-4 mx-2 mb-2 text-[11px] text-[#292926]">
      {/* Product Details Table */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-primary text-[14px] underline underline-offset-4">
          Product Details (Raw Material / SFG)
        </div>

        {/* ✅ Show bulk action buttons only when items are selected */}
        {selectedItems.length > 0 && (
          <div className="flex gap-2 text-sm">
            {["outside"].includes(filter) ? (
              ""
            ) : (
              <>
                {" "}
                <FaPlayCircle
                  className="cursor-pointer text-primary hover:text-green-600 "
                  data-tooltip-id="statusTip"
                  data-tooltip-content="Start / Resume Selected"
                  onClick={() => handleBulkAction("start")}
                />
                <FaPauseCircle
                  className="cursor-pointer text-primary hover:text-orange-600"
                  data-tooltip-id="statusTip"
                  data-tooltip-content="Pause Selected"
                  onClick={() => handleBulkAction("pause")}
                />
              </>
            )}
            <FaArrowCircleRight
              className="cursor-pointer text-primary hover:text-blue-600"
              data-tooltip-id="statusTip"
              data-tooltip-content="Next Stage"
              onClick={() => handleBulkAction("next")}
            />
          </div>
        )}
      </div>

      <table className="w-full text-[11px] border text-left">
        <thead className="bg-primary/70">
          <tr>
            {["production"].includes(filter) ? (
              ""
            ) : (
              <th className="px-2 py-1 border-r border-primary flex gap-1">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.length === filteredDetails.length &&
                    filteredDetails.length > 0
                  }
                  onChange={handleSelectAll}
                  className="accent-black"
                />
              </th>
            )}
            <th className="px-2 py-1 border-r border-primary">S. No.</th>
            <th className="px-2 py-1 border-r border-primary">Sku Code</th>
            <th className="px-2 py-1 border-r border-primary">Item Name</th>
            {["production"].includes(filter) ? (
              ""
            ) : (
              <>
                <th className="px-2 py-1 border-r border-primary">Type</th>
                <th className="px-2 py-1 border-r border-primary">Location</th>
              </>
            )}
            <th className="px-2 py-1 border-r border-primary">Part Name</th>
            <th className="px-2 py-1 border-r border-primary">Height (Inch)</th>
            <th className="px-2 py-1 border-r border-primary">Width (Inch)</th>
            <th className="px-2 py-1 border-r border-primary">Quantity</th>
            {["printing", "stitching"].includes(filter) ? (
              ""
            ) : (
              <th className="px-2 py-1 border-r border-primary">
                Cutting Type
              </th>
            )}
            {["production"].includes(filter) ? (
              <th className="px-2 py-1 border-r border-primary">Printing</th>
            ) : (
              ""
            )}
            {["outside"].includes(filter) ? (
              <th className="px-2 py-1 border-r border-primary">Vendor</th>
            ) : (
              ""
            )}
            <th className="px-2 py-1 border-r border-primary">Status</th>
            {["production"].includes(filter) ? (
              ""
            ) : (
              <th className="px-2 py-1 border-r border-primary">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredDetails?.length > 0 ? (
            filteredDetails.map((item, idx) => (
              <tr key={item._id} className="border-b border-primary">
                {["production"].includes(filter) ? (
                  ""
                ) : (
                  <td className="px-2 py-1 border-r border-primary accent-primary">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleCheckboxChange(item._id)}
                    />
                  </td>
                )}
                <td className="px-2 py-1 border-r border-primary">{idx + 1}</td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.itemId.skuCode || "-"}
                </td>
                <td className="px-2 py-1 border-r border-primary">
                  {item.itemId.itemName || "-"}
                </td>
                {["production"].includes(filter) ? (
                  ""
                ) : (
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
                  {item.grams ? `${item.grams / 1000} kg` : item.qty || "-"}
                </td>
                {["printing", "stitching"].includes(filter) ? (
                  ""
                ) : (
                  <td className="px-2 py-1 border-r border-primary ">
                    {item.cuttingType || "-"}
                  </td>
                )}
                {["production"].includes(filter) ? (
                  <td className="px-2 py-1 font-semibold border-r border-primary">
                    {item.isPrint ? "Yes" : "-" || "-"}
                  </td>
                ) : (
                  ""
                )}
                {["outside"].includes(filter) ? (
                  <td className="px-2 py-1 border-r border-primary">
                    {item.vendor || "-"}
                  </td>
                ) : (
                  ""
                )}
                <td className="px-2 py-1 border-r border-primary">
                  <span
                    className={`${
                      item.status.includes("Yet")
                        ? "bg-gray-200"
                        : [
                            "In Cutting",
                            "In Stitching",
                            "In Printing",
                            "In Checking",
                            "In Progress",
                          ].includes(item.status)
                        ? "bg-yellow-200"
                        : item.status.includes("Paused")
                        ? "bg-orange-200"
                        : "bg-green-200"
                    }  py-0.5 px-1 rounded font-bold`}
                  >
                    {item.status || "-"}
                  </span>
                </td>
                {/* Actions */}
                {["production"].includes(filter) ? (
                  ""
                ) : (
                  <td className="px-2 py-1 flex gap-1 text-[12px]">
                    {item.jobWorkType == "Outside Company" ? (
                      <>
                        {item.status !== "In Progress" && (
                          <FaPlayCircle
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Start Outside Job"
                            className="cursor-pointer text-primary hover:text-green-600"
                            onClick={() => {
                              setSelectedItem({ ...item, action: "play" });
                              setBulkAction(null);
                              setOpenStageModal(true);
                            }}
                          />
                        )}
                        {item.status === "In Progress" && (
                          <FaArrowCircleRight
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Move to Next Stage"
                            className="cursor-pointer text-primary hover:text-blue-600"
                            onClick={() => {
                              setSelectedItem({ ...item, action: "next" });
                              setBulkAction(null);
                              setOpenStageModal(true);
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {[
                          "Yet to Cutting",
                          "Yet to Print",
                          "Yet to Stitch",
                          "Yet to Check",
                          "Cutting Paused",
                          "Printing Paused",
                          "Stitching Paused",
                          "Checking Paused",
                        ].includes(item.status) && (
                          <FaPlayCircle
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Start / Resume"
                            className="cursor-pointer text-primary hover:text-green-600"
                            onClick={() => {
                              setSelectedItem({ ...item, action: "start" });
                              setBulkAction(null);
                              setOpenStageModal(true);
                            }}
                          />
                        )}
                        {[
                          "In Cutting",
                          "In Printing",
                          "In Stitching",
                          "In Checking",
                        ].includes(item.status) && (
                          <FaPauseCircle
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Pause"
                            className="cursor-pointer text-primary hover:text-red-600"
                            onClick={() => {
                              setSelectedItem({ ...item, action: "pause" });
                              setBulkAction(null);
                              setOpenStageModal(true);
                            }}
                          />
                        )}
                        {[
                          "In Cutting",
                          "In Printing",
                          "In Stitching",
                          "In Checking",
                        ].includes(item.status) && (
                          <FaArrowCircleRight
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Move to Next Stage"
                            className="cursor-pointer text-primary hover:text-blue-600"
                            onClick={() => {
                              setSelectedItem({ ...item, action: "next" });
                              setBulkAction(null);
                              setOpenStageModal(true);
                            }}
                          />
                        )}
                      </>
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
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-2 py-1 text-center" colSpan={8}>
                No product details available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Updated StageModal */}
      <StageModal
        open={openStageModal}
        onClose={() => setOpenStageModal(false)}
        item={selectedItem} // single item
        items={
          bulkAction
            ? filteredDetails.filter((i) => selectedItems.includes(i._id))
            : []
        } // bulk items
        bulkAction={bulkAction}
        fetchData={fetchMis}
        miId={MI._id}
      />
    </div>
  );
};

export default JobDetails;
