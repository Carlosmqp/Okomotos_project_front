import React from "react";

function Pagination({ totalPages, currentPage, onPageChange }) {

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 2;

    if (currentPage > maxVisiblePages) {
      pages.push(
        <button
          key={1}
          className="px-3 py-1 mx-1 border rounded-lg bg-white text-black hover:bg-lime-700/55"
          onClick={() => onPageChange(1)}
        >
          1
        </button>
      );
    }

    if (currentPage > maxVisiblePages + 1) {
      pages.push(
        <span key="start-dots" className="px-3 py-1 mx-1">
          ...
        </span>
      );
    }

    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`px-3 py-1 mx-1 border rounded-lg ${
            currentPage === i
              ? "bg-lime-700 text-white"
              : "bg-white text-black hover:bg-lime-700/55"
          }`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - maxVisiblePages) {
      pages.push(
        <span key="end-dots" className="px-3 py-1 mx-1">
          ...
        </span>
      );
    }

    if (currentPage < totalPages - maxVisiblePages + 1) {
      pages.push(
        <button
          key={totalPages}
          className="px-3 py-1 mx-1 border rounded-lg bg-white text-black hover:bg-lime-700/55"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-2">
      <button
        className="px-3 py-1 border rounded-lg bg-white hover:bg-lime-700/55"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        «
      </button>
      {renderPageNumbers()}
      <button
        className="px-3 py-1 border rounded-lg bg-white hover:bg-lime-700/55"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        »
      </button>
    </div>
  );
}

export default Pagination;
