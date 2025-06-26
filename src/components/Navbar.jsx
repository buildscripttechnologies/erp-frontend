// components/Navbar.jsx
import { FiMenu, FiX, FiUser } from "react-icons/fi";

export function Navbar({
  isOpen,
  setIsOpen,
  title = "SmartFlow360",
  username = "admin",
}) {
  return (
    <div
      className={`relative flex   ${
        isOpen ? `pl-70` : `pl-4`
      } p-4 transition-transform  duration-300 ease-in-out justify-between items-center bg-gradient-to-r from-white to-[#d8b76a] shadow-md sticky top-0 z-30`}
    >
      <button
        className="text-2xl text-[#292927] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      <h1
        className={`text-xl sm:text-3xl  ${
          isOpen ? `ml-5` : ``
        } font-bold text-[#292927]`}
      >
        {title}
      </h1>

      <div className="flex text:xl sm:text-2xl items-center space-x-2 text-[#292927]">
        <FiUser />
        <span className="font-medium">{username}</span>
      </div>
    </div>
  );
}
