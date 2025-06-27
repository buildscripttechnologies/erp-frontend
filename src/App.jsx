// src/App.jsx

import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Dash from "./components/Dash";
import MasterUsers from "./components/master/MasterUsers";
import RmMaster from "./components/master/RmMaster";
import "react-toggle/style.css";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
          path="/master-users"
          element={isAuthenticated ? <MasterUsers /> : <Navigate to="/login" />}
        />
        <Route
          path="/rm-master"
          element={isAuthenticated ? <RmMaster /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dash /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
