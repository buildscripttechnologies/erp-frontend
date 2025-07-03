import { useEffect, useState } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import axios from "../../utils/axios";
import { Country, State, City } from "country-state-city";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const AddVendorModal = ({ onClose }) => {
  const [vendors, setVendors] = useState([
    {
      form: {
        vendorName: "",
        nature: "",
        address: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",
        gstin: "",
        factoryAddress: "",
        factoryCountry: "",
        factoryState: "",
        factoryCity: "",
        factoryPostalCode: "",
        bankName: "",
        branch: "",
        accountNo: "",
        ifscCode: "",
        priceTerms: "",
        paymentTerms: ""
      },
      contacts: [{ name: "", designation: "", phone: "", email: "", info: "" }],
      materials: [{ itemId: "", deliveryDays: "", moq: "", uomId: "", rate: "", preferenceIndex: "" }]
    }
  ]);

  AddVendorModal.propTypes = {
    onClose: PropTypes.func.isRequired,
  };

  const [uoms, setUoms] = useState([]);
  const [rms, setRms] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [uomRes, rmRes] = await Promise.all([
          axios.get("/uoms/all-uoms?limit=1000"),
          axios.get("/rms/rm")
        ]);
        setUoms(uomRes.data.data || []);
        setRms(rmRes.data.rawMaterials || []);
      } catch {
        toast.error("Failed to fetch UOM or RM data");
      }
    };
    fetchDropdowns();
  }, []);

  const handleFormChange = (vendorIdx, e) => {
    const newVendors = [...vendors];
    newVendors[vendorIdx].form[e.target.name] = e.target.value;
    setVendors(newVendors);
  };

  const handleContactChange = (vendorIdx, contactIdx, e) => {
    const updated = [...vendors];
    updated[vendorIdx].contacts[contactIdx][e.target.name] = e.target.value;
    setVendors(updated);
  };

  const handleMaterialChange = (vendorIdx, materialIdx, key, value) => {
    const updated = [...vendors];
    updated[vendorIdx].materials[materialIdx][key] = value;
    setVendors(updated);
  };

  const addContact = (vendorIdx) => {
    const updated = [...vendors];
    updated[vendorIdx].contacts.push({ name: "", designation: "", phone: "", email: "", info: "" });
    setVendors(updated);
  };

  const removeContact = (vendorIdx, contactIdx) => {
    const updated = [...vendors];
    updated[vendorIdx].contacts.splice(contactIdx, 1);
    setVendors(updated);
  };

  const addMaterial = (vendorIdx) => {
    const updated = [...vendors];
    updated[vendorIdx].materials.push({ itemId: "", deliveryDays: "", moq: "", uomId: "", rate: "", preferenceIndex: "" });
    setVendors(updated);
  };

  const removeMaterial = (vendorIdx, materialIdx) => {
    const updated = [...vendors];
    updated[vendorIdx].materials.splice(materialIdx, 1);
    setVendors(updated);
  };

  const addVendor = () => {
    setVendors([
      ...vendors,
      {
        form: {
          vendorName: "",
          nature: "",
          address: "",
          country: "",
          state: "",
          city: "",
          postalCode: "",
          gstin: "",
          factoryAddress: "",
          factoryCountry: "",
          factoryState: "",
          factoryCity: "",
          factoryPostalCode: "",
          bankName: "",
          branch: "",
          accountNo: "",
          ifscCode: "",
          priceTerms: "",
          paymentTerms: ""
        },
        contacts: [{ name: "", designation: "", phone: "", email: "", info: "" }],
        materials: [{ itemId: "", deliveryDays: "", moq: "", uomId: "", rate: "", preferenceIndex: "" }]
      }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Promise.all(vendors.map(v => axios.post("/vendors", v)));
      toast.success("Vendors added successfully");
      onClose();
    } catch {
      toast.error("Failed to add vendors");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-2">
      <div className="bg-white w-full max-w-[98vw] max-h-[88vh] overflow-y-auto rounded-md border border-[#d8b76a] text-xs relative scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-gray-100 p-3">
        <button onClick={onClose} className="absolute right-3 top-3 text-sm text-gray-700 hover:text-red-600"><FiX /></button>
        <h2 className="text-base font-semibold text-[#292926] mb-3">Add Vendors</h2>
        <form onSubmit={handleSubmit}>
          {vendors.map((vendor, vendorIdx) => {
            const form = vendor.form;
            const contacts = vendor.contacts;
            const materials = vendor.materials;
            const states = State.getStatesOfCountry(form.country);
            const cities = City.getCitiesOfState(form.country, form.state);
            const factoryStates = State.getStatesOfCountry(form.factoryCountry);
            const factoryCities = City.getCitiesOfState(form.factoryCountry, form.factoryState);

            return (
              <div key={vendorIdx} className="border border-[#d8b76a] p-3 rounded mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-red-600 font-semibold underline">Vendor {vendorIdx + 1}</div>
                  <button type="button" onClick={() => setVendors(vendors.filter((_, i) => i !== vendorIdx))} className="text-red-600 text-sm"><FiX /></button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    ["Vendor Name", "vendorName"],
                    ["Nature of Business", "nature"],
                    ["Address", "address"],
                    ["Country", "country", Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }))],
                    ["State", "state", states.map(s => ({ value: s.isoCode, label: s.name }))],
                    ["City", "city", cities.map(c => ({ value: c.name, label: c.name }))],
                    ["Postal Code", "postalCode"],
                    ["GSTIN", "gstin"],
                    ["Factory Address", "factoryAddress"],
                    ["Factory Country", "factoryCountry", Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }))],
                    ["Factory State", "factoryState", factoryStates.map(s => ({ value: s.isoCode, label: s.name }))],
                    ["Factory City", "factoryCity", factoryCities.map(c => ({ value: c.name, label: c.name }))],
                    ["Factory Postal Code", "factoryPostalCode"],
                    ["Bank Name", "bankName"],
                    ["Branch", "branch"],
                    ["Account No.", "accountNo"],
                    ["IFSC Code", "ifscCode"],
                    ["Price Terms", "priceTerms"],
                    ["Payment Terms", "paymentTerms"]
                  ].map(([label, name, options]) => (
                    <div key={name} className="flex flex-col min-w-[150px] flex-1">
                      <label className="mb-[1px] text-[11px] font-medium">{label}</label>
                      {options ? (
                        <select name={name} value={form[name]} onChange={(e) => handleFormChange(vendorIdx, e)} className="border rounded px-2 py-[3px] text-[12px]">
                          <option value="">Select {label}</option>
                          {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input name={name} value={form[name]} onChange={(e) => handleFormChange(vendorIdx, e)} placeholder={label} className="border rounded px-2 py-[3px] text-[12px]" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Contacts */}
                <div className="mt-4 w-full">
                  <div className="font-semibold text-[13px] mb-1">Contact Persons</div>

                  {/* Header */}
                  <div className="grid grid-cols-5 text-[11px] font-semibold bg-gray-100 px-2 py-1 rounded">
                    <div>Name</div>
                    <div>Designation</div>
                    <div>Phone</div>
                    <div>Email</div>
                    <div>Info</div>
                  </div>

                  {/* Rows */}
                  {contacts.map((c, i) => (
                    <div key={i} className="flex gap-2 items-center mt-1 w-full">
                      <div className="grid grid-cols-5 gap-2 w-full">
                        <input
                          name="name"
                          value={c.name}
                          placeholder="Name"
                          onChange={(e) => handleContactChange(vendorIdx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px]"
                        />
                        <input
                          name="designation"
                          value={c.designation}
                          placeholder="Designation"
                          onChange={(e) => handleContactChange(vendorIdx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px]"
                        />
                        <input
                          name="phone"
                          value={c.phone}
                          placeholder="Phone"
                          onChange={(e) => handleContactChange(vendorIdx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px]"
                        />
                        <input
                          name="email"
                          value={c.email}
                          placeholder="Email"
                          onChange={(e) => handleContactChange(vendorIdx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px]"
                        />
                        <input
                          name="info"
                          value={c.info}
                          placeholder="Info"
                          onChange={(e) => handleContactChange(vendorIdx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeContact(vendorIdx, i)}
                        className="text-red-600 text-xs"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addContact(vendorIdx)}
                    type="button"
                    className="mt-2 bg-[#292926] text-white px-3 py-2 text-xs rounded"
                  >
                    + Add Contact
                  </button>
                </div>


                  {/* Materials */}
                  <div className="mt-4 w-full">
                    <div className="font-semibold text-[13px] mb-1">Raw Materials</div>

                    {/* Header */}
                    <div className="grid grid-cols-6 text-[11px] font-semibold bg-gray-100 px-2 py-1 rounded">
                      <div>Item</div>
                      <div>Delivery</div>
                      <div>MOQ</div>
                      <div>UOM</div>
                      <div>Rate</div>
                      <div>Index</div>
                    </div>

                    {/* Rows */}
                    {materials.map((m, i) => (
                      <div key={i} className="flex gap-2 items-center mt-1 w-full">
                        <div className="grid grid-cols-6 gap-2 w-full">
                          <select
                            value={m.itemId}
                            onChange={(e) => handleMaterialChange(vendorIdx, i, "itemId", e.target.value)}
                            className="border rounded px-2 py-[3px] text-[12px]"
                          >
                            <option value="">Raw Material</option>
                            {rms.map((r) => (
                              <option key={r._id} value={r._id}>
                                {r.skuCode} - {r.itemName}
                              </option>
                            ))}
                          </select>
                          <input
                            value={m.deliveryDays}
                            onChange={(e) => handleMaterialChange(vendorIdx, i, "deliveryDays", e.target.value)}
                            className="border rounded px-2 py-[3px] text-[12px]"
                            placeholder="Days"
                          />
                          <input
                            value={m.moq}
                            onChange={(e) => handleMaterialChange(vendorIdx, i, "moq", e.target.value)}
                            className="border rounded px-2 py-[3px] text-[12px]"
                            placeholder="MOQ"
                          />
                          <select
                            value={m.uomId}
                            onChange={(e) => handleMaterialChange(vendorIdx, i, "uomId", e.target.value)}
                            className="border rounded px-2 py-[3px] text-[12px]"
                          >
                            <option value="">UOM</option>
                            {uoms.map((u) => (
                              <option key={u._id} value={u._id}>
                                {u.unitName}
                              </option>
                            ))}
                          </select>
                          <input
                            value={m.rate}
                            onChange={(e) => handleMaterialChange(vendorIdx, i, "rate", e.target.value)}
                            className="border rounded px-2 py-[3px] text-[12px]"
                            placeholder="Rate"
                          />
                          <input
                            value={m.preferenceIndex}
                            onChange={(e) => handleMaterialChange(vendorIdx, i, "preferenceIndex", e.target.value)}
                            className="border rounded px-2 py-[3px] text-[12px]"
                            placeholder="Index"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMaterial(vendorIdx, i)}
                          className="text-red-600 text-xs"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => addMaterial(vendorIdx)}
                      type="button"
                      className="mt-2 bg-[#292926] text-white px-3 py-2 text-xs rounded"
                    >
                      + Add Material
                    </button>
                  </div>



              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={addVendor} className="bg-[#e0cda0] text-black px-4 py-[4px] text-sm rounded">+ Add</button>
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-[4px] text-sm rounded">Close</button>
            <button type="submit" className="bg-[#d8b76a] text-black px-5 py-[4px] text-sm rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorModal;
