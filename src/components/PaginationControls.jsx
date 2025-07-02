import React from "react";

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  entriesPerPage,
  onEntriesChange,
}) => {
  const pageNumbers = [...Array(totalPages).keys()].map((_, i) => i + 1);

  return (
    <div className="mt-4 flex flex-wrap justify-center sm:justify-between items-center gap-4 text-sm">
      {/* Entries per page */}
      <div className="flex items-center gap-2">
        <label htmlFor="entries" className="text-[#292926] font-medium">
          Entries per page:
        </label>
        <select
          id="entries"
          value={entriesPerPage}
          onChange={(e) => onEntriesChange(Number(e.target.value))}
          className="border border-[#d8b76a] px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37] cursor-pointer"
        >
          {[5, 10, 20, 50, 100].map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-5 py-2 rounded text-base cursor-pointer ${
              currentPage === page
                ? "bg-[#d8b76a] text-white font-semibold"
                : "bg-[#d8b76a]/20"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
