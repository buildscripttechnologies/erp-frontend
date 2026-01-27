import {
  FiHome,
  FiClipboard,
  FiShoppingCart,
  FiBox,
  FiLayers,
  FiUsers,
  FiLogOut,
  FiTool,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import {
  FaAngleDown,
  FaAngleUp,
  FaCheckCircle,
  FaListAlt,
  FaOpencart,
} from "react-icons/fa";
import {
  FaUserCog,
  FaCubes,
  FaBalanceScale,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaCube,
  FaIndustry,
  FaUserFriends,
  FaUserCircle,
} from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  LuMagnet,
  LuMapPinCheckInside,
  LuMapPinXInside,
  LuShoppingBag,
} from "react-icons/lu";
import { BiExport, BiImport, BiSolidPurchaseTag } from "react-icons/bi";

import { GiMaterialsScience } from "react-icons/gi";
import { TbTruckDelivery } from "react-icons/tb";
import {
  MdAssignmentInd,
  MdOutlineSettings,
  MdPattern,
  MdPrint,
} from "react-icons/md";
import {
  RiBillFill,
  RiBillLine,
  RiScissorsCutLine,
} from "react-icons/ri";
import { GrDomain } from "react-icons/gr";
import { TbNeedleThread } from "react-icons/tb";
import { PiEyedropperSampleFill, PiMoneyWavy } from "react-icons/pi";
import { useTabs } from "../context/TabsContext";
export function Sidebar({ isOpen, setIsOpen, onCollapseChange, isMobile }) {
  const navigate = useNavigate();
  const { logout, hasPermission, user } = useAuth();
  let tabs;
  try {

    tabs = useTabs();
  } catch (e) {
    tabs = null;
  }

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    Purchase: false,
    Master: false,
  });

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovering(true);
      onCollapseChange?.(false);
    }
  };
  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovering(false);
      onCollapseChange?.(true);
    }
  };

  const toggleMenu = (menuLabel) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuLabel]: !prev[menuLabel],
    }));
  };

  const sidebarMenus = [
    {
      icon: FiHome,
      label: "Dashboard",
      path: "/dashboard",
      module: "Dashboard",
      action: "read",
    },
    {
      icon: LuMagnet,
      label: "Leads",
      path: "/leads",
      module: "Leads",
      action: "read",
    },
    {
      icon: FiClipboard,
      label: "Stock Register",
      path: "/stock-register",
      module: "Stock",
      action: "read",
    },
    {
      icon: RiBillLine,
      label: "Quotation Master",
      path: "/quotation-master",
      module: "Quotation Master",
      action: "read",
    },

    {
      icon: PiMoneyWavy,
      label: "Sales",
      subMenu: [
        {
          icon: FiShoppingCart,
          label: "Customer Order",
          path: "/customer-order",
          module: "Customer Order",
          action: "read",
        },
        {
          icon: FiLayers,
          label: "CO Pendency",
          path: "/co-pendency",
          module: "CO Pendency",
          action: "read",
        },
      ],
    },
    {
      icon: LuShoppingBag,
      label: "Purchase",
      subMenu: [
        {
          label: "Purchase Order",
          icon: BiSolidPurchaseTag,
          path: "/purchase-order",
          module: "Purchase Order",
          action: "read",
        },
        {
          label: "P. O. Approval",
          icon: FaCheckCircle,
          path: "/purchase-order-approval",
          module: "PO Approval",
          action: "read",
        },
      ],
    },
    {
      icon: FiBox,
      label: "Material",
      subMenu: [
        {
          label: "Material Inward",
          icon: TbTruckDelivery,
          module: "Material Inward",
          path: "/material-inward",
          action: "read",
        },
        {
          icon: BiExport,
          label: "Material Issue",
          module: "Material Issue",
          path: "/material-issue",
          action: "read",
        },
        {
          icon: BiImport,
          label: "Material Receive",
          module: "Material Receive",
          path: "/material-receive",
          action: "read",
        },
        {
          icon: GiMaterialsScience,
          label: "Material Consumption",
          module: "Material Consumption",
          path: "/material-consumption",
          action: "read",
        },
      ],
    },
    {
      icon: FaListAlt,
      label: "Production List",
      module: "Production List",
      path: "/production-list",
      action: "read",
    },
    {
      icon: FiClipboard,
      label: "Job Work",
      subMenu: [
        {
          label: "Inside Company",
          icon: LuMapPinCheckInside,
          subMenu: [
            {
              label: "Cutting",
              icon: RiScissorsCutLine,
              path: "/inside-company/cutting",
              module: "Cutting",
              action: "read",
            },
            {
              label: "Printing",
              icon: MdPrint,
              path: "/inside-company/printing",
              module: "Printing",
              action: "read",
            },
            {
              label: "Pasting",
              icon: MdPattern,
              path: "/inside-company/pasting",
              module: "Pasting",
              action: "read",
            },
            {
              label: "Stitching",
              icon: TbNeedleThread,
              path: "/inside-company/stitching",
              module: "Stitching",
              action: "read",
            },
            {
              label: "Quality Check",
              icon: FaCheckCircle,
              path: "/inside-company/quality-check",
              module: "Quality Check",
              action: "read",
            },
          ],
        },
        {
          label: "Outside Company",
          icon: LuMapPinXInside,
          path: "/outside-company",
          module: "Outside Company",
          action: "read",
        },
      ],
    },
    {
      icon: FiTool,
      label: "Machine Accessories",
      subMenu: [
        {
          label: "Accessories Inward",
          icon: TbTruckDelivery,
          module: "Accessories Inward",
          path: "/accessories-inward",
          action: "read",
        },
        {
          icon: BiExport,
          label: "Accessories Issue",
          module: "Accessories Issue",
          path: "/accessories-issue",
          action: "read",
        },
        {
          icon: BiImport,
          label: "Accessories Receive",
          module: "Accessories Receive",
          path: "/accessories-receive",
          action: "read",
        },
        {
          icon: FaListAlt,
          label: "Accessories List",
          module: "Accessories List",
          path: "/accessories-list",
          action: "read",
        },
      ],
    },
    {
      icon: GrDomain,
      label: "Master",
      subMenu: [
        {
          label: "User Master",
          icon: FaUserCog,
          path: "/master-users",
          module: "User",
          action: "read",
        },
        {
          label: "UOM Master",
          icon: FaBalanceScale,
          path: "/uom-master",
          module: "UOM",
          action: "read",
        },
        {
          label: "Role Master",
          icon: MdAssignmentInd,
          path: "/role-master",
          module: "Dashboard",
          action: "Role",
        },
        {
          label: "R. M. Master",
          icon: FaCubes,
          path: "/rm-master",
          module: "RawMaterial",
          action: "read",
        },
        {
          label: "Location Master",
          icon: FaMapMarkerAlt,
          path: "/location-master",
          module: "Location",
          action: "read",
        },
        {
          label: "SFG Master",
          icon: FaLayerGroup,
          path: "/sfg-master",
          module: "SFG",
          action: "read",
        },
        {
          label: "FG Master",
          icon: FaCube,
          path: "/fg-master",
          module: "FG",
          action: "read",
        },
        {
          label: "Sample Master",
          icon: PiEyedropperSampleFill,
          path: "/sample-master",
          module: "Sample",
          action: "read",
        },
        {
          label: "BOM Master",
          icon: RiBillFill,
          path: "/bom-master",
          module: "BOM",
          action: "read",
        },
        {
          label: "Vendor Master",
          icon: FaIndustry,
          path: "/vendor-master",
          module: "Vendor",
          action: "read",
        },
        {
          label: "Customer Master",
          icon: FaUserFriends,
          path: "/customer-master",
          module: "Customer",
          action: "read",
        },
      ],
    },
    {
      icon: MdOutlineSettings,
      label: "Settings",
      module: "Settings",
      path: "/settings",
      action: "read",
    },
  ];

  const MenuItem = ({
    item,
    openMenus,
    toggleMenu,
    navigate,
    hasPermission,
    sidebarCollapsed,
    isHovering,
    isMobile,
    isOpen,
  }) => {
    const { icon: Icon, label, path, subMenu, module, action } = item;

    if (!subMenu && module && !hasPermission(module, action)) return null;

    const filterSubMenu = (subMenu) => {
      return subMenu
        .map((sm) => {
          if (sm.subMenu) {
            const children = filterSubMenu(sm.subMenu);
            if (children.length > 0) {
              return { ...sm, subMenu: children };
            }
            return null;
          }
          return hasPermission(sm.module, sm.action) ? sm : null;
        })
        .filter(Boolean);
    };

    const filteredSubMenu = subMenu ? filterSubMenu(subMenu) : [];

    if (subMenu && filteredSubMenu.length === 0) return null;

    return (
      <div className={sidebarCollapsed && !isHovering ? "w-full" : ""}>
        <div
          className={`flex items-center gap-3 px-2 py-2.5 hover:bg-primary/5 rounded-lg cursor-pointer text-sm transition-all duration-200 ${
            sidebarCollapsed && !isHovering ? "flex-col justify-center items-center w-full" : ""
          }`}
          onClick={() => {
            if (subMenu) {
              toggleMenu(label);
            } else if (path) {
              if (tabs) {
                tabs.openTab(path, label);
              } else {
                navigate(path);
              }
            }
          }}
          title={sidebarCollapsed && !isHovering ? label : ""}
        >

          {!(isMobile && isOpen) && Icon && <Icon className="text-primary flex-shrink-0 text-base" />}
          {(isHovering || !sidebarCollapsed || (isMobile && isOpen)) && (
            <span className="flex items-center gap-1.5 flex-1 text-gray-700">
              {label}
              {subMenu && (openMenus[label] ? <FaAngleUp size={12} /> : <FaAngleDown size={12} />)}
            </span>
          )}

        {sidebarCollapsed && !isHovering && (
          <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-medium shadow-lg">
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
          </div>
        )}
      </div>

      {subMenu && (isHovering || !sidebarCollapsed || (isMobile && isOpen)) && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            openMenus[label] ? "max-h-[500px]" : "max-h-0"
          }`}
        >
          <div className="ml-4 mt-1 space-y-1">
            {filteredSubMenu.map((sm) => (
              <MenuItem
                key={sm.label}
                item={sm}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
                navigate={navigate}
                hasPermission={hasPermission}
                sidebarCollapsed={sidebarCollapsed}
                isHovering={isHovering}
                isMobile={isMobile}
                isOpen={isOpen}
              />
            ))}
          </div>
        </div>
      )}
      </div>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-full bg-white shadow-xl drop-shadow-xl transform transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
        isOpen ? (isMobile ? "translate-x-0 w-60" : (isHovering || !sidebarCollapsed ? "translate-x-0 w-60" : "translate-x-0 w-20")) : "-translate-x-full w-60"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      <div className="relative flex h-16 bg-gradient-to-r from-primary to-primary/80 items-center px-4 flex-shrink-0 border-b border-primary/30">

        {!isMobile && sidebarCollapsed && !isHovering && (
          <img src="/images/fav4.png" alt="smartflow360 icon" className="w-full h-6 object-contain" />
        )}

        {(isMobile || isHovering || !sidebarCollapsed) && (
          <img src="/images/logo4.png" alt="smartflow360 logo" className="h-6 object-contain" />
        )}

        {isMobile && isOpen && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-primary border border-primary text-white text-xl transition-colors duration-200 focus:outline-none hover:bg-[#d8b76a] hover:text-primary"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
            tabIndex={0}
          >
            <span className="leading-none">&#10005;</span>
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-auto px-2 pt-2 text-base font-semibold text-gray-800 gap-1 flex flex-col">
        {sidebarMenus.map((item) => (
          <MenuItem
            key={item.label}
            item={item}
            openMenus={openMenus}
            toggleMenu={toggleMenu}
            navigate={navigate}
            hasPermission={hasPermission}
            sidebarCollapsed={sidebarCollapsed}
            isHovering={isHovering}
            isMobile={isMobile}
            isOpen={isOpen}
          />
        ))}
      </nav>

      <div className="flex flex-col flex-shrink-0 w-full border-t border-gray-200 bg-white">
        <div className={`py-4 px-3 flex items-center justify-center`}>
          <div className={`flex items-center gap-3`}>
            <FaUserCircle className="text-3xl text-primary flex-shrink-0" />
            {(isHovering || !sidebarCollapsed) && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-700">{user?.fullName}</span>
                <span className="text-xs bg-[#292926] text-[#d8b76a] px-2 py-0.5 rounded uppercase font-bold w-fit">
                  {user?.userType}
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={logout}
          className={`flex items-center justify-center border-t border-gray-200 text-lg gap-3 text-primary hover:bg-red-50 py-4 px-3 cursor-pointer transition-all w-full font-medium`}
          title={sidebarCollapsed && !isHovering ? "Logout" : ""}
        >
          <FiLogOut size={18} /> {(isHovering || !sidebarCollapsed) && "Logout"}
        </button>
      </div>
    </aside>
  );
}
