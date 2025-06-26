// src/pages/ResetPassword.jsx

import React, { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/reset-password", { email });
      toast.success("OTP has been sent to your email");
      navigate("/change-password");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#d8b76a] mb-6">
        Reset Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-3 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />
        <button
          type="submit"
          className="w-full bg-[#d8b76a] text-xl text-[#292927] font-bold hover:text-[#292927] py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer transition duration-200"
        >
          Send OTP
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
