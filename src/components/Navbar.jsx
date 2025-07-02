// components/Navbar.jsx
import { useState } from "react";
import { FiMenu, FiX, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { FaRegUserCircle, FaUserCircle } from "react-icons/fa";

export function Navbar({ isOpen, setIsOpen, title = "SmartFlow360" }) {
  const [showUser, setShowUser] = useState(false);
  const { user } = useAuth();

  const toggleShowUser = (showUser) => {
    console.log("user", user);

    setShowUser(showUser ? false : true);
    console.log("showUser", showUser);
  };

  return (
    <div
      className={`relative flex h-15  ${
        isOpen ? `pl-45 sm:pl-55` : `pl-4`
      } p-4 transition-transform  duration-300 ease-in-out justify-between items-center bg-gradient-to-r from-white to-[#d8b76a] shadow-md sticky top-0 z-30`}
    >
      <button
        className="text-2xl text-[#292927] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      <h1
        className={`text-xl sm:text-2xl  ${
          isOpen ? `ml-5 hidden` : ``
        } font-bold text-[#292927]`}
      >
        {title}
      </h1>

      <div className="flex text:xl sm:text-2xl items-center space-x-2 text-[#292927] transition-all duration-200 ">
        <span className="text-sm bg-[#292926] text-[#d8b76a] px-3 py-1 rounded uppercase font-bold ">
          {user.userType}
        </span>
        <span className="hidden sm:flex text-base font-bold text-[#292926]">
          {user.fullName}
        </span>
        <FaUserCircle className="text-[#292926] hidden sm:flex" />
        {/* <FaUserCircle
          onClick={() => toggleShowUser(showUser)}
          className="text-[#292926]  sm:hidden"
        />
        <div
          className={`absolute sm:hidden w-auto bg-[#d8b76a] p-2 rounded mt-22 right-5 ${
            showUser ? "" : "hidden"
          }`}
        >
          <span className="text-sm bg-[#292926] text-[#d8b76a] px-3 py-1 rounded uppercase font-bold">
            {user.userType}
          </span>
          <span className=" text-base font-bold text-[#292926]">
            {user.fullName}
          </span>
        </div> */}
      </div>
    </div>
  );
}
