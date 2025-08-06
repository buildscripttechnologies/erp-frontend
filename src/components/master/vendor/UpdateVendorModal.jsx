import { useEffect, useState } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import axios from "../../../utils/axios";
import { Country, State, City } from "country-state-city";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import Select from "react-select";

const UpdateVendorModal = ({
  vendorData,
  onClose,
  onSuccess,
  uoms,
  rms,
  sfgs,
  fgs,
}) => {
  const [vendors, setVendors] = useState([
    {
      form: vendorData || {},
      contactPersons: vendorData?.contactPersons || [],
      rm:
        vendorData?.rm?.map((mat) => ({
          itemId: mat.item?._id || mat.item,
          type: mat.type,
          deliveryDays: mat.deliveryDays,
          moq: mat.moq,
          uomId: mat.uom?._id || mat.uom,
          rate: mat.rate,
          preferenceIndex: mat.preferenceIndex,
        })) || [],
    },
  ]);

  const handleFormChange = (vendorIdx, e) => {
    const newVendors = [...vendors];
    newVendors[vendorIdx].form[e.target.name] = e.target.value;
    setVendors(newVendors);
  };

  const handleContactChange = (vendorIdx, contactIdx, e) => {
    const updated = [...vendors];
    updated[vendorIdx].contactPersons[contactIdx][e.target.name] =
      e.target.value;
    setVendors(updated);
  };

  const handleMaterialChange = (vendorIdx, materialIdx, key, value) => {
    console.log("mat", vendorIdx, materialIdx, key, value);

    const updated = [...vendors];
    updated[vendorIdx].rm[materialIdx][key] = value;
    setVendors(updated);
  };
  const handleMaterialSelect = (vendorIdx, materialIdx, selected) => {
    const updated = [...vendors];
    console.log("selected", selected);

    updated[vendorIdx].rm[materialIdx] = {
      ...updated[vendorIdx].rm[materialIdx],
      itemId: selected?.value || "",
      type: selected?.type || "",
    };
    setVendors(updated);
  };

  const addContact = () => {
    const updated = [...vendors];
    updated[0].contactPersons.push({
      contactPerson: "",
      designation: "",
      phone: "",
      email: "",
      information: "",
    });
    setVendors(updated);
  };

  const removeContact = (contactIdx) => {
    const updated = [...vendors];
    updated[0].contactPersons.splice(contactIdx, 1);
    setVendors(updated);
  };

  const addMaterial = () => {
    const updated = [...vendors];
    updated[0].rm.push({
      itemId: "",
      type: "",
      deliveryDays: "",
      moq: "",
      uomId: "",
      rate: "",
      preferenceIndex: "",
    });
    setVendors(updated);
  };

  const removeMaterial = (materialIdx) => {
    const updated = [...vendors];
    updated[0].rm.splice(materialIdx, 1);
    setVendors(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = vendors[0];
    const payload = {
      ...v.form,
      contactPersons: v.contactPersons,
      rm: v.rm.map((mat) => ({
        item: mat.itemId,
        type: mat.type,
        deliveryDays: +mat.deliveryDays,
        moq: +mat.moq,
        uom: mat.uomId,
        rate: +mat.rate,
        preferenceIndex: mat.preferenceIndex,
      })),
    };

    try {
      let res = await axios.patch(`/vendors/update/${vendorData._id}`, payload);
      if (res.data.status == 403) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Vendor updated successfully");
      onSuccess();
    } catch (err) {
      console.error("Update Error:", err);
      toast.error("Failed to update vendor");
    }
  };

  const materialOptions = [
    ...rms.map((r) => ({
      value: r.id,
      label: `${r.skuCode} - ${r.itemName} - ${r.description}`,
      type: "RawMaterial",
    })),
    ...sfgs.map((s) => ({
      value: s.id,
      label: `${s.skuCode} - ${s.itemName} - ${s.description}`,
      type: s.type,
    })),
    ...fgs.map((f) => ({
      value: f.id,
      label: `${f.skuCode} - ${f.itemName} - ${f.description}`,
      type: f.type,
    })),
  ];

  const vendor = vendors[0];
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-2">
      <div className="bg-white w-full max-w-[98vw] max-h-[88vh] overflow-y-auto rounded-md border border-[#d8b76a] text-xs relative scrollbar-thin scrollbar-thumb-[#d8b76a] scrollbar-track-gray-100 p-3">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-sm text-gray-700 hover:text-red-600 cursor-pointer"
        >
          <FiX />
        </button>
        <h2 className="text-base font-semibold text-[#d8b76a] mb-3 underline">
          Update Vendor
        </h2>
        <form onSubmit={handleSubmit}>
          {vendors.map((vendor, vendorIdx = 0) => {
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
                    className="text-black hover:text-red-600 text-sm cursor-pointer"
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
                    ["PAN", "pan"],
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
                      className="flex flex-col max-w-[150px] flex-1"
                    >
                      <label className="mb-[1px] text-[11px] font-medium text-[#292926]">
                        {label}
                      </label>
                      {options ? (
                        <select
                          name={name}
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
                          className="border border-[#d8b76a] max-w-[400px] rounded px-2 py-[3px] text-[12px] focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Contact Persons */}
                <div className="mt-4 w-full">
                  <div className="font-semibold text-[14px] mb-1 text-[#d8b76a] underline">
                    Contact Persons
                  </div>

                  {/* Header (hide on mobile) */}
                  {/* <div className="hidden md:grid grid-cols-5 text-[11px] font-semibold bg-[#d8b76a]/80 px-2 py-1 rounded">
                    <div>Name</div>
                    <div>Designation</div>
                    <div>Phone</div>
                    <div>Email</div>
                    <div>Info</div>
                  </div> */}

                  {/* Rows */}
                  {contacts.map((c, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 mt-2 w-full md:flex-row md:items-center"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 w-full">
                        <div className="flex flex-col">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            Name
                          </label>
                          <input
                            name="contactPerson"
                            value={c.contactPerson}
                            placeholder="Name"
                            onChange={(e) =>
                              handleContactChange(vendorIdx, i, e)
                            }
                            className="border rounded px-2 py-[6px] text-[12px] border-[#d8b76a] focus:border-2 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            Designation
                          </label>
                          <input
                            name="designation"
                            value={c.designation}
                            placeholder="Designation"
                            onChange={(e) =>
                              handleContactChange(vendorIdx, i, e)
                            }
                            className="border rounded px-2 py-[6px] text-[12px] border-[#d8b76a] focus:border-2 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            Phone
                          </label>
                          <input
                            name="phone"
                            value={c.phone}
                            placeholder="Phone"
                            onChange={(e) =>
                              handleContactChange(vendorIdx, i, e)
                            }
                            className="border rounded px-2 py-[6px] text-[12px] border-[#d8b76a] focus:border-2 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            Email
                          </label>
                          <input
                            name="email"
                            value={c.email}
                            placeholder="Email"
                            onChange={(e) =>
                              handleContactChange(vendorIdx, i, e)
                            }
                            className="border rounded px-2 py-[6px] text-[12px] border-[#d8b76a] focus:border-2 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            Information
                          </label>
                          <input
                            name="information"
                            value={c.information}
                            placeholder="Info"
                            onChange={(e) =>
                              handleContactChange(vendorIdx, i, e)
                            }
                            className="border rounded px-2 py-[6px] text-[12px] border-[#d8b76a] focus:border-2 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeContact(vendorIdx, i)}
                        className="self-start mt-5 flex gap-1 items-center text-red-600  text-sm rounded cursor-pointer hover:underline"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addContact(vendorIdx)}
                    type="button"
                    className="mt-3 bg-[#d8b76a] text-black px-3 py-2 text-xs rounded hover:bg-[#d8b76a]/80 cursor-pointer"
                  >
                    + Add Contact
                  </button>
                </div>

                {/* Materials */}
                <div className="mt-6 w-full">
                  <div className="font-semibold text-[14px] mb-1 text-[#d8b76a] underline">
                    Raw Materials
                  </div>

                  {/* Header (hidden on small screens) */}
                  {/* <div className="hidden md:grid grid-cols-6 text-[11px] font-semibold bg-[#d8b76a]/80 px-2 py-1 rounded">
                    <div>Item</div>
                    <div>Delivery</div>
                    <div>MOQ</div>
                    <div>UOM</div>
                    <div>Rate</div>
                    <div>Index</div>
                  </div> */}

                  {/* Rows */}
                  {materials.map((m, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 mt-2 w-full md:flex-row md:items-center"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2 w-full">
                        <div className="flex flex-col md:col-span-2">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            Item
                          </label>
                          <Select
                            options={materialOptions}
                            placeholder="Select Material"
                            value={materialOptions.find(
                              (opt) =>
                                opt.value === m.itemId && opt.type === m.type
                            )}
                            onChange={(selected) =>
                              handleMaterialSelect(vendorIdx, i, selected)
                            }
                            styles={{
                              control: (base, state) => ({
                                ...base,
                                borderColor: "#d8b76a",
                                boxShadow: state.isFocused
                                  ? "0 0 0 1px #d8b76a"
                                  : "none",
                                "&:hover": { borderColor: "#d8b76a" },
                              }),
                            }}
                            isClearable
                            className="text-[12px]"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            Delivery
                          </label>
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
                            className="border rounded px-2 py-[10px] text-[12px] border-[#d8b76a] focus:border-2 focus:outline-none"
                            placeholder="Days"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            MOQ
                          </label>
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
                            className="border rounded px-2 py-[10px] text-[12px] border-[#d8b76a] focus:border-2 focus:outline-none"
                            placeholder="MOQ"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            UOM
                          </label>
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
                            className="border rounded px-2 py-[9px] text-[12px] border-[#d8b76a] focus:border-2 focus:outline-none cursor-pointer"
                          >
                            <option value="">UOM</option>
                            {uoms.map((u) => (
                              <option key={u._id} value={u._id}>
                                {u.unitName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            Rate
                          </label>
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
                            className="border rounded px-2 py-[10px] text-[12px] border-[#d8b76a] focus:border-2 focus:outline-none"
                            placeholder="Rate"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[11px] font-medium text-[#292926] mb-1">
                            Index
                          </label>
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
                            className="border rounded px-2 py-[10px] text-[12px] border-[#d8b76a] focus:border-2 focus:outline-none"
                            placeholder="Index"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMaterial(vendorIdx, i)}
                        className="self-start flex gap-1 items-center mt-6 text-red-600  text-sm rounded cursor-pointer hover:underline"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addMaterial(vendorIdx)}
                    type="button"
                    className="mt-3 bg-[#d8b76a] text-black px-3 py-2 text-xs rounded hover:bg-[#d8b76a]/80 cursor-pointer"
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
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-[4px] text-sm rounded cursor-pointer hover:bg-gray-400 "
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-[#d8b76a] text-black px-5 py-[4px] text-sm rounded cursor-pointer hover:bg-[#d8b76a]/80"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UpdateVendorModal.propTypes = {
  vendorData: PropTypes.object.isRequired,
  uoms: PropTypes.array.isRequired,
  rms: PropTypes.array.isRequired,
  sfgs: PropTypes.array.isRequired,
  fgs: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default UpdateVendorModal;
