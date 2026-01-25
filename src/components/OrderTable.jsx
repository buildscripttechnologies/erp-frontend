import { FiFileText, FiEdit2 } from "react-icons/fi";

// OrderTable.jsx
export function OrderTable({ title, columns, data }) {
  return (
    <div className="mt-8 w-full">
      {/* Card Container */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#292927] to-[#3a3a37] px-8 py-3 flex items-center justify-between">
          <h3 className="text-white text-lg font-bold tracking-wide">
            {title}
          </h3>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#d8b76a] bg-gray-50">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-2 text-left text-xs font-bold text-[#292927] uppercase tracking-widest"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                <>
                  {data.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-[#d8b76a]/8 transition-colors duration-200"
                    >
                      {row.map((cell, j) => (
                        <td 
                          key={j} 
                          className="px-4 py-3 text-sm text-gray-700 font-medium"
                        >
                          {cell === "pdf" ? (
                            <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#d8b76a]/10 hover:bg-[#d8b76a]/20 transition-colors">
                              <FiFileText
                                className="text-[#d8b76a] text-lg"
                                title="View PDF"
                              />
                            </button>
                          ) : cell === "action" ? (
                            <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#d8b76a]/10 hover:bg-[#d8b76a]/20 transition-colors">
                              <FiEdit2
                                className="text-[#d8b76a] text-lg"
                                title="Edit"
                              />
                            </button>
                          ) : (
                            cell
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan="100%" className="text-center py-12">
                    <div className="text-gray-400 font-medium">No Data Found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
