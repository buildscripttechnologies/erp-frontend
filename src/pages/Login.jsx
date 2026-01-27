import React, { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";
const Login = () => {
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  const { login } = useAuth();

  const validateField = (name, value) => {
    if (!value.trim()) {
      return `${name === 'identifier' ? 'Username or Email' : 'Password'} is required`;
    }
    return "";
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field === 'identifier' ? identifier : password;
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    const identifierError = validateField('identifier', identifier);
    const passwordError = validateField('password', password);
    
    if (identifierError) newErrors.identifier = identifierError;
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    setTouched({ identifier: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", { identifier, password });

      const { token, status, user } = res.data;

      if (status == 203) {
        toast.success("Please verify your email first.");
        navigate("/verify-otp", {
          state: {
            email: user.email,
            purpose: "verification",
          },
        });
        return;
      }
      if (status === 206) {
        toast.success("Please verify your email for 2FA.");
        navigate("/verify-otp", {
          state: {
            email: user.email,
            purpose: "2fa",
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <input
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (touched.identifier) {
                setErrors(prev => ({ ...prev, identifier: validateField('identifier', e.target.value) }));
              }
            }}
            onBlur={() => handleBlur('identifier')}
            placeholder="Username or Email"
            className={`w-full p-2 text-md text-[#272723] font-bold border rounded focus:border-3 focus:outline-none transition duration-200 ${
              errors.identifier && touched.identifier
                ? 'border-red-500 focus:border-red-500'
                : 'border-[#d8b76a] focus:border-[#b38a37]'
            }`}
          />
          {errors.identifier && touched.identifier && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.identifier}
            </p>
          )}
        </div>
        <div>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) {
                  setErrors(prev => ({ ...prev, password: validateField('password', e.target.value) }));
                }
              }}
              onBlur={() => handleBlur('password')}
              placeholder="Password"
              className={`w-full p-2 text-md text-[#272723] font-bold border rounded focus:border-3 focus:outline-none transition duration-200 ${
                errors.password && touched.password
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#d8b76a] focus:border-[#b38a37]'
              }`}
            />
            <button
              type="button"
              className="absolute right-2 top-2.5 text-[#272723]"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? (
                <FiEyeOff className="text-[#d8b76a]" size={20} />
              ) : (
                <FiEye className="text-[#d8b76a]" size={20} />
              )}
            </button>
          </div>
          {errors.password && touched.password && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        <button
          disabled={loading}
          type="submit"
          className=" w-full bg-[#d8b76a] text-xl text-[#292926] font-bold hover:text-[#292926] py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer transition duration-200"
        >
          {loading ? (
            <>
              <span className="mr-2">Logging in</span>
              <BeatLoader size={5} color="#292926" />
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
