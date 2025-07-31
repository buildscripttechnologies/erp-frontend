import { cloneElement, useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function Dashboard({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setIsOpen(isMobile ? false : true);
  }, []);

  // Close sidebar on route change if mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname]);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <>
      <Navbar
        isOpen={isOpen}
        setIsOpen={toggleSidebar}
        title="SmartFlow360"
        user={user}
      />

      <div className="flex min-h-screen pt-15  w-full bg-gradient-to-r from-white to-[#d8b76a]/10  ">
        {/* Sidebar */}
        <Sidebar isOpen={isOpen} setIsOpen={toggleSidebar} />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all overflow-auto duration-300 ease-in-out ${
            isOpen ? "ml-50 " : "ml-0"
          }`}
        >
          {cloneElement(children, { isOpen })}
        </main>
      </div>
    </>
  );
}
