const CustomerDetailsSection = ({ customerData }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="bg-white border border-[#d8b76a] rounded shadow p-4 mx-2 mb-2 text-[11px] text-[#292926]">
      <h2 className="text-[14px] text-[#d8b76a] font-bold underline underline-offset-4 mb-2">
        Additional Customer Details
      </h2>
      <table className="w-full text-[11px] border border-[#d8b76a] mb-4 rounded ">
        <tbody className="rounded">
          <tr className="border-b border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Bank Name
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {customerData.bankName || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1  border-r border-[#d8b76a]">
              Branch{" "}
            </td>
            <td className="px-2 py-1">{customerData.branch || "-"}</td>
          </tr>
          <tr className="border-b  border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1  border-r border-[#d8b76a]">
              IFSC Code
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {customerData.ifscCode || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Agent Name
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {customerData.agentName || "-"}
            </td>
          </tr>
          <tr className="border-b  border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1  border-r border-[#d8b76a]">
              Payment Terms
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {customerData.paymentTerms || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Total PO Value
            </td>
            <td className="px-2 py-1">{customerData.totalPo || "-"}</td>
          </tr>
          <tr className="border-b  border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1  border-r border-[#d8b76a]">
              Lead Competitor
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {customerData.leadCompetitor || "-"}
            </td>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Transportation Time
            </td>
            <td className="px-2 py-1">
              {customerData.transportationTime || "-"}
            </td>
          </tr>
          <tr className="border-b border-[#d8b76a]">
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Created At
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {new Date(customerData.createdAt).toLocaleString("en-IN", {
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
              {new Date(customerData.updatedAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </td>
          </tr>
          {/* <tr>
            <td className="font-semibold bg-[#f8f8f8] px-2 py-1 border-r border-[#d8b76a]">
              Created At
            </td>
            <td className="px-2 py-1 border-r border-[#d8b76a]">
              {new Date(customerData.createdAt).toLocaleString("en-IN", {
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
              {new Date(customerData.updatedAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </td>
          </tr> */}
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
            {/* <th className="px-2">Information</th> */}
            <th className="px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {customerData.contactPersons.map((c, idx) => (
            <tr key={idx} className="border-b border-[#d8b76a]">
              <td className="border-r border-[#d8b76a] px-2">{idx + 1}</td>
              <td className="border-r border-[#d8b76a] px-2">
                {new Date(customerData.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {new Date(customerData.updatedAt).toLocaleString("en-IN", {
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
              {/* <td className="border-r border-[#d8b76a] px-2">
                {c.information || "-"}
              </td> */}
              <td className="border-r border-[#d8b76a] px-2">
                {c.isActive ? "Active" : "Not Active"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Materials */}
      <h3 className="font-bold text-[#d8b76a] text-[14px] underline underline-offset-4 mb-2">
        Delivery Locations
      </h3>
      <table className="w-full mb-4 text-[11px] border text-left ">
        <thead className="bg-[#d8b76a]/70">
          <tr>
            <th className="px-2">S. No.</th>
            <th className="px-2">Consignee Name</th>
            <th className="px-2">Consignee Address</th>
            <th className="px-2">City</th>
            <th className="px-2">State</th>
            <th className="px-2">Country</th>
            <th className="px-2">Pin Code</th>
            <th className="px-2">GSTIN of Consignee</th>
            <th className="px-2">Store Incharge </th>
            <th className="px-2">Contact No</th>
            <th className="px-2">Email</th>
            <th className="px-2">Status</th>
            <th className="px-2">Created At</th>
            <th className="px-2">Updated At</th>
            {/* <th className="px-2">Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {customerData.deliveryLocations.map((d, idx) => (
            <tr key={idx} className="border-b border-[#d8b76a]">
              <td className="border-r border-[#d8b76a] px-2">{idx + 1}</td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.consigneeName || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.consigneeAddress || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.city || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.state || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.country || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.pinCode || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.gstinOfConsignee || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.storeIncharge || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.contactNo || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.email || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {d.isActive ? "Active" : "Not Active" || "-"}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {new Date(customerData.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
              <td className="border-r border-[#d8b76a] px-2">
                {new Date(customerData.updatedAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
              {/* <td className="border-r border-[#d8b76a] px-2"></td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerDetailsSection;
