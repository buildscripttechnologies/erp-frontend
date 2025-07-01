// src/pages/ChangePassword.jsx

import React, { useEffect, useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import axios from "../utils/axios";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      console.log("State : ", location.state);

      setEmail(location.state.email || "");
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/change-password", {
        email,
        otp,
        newPassword,
      });
      toast.success("Password changed successfully. Please login again.");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return toast.error("Please enter your email to resend OTP.");
    setResending(true);
    try {
      await axios.post("/otp/send", { email, purpose: "password reset" });
      toast.success("OTP resent successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#d8b76a] mb-6">
        Change Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
        disabled
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 text-md cursor-not-allowed text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP"
            className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200"
            required
          />
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending}
            className="px-4 py-2 text-sm font-semibold whitespace-nowrap cursor-pointer text-[#292927] border border-[#d8b76a] bg-white rounded hover:bg-[#f7f3ea] transition duration-200 disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-[#d8b76a] text-xl text-[#292927] font-bold hover:text-[#292927] py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer transition duration-200"
        >
          {loading ? (
            <>
              <span className="mr-2">Changing Password...</span>
              <ClipLoader size={20} color="#292926" />
            </>
          ) : (
            "Change Password"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ChangePassword;
