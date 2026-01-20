import {
  FiHome,
  FiClipboard,
  FiShoppingCart,
  FiBox,
  FiLayers,
  FiUsers,
  FiLogOut,
  FiTool,
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
export function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const { logout, hasPermission } = useAuth();
  let tabs;
  try {
    // Sidebar is inside Dashboard which provides TabsProvider
    tabs = useTabs();
  } catch (e) {
    tabs = null;
  }

  // console.log("haspermission", hasPermission("User", "read"));

  const [openMenus, setOpenMenus] = useState({
    Purchase: false,
    Master: false,
  });

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
  }) => {
    const { icon: Icon, label, path, subMenu, module, action } = item;
    // console.log("item", item);

    // Permission check
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
      <div>
        <div
          className="flex items-center gap-3 px-1 py-0.5 hover:bg-gray-100 rounded cursor-pointer text-sm"
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
        >
          {Icon && <Icon className="text-primary" />}
          <span className="flex items-center gap-1">
            {label}
            {subMenu && (openMenus[label] ? <FaAngleUp /> : <FaAngleDown />)}
          </span>
        </div>

        {subMenu && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openMenus[label] ? "max-h-[500px]" : "max-h-0"
            }`}
          >
            <div className="ml-4 mt-1">
              {filteredSubMenu.map((sm) => (
                <MenuItem
                  key={sm.label}
                  item={sm}
                  openMenus={openMenus}
                  toggleMenu={toggleMenu}
                  navigate={navigate}
                  hasPermission={hasPermission}
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
      className={`fixed top-0 left-0 z-50 h-full w-60 bg-white shadow-xl drop-shadow-xl transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out overflow-y-auto `}
    >
      <div className="flex h-15 justify-between bg-primary/50 items-center p-3">
        <img src="/images/logo4.png" alt="smartflow360 logo" />
      </div>

      <nav className="flex flex-col px-3 pt-1 text-base font-semibold text-gray-800">
        {sidebarMenus.map((item) => (
          <MenuItem
            key={item.label}
            item={item}
            openMenus={openMenus}
            toggleMenu={toggleMenu}
            navigate={navigate}
            hasPermission={hasPermission}
          />
        ))}

        <button
          onClick={logout}
          className="flex items-center border-t border-primary text-lg gap-3 text-primary hover:bg-gray-100 p-2 mt-4 cursor-pointer"
        >
          <FiLogOut /> Logout
        </button>
      </nav>
    </aside>
  );
}
