// src/layouts/AuthLayout.jsx

import React from "react";
import { motion } from "framer-motion";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full overflow-hidden flex flex-col md:flex-row bg-gradient-to-r from-white  to-[#d8b76a]">
      {/* Left Panel */}
      <motion.div
        className=" md:flex md:w-1/2 items-center justify-center mt-[-5%] px-10 bg-opacity-40 text-center"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-2xl">
          <div className="relative mb-[-20px]">
            <img
              src="/images/logo.png"
              alt="SmartFlow360 Logo"
              className="md:w-100 w-40 mx-auto "
            />
          </div>
          <h2 className="text-2xl  md:mt-[-12%] md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
            SmartFlow360
          </h2>
          <p className="mt-4 text-lg md:text-xl lg:text-2xl font-medium drop-shadow">
            Streamlining your workflow from planning to dispatch
          </p>
        </div>
      </motion.div>

      {/* Right Panel (Form) */}
      <motion.div
        className="flex w-full md:w-1/2 items-center justify-center py-12 px-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
