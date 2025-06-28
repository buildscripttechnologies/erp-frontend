import React from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";

const AccessDeniedNotice = ({userType}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6 py-12  rounded   text-center">
      <div>
        <FiAlertCircle className="mx-auto text-5xl text-[#d8b76a] mb-4" />
        <h1 className="text-2xl font-bold text-[#d8b76a] mb-2">
          Access Restricted
        </h1>
        <p className="text-[#292926] font-medium text-lg mb-4">
          You do not have permission to access this section. Only users with{" "}
          <span className="font-semibold text-[#d8b76a]">{userType}</span> privileges
          are allowed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-5 py-2 bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-[#292926] font-semibold rounded transition cursor-pointer"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default AccessDeniedNotice;
