import { span } from "framer-motion/client";
import { FiFileText, FiEdit2 } from "react-icons/fi";

// OrderTable.jsx
export function OrderTable({ title, columns, data }) {
  console.log("data", data);

  return (
    <div className="bg-white shadow-md drop-shadow-sm  whitespace-nowrap rounded-lg overflow-x-auto mt-6 pb-3">
      <h3 className="px-4 py-2 text-[#d8b76a] text-xl font-semibold ">
        {title}
      </h3>
      <table className="min-w-full text-left text-sm">
        <thead className="border-y border-[#d8b76a]">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-2 text-xs text-black font-semibold"
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
                  className="border-b border-[#d8b76a]/40 hover:bg-gray-50 text-[12px]"
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-1">
                      {cell === "pdf" ? (
                        <FiFileText
                          className="text-[#d8b76a] font-extrabold text-base cursor-pointer"
                          title="View PDF"
                        />
                      ) : cell === "action" ? (
                        <FiEdit2
                          className="text-[#d8b76a] font-extrabold text-base cursor-pointer"
                          title="Edit"
                        />
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
              <td colSpan="100%" className="text-center py-4 text-gray-500">
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
