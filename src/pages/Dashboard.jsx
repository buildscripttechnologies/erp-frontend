import { cloneElement, useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";


export default function Dashboard({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // On mount, set sidebar state based on screen width
    const isMobile = window.innerWidth < 768;
    setIsOpen(isMobile ? false : true); // closed on mobile, open on desktop
  }, []);
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

      <div className="flex min-h-[91.7vh]  w-full bg-gradient-to-r from-white to-[#d8b76a]/10 overflow-auto ">
        {/* Sidebar */}
        <Sidebar isOpen={isOpen} setIsOpen={toggleSidebar} />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isOpen ? "md:ml-50 ml-42" : "ml-0"
          }`}
        >
          {cloneElement(children, { isOpen })}
        </main>
      </div>
    </>
  );
}
