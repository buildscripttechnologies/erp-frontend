import React from "react";

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  entriesPerPage,
  onEntriesChange,
  totalResults,
}) => {
  const start = (currentPage - 1) * entriesPerPage + 1;
  const end = Math.min(currentPage * entriesPerPage, totalResults);

  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return [...Array(totalPages).keys()].map((i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-between items-center text-sm">
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

      {/* Showing count */}
      <div className="text-[#292926] font-medium text-center sm:text-left">
        Showing {totalResults === 0 ? 0 : start} to {end} of {totalResults}{" "}
        entries
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-1 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        {/* Page Numbers */}
        {visiblePages.map((page, index) => (
          <button
            key={index}
            disabled={page === "..."}
            onClick={() => typeof page === "number" && onPageChange(page)}
            className={`px-4 py-1 rounded text-base ${
              page === currentPage
                ? "bg-[#d8b76a] text-white font-semibold"
                : "bg-[#d8b76a]/20 hover:bg-[#d8b76a]/40"
            } ${
              page === "..." ? "cursor-default opacity-50" : "cursor-pointer"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-1 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
