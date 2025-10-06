import React, { useState } from "react";
import Tabs from "rc-tabs";
import routesList from "../routes/routesList";

export default function TabLayout({ initialPath = "/dashboard" }) {
  // Active tab key
  const [activeKey, setActiveKey] = useState(initialPath);

  // Tabs state: { key, label } array
  const [tabs, setTabs] = useState([
    { key: initialPath, label: "Dashboard" }, // Default first tab
  ]);

  // Open a tab or switch to it
  const openTab = (path, label) => {
    // If tab already exists, just switch
    const exists = tabs.find((tab) => tab.key === path);
    if (!exists) {
      setTabs((prev) => [...prev, { key: path, label }]);
    }
    setActiveKey(path);
  };

  // Close a tab
  const closeTab = (key) => {
    setTabs((prev) => prev.filter((tab) => tab.key !== key));

    // Switch to previous tab if the closed one was active
    if (activeKey === key) {
      const idx = tabs.findIndex((tab) => tab.key === key);
      if (tabs[idx - 1]) setActiveKey(tabs[idx - 1].key);
      else if (tabs[idx + 1]) setActiveKey(tabs[idx + 1].key);
    }
  };

  // Prepare items for rc-tabs
  const items = tabs.map((tab) => {
    const route = routesList.find((r) => r.path === tab.key);
    if (!route) return null;
    const Component = route.element;

    return {
      key: tab.key,
      label: (
        <div className="flex items-center gap-2">
          {tab.label}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent switching tab
              closeTab(tab.key);
            }}
            className="text-red-500 font-bold"
          >
            ×
          </button>
        </div>
      ),
      children: <Component />, // render component here
    };
  });

  return {
    openTab,
    TabsComponent: (
      <Tabs items={items} activeKey={activeKey} onChange={setActiveKey} />
    ),
  };
}
