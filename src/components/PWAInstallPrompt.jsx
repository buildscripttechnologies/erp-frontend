// components/PwaInstallPrompt.jsx
import React from "react";

const PwaInstallPrompt = ({ onInstall, onClose }) => {
  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 bg-[#292926] text-white border border-[#d8b76a] rounded-xl shadow-lg p-4 z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-lg font-semibold">Install Smartflow 360</p>
        <p className="text-sm text-gray-300">
          Get quick access with the app-like experience.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onInstall}
          className="bg-[#d8b76a] text-[#292926] px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer"
        >
          Install
        </button>
        <button
          onClick={onClose}
          className="text-white border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-[#292926] transition cursor-pointer"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
