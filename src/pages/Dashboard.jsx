import { cloneElement, useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import TabsBar from "../components/TabsBar";
import { TabsProvider } from "../context/TabsContext";
import TabContentHost from "../components/TabContentHost";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function Dashboard({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
        sidebarCollapsed={sidebarCollapsed}
      />

      <TabsProvider>
        <TabsBar isOpen={isOpen} sidebarCollapsed={sidebarCollapsed} />
        <div className="flex min-h-screen pt-20  w-full bg-[#fdfcf8]  ">
          {/* Sidebar */}
          <Sidebar isOpen={isOpen} setIsOpen={toggleSidebar} onCollapseChange={setSidebarCollapsed} />

          {/* Main Content */}
          <main
            className={`flex-1 transition-all overflow-auto duration-300 ease-in-out ${
              isOpen ? (sidebarCollapsed ? "ml-20" : "ml-60") : "ml-0"
            }`}
          >
            <TabContentHost />
          </main>
        </div>
      </TabsProvider>
    </>
  );
}
