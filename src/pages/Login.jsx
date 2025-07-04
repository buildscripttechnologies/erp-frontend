import React, { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";
const Login = () => {
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", { identifier, password });

      const { token, status, user } = res.data;
      

      if (status == 203) {
        toast.error("Please verify your email first.");
        navigate("/verify-otp", {
          state: {
            email: user.email,
            purpose: "verification",
          },
        });
        return;
      }
      if (status === 206) {
        toast.error("Please verify your email for 2FA.");
        navigate("/verify-otp", {
          state: {
            email: user.email,
            purpose: "2FA",
          },
        });
        return;
      }

      if (status === 200 && token && user) {
        login(token, user);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#d8b76a] mb-6">
        Login
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Username or Email"
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
          disabled={loading}
          type="submit"
          className="w-full bg-[#d8b76a] text-xl text-[#292926] font-bold hover:text-[#292926] py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer transition duration-200"
        >
          {loading ? (
            <>
              <span className="mr-2">Logging in...</span>
              <ClipLoader size={20} color="#292926" />
            </>
          ) : (
            "Login"
          )}
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
