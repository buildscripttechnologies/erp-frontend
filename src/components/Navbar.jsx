import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { Tooltip } from "react-tooltip";

export function Navbar({ isOpen, setIsOpen, title = "SmartFlow360" }) {
  const [showUser, setShowUser] = useState(false);
  const { user } = useAuth();

  const toggleShowUser = () => {
    setShowUser((prev) => !prev);
  };

  return (
    <div
      className={`fixed  top-0 flex h-15 ${
        isOpen ? `pl-53` : `pl-4`
      } p-4 transition-transform duration-300 ease-in-out justify-between items-center bg-gradient-to-r from-white to-[#d8b76a] shadow-md sticky top-0 z-30`}
    >
      {/* Sidebar Toggle */}
      <button
        className="text-2xl text-[#292927] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Title */}
      {/* <h1
        className={`text-xl sm:text-2xl ${
          isOpen ? `ml-5 hidden` : ``
        } font-bold text-[#292927]`}
      >
        {title}
      </h1> */}
      <img
        src="/images/logo4.png"
        alt="smartflow360 logo"
        className={`w-50 sm:ml-[10%] ${
          isOpen ? `ml-5 hidden` : ``
        } transition-transform `}
      />

      {/* User Section */}
      <div className="relative text-[#292927]">
        {/* Desktop View */}
        <div className="hidden sm:flex items-center space-x-2 text-base">
          <span className="text-sm bg-[#292926] text-[#d8b76a] px-3 py-1 rounded uppercase font-bold">
            {user.userType}
          </span>
          <span className="font-bold">{user.fullName}</span>
          <FaUserCircle className="text-xl" />
        </div>

        {/* Mobile View */}
        <div className="sm:hidden flex items-center justify-center">
          <FaUserCircle
            // data-tooltip-id="statusTip"
            // data-tooltip-content={`${user.userType + " : " + user.fullName}`}
            className="text-2xl cursor-pointer"
            onClick={toggleShowUser}
          />
          {showUser && (
            <div className="absolute right-0 mt-22 bg-white border rounded shadow-md p-2 z-50 min-w-[150px] text-sm">
              <div className="font-semibold text-[#292926]">
                {user.fullName}
              </div>
              <div className="uppercase text-[#d8b76a] font-bold">
                {user.userType}
              </div>
            </div>
          )}
          <Tooltip
            id="statusTip"
            place="top"
            style={{
              backgroundColor: "#292926",
              color: "#d8b76a",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          />
        </div>
      </div>
    </div>
  );
}
