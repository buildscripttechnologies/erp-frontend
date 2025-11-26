import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [gstTable, setGstTable] = useState([]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/settings/categories");
      if (Array.isArray(res.data?.categories)) {
        const grouped = res.data.categories.reduce((acc, cat) => {
          if (!acc[cat.type]) acc[cat.type] = [];
          acc[cat.type].push(cat.name);
          return acc;
        }, {});
        setCategories(grouped);
      } else {
        setCategories({});
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      // toast.error("Failed to load categories ❌");
    } finally {
      setLoading(false);
    }
  };
  const fetchGstTable = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/settings/gst-table/get");
      setGstTable(res.data?.gstTable || []);
    } catch (err) {
      console.error("Failed to fetch GST table:", err);
      // toast.error("Failed to load GST table ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchGstTable();
  }, []);

  const refreshCategories = async () => {
    await fetchCategories();
    toast.success("Categories Refreshed ✅");
  };
  const refreshGstTable = async () => {
    await fetchGstTable();
    toast.success("Gst Table Refreshed ✅");
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        refreshCategories,
        gstTable,
        refreshGstTable,
        HxWxQ: categories["H x W x Q"] || [],
        WxQ: categories["W x Q"] || [],
        Q: categories["Q"] || [],
        GxQ: categories["G x Q"] || [],
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
