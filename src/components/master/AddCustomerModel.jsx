/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import axios from "../../utils/axios";
import { Country, State, City } from "country-state-city";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const AddCustomerModal = ({ onClose }) => {
  const [customerSets, setCustomerSets] = useState([
    {
      form: {
        customerName: "",
        aliasName: "",
        nature: "",
        address: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",
        gstin: "",
        bankName: "",
        branch: "",
        ifscCode: "",
        agentName: "",
        paymentTerms: "",
        leadCompetitor: "",
        transportationTime: "",
      },
      contacts: [{ name: "", designation: "", phone: "", email: "" }],
      locations: [
        {
          consigneeName: "",
          consigneeAddress: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          gstin: "",
          storeIncharge: "",
          contactNo: "",
          email: "",
        },
      ],
    },
  ]);

  AddCustomerModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

  const countries = Country.getAllCountries();

  const handleFormChange = (idx, e) => {
    const updated = [...customerSets];
    updated[idx].form[e.target.name] = e.target.value;
    setCustomerSets(updated);
  };

  const handleContactChange = (setIdx, i, e) => {
    const updated = [...customerSets];
    updated[setIdx].contacts[i][e.target.name] = e.target.value;
    setCustomerSets(updated);
  };

  const handleLocationChange = (setIdx, i, e) => {
    const updated = [...customerSets];
    updated[setIdx].locations[i][e.target.name] = e.target.value;
    setCustomerSets(updated);
  };

  const addCustomerSet = () => {
    setCustomerSets([
      ...customerSets,
      {
        form: {
          customerName: "",
          aliasName: "",
          nature: "",
          address: "",
          country: "",
          state: "",
          city: "",
          postalCode: "",
          gstin: "",
          bankName: "",
          branch: "",
          ifscCode: "",
          agentName: "",
          paymentTerms: "",
          leadCompetitor: "",
          transportationTime: "",
        },
        contacts: [{ name: "", designation: "", phone: "", email: "" }],
        locations: [
          {
            consigneeName: "",
            consigneeAddress: "",
            country: "",
            state: "",
            city: "",
            pinCode: "",
            gstin: "",
            storeIncharge: "",
            contactNo: "",
            email: "",
          },
        ],
      },
    ]);
  };

  const addContact = (setIdx) => {
    const updated = [...customerSets];
    updated[setIdx].contacts.push({ name: "", designation: "", phone: "", email: "" });
    setCustomerSets(updated);
  };

  const removeContact = (setIdx, i) => {
    const updated = [...customerSets];
    updated[setIdx].contacts.splice(i, 1);
    setCustomerSets(updated);
  };

  const addLocation = (setIdx) => {
    const updated = [...customerSets];
    updated[setIdx].locations.push({ consigneeName: "", consigneeAddress: "", country: "", state: "", city: "", pinCode: "", gstin: "", storeIncharge: "", contactNo: "", email: "" });
    setCustomerSets(updated);
  };

  const removeLocation = (setIdx, i) => {
    const updated = [...customerSets];
    updated[setIdx].locations.splice(i, 1);
    setCustomerSets(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (let cs of customerSets) {
        await axios.post("/customers", {
          ...cs.form,
          contacts: cs.contacts,
          deliveryLocations: cs.locations,
        });
      }
      toast.success("Customer(s) added successfully");
      onClose();
    } catch (err) {
      toast.error("Failed to add customer(s)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-2">
      <div className="bg-white w-full max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-md border border-[#d8b76a] text-xs relative scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-gray-100 p-3">
        <button onClick={onClose} className="absolute right-3 top-3 text-sm text-gray-700 hover:text-red-600"><FiX /></button>
        <h2 className="text-base font-semibold text-[#292926] mb-3">Add Customers</h2>
        <form onSubmit={handleSubmit}>
          {customerSets.map((set, idx) => {
            const states = State.getStatesOfCountry(set.form.country);
            const cities = City.getCitiesOfState(set.form.country, set.form.state);

            return (
              <div key={idx} className="border border-[#d8b76a] p-3 rounded mb-4">

                {/* <div className="flex justify-between items-center mb-2">
                  <div className="text-red-600 font-semibold underline">Customer {idx + 1}</div>
                  <button onClick={() => setCustomerSets(customerSets.filter((_, i) => i !== idx))} type="button" className="text-red-500 text-sm"><FiTrash2 /> Delete</button>
                </div> */}

                <div className="flex justify-between items-center mb-2">
                  <div className="text-red-600 font-semibold underline">
                    Customer {idx + 1}
                  </div>

                  {idx !== 0 && (
                    <button
                      onClick={() =>
                        setCustomerSets(customerSets.filter((_, i) => i !== idx))
                      }
                      type="button"
                      className="text-red-500 text-sm flex items-center gap-1"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  )}
                </div>


                <div className="flex flex-wrap gap-3">
                  {[ 
                    ["Customer Name", "customerName"],
                    ["Alias Name", "aliasName"],
                    ["Nature Of Business", "nature"],
                    ["Address", "address"],
                    ["Country", "country", countries.map(c => ({ value: c.isoCode, label: c.name }))],
                    ["State", "state", states.map(s => ({ value: s.isoCode, label: s.name }))],
                    ["City", "city", cities.map(c => ({ value: c.name, label: c.name }))],
                    ["Postal Code", "postalCode"],
                    ["GSTIN", "gstin"],
                    ["Bank Name", "bankName"],
                    ["Branch", "branch"],
                    ["IFSC Code", "ifscCode"],
                    ["Agent Name", "agentName"],
                    ["Payment Terms", "paymentTerms"],
                    ["Lead Competitor", "leadCompetitor"],
                    ["Transportation Time", "transportationTime"]
                  ].map(([label, name, options]) => (
                    <div key={name} className="flex flex-col min-w-[150px] flex-1">
                      <label className="mb-[1px] text-[11px] font-medium">{label}</label>
                      {options ? (
                        <select name={name} value={set.form[name]} onChange={(e) => handleFormChange(idx, e)} className="border rounded px-2 py-[3px] text-[12px]">
                          <option value="">Select {label}</option>
                          {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input name={name} value={set.form[name]} onChange={(e) => handleFormChange(idx, e)} placeholder={label} className="border rounded px-2 py-[3px] text-[12px]" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <h3 className="font-semibold text-[13px] mb-1">Contact Persons</h3>
                  {set.contacts.map((c, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 mt-1">
                      {['name', 'designation', 'phone', 'email'].map((key) => (
                        <input
                          key={key}
                          name={key}
                          value={c[key]}
                          placeholder={key}
                          onChange={(e) => handleContactChange(idx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px]"
                        />
                      ))}
                      <button type="button" onClick={() => removeContact(idx, i)} className="flex text-red-500 text-xs"><FiTrash2 /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addContact(idx)} className="mt-2 bg-[#292926] text-white px-3 py-2px text-xs rounded">+ Add Contact</button>
                </div>

                <div className="mt-3">
                  <h3 className="font-semibold text-[13px] mb-1">Delivery Locations</h3>
                  {set.locations.map((l, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 mt-1">
                      {["consigneeName", "consigneeAddress", "country", "state", "city"].map((key) => (
                        <input
                          key={key}
                          name={key}
                          value={l[key]}
                          placeholder={key}
                          onChange={(e) => handleLocationChange(idx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px]"
                        />
                      ))}
                      <button type="button" onClick={() => removeLocation(idx, i)} className="flex text-red-500 text-xs"><FiTrash2 /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addLocation(idx)} className="mt-2 bg-[#292926] text-white px-3 py-2px text-xs rounded">+ Add Delivery Location</button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={addCustomerSet} className="bg-[#e0cda0] text-black px-4 py-[4px] text-sm rounded">+ Add</button>
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-[4px] text-sm rounded">Close</button>
            <button type="submit" className="bg-[#d8b76a] text-black px-5 py-[4px] text-sm rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;
