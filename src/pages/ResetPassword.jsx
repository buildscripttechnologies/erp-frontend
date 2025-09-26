// src/pages/ResetPassword.jsx

import React, { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/reset-password", { email });
      if (res.status === 200) {
        toast.success("OTP has been sent to your email");
        navigate("/change-password", {
          state: {
            email: email,
          },
        });
      } else {
        toast.error("Failed to send OTP. Please try again."); // <-- Add error handling for failed OTP
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
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
          disabled={loading}
          type="submit"
          className="w-full bg-[#d8b76a] text-xl text-[#292927] font-bold hover:text-[#292927] py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer transition duration-200"
        >
          {loading ? (
            <>
              <span className="mr-2">Sending OTP</span>
              <BeatLoader size={5} color="#292926" />
            </>
          ) : (
            "Send OTP"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
