import React from "react";
import "../css/Pagination.css";

const Pagination = ({ currentPage, totalPages, hasNext, hasPrev, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn"
        disabled={!hasPrev}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Previous
      </button>

      <span className="pagination-info">
        Page {currentPage} of {totalPages}
      </span>

      <button
        className="pagination-btn"
        disabled={!hasNext}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
