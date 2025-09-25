import React from "react";
import LetterpadSetting from "./LetterpadSetting";

const Settings = () => {
  return (
    <div className="p-6 overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">Settings</h2>

      {/* Letterpad Component */}
      <LetterpadSetting />

      {/* Future settings can go here */}
      {/* <CompanyInfoSetting /> */}
      {/* <SignatureSetting /> */}
    </div>
  );
};

export default Settings;
