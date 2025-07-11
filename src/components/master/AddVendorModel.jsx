import { useEffect, useState } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import axios from "../../utils/axios";
import { Country, State, City } from "country-state-city";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import Select from "react-select";

const AddVendorModal = ({ onClose }) => {
  const [vendors, setVendors] = useState([
    {
      form: {
        venderCode: "",
        vendorName: "",
        natureOfBusiness: "",
        address: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",
        gst: "",
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
        paymentTerms: "",
      },
      contactPersons: [
        {
          contactPerson: "",
          designation: "",
          phone: "",
          email: "",
          information: "",
        },
      ],
      rm: [
        {
          itemId: "",
          type: "RM",
          deliveryDays: "",
          moq: "",
          uomId: "",
          rate: "",
          preferenceIndex: "",
        },
      ],
    },
  ]);

  AddVendorModal.propTypes = {
    onClose: PropTypes.func.isRequired,
  };

  const [uoms, setUoms] = useState([]);
  const [rms, setRms] = useState([]);
  const [sfgs, setSfgs] = useState([]);
  const [fgs, setFgs] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [uomRes, rmRes, sfgRes, fgRes] = await Promise.all([
          axios.get("/uoms/all-uoms?limit=1000"),
          axios.get("/rms/rm?limit=1000"),
          axios.get("/sfgs/get-all?limit=1000"),
          axios.get("/fgs/get-all?limit=1000"),
        ]);
        setUoms(uomRes.data.data || []);
        setRms(rmRes.data.rawMaterials || []);
        setSfgs(sfgRes.data.data || []);
        setFgs(fgRes.data.data || []);
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

  const handleFactoryChange = (vendorIdx, e) => {
    const newVendors = [...vendors];
    newVendors[vendorIdx].factory[e.target.name] = e.target.value;
    setVendors(newVendors);
  };

  const handleContactChange = (vendorIdx, contactIdx, e) => {
    const updated = [...vendors];
    updated[vendorIdx].contactPersons[contactIdx][e.target.name] =
      e.target.value;
    setVendors(updated);
  };

  const handleMaterialChange = (vendorIdx, materialIdx, key, value) => {
    console.log(vendorIdx, materialIdx, key, value);

    const updated = [...vendors];
    updated[vendorIdx].rm[materialIdx][key] = value;
    setVendors(updated);
  };

  const addContact = (vendorIdx) => {
    const updated = [...vendors];
    updated[vendorIdx].contactPersons.push({
      contactPerson: "",
      designation: "",
      phone: "",
      email: "",
      information: "",
    });
    setVendors(updated);
  };

  const removeContact = (vendorIdx, contactIdx) => {
    const updated = [...vendors];
    updated[vendorIdx].contactPersons.splice(contactIdx, 1);
    setVendors(updated);
  };

  const addMaterial = (vendorIdx) => {
    const updated = [...vendors];
    updated[vendorIdx].rm.push({
      itemId: "",
      type: "", // default to RM
      deliveryDays: "",
      moq: "",
      uomId: "",
      rate: "",
      preferenceIndex: "",
    });

    setVendors(updated);
  };

  const removeMaterial = (vendorIdx, materialIdx) => {
    const updated = [...vendors];
    updated[vendorIdx].rm.splice(materialIdx, 1);
    setVendors(updated);
  };

  const addVendor = () => {
    setVendors([
      ...vendors,
      {
        form: {
          venderCode: "",
          vendorName: "",
          natureOfBusiness: "",
          address: "",
          country: "",
          state: "",
          city: "",
          postalCode: "",
          gst: "",

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
          paymentTerms: "",
        },
        contactPersons: [
          {
            contactPerson: "",
            designation: "",
            phone: "",
            email: "",
            information: "",
          },
        ],
        rm: [
          {
            itemId: "",
            type: "",
            deliveryDays: "",
            moq: "",
            uomId: "",
            rate: "",
            preferenceIndex: "",
          },
        ],
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = vendors.map(({ form, contactPersons, rm }) => ({
        // venderCode: form.venderCode,
        vendorName: form.vendorName,
        natureOfBusiness: form.natureOfBusiness,
        address: form.address,
        country: form.country,
        state: form.state,
        city: form.city,
        postalCode: form.postalCode,
        gst: form.gst,
        factoryAddress: form.factoryAddress,
        factoryCountry: form.factoryCountry,
        factoryState: form.factoryState,
        factoryCity: form.factoryCity,
        factoryPostalCode: form.factoryPostalCode,
        bankName: form.bankName,
        branch: form.branch,
        accountNo: form.accountNo,
        ifscCode: form.ifscCode,
        priceTerms: form.priceTerms,
        paymentTerms: form.paymentTerms,
        contactPersons: contactPersons.map((cp) => ({
          contactPerson: cp.contactPerson,
          designation: cp.designation,
          phone: cp.phone,
          email: cp.email,
          information: cp.information,
        })),
        rm: rm
          ?.filter((mat) => mat?.itemId) // only include if item is selected
          .map((mat) => {
            const matchedRM = rms.find((r) => r.id === mat.itemId);
            const matchedSFG = sfgs.find((s) => s.id === mat.itemId);
            const matchedFG = fgs.find((f) => f.id === mat.itemId);

            let type = "";
            if (matchedRM) type = "RawMaterial";
            else if (matchedSFG) type = "SFG";
            else if (matchedFG) type = "FG";

            return {
              item: mat.itemId,
              type,
              deliveryDays: +mat.deliveryDays,
              moq: +mat.moq,
              uom: mat.uomId,
              rate: +mat.rate,
              preferenceIndex: mat.preferenceIndex,
            };
          }),
      }));

      console.log("payload", vendors);

      await axios.post("/vendors/add-many", { vendors: payload });
      toast.success("Vendors added successfully");
      onClose();
    } catch (err) {
      console.error("Submit Error:", err.response?.data || err.message);
      toast.error("Failed to add vendors");
    }
  };

  const materialOptions = [
    ...rms.map((r) => ({
      value: r.id,
      label: `${r.skuCode} - ${r.itemName}`,
      type: "RawMaterial",
    })),
    ...sfgs.map((s) => ({
      value: s.id,
      label: `${s.skuCode} - ${s.itemName}`,
      type: "SFG",
    })),
    ...fgs.map((f) => ({
      value: f.id,
      label: `${f.skuCode} - ${f.itemName}`,
      type: "FG",
    })),
  ];

  // console.log("materials", materialOptions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-2">
      <div className="bg-white w-full max-w-[98vw] max-h-[88vh] overflow-y-auto rounded-md border border-[#d8b76a] text-xs relative scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-gray-100 p-3">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-sm text-gray-700 hover:text-red-600 cursor-pointer"
        >
          <FiX />
        </button>
        <h2 className="text-base font-semibold text-[#292926] mb-3">
          Add Vendors
        </h2>
        <form onSubmit={handleSubmit}>
          {vendors.map((vendor, vendorIdx) => {
            const form = vendor.form;
            const contacts = vendor.contactPersons;
            const materials = vendor.rm;
            const states = State.getStatesOfCountry(form.country);
            const cities = City.getCitiesOfState(form.country, form.state);
            const factoryStates = State.getStatesOfCountry(form.factoryCountry);
            const factoryCities = City.getCitiesOfState(
              form.factoryCountry,
              form.factoryState
            );

            return (
              <div
                key={vendorIdx}
                className="border border-[#d8b76a] p-3 rounded mb-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[#d8b76a] font-semibold underline">
                    Vendor {vendorIdx + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setVendors(vendors.filter((_, i) => i !== vendorIdx))
                    }
                    className="text-red-600 text-sm cursor-pointer"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    ["Vendor Name", "vendorName"],
                    ["Nature of Business", "natureOfBusiness"],
                    ["Address", "address"],
                    [
                      "Country",
                      "country",
                      Country.getAllCountries().map((c) => ({
                        value: c.isoCode, // ✅ use ISO code here
                        label: c.name,
                      })),
                    ],
                    [
                      "State",
                      "state",
                      State.getStatesOfCountry(form.country).map((s) => ({
                        value: s.isoCode,
                        label: s.name,
                      })),
                    ],
                    [
                      "City",
                      "city",
                      City.getCitiesOfState(form.country, form.state).map(
                        (c) => ({
                          value: c.name,
                          label: c.name,
                        })
                      ),
                    ],

                    ["Postal Code", "postalCode"],
                    ["GSTIN", "gst"],
                    ["Factory Address", "factoryAddress"],
                    [
                      "Factory Country",
                      "factoryCountry",
                      Country.getAllCountries().map((c) => ({
                        value: c.isoCode, // ✅ use ISO code here
                        label: c.name,
                      })),
                    ],
                    [
                      "Factory State",
                      "factoryState",
                      State.getStatesOfCountry(form.factoryCountry).map(
                        (s) => ({
                          value: s.isoCode,
                          label: s.name,
                        })
                      ),
                    ],
                    [
                      "Factory City",
                      "factoryCity",
                      City.getCitiesOfState(
                        form.factoryCountry,
                        form.factoryState
                      ).map((c) => ({
                        value: c.name,
                        label: c.name,
                      })),
                    ],
                    ["Factory Postal Code", "factoryPostalCode"],
                    ["Bank Name", "bankName"],
                    ["Branch", "branch"],
                    ["Account No.", "accountNo"],
                    ["IFSC Code", "ifscCode"],
                    ["Price Terms", "priceTerms"],
                    ["Payment Terms", "paymentTerms"],
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
                          value={form[name]}
                          onChange={(e) => handleFormChange(vendorIdx, e)}
                          className="border rounded border-[#d8b76a] px-2 py-[3px] text-[12px] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
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
                          required={name == "vendorName" ? true : false}
                          name={name}
                          value={form[name]}
                          onChange={(e) => handleFormChange(vendorIdx, e)}
                          placeholder={label}
                          className="border border-[#d8b76a] rounded px-2 py-[3px] text-[12px] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Contacts */}
                <div className="mt-4 w-full">
                  <div className="font-semibold text-[13px] mb-1 text-[#d8b76a]">
                    Contact Persons
                  </div>

                  {/* Header */}
                  <div className="grid grid-cols-5 text-[11px] font-semibold bg-[#d8b76a]/50 px-2 py-1 rounded">
                    <div>Name</div>
                    <div>Designation</div>
                    <div>Phone</div>
                    <div>Email</div>
                    <div>Info</div>
                  </div>

                  {/* Rows */}
                  {contacts.map((c, i) => (
                    <div
                      key={i}
                      className="flex gap-2 items-center mt-1 w-full "
                    >
                      <div className="grid grid-cols-5 gap-2 w-full">
                        <input
                          name="contactPerson"
                          value={c.name}
                          placeholder="Name"
                          onChange={(e) => handleContactChange(vendorIdx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px] border-[#d8b76a] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                        />
                        <input
                          name="designation"
                          value={c.designation}
                          placeholder="Designation"
                          onChange={(e) => handleContactChange(vendorIdx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px] border-[#d8b76a] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                        />
                        <input
                          name="phone"
                          value={c.phone}
                          placeholder="Phone"
                          onChange={(e) => handleContactChange(vendorIdx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px] border-[#d8b76a] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                        />
                        <input
                          name="email"
                          value={c.email}
                          placeholder="Email"
                          onChange={(e) => handleContactChange(vendorIdx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px] border-[#d8b76a] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                        />
                        <input
                          name="information"
                          value={c.info}
                          placeholder="Info"
                          onChange={(e) => handleContactChange(vendorIdx, i, e)}
                          className="border rounded px-2 py-[3px] text-[12px] border-[#d8b76a] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeContact(vendorIdx, i)}
                        className="text-red-600 text-xs cursor-pointer"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addContact(vendorIdx)}
                    type="button"
                    className="mt-2 bg-[#d8b76a]/50 text-black px-3 py-2 text-xs rounded cursor-pointer"
                  >
                    + Add Contact
                  </button>
                </div>

                {/* Materials */}
                <div className="mt-4 w-full">
                  <div className="font-semibold text-[13px] mb-1 text-[#d8b76a] ">
                    Raw Materials
                  </div>

                  {/* Header */}
                  <div className="grid grid-cols-6 text-[11px] font-semibold bg-[#d8b76a]/50 px-2 py-1 rounded ">
                    <div>Item</div>
                    <div>Delivery</div>
                    <div>MOQ</div>
                    <div>UOM</div>
                    <div>Rate</div>
                    <div>Index</div>
                  </div>

                  {/* Rows */}
                  {materials.map((m, i) => (
                    <div
                      key={i}
                      className="flex gap-2 items-center mt-1 w-full"
                    >
                      <div className="grid grid-cols-6 gap-2 w-full">
                        <Select
                          options={materialOptions}
                          placeholder="Select Material"
                          value={materialOptions.find(
                            (opt) => opt.value === m.item && opt.type === m.type
                          )}
                          onChange={(selected) => {
                            if (selected) {
                              handleMaterialChange(
                                vendorIdx,
                                i,
                                "itemId",
                                selected.value
                              );
                              handleMaterialChange(
                                vendorIdx,
                                i,
                                "type",
                                selected.type
                              );
                            } else {
                              handleMaterialChange(vendorIdx, i, "itemId", "");
                              handleMaterialChange(vendorIdx, i, "type", "");
                            }
                          }}
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              borderColor: "#d8b76a",
                              boxShadow: state.isFocused
                                ? "0 0 0 1px #d8b76a"
                                : "none",
                              "&:hover": {
                                borderColor: "#d8b76a",
                              },
                            }),
                          }}
                          isClearable
                          className="text-[12px] "
                        />

                        <input
                          value={m.deliveryDays}
                          onChange={(e) =>
                            handleMaterialChange(
                              vendorIdx,
                              i,
                              "deliveryDays",
                              e.target.value
                            )
                          }
                          className="border rounded px-2 py-[3px] text-[12px] border-[#d8b76a] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                          placeholder="Days"
                        />
                        <input
                          value={m.moq}
                          onChange={(e) =>
                            handleMaterialChange(
                              vendorIdx,
                              i,
                              "moq",
                              e.target.value
                            )
                          }
                          className="border rounded px-2 py-[3px] text-[12px] border-[#d8b76a] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                          placeholder="MOQ"
                        />
                        <select
                          value={m.uomId}
                          onChange={(e) =>
                            handleMaterialChange(
                              vendorIdx,
                              i,
                              "uomId",
                              e.target.value
                            )
                          }
                          className="border rounded px-2 py-[3px] text-[12px] border-[#d8b76a] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
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
                          onChange={(e) =>
                            handleMaterialChange(
                              vendorIdx,
                              i,
                              "rate",
                              e.target.value
                            )
                          }
                          className="border rounded px-2 py-[3px] text-[12px] border-[#d8b76a] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                          placeholder="Rate"
                        />
                        <input
                          value={m.preferenceIndex}
                          onChange={(e) =>
                            handleMaterialChange(
                              vendorIdx,
                              i,
                              "preferenceIndex",
                              e.target.value
                            )
                          }
                          className="border rounded px-2 py-[3px] text-[12px] border-[#d8b76a] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                          placeholder="Index"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMaterial(vendorIdx, i)}
                        className="text-red-600 text-xs cursor-pointer"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addMaterial(vendorIdx)}
                    type="button"
                    className="mt-2 bg-[#d8b76a]/50 text-black px-3 py-2 text-xs rounded cursor-pointer"
                  >
                    + Add Material
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={addVendor}
              className="bg-[#e0cda0] text-black px-4 py-[4px] text-sm rounded cursor-pointer"
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
              className="bg-[#d8b76a] text-black px-5 py-[4px] text-sm rounded cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorModal;
