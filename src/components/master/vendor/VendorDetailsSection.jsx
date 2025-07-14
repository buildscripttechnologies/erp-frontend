const VendorDetailsSection = ({ vendorData }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="bg-white border border-[#d8b76a] rounded shadow p-4 mx-2 mb-2 text-[11px] text-[#292926]">
      <h2 className="text-[14px] text-[#d8b76a] font-bold underline underline-offset-4 mb-2">
        Additional Vendor Details
      </h2>
      <table className="w-full text-[11px] border border-[#d8b76a] mb-4 rounded ">
        <tbody className="rounded">
          <tr className="border-b border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Factory/Store Address
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {vendorData.factoryAddress || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1  border-r border-[#d8b76a]">
              Factory City
            </td>
            <td className="px-2 py-1">{vendorData.factoryCity || "-"}</td>
          </tr>
          <tr className="border-b  border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1  border-r border-[#d8b76a]">
              Factory State{" "}
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {vendorData.factoryState || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Factory Postal Code
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {vendorData.factoryPostalCode || "-"}
            </td>
          </tr>
          <tr className="border-b  border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1  border-r border-[#d8b76a]">
              Bank Name
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {vendorData.bankName || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Branch
            </td>
            <td className="px-2 py-1">{vendorData.branch || "-"}</td>
          </tr>
          <tr className="border-b  border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1  border-r border-[#d8b76a]">
              Account No.
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {vendorData.accountNo || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              IFSC Code{" "}
            </td>
            <td className="px-2 py-1">{vendorData.ifscCode || "-"}</td>
          </tr>
          <tr className="border-b border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Price Terms{" "}
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {vendorData.priceTerms || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Payment Terms{" "}
            </td>
            <td className="px-2 py-1">{vendorData.paymentTerms || "-"}</td>
          </tr>
          <tr>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Created At
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {new Date(vendorData.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Updated At
            </td>
            <td className="px-2 py-1">
              {" "}
              {new Date(vendorData.updatedAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Contact Persons */}
      <h2 className="font-bold text-[#d8b76a] text-[14px] underline underline-offset-4 mb-2">
        Contact Persons
      </h2>
      <table className="w-full mb-4 text-[11px] border text-left">
        <thead className="bg-[#d8b76a]/70">
          <tr className="">
            <th className="px-2">S. No.</th>
            <th className="px-2">Created At </th>
            <th className="px-2">Updated At </th>
            <th className="px-2">Contact Person </th>
            <th className="px-2">Designation</th>
            <th className="px-2">Phone</th>
            <th className="px-2">Email</th>
            <th className="px-2">Information</th>
            <th className="px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {vendorData.contactPersons.map((c, idx) => (
            <tr key={idx} className="border-b border-[#d8b76a]">
              <td className="border-r border-[#d8b76a] px-2">{idx + 1}</td>
              <td className="border-r border-[#d8b76a] px-2">
                {new Date(vendorData.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {new Date(vendorData.updatedAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {c.contactPerson || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {c.designation || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {c.phone || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {c.email || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {c.information || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {c.isActive ? "Active" : "False"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Materials */}
      <h3 className="font-bold text-[#d8b76a] text-[14px] underline underline-offset-4 mb-2">
        Supplied Materials
      </h3>
      <table className="w-full mb-4 text-[11px] border text-left ">
        <thead className="bg-[#d8b76a]/70">
          <tr>
            <th className="px-2">S. No.</th>
            <th className="px-2">Created At</th>
            <th className="px-2">Updated At</th>
            <th className="px-2">SKU</th>
            <th className="px-2">Item Name</th>
            <th className="px-2">Description</th>
            <th className="px-2">HSN Code</th>
            <th className="px-2">Type</th>
            <th className="px-2">UOM</th>
            <th className="px-2">Lead Time</th>
            <th className="px-2">MOQ</th>
            <th className="px-2">UOM</th>
            <th className="px-2">Rate</th>
            <th className="px-2">Pref</th>
            <th className="px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {vendorData.rm.map((r, idx) => (
            <tr key={idx} className="border-b border-[#d8b76a]">
              <td className="border-r border-[#d8b76a] px-2">{idx + 1}</td>
              <td className="border-r border-[#d8b76a] px-2">
                {new Date(vendorData.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {new Date(vendorData.updatedAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.item?.skuCode || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.item?.itemName || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.item?.description || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.item?.hsnOrSac || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.item?.type || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.item?.UOM
                  ? r.item.UOM?.unitName || "-"
                  : r.item.stockUOM?.unitName || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.deliveryDays || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">{r.moq || "-"}</td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.uom?.unitName || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.rate || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.preferenceIndex || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {r.item.status || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorDetailsSection;
