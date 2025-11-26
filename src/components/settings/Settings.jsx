import React from "react";
import LetterpadSetting from "./LetterpadSetting";
import Vendors from "./Vendors";
import CompanyDetails from "./CompanyDetails";
import Categories from "./Categories";
import GstTable from "./GstTable";

const Settings = () => {
  return (
    <div className="p-6 overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">Settings</h2>

      {/* Letterpad Component */}
      <LetterpadSetting />
      <Vendors />
      <CompanyDetails />
      <Categories />
      <GstTable />
    </div>
  );
};

export default Settings;
