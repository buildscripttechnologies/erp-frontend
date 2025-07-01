import React from "react";

export default function TableSkeleton({ rows = 5, columns = [] }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse border-b border-[#d8b76a]">
          {columns.map((col, colIndex) => (
            <td key={colIndex} className={`px-2 py-1 ${col.className}`}>
              <div className="h-4 bg-gray-200 rounded w-full max-w-[80%] mx-auto" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
