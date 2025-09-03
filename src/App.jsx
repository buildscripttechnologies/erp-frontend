import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Dash from "./components/Dash";
import MasterUsers from "./components/master/MasterUsers";
import RmMaster from "./components/master/RmMaster";
import "react-toggle/style.css";
import { useAuth } from "./context/AuthContext";
import UomMaster from "./components/master/uom/UomMaster";
import "react-toggle/style.css";
import SfgMaster from "./components/master/sfg/SfgMaster";
import LocationMaster from "./components/master/location/LocationMaster";
import FgMaster from "./components/master/fg/FgMaster";
import VendorMaster from "./components/master/vendor/VendorMaster";

import RoleMaster from "./components/master/Role/RoleMaster";
import Dashboard from "./pages/Dashboard";

import CustomerMaster from "./components/master/customer/CustomerMaster";
import PwaInstallPrompt from "./components/PWAInstallPrompt";
import { useEffect, useState } from "react";
import BOMMaster from "./components/master/bom/BomMaster";
import SampleMaster from "./components/master/sample/SampleMaster";
import PurchaseOrder from "./components/purchase/PurchaseOrder";
import POApproval from "./components/purchase/POApproval";
import StockRegister from "./components/stockRegister/StockRegister";
import MaterialInward from "./components/materialInward/MaterialInward";
import MaterialIssue from "./components/materialIssue/MaterialIssue";

const App = () => {
  const { isAuthenticated, authChecked } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const shouldShowPrompt = () => {
    const dismissedAt = localStorage.getItem("pwaDismissedAt");
    if (!dismissedAt) return true;

    const lastDismissed = new Date(parseInt(dismissedAt, 10));
    const now = new Date();
    const diffInDays = (now - lastDismissed) / (1000 * 60 * 60 * 24);
    return diffInDays >= 5; // Show again after 5 days
  };

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      if (shouldShowPrompt()) {
        setDeferredPrompt(e);
        setShowInstallPrompt(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("PWA installed");
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleClosePrompt = () => {
    localStorage.setItem("pwaDismissedAt", Date.now().toString());
    setShowInstallPrompt(false);
  };
  if (!authChecked) return <div>Loading...</div>;
  return (
    <>
      {showInstallPrompt && (
        <PwaInstallPrompt
          onInstall={handleInstallClick}
          onClose={handleClosePrompt}
        />
      )}

      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />

          <Route
            path="/stock-register"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <StockRegister />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/purchase-order"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <PurchaseOrder />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/purchase-order-approval"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <POApproval />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/material-inward"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <MaterialInward />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/material-issue"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <MaterialIssue />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <Dash />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/master-users"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <MasterUsers />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/rm-master"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <RmMaster />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/uom-master"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <UomMaster />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/role-master"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <RoleMaster />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/sfg-master"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <SfgMaster />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/location-master"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <LocationMaster />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/fg-master"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <FgMaster />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/vendor-master"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <VendorMaster />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/customer-master"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <CustomerMaster />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/bom-master"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <BOMMaster />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/sample-master"
            element={
              isAuthenticated ? (
                <Dashboard>
                  <SampleMaster />
                </Dashboard>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
