
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
      const res = await axios.get("/dashboard"); 
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

      <div className="w-[98%] mx-auto mt-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 py-4 pb-5 rounded-xl border border-primary/30 shadow-md">
        <div className="flex items-center justify-center gap-3">
          <div className="w-1.5 h-10 bg-primary rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-wide">
            Dashboard
          </h1>
          <div className="w-1.5 h-10 bg-primary rounded-full"></div>
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3 rounded-full"></div>
      </div>

      <div className="w-[98%] mx-auto mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-6">

        <div className="bg-gradient-to-r from-primary/10 to-transparent py-3 px-4 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">Orders</h2>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          <div className="gap-3 md:gap-4 w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2">
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

          <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-gray-800 dark:border dark:border-gray-700 rounded-xl p-4 border border-gray-100">
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

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6"></div>

        <div className="bg-gradient-to-r from-primary/10 to-transparent py-3 px-4 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">Master</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <DashboardCard title="RM" value={masterStats.totalRM} />
          <DashboardCard title="SFG" value={masterStats.totalSFG} />
          <DashboardCard title="FG" value={masterStats.totalFG} />
          <DashboardCard title="Vendor" value={masterStats.totalVendor} />
          <DashboardCard title="Customer" value={masterStats.totalCustomer} />
        </div>
      </div>

      <div className="w-[98%] mx-auto mt-6 bg-gradient-to-r from-primary/10 to-transparent py-3 px-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">Tables</h2>
        </div>
      </div>

      <div className="w-[98%] mx-auto grid grid-cols-1 gap-y-6">

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
