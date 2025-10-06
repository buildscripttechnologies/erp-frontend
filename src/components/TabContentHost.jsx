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

  return (
    <div className="p-2">
      {items.map((t) => (
        <TabPane key={t.path} path={t.path} active={t.path === activePath} />
      ))}
    </div>
  );
});
