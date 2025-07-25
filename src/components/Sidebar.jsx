import {
  FiHome,
  FiClipboard,
  FiShoppingCart,
  FiBox,
  FiLayers,
  FiUsers,
  FiLogOut,
} from "react-icons/fi";
import {
  FaAngleDown,
  FaAngleUp,
  FaCheckCircle,
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
import { LuShoppingBag } from "react-icons/lu";

export function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    { icon: FiHome, label: "Dashboard", path: "/dashboard" },
    { icon: FiClipboard, label: "Stock Register" },
    { icon: FiShoppingCart, label: "Customer Order" },
    { icon: FiLayers, label: "CO Pendency" },

    {
      icon: LuShoppingBag,
      label: "Purchase",
      subMenu: [
        {
          label: "Purchase Order",
          icon: LuShoppingBag,
          path: "/purchase-order",
        },
        {
          label: "P. O. Approval",
          icon: FaCheckCircle,
          path: "/purchase-order-approval",
        },
      ],
    },

    { icon: FiBox, label: "Material Inward" },
    { icon: FiBox, label: "Material Issue" },
    { icon: FiShoppingCart, label: "Production List" },
    { icon: FiClipboard, label: "Job Work" },

    {
      icon: FiUsers,
      label: "Master",
      subMenu: [
        { label: "Users", icon: FaUserCog, path: "/master-users" },
        { label: "UOM Master", icon: FaBalanceScale, path: "/uom-master" },
        { label: "Role Master", icon: FaBalanceScale, path: "/role-master" },
        { label: "R. M. Master", icon: FaCubes, path: "/rm-master" },
        {
          label: "Location Master",
          icon: FaMapMarkerAlt,
          path: "/location-master",
        },
        { label: "SFG Master", icon: FaLayerGroup, path: "/sfg-master" },
        { label: "FG Master", icon: FaCube, path: "/fg-master" },
        { label: "Sample Master", icon: FaUserFriends, path: "/sample-master" },
        { label: "BOM Master", icon: FaUserFriends, path: "/bom-master" },
        { label: "Vendor Master", icon: FaIndustry, path: "/vendor-master" },
        {
          label: "Customer Master",
          icon: FaUserFriends,
          path: "/customer-master",
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-full w-50 bg-white shadow-xl drop-shadow-xl transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out overflow-y-auto`}
    >
      <div className="flex h-15 justify-between bg-[#d8b76a]/50 items-center p-3">
        <img src="/images/logo4.png" alt="smartflow360 logo" />
      </div>

      <nav className="flex flex-col px-3 pt-1 text-base font-semibold text-gray-800">
        {sidebarMenus.map(({ icon: Icon, label, path, subMenu }) => (
          <div key={label}>
            <div
              className="flex items-center gap-3 p-1 hover:bg-gray-100 rounded cursor-pointer text-sm"
              onClick={() => {
                if (subMenu) {
                  toggleMenu(label);
                } else if (path) {
                  navigate(path);
                }
              }}
            >
              <Icon className="text-[#d8b76a]" />
              <span className="flex items-center gap-2">
                {label}
                {subMenu &&
                  (openMenus[label] ? <FaAngleUp /> : <FaAngleDown />)}
              </span>
            </div>

            {subMenu && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openMenus[label] ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <div className="ml-4 mt-1">
                  {subMenu.map(({ label: subLabel, icon: SubIcon, path }) => (
                    <div
                      key={subLabel}
                      onClick={() => navigate(path)}
                      className="flex items-center gap-2 p-1 text-sm rounded hover:bg-gray-100 text-[#292926] cursor-pointer"
                    >
                      <SubIcon className="text-[#d8b76a]" />
                      {subLabel}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={logout}
          className="flex items-center border-t border-[#d8b76a] text-lg gap-3 text-[#d8b76a] hover:bg-gray-100 p-2 mt-4 cursor-pointer"
        >
          <FiLogOut /> Logout
        </button>
      </nav>
    </aside>
  );
}
