import { FiFileText, FiEdit2 } from "react-icons/fi";

// OrderTable.jsx
export function OrderTable({ title, columns, data }) {
  return (
    <div className="bg-white shadow-md drop-shadow-sm scrollbar-hide rounded-lg overflow-x-auto mt-6 pb-3">
      <h3 className="px-4 py-4 text-[#d8b76a] text-2xl font-semibold ">
        {title}
      </h3>
      <table className="min-w-full text-left text-sm">
        <thead className="border-y border-[#d8b76a]">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-2 text-lg text-black font-semibold"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-[#d8b76a]/40 hover:bg-gray-50 text-base">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2">
                  {cell === "pdf" ? (
                    <FiFileText
                      className="text-[#d8b76a] font-extrabold text-2xl cursor-pointer"
                      title="View PDF"
                    />
                  ) : cell === "action" ? (
                    <FiEdit2
                      className="text-[#d8b76a] font-extrabold text-xl cursor-pointer"
                      title="Edit"
                    />
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
