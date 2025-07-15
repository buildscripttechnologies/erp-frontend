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
import UomMaster from "./components/master/UomMaster";
import "react-toggle/style.css";
import SfgMaster from "./components/master/sfg/SfgMaster";
import LocationMaster from "./components/master/location/LocationMaster";
import FgMaster from "./components/master/fg/FgMaster";
import VendorMaster from "./components/master/vendor/VendorMaster";

import RoleMaster from "./components/master/Role/RoleMaster";
import Dashboard from "./pages/Dashboard";

import CustomerMaster from "./components/master/customer/CustomerMaster";

const App = () => {
  const { isAuthenticated, authChecked } = useAuth();
  if (!authChecked) return <div>Loading...</div>;
  return (
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
          path="/dashboard"
          element={isAuthenticated ? <Dash /> : <Navigate to="/login" />}
        />
        <Route
          path="/master-users"
          element={isAuthenticated ? <MasterUsers /> : <Navigate to="/login" />}
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
          element={isAuthenticated ? <UomMaster /> : <Navigate to="/login" />}
        />
        <Route
          path="/role-master"
          element={isAuthenticated ? <RoleMaster /> : <Navigate to="/login" />}
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
            isAuthenticated ? <LocationMaster /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/fg-master"
          element={isAuthenticated ? <FgMaster /> : <Navigate to="/login" />}
        />
        <Route
          path="/vendor-master"
          element={
            isAuthenticated ? <VendorMaster /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/customer-master"
          element={
            isAuthenticated ? <CustomerMaster /> : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
