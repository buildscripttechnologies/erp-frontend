import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TabsContext = createContext(null);

export function TabsProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem("tabsState");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.tabs)) return parsed.tabs;
      }
    } catch {}
    return [];
  });

  const [activePath, setActivePath] = useState(() => {
    try {
      const saved = localStorage.getItem("tabsState");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.activePath || null;
      }
    } catch {}
    return null;
  });

  // --- Title + Icon helpers ---
  const titleMap = {
    "/dashboard": "Dashboard",
    "/leads": "Leads",
    "/stock-register": "Stock Register",
    "/quotation-master": "Quotation Master",
    "/customer-order": "Customer Order",
    "/co-pendency": "CO Pendency",
    "/purchase-order": "Purchase Order",
    "/purchase-order-approval": "PO Approval",
    "/material-inward": "Material Inward",
    "/material-issue": "Material Issue",
    "/material-receive": "Material Receive",
    "/material-consumption": "Material Consumption",
    "/production-list": "Production List",
    "/inside-company/cutting": "Cutting",
    "/inside-company/printing": "Printing",
    "/inside-company/pasting": "Pasting",
    "/inside-company/stitching": "Stitching",
    "/inside-company/quality-check": "Quality Check",
    "/outside-company": "Outside Company",
    "/accessories-inward": "Accessories Inward",
    "/accessories-issue": "Accessories Issue",
    "/accessories-receive": "Accessories Receive",
    "/accessories-list": "Accessories List",
    "/master-users": "User Master",
    "/uom-master": "UOM Master",
    "/role-master": "Role Master",
    "/rm-master": "R. M. Master",
    "/location-master": "Location Master",
    "/sfg-master": "SFG Master",
    "/fg-master": "FG Master",
    "/sample-master": "Sample Master",
    "/bom-master": "BOM Master",
    "/vendor-master": "Vendor Master",
    "/customer-master": "Customer Master",
    "/settings": "Settings",
  };

  const iconMap = {
    "/dashboard": "FiHome",
    "/leads": "LuMagnet",
    "/stock-register": "FiClipboard",
    "/quotation-master": "RiBillLine",
    "/customer-order": "FiShoppingCart",
    "/co-pendency": "FiLayers",
    "/purchase-order": "BiSolidPurchaseTag",
    "/purchase-order-approval": "FaCheckCircle",
    "/material-inward": "TbTruckDelivery",
    "/material-issue": "BiExport",
    "/material-receive": "BiImport",
    "/material-consumption": "GiMaterialsScience",
    "/production-list": "FaListAlt",
    "/inside-company/cutting": "RiScissorsCutLine",
    "/inside-company/printing": "MdPrint",
    "/inside-company/pasting": "MdPattern",
    "/inside-company/stitching": "TbNeedleThread",
    "/inside-company/quality-check": "FaCheckCircle",
    "/outside-company": "LuMapPinXInside",
    "/accessories-inward": "TbTruckDelivery",
    "/accessories-issue": "BiExport",
    "/accessories-receive": "BiImport",
    "/accessories-list": "FaListAlt",
    "/master-users": "FaUserCog",
    "/uom-master": "FaBalanceScale",
    "/role-master": "MdAssignmentInd",
    "/rm-master": "FaCubes",
    "/location-master": "FaMapMarkerAlt",
    "/sfg-master": "FaLayerGroup",
    "/fg-master": "FaCube",
    "/sample-master": "PiEyedropperSampleFill",
    "/bom-master": "RiBillFill",
    "/vendor-master": "FaIndustry",
    "/customer-master": "FaUserFriends",
    "/settings": "MdOutlineSettings",
  };

  const getTitleFromPath = useCallback((path) => {
    if (titleMap[path]) return titleMap[path];
    const seg = path
      .split("?")[0]
      .split("#")[0]
      
      .split("/")
      .filter(Boolean)
      .pop();
    return seg
      ? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Tab";
  }, []);

  const getTabInfo = useCallback(
    (path) => {
      const title = getTitleFromPath(path);
      const icon = iconMap[path] || "FileText";
      return { title, icon };
    },
    [getTitleFromPath]
  );

  // --- Auto-open current route as tab ---
  useEffect(() => {
    const path = location.pathname + (location.search || "");
    setTabs((prev) => {
      const exists = prev.some((t) => t.path === path);
      if (exists) return prev;
      const { title, icon } = getTabInfo(path);
      return [...prev, { path, title, icon, pinned: false }];
    });
    setActivePath(path);
  }, [location.pathname, location.search, getTabInfo]);

  // --- Persist state ---
  useEffect(() => {
    try {
      localStorage.setItem("tabsState", JSON.stringify({ tabs, activePath }));
    } catch {}
  }, [tabs, activePath]);

  // --- Actions ---
  const openTab = useCallback(
    (path, title) => {
      setTabs((prev) => {
        const exists = prev.some((t) => t.path === path);
        if (exists) return prev;
        const { title: defaultTitle, icon } = getTabInfo(path);
        return [
          ...prev,
          { path, title: title || defaultTitle, icon, pinned: false },
        ];
      });
      setActivePath(path);
      navigate(path);
    },
    [getTabInfo, navigate]
  );

  const activateTab = useCallback(
    (path) => {
      setActivePath(path);
      navigate(path);
    },
    [navigate]
  );

  const closeTab = useCallback(
    (path) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.path === path);
        if (idx === -1) return prev;
        const newTabs = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
        if (path === activePath) {
          const next = newTabs[idx] || newTabs[idx - 1] || null;
          if (next) {
            setActivePath(next.path);
            navigate(next.path);
          }
        }
        return newTabs;
      });
    },
    [activePath, navigate]
  );

  const closeOthers = useCallback(
    (path) => {
      setTabs((prev) => prev.filter((t) => t.path === path));
      setActivePath(path);
      navigate(path);
    },
    [navigate]
  );

  const closeAll = useCallback(() => {
    setTabs([]);
    setActivePath(null);
    navigate("/dashboard");
  }, [navigate]);

  const reorderTabs = useCallback((fromIndex, toIndex) => {
    setTabs((prev) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      )
        return prev;
      const next = prev.slice();
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const togglePin = useCallback((path) => {
    setTabs((prev) =>
      prev.map((t) => (t.path === path ? { ...t, pinned: !t.pinned } : t))
    );
  }, []);

  const value = useMemo(
    () => ({
      tabs,
      activePath,
      openTab,
      activateTab,
      closeTab,
      closeOthers,
      closeAll,
      reorderTabs,
      togglePin,
    }),
    [
      tabs,
      activePath,
      openTab,
      activateTab,
      closeTab,
      closeOthers,
      closeAll,
      reorderTabs,
      togglePin,
    ]
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within TabsProvider");
  return ctx;
}
