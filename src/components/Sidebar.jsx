import {
  FiHome,
  FiClipboard,
  FiShoppingCart,
  FiBox,
  FiLayers,
  FiUsers,
  FiLogOut,
} from "react-icons/fi";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
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
import { path } from "framer-motion/client";

export function Sidebar({ isOpen, setIsOpen }) {
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const masterSubmenu = [
    { label: "Users", icon: FaUserCog, path: "/master-users" },
    { label: "R. M. Master", icon: FaCubes, path: "/rm-master" },
    { label: "UOM Master", icon: FaBalanceScale, path: "/uom-master" },
    { label: "SFG Master", icon: FaLayerGroup, path: "/sfg-master" },
    { label: "Location Master", icon: FaMapMarkerAlt, path: "/location-master" },
    { label: "FG Master", icon: FaCube, path: "/fg-master" },
    { label: "Vendor Master", icon: FaIndustry, path: "/vendor-master" },
    { label: "Customer Master", icon: FaUserFriends },
  ];

  // const handleLogout = () => {
  //   try {
  //     localStorage.removeItem("token", "");
  //     navigate(`/login`);
  //     toast.success("Logged Out Successfully.");
  //   } catch (error) {
  //     toast.error("Error Logging Out.");
  //   }
  // };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-md transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out overflow-y-auto`}
    >
      <div className="flex justify-between items-center p-4 border-b border-[#d8b76a]">
        <h2 className="text-3xl font-bold text-[#d8b76a]">SmartFlow360</h2>
      </div>

      <nav className="flex flex-col p-4 space-y-1 text-base font-semibold text-gray-800">
        {/* Top level items */}
        {[
          { icon: FiHome, label: "Dashboard", path: "/dashboard" },
          { icon: FiClipboard, label: "Stock Register" },
          { icon: FiShoppingCart, label: "Customer Order" },
          { icon: FiLayers, label: "CO Pendency" },
          { icon: FiBox, label: "Purchase Order" },
          { icon: FiBox, label: "Material Inward" },
          { icon: FiBox, label: "Material Issue" },
          { icon: FiShoppingCart, label: "Production List" },
          { icon: FiClipboard, label: "Job Work" },
        ].map(({ icon: Icon, label, path }) => (
          <a
            key={label}
            onClick={() => navigate(path)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
          >
            <Icon className="text-[#d8b76a]" />
            {label}
          </a>
        ))}

        {/* Master collapsible section */}
        <div>
          <button
            className="flex items-center justify-between w-full p-2 hover:bg-gray-100 rounded border border-[#d8b76a] text-[#292926] cursor-pointer"
            onClick={() => setIsMasterOpen((prev) => !prev)}
          >
            <span className="flex items-center gap-3 ">
              <FiUsers className="text-[#d8b76a]" />
              Master
            </span>
            {isMasterOpen ? <FaAngleUp /> : <FaAngleDown />}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isMasterOpen ? "max-h-[500px]" : "max-h-0"
            }`}
          >
            <div className="ml-6 mt-2 space-y-1">
              {masterSubmenu.map(({ label, icon: Icon, path }) => (
                <a
                  key={label}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-[#292926] cursor-pointer"
                >
                  <Icon className="text-[#d8b76a]" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center border-t border-[#d8b76a] text-2xl gap-3 text-[#d8b76a] hover:bg-gray-100 p-2 mt-4 cursor-pointer "
        >
          <FiLogOut /> Logout
        </button>
      </nav>
    </aside>
  );
}
