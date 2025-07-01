import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { FiMinus, FiPlus } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import Select from "react-select";
import { Country, State, City } from "country-state-city";

const AddVendorModal = ({ onClose, onAdded, uoms, rms }) => {
  const [form, setForm] = useState({
    vendorName: "",
    vendorCode: "",
    nature: "",
    address: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    gstin: "",
    status: "Active",
  });

  const [contacts, setContacts] = useState([{ name: "", phone: "", email: "" }]);
  const [materials, setMaterials] = useState([{ itemId: "", uomId: "" }]);
  const [loading, setLoading] = useState(false);

    const countries = Country.getAllCountries();
    const states = State.getStatesOfCountry(form.country);
    const cities = City.getCitiesOfState(form.country, form.state);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (i, e) => {
    const updated = [...contacts];
    updated[i][e.target.name] = e.target.value;
    setContacts(updated);
  };

  const handleMaterialChange = (i, key, value) => {
    const updated = [...materials];
    updated[i][key] = value;
    setMaterials(updated);
  };

  const addContact = () => setContacts([...contacts, { name: "", phone: "", email: "" }]);
  const removeContact = (i) => {
    const updated = [...contacts];
    updated.splice(i, 1);
    setContacts(updated);
  };

  const addMaterial = () => setMaterials([...materials, { itemId: "", uomId: "" }]);
  const removeMaterial = (i) => {
    const updated = [...materials];
    updated.splice(i, 1);
    setMaterials(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/vendors", {
        ...form,
        contacts,
        materials,
      });
      toast.success("Vendor added successfully");
      onClose();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-5xl rounded-lg p-6 border border-[#d8b76a] overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-[#fdf6e9]">
        <h2 className="text-xl font-bold mb-4 text-[#d8b76a]">Add Vendor</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="vendorName"
              placeholder="Vendor Name"
              value={form.vendorName}
              onChange={handleFormChange}
              className="p-2 border border-[#d8b76a] rounded"
              required
            />
            <input
              name="vendorCode"
              placeholder="Vendor Code"
              value={form.vendorCode}
              onChange={handleFormChange}
              className="p-2 border border-[#d8b76a] rounded"
              required
            />
            <input
              name="nature"
              placeholder="Nature of Business"
              value={form.nature}
              onChange={handleFormChange}
              className="p-2 border border-[#d8b76a] rounded"
            />
            <input
              name="gstin"
              placeholder="GSTIN"
              value={form.gstin}
              onChange={handleFormChange}
              className="p-2 border border-[#d8b76a] rounded"
            />
            <input
              name="postalCode"
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={handleFormChange}
              className="p-2 border border-[#d8b76a] rounded"
            />
            <select
              name="status"
              value={form.status}
              onChange={handleFormChange}
              className="p-2 border border-[#d8b76a] rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <textarea
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleFormChange}
            className="w-full p-2 border border-[#d8b76a] rounded"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              name="country"
              value={form.country}
              onChange={handleFormChange}
              className="p-2 border border-[#d8b76a] rounded"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
              ))}
            </select>

            <select
              name="state"
              value={form.state}
              onChange={handleFormChange}
              className="p-2 border border-[#d8b76a] rounded"
              disabled={!form.country}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
              ))}
            </select>

            <select
              name="city"
              value={form.city}
              onChange={handleFormChange}
              className="p-2 border border-[#d8b76a] rounded"
              disabled={!form.state}
            >
              <option value="">Select City</option>
              {cities.map((c, i) => (
                <option key={i} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="border border-[#d8b76a] rounded p-4">
            <h3 className="text-sm font-semibold mb-2">Contact Persons</h3>
            {contacts.map((c, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                <input
                  name="name"
                  placeholder="Name"
                  value={c.name}
                  onChange={(e) => handleContactChange(i, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                />
                <input
                  name="phone"
                  placeholder="Phone"
                  value={c.phone}
                  onChange={(e) => handleContactChange(i, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                />
                <input
                  name="email"
                  placeholder="Email"
                  value={c.email}
                  onChange={(e) => handleContactChange(i, e)}
                  className="p-2 border border-[#d8b76a] rounded"
                />
              </div>
            ))}
            <div className="flex gap-2">
              {contacts.length > 1 && (
                <button type="button" onClick={() => removeContact(contacts.length - 1)} className="text-red-600">
                  <FiMinus />
                </button>
              )}
              <button type="button" onClick={addContact} className="text-green-600">
                <FiPlus />
              </button>
            </div>
          </div>

          <div className="border border-[#d8b76a] rounded p-4">
            <h3 className="text-sm font-semibold mb-2">Raw Materials with UOM</h3>
            {materials.map((m, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                <select
                  value={m.itemId}
                  onChange={(e) => handleMaterialChange(i, "itemId", e.target.value)}
                  className="p-2 border border-[#d8b76a] rounded"
                >
                  <option value="">Select RM</option>
                  {rms.map((rm) => (
                    <option key={rm._id} value={rm._id}>{rm.skuCode} - {rm.itemName}</option>
                  ))}
                </select>
                <select
                  value={m.uomId}
                  onChange={(e) => handleMaterialChange(i, "uomId", e.target.value)}
                  className="p-2 border border-[#d8b76a] rounded"
                >
                  <option value="">Select UOM</option>
                  {uoms.map((u) => (
                    <option key={u._id} value={u._id}>{u.unitName}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="flex gap-2">
              {materials.length > 1 && (
                <button type="button" onClick={() => removeMaterial(materials.length - 1)} className="text-red-600">
                  <FiMinus />
                </button>
              )}
              <button type="button" onClick={addMaterial} className="text-green-600">
                <FiPlus />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-[#292926] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#d8b76a] hover:bg-[#b38a37] text-[#292926] font-semibold rounded"
            >
              {loading ? <ClipLoader size={20} color="#292926" /> : "Save Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorModal;