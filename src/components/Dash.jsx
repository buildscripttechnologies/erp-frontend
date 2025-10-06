// components/DashboardLayout.jsx
import React, { useState } from "react";
import { DashboardCard } from "./DashboardCard";
import { OrderCard } from "./OrderCard";
import { OrderPieChart } from "./PieChartComponent";
import { OrderTable } from "./OrderTable";

const Dash = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="relative max-w-[99vw] mx-auto overflow-x-hidden">
      {/* Users & Orders */}
      <h2 className="text-2xl mt-4 font-semibold ml-[1%] border-b-4 w-20 border-[#d8b76a] ">
        Users
      </h2>
      <div className="relative mt-4 gap-3 md:gap-6 w-[98%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Admin" value="5" />
        <DashboardCard title="Editor" value="3" />
        <DashboardCard title="Viewer" value="8" />
      </div>
      <h2 className="text-2xl font-semibold mt-8 ml-[1%] border-b-4 w-25 border-[#d8b76a] ">
        Orders
      </h2>
      <div className="relative w-[98%] mx-auto flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="mt-4 gap-3 md:gap-6 w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 ">
          <OrderCard name="Total Orders" numbers="12" value="₹17000" />
          <OrderCard name="Single PO" numbers="15" value="₹10,000" />
          <OrderCard name="Scattered PO" numbers="10" value="₹5,000" />
          <OrderCard name="RC PO" numbers="20" value="₹2,000" />
        </div>

        {/* Chart */}
        <div className="drop-shadow-sm  w-full  md:w-1/2 ">
          <OrderPieChart />
        </div>
      </div>

      {/* Master Metrics */}
      <h2 className="text-2xl font-semibold mt-8 ml-[1%] border-b-4 w-25 border-[#d8b76a]">
        Master
      </h2>
      <div className="mt-4 w-[98%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard title="RM" value="12" />
        <DashboardCard title="SFG" value="32" />
        <DashboardCard title="FG" value="45" />
        <DashboardCard title="Vendor" value="67" />
        <DashboardCard title="Customer" value="89" />
      </div>

      {/* Tables */}
      <h2 className="text-2xl font-semibold mt-8 ml-[1%] border-b-4 w-22 border-[#d8b76a]">
        Tables
      </h2>
      <div className="w-[98%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-4">
        <OrderTable
          title="Material Inward"
          columns={["Timestamp", "Inward ID", "Invoice No", "PDF", "Action"]}
          data={[
            ["2025-06-23 10:15", "INW-001", "INV-789", "pdf", "action"],
            ["2025-06-22 14:50", "INW-002", "INV-790", "pdf", "action"],
            ["2025-06-21 09:30", "INW-003", "INV-791", "pdf", "action"],
          ]}
        />

        <OrderTable
          title="Purchase Order"
          columns={["Timestamp", "PO No", "Vender", "PDF", "Value", "Action"]}
          data={[
            [
              "2025-06-20 11:00",
              "PO-1001",
              "Vendor A",
              "pdf",
              "₹10,000",
              "action",
            ],
            [
              "2025-06-19 16:45",
              "PO-1002",
              "Vendor B",
              "pdf",
              "₹5,500",
              "action",
            ],
            [
              "2025-06-18 13:20",
              "PO-1003",
              "Vendor C",
              "pdf",
              "₹7,200",
              "action",
            ],
          ]}
        />

        <OrderTable
          title="Job Order"
          columns={[
            "Timestamp",
            "Job Order No",
            "Vender",
            "PDF",
            "Value",
            "Action",
          ]}
          data={[
            [
              "2025-06-17 15:10",
              "JOB-501",
              "Vendor X",
              "pdf",
              "₹2,500",
              "action",
            ],
            [
              "2025-06-16 10:00",
              "JOB-502",
              "Vendor Y",
              "pdf",
              "₹4,000",
              "action",
            ],
            [
              "2025-06-15 08:30",
              "JOB-503",
              "Vendor Z",
              "pdf",
              "₹3,750",
              "action",
            ],
          ]}
        />

        <OrderTable
          title="Customer Order"
          columns={[
            "Timestamp",
            "POR No",
            "Customer",
            "PO Type",
            "Value",
            "Action",
          ]}
          data={[
            [
              "2025-06-14 12:25",
              "COR-901",
              "Customer A",
              "Single",
              "₹12,000",
              "action",
            ],
            [
              "2025-06-13 17:40",
              "COR-902",
              "Customer B",
              "RC",
              "₹6,500",
              "action",
            ],
            [
              "2025-06-12 11:15",
              "COR-903",
              "Customer C",
              "Scattered",
              "₹8,000",
              "action",
            ],
          ]}
        />
      </div>
    </div>
  );
};

export default Dash;
