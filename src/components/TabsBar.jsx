import { useMemo } from "react";
import { X } from "react-feather";
import { useTabs } from "../context/TabsContext";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTab({
  id,
  isActive,
  title,
  pinned,
  onClick,
  onClose,
  onContextMenu,
  onTogglePin,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-3 py-1 rounded-t border ${
        isActive
          ? "bg-white border-gray-300 border-b-white text-gray-900"
          : "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200"
      } cursor-pointer select-none`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...attributes}
      {...listeners}
    >
      <button
        className={`text-xs ${
          pinned ? "text-yellow-600" : "text-gray-400"
        } hover:text-yellow-600`}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin();
        }}
        title={pinned ? "Unpin" : "Pin"}
      >
        a
      </button>
      <span className="whitespace-nowrap text-sm">{title}</span>
      <button
        className="opacity-60 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={`Close ${title}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function TabsBar({ isOpen = false }) {
  const {
    tabs,
    activePath,
    activateTab,
    closeTab,
    closeOthers,
    closeAll,
    reorderTabs,
    togglePin,
  } = useTabs();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  if (!tabs || tabs.length === 0) return null;

  return (
    <div
      className={`sticky top-15 z-[1000] bg-white/90 backdrop-blur-sm border-b border-gray-200 pointer-events-auto transition-all duration-300 ease-in-out ${
        isOpen ? "ml-50" : "ml-0"
      }`}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over || active.id === over.id) return;
          const oldIndex = tabs.findIndex((t) => t.path === active.id);
          const newIndex = tabs.findIndex((t) => t.path === over.id);
          if (oldIndex !== -1 && newIndex !== -1)
            reorderTabs(oldIndex, newIndex);
        }}
      >
        <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto no-scrollbar sm:h-auto h-10">
          <SortableContext
            items={tabs.map((t) => t.path)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs
              .slice()
              .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))
              .map((t) => {
                const isActive = t.path === activePath;
                return (
                  <SortableTab
                    key={t.path}
                    id={t.path}
                    isActive={isActive}
                    title={t.title}
                    pinned={!!t.pinned}
                    onClick={() => activateTab(t.path)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (e.altKey) closeOthers(t.path);
                      else if (e.ctrlKey) closeAll();
                    }}
                    onClose={() => closeTab(t.path)}
                    onTogglePin={() => togglePin(t.path)}
                  />
                );
              })}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
