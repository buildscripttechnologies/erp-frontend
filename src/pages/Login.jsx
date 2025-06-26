import React, { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", { email, password });
      // console.log("Login response:", res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (res.data.status === 403) {
        toast.error("Please verify your email for 2FA.");
        navigate("/verify-otp"); // <- redirect here
      } else if (res.data.status === 200) {
        navigate("/");
        toast.success("Login successful!");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#d8b76a] mb-6">
        Login
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-3 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-3 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />

        <button
          type="submit"
          className="w-full bg-[#d8b76a] text-xl text-[#292927] font-bold hover:text-[#292927] py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer transition duration-200"
        >
          Login
        </button>
        <p className="text-center text-xl mt-4">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-[#d8b76a] font-bold hover:underline"
          >
            Register
          </a>
        </p>
        <p className="text-center text-xl mt-2">
          <a
            href="/reset-password"
            className="text-[#d8b76a] font-bold hover:underline"
          >
            Forgot Password?
          </a>
        </p>
        {/* <p className="text-center text-sm mt-2">
            <a href="/verify-otp" className="text-blue-600 hover:underline">
                Verify OTP
            </a>
        </p> */}
      </form>
    </AuthLayout>
  );
};

export default Login;
