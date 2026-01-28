import { memo, useMemo } from "react";
import { useTabs } from "../context/TabsContext";
import { getComponentForPath } from "../routes/tabRegistry";

function TabPane({ path, active }) {
  const Component = getComponentForPath(path);
  if (!Component) return null;
  return (
    <div
      style={{ display: active ? "block" : "none" }}
      className="w-full h-full"
    >
      <Component />
    </div>
  );
}

export default memo(function TabContentHost() {
  const { tabs, activePath } = useTabs();

  const items = useMemo(() => tabs || [], [tabs]);
  if (!items || items.length === 0) return null;

  const isOnlyDashboard = items.length === 1 && items[0].path === "/dashboard";
  const showTabsBar = !isOnlyDashboard;

  return (
    <div className={`p-4 pb-8 ${showTabsBar ? "pt-4 lg:pt-16 border-t lg:border-t-0 border-gray-200" : "pt-8"}`}>
      {items.map((t) => (
        <TabPane key={t.path} path={t.path} active={t.path === activePath} />
      ))}
    </div>
  );
});
