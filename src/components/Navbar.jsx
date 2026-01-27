import { FiMenu } from "react-icons/fi";

export function Navbar({ isOpen, setIsOpen, title = "SmartFlow360", sidebarCollapsed = true }) {

  if (isOpen) return null;

  return (
    <div
      className={`fixed w-full top-0 flex h-15 pl-4 p-4 transition-all duration-300 ease-in-out justify-between items-center bg-[#fdfcf8] z-30`}
    >

      <button
        className="text-2xl text-[#292927] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiMenu />
      </button>

      <img
        src="/images/logo4.png"
        alt="smartflow360 logo"
        className="w-50 sm:ml-[10%] transition-transform"
      />

      <div></div>
    </div>
  );
}
