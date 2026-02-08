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
    <>
      <div className="flex flex-col gap-4 items-center lg:hidden">
        <div className="flex flex-wrap gap-1.5 items-center justify-center">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>

          {visiblePages.map((page, index) => (
            <button
              key={index}
              disabled={page === "..."}
              onClick={() => typeof page === "number" && onPageChange(page)}
              className={`min-w-[32px] px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                page === currentPage
                  ? "bg-primary text-secondary shadow-sm"
                  : "bg-gray-100 hover:bg-primary/20"
              } ${
                page === "..." ? "cursor-default" : "cursor-pointer"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => onEntriesChange(Number(e.target.value))}
              className="border border-gray-200 px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer bg-white"
            >
              {[5, 10, 20, 50, 100].map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
          <span className="text-gray-400">|</span>
          <span>
            {totalResults === 0 ? 0 : start}–{end} of {totalResults}
          </span>
        </div>
      </div>

      <div className="hidden lg:flex mt-4 flex-row justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="entries" className="text-[#292926] dark:text-white font-medium">
            Entries per page:
          </label>
          <select
            id="entries"
            value={entriesPerPage}
            onChange={(e) => onEntriesChange(Number(e.target.value))}
            className="border border-[#d8b76a] pl-3 pr-10 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#b38a37] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23d8b76a%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat"
          >
            {[5, 10, 20, 50, 100].map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[#292926] dark:text-white font-medium">
          Showing {totalResults === 0 ? 0 : start} to {end} of {totalResults} entries
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-center">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-1 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>

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

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-1 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default PaginationControls;
