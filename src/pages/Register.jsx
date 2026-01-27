import React, { useEffect, useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    userType: "",
    userGroup: "UserGrp",
  });

  const fieldLabels = {
    fullName: 'Full Name',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    mobile: 'Mobile',
    userType: 'User Type'
  };

  const validateField = (name, value) => {
    if (!value || !value.toString().trim()) {
      return `${fieldLabels[name]} is required`;
    }
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    if (name === 'mobile' && !/^\d{10}$/.test(value)) {
      return 'Please enter a valid 10-digit mobile number';
    }
    if (name === 'password' && value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (name === 'userType' && value === 'Select User Type') {
      return 'Please select a user type';
    }
    return "";
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ['fullName', 'username', 'email', 'password', 'mobile', 'userType'];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    setTouched(fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const ErrorMessage = ({ field }) => (
    errors[field] && touched[field] && (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {errors[field]}
      </p>
    )
  );

  const getInputClass = (field) => `w-full p-2 text-md text-[#272723] font-bold border rounded focus:border-3 focus:outline-none transition duration-200 ${
    errors[field] && touched[field]
      ? 'border-red-500 focus:border-red-500'
      : 'border-[#d8b76a] focus:border-[#b38a37]'
  }`;

  const FetchUserTypes = async () => {
    try {
      const res = await axios.get("/roles/all-roles");
      // console.log(res.data);

      if (res.status === 200 || res.status === 201) {
        setUserTypes(res.data.roles);
      } else {
        toast.error("Failed to fetch user types");
      }
    } catch (error) {}
  };
  useEffect(() => {
    FetchUserTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post("/auth/register", formData);

      if (res.status === 200 || res.status === 201) {
        toast.success("Registered. OTP sent. Please check your email.");
        navigate("/verify-otp", {
          state: {
            email: formData.email,
            purpose: "signup",
          },
        });
      } else {
        toast.error(res.data?.message || "Something went wrong.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false); // <-- Always reset loading
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#d8b76a] mb-6">
        Register
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            placeholder="Full Name"
            className={getInputClass('fullName')}
          />
          <ErrorMessage field="fullName" />
        </div>

        <div>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            onBlur={() => handleBlur('username')}
            placeholder="Username"
            className={getInputClass('username')}
          />
          <ErrorMessage field="username" />
        </div>

        <div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="Email"
            className={getInputClass('email')}
          />
          <ErrorMessage field="email" />
        </div>

        <div>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Password"
              className={getInputClass('password')}
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
          <ErrorMessage field="password" />
        </div>

        <div>
          <input
            type="number"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            onBlur={() => handleBlur('mobile')}
            placeholder="Mobile"
            className={getInputClass('mobile')}
          />
          <ErrorMessage field="mobile" />
        </div>

        <div>
          <select
            value={formData.userType}
            onChange={(e) => handleChange('userType', e.target.value)}
            onBlur={() => handleBlur('userType')}
            className={`${getInputClass('userType')} cursor-pointer`}
          >
            <option>Select User Type</option>
            {userTypes
              .filter((role) => role.name !== "Admin")
              .map((role) => (
                <option key={role.name} value={role.name}>
                  {role.name}
                </option>
              ))}
          </select>
          <ErrorMessage field="userType" />
        </div>

        {/* <input
          type="text"
          value={formData.userGroup}
          onChange={(e) =>
            setFormData({ ...formData, userGroup: e.target.value })
          }
          placeholder="User Group"
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-3 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        /> */}

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-[#d8b76a] text-xl text-[#292927] font-bold hover:text-[#292927] py-2 rounded hover:bg-[#d8b76a]/80 cursor-pointer transition duration-200"
        >
          {loading ? (
            <>
              <span className="mr-2">Registering User</span>
              <BeatLoader size={5} color="#292926" />
            </>
          ) : (
            "Register"
          )}
        </button>
        <p className="text-center text-xl mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-[#d8b76a] font-bold hover:underline">
            Login
          </a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
