/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import axios from "../../../utils/axios";
import { Country, State, City } from "country-state-city";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const AddCustomerModal = ({ onClose, onAdded }) => {
  const [customerSets, setCustomerSets] = useState([
    {
      form: {
        customerName: "",
        aliasName: "",
        natureOfBusiness: "",
        address: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",
        gst: "",
        bankName: "",
        branch: "",
        ifscCode: "",
        agentName: "",
        paymentTerms: "",
        leadCompetitor: "",
        transportationTime: "",
      },
      contacts: [{ contactPerson: "", designation: "", phone: "", email: "" }],
      locations: [
        {
          consigneeName: "",
          consigneeAddress: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          gstinOfConsignee: "",
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
          natureOfBusiness: "",
          address: "",
          country: "",
          state: "",
          city: "",
          postalCode: "",
          gst: "",
          bankName: "",
          branch: "",
          ifscCode: "",
          agentName: "",
          paymentTerms: "",
          leadCompetitor: "",
          transportationTime: "",
        },
        contacts: [
          { contactPerson: "", designation: "", phone: "", email: "" },
        ],
        locations: [
          {
            consigneeName: "",
            consigneeAddress: "",
            country: "",
            state: "",
            city: "",
            pinCode: "",
            gstinOfConsignee: "",
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
    updated[setIdx].contacts.push({
      contactPerson: "",
      designation: "",
      phone: "",
      email: "",
    });
    setCustomerSets(updated);
  };

  const removeContact = (setIdx, i) => {
    const updated = [...customerSets];
    updated[setIdx].contacts.splice(i, 1);
    setCustomerSets(updated);
  };

  const addLocation = (setIdx) => {
    const updated = [...customerSets];
    updated[setIdx].locations.push({
      consigneeName: "",
      consigneeAddress: "",
      country: "",
      state: "",
      city: "",
      pinCode: "",
      gstinOfConsignee: "",
      storeIncharge: "",
      contactNo: "",
      email: "",
    });
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
      const payload = {
        customers: customerSets.map((cs) => ({
          ...cs.form,
          contactPersons: cs.contacts,
          deliveryLocations: cs.locations,
        })),
      };

      const res = await axios.post("/customers/add-many", payload);
      if (res.status === 201) {
        toast.success("Customer(s) added successfully");
        onClose();
        onAdded();
      }
    } catch (err) {
      toast.error("Failed to add customer(s)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-2">
      <div className="bg-white w-full max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-md border border-[#d8b76a] text-xs relative scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-gray-100 p-3">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-sm text-gray-700 hover:text-red-600 cursor-pointer"
        >
          <FiX />
        </button>
        <h2 className="text-base font-semibold text-[#d8b76a] mb-3 underline">
          Add Customers
        </h2>
        <form onSubmit={handleSubmit}>
          {customerSets.map((set, idx) => {
            const states = State.getStatesOfCountry(set.form.country);
            const cities = City.getCitiesOfState(
              set.form.country,
              set.form.state
            );

            return (
              <div
                key={idx}
                className="border border-[#d8b76a] p-3 rounded mb-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[#d8b76a] font-bold text-[14px] underline">
                    Customer {idx + 1}
                  </div>

                  {idx !== 0 && (
                    <button
                      onClick={() =>
                        setCustomerSets(
                          customerSets.filter((_, i) => i !== idx)
                        )
                      }
                      type="button"
                      className="text-red-500 text-sm flex items-center gap-1"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    ["Customer Name", "customerName"],
                    ["Alias Name", "aliasName"],
                    ["Nature Of Business", "natureOfBusiness"],
                    ["Address", "address"],
                    [
                      "Country",
                      "country",
                      countries.map((c) => ({
                        value: c.isoCode,
                        label: c.name,
                      })),
                    ],
                    [
                      "State",
                      "state",
                      states.map((s) => ({ value: s.isoCode, label: s.name })),
                    ],
                    [
                      "City",
                      "city",
                      cities.map((c) => ({ value: c.name, label: c.name })),
                    ],
                    ["Postal Code", "postalCode"],
                    ["GSTIN", "gst"],
                    ["Bank Name", "bankName"],
                    ["Branch", "branch"],
                    ["IFSC Code", "ifscCode"],
                    ["Agent Name", "agentName"],
                    ["Payment Terms", "paymentTerms"],
                    ["Lead Competitor", "leadCompetitor"],
                    ["Transportation Time", "transportationTime"],
                  ].map(([label, name, options]) => (
                    <div key={name} className="flex flex-col">
                      <label className="mb-[2px] text-xs font-medium text-gray-700">
                        {label}
                      </label>

                      {options ? (
                        <select
                          name={name}
                          value={set.form[name]}
                          onChange={(e) => handleFormChange(idx, e)}
                          className="border rounded border-[#d8b76a] px-2 py-[3px] text-sm focus:border-[#d8b76a] focus:ring-1 focus:ring-[#d8b76a] focus:outline-none transition duration-200"
                        >
                          <option value="">Select {label}</option>
                          {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          name={name}
                          value={set.form[name]}
                          onChange={(e) => handleFormChange(idx, e)}
                          placeholder={label}
                          className="border rounded border-[#d8b76a] px-2 py-[3px] text-sm focus:ring-1 focus:ring-[#d8b76a] focus:border-[#d8b76a] focus:outline-none transition duration-200"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-[14px] mb-2 text-[#d8b76a] underline">
                    Contact Persons
                  </h3>

                  {set.contacts.map((c, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-2 items-start"
                    >
                      {[
                        ["Contact Person", "contactPerson"],
                        ["Designation", "designation"],
                        ["Phone", "phone"],
                        ["Email", "email"],
                      ].map(([label, key]) => (
                        <div key={key} className="flex flex-col">
                          <label className="text-[12px] font-semibold mb-[2px] text-[#292926]">
                            {label}
                          </label>
                          <input
                            name={key}
                            value={c[key]}
                            placeholder={label}
                            onChange={(e) => handleContactChange(idx, i, e)}
                            className="border border-[#d8b76a] rounded px-3 py-[6px] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#d8b76a] transition"
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => removeContact(idx, i)}
                        className="text-red-600 text-sm flex items-center gap-1 hover:underline mt-5 cursor-pointer"
                      >
                        <FiTrash2 className="text-base" />
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addContact(idx)}
                    className="mt-2 text-[#292926] bg-[#d8b76a] px-3 py-1.5 rounded text-xs hover:bg-[#d8b76a]/80 transition cursor-pointer"
                  >
                    + Add Contact
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-[14px] mb-2 text-[#d8b76a] underline">
                    Delivery Locations
                  </h3>

                  {set.locations.map((l, i) => {
                    const countries = Country.getAllCountries().map((c) => ({
                      value: c.isoCode,
                      label: c.name,
                    }));
                    const states = State.getStatesOfCountry(
                      l.country || ""
                    ).map((s) => ({
                      value: s.isoCode,
                      label: s.name,
                    }));
                    const cities = City.getCitiesOfState(
                      l.country || "",
                      l.state || ""
                    ).map((c) => ({
                      value: c.name,
                      label: c.name,
                    }));

                    return (
                      <div
                        key={i}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-2 items-center"
                      >
                        {[
                          ["Consignee Name", "consigneeName"],
                          ["Consignee Address", "consigneeAddress"],
                          ["Country", "country", countries],
                          ["State", "state", states],
                          ["City", "city", cities],
                          ["PIN Code", "pinCode"],
                          ["GSTIN", "gstinOfConsignee"],
                          ["Store Incharge", "storeIncharge"],
                          ["Contact No", "contactNo"],
                          ["Email", "email"],
                        ].map(([label, name, options]) => (
                          <div
                            key={name}
                            className="flex flex-col min-w-[150px] flex-1"
                          >
                            <label className="mb-[1px] text-[11px] font-medium text-[#292926]">
                              {label}
                            </label>
                            {options ? (
                              <select
                                name={name}
                                value={l[name]}
                                onChange={(e) =>
                                  handleLocationChange(idx, i, e)
                                }
                                className="border rounded border-[#d8b76a] px-2 py-[5px] text-[12px] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                              >
                                <option value="">Select {label}</option>
                                {options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                name={name}
                                value={l[name]}
                                placeholder={label}
                                onChange={(e) =>
                                  handleLocationChange(idx, i, e)
                                }
                                className="border border-[#d8b76a] rounded px-3 py-[6px] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#d8b76a] transition"
                              />
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => removeLocation(idx, i)}
                          className="text-red-600 text-sm flex items-center gap-1 hover:underline mb-1 cursor-pointer"
                        >
                          <FiTrash2 className="text-base" />
                          Remove
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => addLocation(idx)}
                    className="mt-2 bg-[#d8b76a] text-[#292926] px-3 py-1.5 items-center rounded text-xs hover:bg-[#d8b76a]/80 transition cursor-pointer"
                  >
                    + Add Delivery Location
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={addCustomerSet}
              className="bg-[#d8b76a] hover:bg-[#d8b76a]/80 text-black px-4 py-[4px] text-sm rounded cursor-pointer"
            >
              + Add
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-[4px] text-sm rounded cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-[#d8b76a] text-black px-5 py-[4px] text-sm rounded hover:bg-[#d8b76a]/80 cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;
