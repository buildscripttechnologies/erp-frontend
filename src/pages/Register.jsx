import React, { useEffect, useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

const Register = () => {
  const navigate = useNavigate();
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    userType: "",
    userGroup: "UserGrp",
  });
  const FetchUserTypes = async () => {
    try {
      const res = await axios.get("/roles/all-roles");
      console.log(res.data);

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
    setLoading(true); // <-- Add loading state if needed
    try {
      const res = await axios.post("/auth/register", formData);

      if (res.status === 200 || res.status === 201) {
        toast.success("Registered. OTP sent. Please check your email.");
        navigate("/verify-otp");
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          placeholder="Full Name"
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-3 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />

        <input
          type="text"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          placeholder="Username"
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-3 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />

        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-3 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />

        <input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          placeholder="Password"
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-3 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />
        <input
          type="number"
          value={formData.mobile}
          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          placeholder="Mobile"
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-3 focus:border-[#b38a37] focus:outline-none transition duration-200"
          required
        />

        <select
          value={formData.userType}
          onChange={(e) =>
            setFormData({ ...formData, userType: e.target.value })
          }
          className="w-full p-2 text-md text-[#272723] font-bold border border-[#d8b76a] rounded focus:border-3 focus:border-[#b38a37] focus:outline-none transition duration-200 cursor-pointer"
        >
          <option>Select User Type</option>
          {userTypes.map((role) => (
            <option key={role.name} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>

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
              <span className="mr-2">Registering User...</span>
              <ClipLoader size={20} color="#292926" />
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
