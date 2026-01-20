import { useMemo, useRef, useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "react-feather";

import { TiPinOutline } from "react-icons/ti";

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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiClipboard, FiHome, FiLayers, FiShoppingCart } from "react-icons/fi";
import { LuMagnet, LuMapPinXInside } from "react-icons/lu";
import { BiSolidPurchaseTag, BiExport, BiImport } from "react-icons/bi";
import {
  FaCheckCircle,
  FaListAlt,
  FaUserCog,
  FaBalanceScale,
  FaCubes,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaCube,
  FaIndustry,
  FaUserFriends,
} from "react-icons/fa";
import { TbNeedleThread, TbTruckDelivery } from "react-icons/tb";
import {
  RiBillFill,
  RiBillLine,
  RiCloseFill,
  RiScissorsCutLine,
} from "react-icons/ri";
import {
  MdPrint,
  MdPattern,
  MdAssignmentInd,
  MdOutlineSettings,
} from "react-icons/md";
import { PiEyedropperSampleFill } from "react-icons/pi";
import { GiMaterialsScience } from "react-icons/gi";
const ICONS = {
  FiClipboard: FiClipboard,
  FiHome: FiHome,
  FiLayers: FiLayers,
  FiShoppingCart: FiShoppingCart,
  RiBillLine: RiBillLine,
  LuMagnet: LuMagnet,
  LuMapPinXInside: LuMapPinXInside,
  BiSolidPurchaseTag: BiSolidPurchaseTag,
  BiExport: BiExport,
  BiImport: BiImport,
  GiMaterialsScience: GiMaterialsScience,
  FaCheckCircle: FaCheckCircle,
  FaListAlt: FaListAlt,
  FaUserCog: FaUserCog,
  FaBalanceScale: FaBalanceScale,
  FaCubes: FaCubes,
  FaMapMarkerAlt: FaMapMarkerAlt,
  FaLayerGroup: FaLayerGroup,
  FaCube: FaCube,
  FaIndustry: FaIndustry,
  FaUserFriends: FaUserFriends,
  TbNeedleThread: TbNeedleThread,
  TbTruckDelivery: TbTruckDelivery,
  RiBillFill: RiBillFill,
  RiScissorsCutLine: RiScissorsCutLine,
  MdPrint: MdPrint,
  MdPattern: MdPattern,
  MdAssignmentInd: MdAssignmentInd,
  MdOutlineSettings: MdOutlineSettings,
  PiEyedropperSampleFill: PiEyedropperSampleFill,
};

function getIconComponent(name) {
  return ICONS[name] || FiClipboard; // fallback
}

function SortableTab({
  id,
  isActive,
  title,
  pinned,
  icon,
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

  const IconComponent = getIconComponent(icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center  gap-x-2 px-3 py-1.5   rounded-t  font-semibold ${
        isActive
          ? "bg-[#fdfcf8] border-primary border-x-2 border-t-2 border-b-2 border-b-[#fdfcf8]  text-gray-900"
          : "bg-gray-200 text-gray-700  hover:bg-gray-200"
      } cursor-pointer select-none`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...attributes}
      {...listeners}
    >
      {/* 📌 Pin Button */}
      <button
        className={`text-xs ${
          pinned ? "text-red-600" : "text-gray-400"
        } hover:text-yellow-600`}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin();
        }}
        title={pinned ? "Unpin" : "Pin"}
      >
        <TiPinOutline size={14} />
      </button>

      {/* 🧭 Icon */}
      <IconComponent
        size={14}
        className={isActive ? "text-primary" : "text-gray-500"}
      />

      {/* 🏷️ Title */}
      <span className="whitespace-nowrap text-sm">{title}</span>

      {/* ❌ Close */}
      <button
        className=" hover:text-red-600 cursor-pointer"
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

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateScrollButtons = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [tabs]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 150;
    el.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!tabs || tabs.length === 0) return null;

  return (
    <div
      className={`fixed w-full top-15 flex h-8 ${
        isOpen ? `pl-63` : `pl-4`
      } p-4 transition-transform duration-300 ease-in-out border-b-2 bg-[#fdfcf8] border-primary justify-between items-center  z-30`}
    >
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="p-1 rounded-full bg-[#fdfcf8] border hover:bg-gray-200 shadow-sm mr-1   cursor-pointer hidden sm:block"
        >
          <ChevronLeft size={18} />
        </button>
      )}

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
        <div
          ref={scrollRef}
          className="flex items-center gap-1 px-2 py-1 overflow-x-auto no-scrollbar sm:h-auto h-10"
        >
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
                    icon={t.icon} // ✅ Added icon prop
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

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="p-1 rounded-full bg-[#fdfcf8] hover:bg-gray-200 shadow-sm ml-1 cursor-pointer border hidden sm:block"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <button
        onClick={() => closeAll()}
        className="p-1 rounded-full bg-[#fdfcf8] hover:bg-gray-200 shadow-sm ml-2 cursor-pointer border "
      >
        <RiCloseFill size={18} />
      </button>
    </div>
  );
}
