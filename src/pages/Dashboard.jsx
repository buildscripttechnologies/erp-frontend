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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024); 
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <>

      {isMobile && (
        <Navbar
          isOpen={isOpen}
          setIsOpen={toggleSidebar}
          title="SmartFlow360"
          user={user}
          sidebarCollapsed={sidebarCollapsed}
        />
      )}

      <TabsProvider>
        <TabsBar isOpen={isOpen} sidebarCollapsed={sidebarCollapsed} />
        <div className={`flex min-h-screen w-full bg-[#fdfcf8] dark:bg-gray-900 transition-colors duration-300 ${isMobile ? "pt-20" : "pt-0"}`}>
 
          {((!isMobile && isOpen) || (isMobile && isOpen)) && (
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} onCollapseChange={setSidebarCollapsed} isMobile={isMobile} />
          )}

          <main
            className={`flex-1 transition-all overflow-auto duration-300 ease-in-out ${
              isOpen && !isMobile
                ? sidebarCollapsed
                  ? "ml-20"
                  : "ml-60"
                : "ml-0"
            }`}
          >
            <TabContentHost />
          </main>
        </div>
      </TabsProvider>
    </>
  );
}
