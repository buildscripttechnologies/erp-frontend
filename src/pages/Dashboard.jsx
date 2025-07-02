import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Dashboard({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const { user } = useAuth();

  return (
    <>
      <Navbar
        isOpen={isOpen}
        setIsOpen={toggleSidebar}
        title="SmartFlow360"
        user={user}
      />

      <div className="flex min-h-screen w-full bg-gradient-to-r from-white to-[#d8b76a]/10 overflow-auto ">
        {/* Sidebar */}
        <Sidebar isOpen={isOpen} setIsOpen={toggleSidebar} />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isOpen ? "ml-50" : "ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </>
  );
}
