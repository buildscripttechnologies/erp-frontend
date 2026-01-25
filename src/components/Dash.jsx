// components/Dash.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "./../utils/axios";
import toast from "react-hot-toast";
import { DashboardCard } from "./DashboardCard";
import { OrderCard } from "./OrderCard";
import { OrderPieChart } from "./PieChartComponent";
import { OrderTable } from "./OrderTable";
import { BeatLoader } from "react-spinners";

const Dash = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/dashboard"); // your API endpoint
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ Memoized values (prevents unnecessary re-renders)
  const orderStats = useMemo(() => {
    if (!data) return {};
    return {
      customer: data.orders?.customer || {},
      purchase: data.orders?.purchase || {},
      production: data.orders?.production || {},
    };
  }, [data]);

  const masterStats = useMemo(() => data?.master || {}, [data]);
  const latest = useMemo(() => data?.latestEntries || {}, [data]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <BeatLoader color="#d8b76a" />
      </div>
    );

  if (!data)
    return <p className="text-center mt-10 text-gray-500">No data found.</p>;

  return (
    <div className="relative max-w-[99vw] mx-auto overflow-x-hidden pb-16">
      {/* ===================== Orders Section ===================== */}
      <h2 className="text-2xl font-semibold mt-8 ml-[1%] border-b-4 w-25 border-primary">
        Orders
      </h2>

      <div className="relative w-[98%] mx-auto flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="mt-4 gap-3 md:gap-6 w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 ">
          <OrderCard
            name="Customer Orders"
            numbers={orderStats.customer.totalOrders}
            value={`₹${orderStats.customer.totalAmount?.toLocaleString()}`}
          />
          <OrderCard
            name="Purchase Orders"
            numbers={orderStats.purchase.totalOrders}
            value={`₹${orderStats.purchase.totalAmount?.toLocaleString()}`}
          />
          <OrderCard
            name="In Production"
            numbers={orderStats.production.totalOrders}
            value={`₹${orderStats.production.totalAmount?.toLocaleString()}`}
          />
          <OrderCard name="RC PO" numbers="0" value="₹0" />
        </div>

        {/* Chart */}
        <div className="drop-shadow-sm w-full md:w-1/2">
          <OrderPieChart
            data={[
              {
                name: "Customer",
                value: orderStats.customer.totalAmount || 0,
              },
              {
                name: "Purchase",
                value: orderStats.purchase.totalAmount || 0,
              },
              {
                name: "Production",
                value: orderStats.production.totalAmount || 0,
              },
            ]}
          />
        </div>
      </div>

      {/* ===================== Master Metrics ===================== */}
      <h2 className="text-2xl font-semibold mt-8 ml-[1%] border-b-4 w-25 border-primary">
        Master
      </h2>
      <div className="mt-4 w-[98%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard title="RM" value={masterStats.totalRM} />
        <DashboardCard title="SFG" value={masterStats.totalSFG} />
        <DashboardCard title="FG" value={masterStats.totalFG} />
        <DashboardCard title="Vendor" value={masterStats.totalVendor} />
        <DashboardCard title="Customer" value={masterStats.totalCustomer} />
      </div>

      {/* ===================== Tables Section ===================== */}
      <h2 className="text-2xl font-semibold mt-8 ml-[1%] border-b-4 w-22 border-primary">
        Tables
      </h2>

      <div className="w-[98%] mx-auto grid grid-cols-1 gap-y-6">
        {/* Material Inward */}
        <OrderTable
          title="Material Inward"
          columns={["Date", "SKU Code", "Item Name", "Qty", "Inward By"]}
          data={latest.materialInwards?.map((m) => [
            new Date(m.updatedAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            m.skuCode,
            m.itemName,
            m.stockQty,
            m.createdBy?.fullName || "-",
          ])}
        />

        {/* Purchase Orders */}
        <OrderTable
          title="Purchase Orders"
          columns={["Date", "PO No", "Vendor Name", "Value", "Created By"]}
          data={latest.purchaseOrders?.map((p) => [
            new Date(p.updatedAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            p.poNo,
            p.vendor?.vendorName || "-",
            `₹${p.totalAmountWithGst?.toLocaleString() || 0}`,
            p.createdBy?.fullName || "-",
          ])}
        />

        {/* Job Orders */}
        <OrderTable
          title="Job Orders"
          columns={[
            "Date",
            "Prod No",
            "Customer Name",
            "Product Name",
            "Created By",
          ]}
          data={latest.jobOrders?.map((j) => [
            new Date(j.updatedAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            ,
            j.prodNo,
            j.bom?.partyName?.customerName || "-",
            j.productName,
            j.createdBy?.fullName || "-",
          ])}
        />

        {/* Customer Orders */}
        <OrderTable
          title="Customer Orders"
          columns={[
            "Date",
            "BOM No",
            "Customer Name",
            "Product Name",
            "Created By",
          ]}
          data={latest.customerOrders?.map((c) => [
            new Date(c.updatedAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            c.bomNo,
            c.partyName?.customerName || "-",
            c.productName,
            c.createdBy?.fullName || "-",
          ])}
        />
      </div>
    </div>
  );
};

export default Dash;
