import React, { useState, useEffect } from "react";
import AuthLayout from "../layouts/AuthLayout";
import axios from "../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  useEffect(() => {
    if (location.state) {
      // console.log("State : ", location.state);

      setEmail(location.state.email || "");
      setPurpose(location.state.purpose || "");
    }
  }, [location.state]);


  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/otp/verify", { email, otp, purpose });

      const { token, status, user } = res.data;

      console.log("token,user", token, user);

      // if (res.data.token) localStorage.setItem("token", res.data.token);

      // toast.success("Login successful!");

      if (status === 200) {
        login(token, user);
        toast.success("OTP verified successfully!");
        navigate("/dashboard");
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return alert("Please enter your email first.");
    setResending(true);
    try {
      await axios.post("/otp/send", { email, purpose });
      toast.success("OTP resent successfully.");
      setTimer(30); // 30-second cooldown
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#d8b76a] mb-6">
        Verify OTP
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          disabled
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 text-md text-[#272723] cursor-not-allowed font-bold border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200"
            required
          />
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || timer > 0}
            className="px-4 py-2 text-sm font-semibold text-[#292927] border border-[#d8b76a] bg-white rounded hover:bg-[#f7f3ea] transition duration-200 disabled:opacity-50"
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
          </button>
        </div>

        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="hidden w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-2 focus:border-[#b38a37] focus:outline-none transition duration-200"
        >
          <option value="signup">Signup</option>
          <option value="2fa">2FA</option>
        </select>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-[#d8b76a] text-xl text-[#292927] font-bold hover:text-[#292927] py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer transition duration-200"
        >
          {loading ? (
            <>
              <span className="mr-2">Verifying</span>
              <BeatLoader size={5} color="#292926" />
            </>
          ) : (
            "Verify OTP"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default VerifyOtp;
