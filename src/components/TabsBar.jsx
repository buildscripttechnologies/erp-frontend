import { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
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
  return ICONS[name] || FiClipboard;
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
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-primary/15 to-primary/10 border border-primary/40 text-gray-900 shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-150 border border-gray-200 hover:border-gray-300"
      } cursor-pointer select-none whitespace-nowrap`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...attributes}
      {...listeners}
    >

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

      <IconComponent
        size={14}
        className={isActive ? "text-primary" : "text-gray-500"}
      />

      <span className="whitespace-nowrap text-sm">{title}</span>

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

SortableTab.propTypes = {
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  pinned: PropTypes.bool.isRequired,
  icon: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  onTogglePin: PropTypes.func.isRequired,
};

export default function TabsBar({ isOpen = false, sidebarCollapsed = true }) {
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

  const [showCloseAllModal, setShowCloseAllModal] = useState(false);

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
  
  const isOnlyDashboard = tabs.length === 1 && tabs[0].path === "/dashboard";

  if (isOnlyDashboard) return null;

  return (
    <div
      className={`fixed w-full ${isOpen ? "top-0" : "top-15"} hidden lg:flex h-auto ${
        isOpen ? (sidebarCollapsed ? `pl-23` : `pl-63`) : `pl-4`
      } transition-all duration-300 ease-in-out border-b-2 bg-[#fdfcf8] border-primary items-center justify-start z-30 px-3 py-3 gap-2`}
    >

      {!isOnlyDashboard && canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="p-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:from-primary/20 hover:to-primary/10 hover:border-primary/40 shadow-md hover:shadow-lg text-primary transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-center flex-shrink-0"
          title="Scroll left"
        >
          <ChevronLeft size={22} className="stroke-[2.5]" />
        </button>
      )}

      <div className="flex-1 overflow-hidden mx-1">
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
            className="flex items-center gap-2 overflow-x-scroll no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {!isOnlyDashboard && (
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
                        icon={t.icon}
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
            )}
          </div>
        </DndContext>
      </div>

      {!isOnlyDashboard && canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="p-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:from-primary/20 hover:to-primary/10 hover:border-primary/40 shadow-md hover:shadow-lg text-primary transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-center flex-shrink-0"
          title="Scroll right"
        >
          <ChevronRight size={22} className="stroke-[2.5]" />
        </button>
      )}

      {!isOnlyDashboard && tabs && tabs.length > 2 && (
        <button
          onClick={() => setShowCloseAllModal(true)}
          className="p-2.5 rounded-lg bg-gradient-to-r from-red-100 to-red-50 border border-red-200 hover:from-red-200 hover:to-red-100 hover:border-red-400 shadow-md hover:shadow-lg text-red-600 transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-center flex-shrink-0 ml-2"
          title="Close all tabs"
        >
          <X size={22} className="stroke-[2.5]" />
        </button>
      )}

      {showCloseAllModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm mx-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Close All Tabs?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to close all tabs? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseAllModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closeAll();
                  setShowCloseAllModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-all duration-200"
              >
                Close All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

TabsBar.propTypes = {
  isOpen: PropTypes.bool,
};
