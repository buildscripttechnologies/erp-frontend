// src/utils/axios.js
import axios from "axios";

const instance = axios.create({
  // baseURL: "http://localhost:5000/api", // <-- correct port for your backend
  // baseURL: "https://api.smartflow360.com/api",
  baseURL: "https://backend-45z3.onrender.com/api", // <-- correct port for your backend
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default instance;
