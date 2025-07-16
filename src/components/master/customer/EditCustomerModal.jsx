import React, { useEffect, useState } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import axios from "../../../utils/axios";
import { Country, State, City } from "country-state-city";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const EditCustomerModal = ({ customer, onClose, onUpdated }) => {
  const [form, setForm] = useState({ ...customer });
  const [contacts, setContacts] = useState(customer.contactPersons || []);
  const [locations, setLocations] = useState(customer.deliveryLocations || []);

  useEffect(() => {
    setForm({ ...customer });
    setContacts(customer.contactPersons || []);
    setLocations(customer.deliveryLocations || []);
  }, [customer]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContactChange = (i, e) => {
    const updated = [...contacts];
    updated[i][e.target.name] = e.target.value;
    setContacts(updated);
  };

  const handleLocationChange = (i, e) => {
    const updated = [...locations];
    updated[i][e.target.name] = e.target.value;
    setLocations(updated);
  };

  const addContact = () => {
    setContacts([
      ...contacts,
      { contactPerson: "", designation: "", phone: "", email: "" },
    ]);
  };

  const removeContact = (i) => {
    setContacts(contacts.filter((_, idx) => idx !== i));
  };

  const addLocation = () => {
    setLocations([
      ...locations,
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
    ]);
  };

  const removeLocation = (i) => {
    setLocations(locations.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        contactPersons: contacts,
        deliveryLocations: locations,
      };

      const res = await axios.patch(
        `/customers/update/${customer._id}`,
        payload
      );
      if (res.status === 200) {
        toast.success("Customer updated successfully");
        onUpdated?.();
        onClose();
      }
    } catch (err) {
      toast.error("Failed to update customer");
    }
  };

  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(form.country || "");
  const cities = City.getCitiesOfState(form.country || "", form.state || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-2">
      <div className="bg-white w-full max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-md border border-[#d8b76a] text-xs relative scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-gray-100 p-3">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-sm text-gray-700 hover:text-red-600 cursor-pointer"
        >
          <FiX />
        </button>
        <h2 className="text-base font-bold text-[#d8b76a] mb-3 underline ">
          Edit Customer
        </h2>
        <form onSubmit={handleSubmit}>
          {/* General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* map through same fields as in AddCustomerModal */}
            {[
              ["Customer Name", "customerName"],
              ["Alias Name", "aliasName"],
              ["Nature Of Business", "natureOfBusiness"],
              ["Address", "address"],
              [
                "Country",
                "country",
                countries.map((c) => ({ value: c.isoCode, label: c.name })),
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
                    value={form[name] || ""}
                    onChange={handleFormChange}
                    className="border border-[#d8b76a] rounded px-2 py-[3px] text-sm"
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
                    value={form[name] || ""}
                    onChange={handleFormChange}
                    className="border border-[#d8b76a] rounded px-2 py-[3px] text-sm"
                    placeholder={label}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Contact Persons */}
          <div className="mt-4">
            <h3 className="font-bold text-[14px] mb-2 text-[#d8b76a] underline">
              Contact Persons
            </h3>
            {contacts.map((c, i) => (
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
                      onChange={(e) => handleContactChange(i, e)}
                      className="border border-[#d8b76a] rounded px-2 py-[5px] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#d8b76a] transition"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="text-red-600 text-sm flex items-center gap-1 hover:underline mt-5 cursor-pointer"
                >
                  <FiTrash2 className="text-base" />
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addContact}
              className="mt-2 text-[#292926] bg-[#d8b76a] px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-[#d8b76a]/80"
            >
              + Add Contact
            </button>
          </div>

          {/* Delivery Locations */}
          <div className="mt-4">
            <h3 className="font-bold text-[14px] mb-2 text-[#d8b76a] underline">
              Delivery Locations
            </h3>
            {locations.map((l, i) => {
              const states = State.getStatesOfCountry(l.country || "").map(
                (s) => ({ value: s.isoCode, label: s.name })
              );
              const cities = City.getCitiesOfState(
                l.country || "",
                l.state || ""
              ).map((c) => ({ value: c.name, label: c.name }));

              return (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-2 items-center"
                >
                  {[
                    ["Consignee Name", "consigneeName"],
                    ["Consignee Address", "consigneeAddress"],
                    [
                      "Country",
                      "country",
                      countries.map((c) => ({
                        value: c.isoCode,
                        label: c.name,
                      })),
                    ],
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
                          onChange={(e) => handleLocationChange(i, e)}
                          className="border border-[#d8b76a] rounded px-2 py-[5px] text-[12px]"
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
                          onChange={(e) => handleLocationChange(i, e)}
                          className="border border-[#d8b76a] rounded px-2 py-[5px] text-[12px]"
                          placeholder={label}
                        />
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => removeLocation(i)}
                    className="text-red-600 text-sm flex items-center gap-1 mb-1 cursor-pointer"
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addLocation}
              className="mt-2 bg-[#d8b76a] text-[#292926] px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-[#d8b76a]/80"
            >
              + Add Delivery Location
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-[4px] text-sm rounded cursor-pointer hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#d8b76a] text-black px-5 py-[4px] text-sm rounded hover:bg-[#d8b76a]/80 cursor-pointer"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditCustomerModal.propTypes = {
  customer: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdated: PropTypes.func,
};

export default EditCustomerModal;
