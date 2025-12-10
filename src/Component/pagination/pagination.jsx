// src/components/Election/Pagination.jsx
import React from "react";

export default function Pagination({ totalPages, currentPage, setPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button className="page-btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Prev</button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          className={`page-btn ${p === currentPage ? "active" : ""}`}
          onClick={() => setPage(p)}
          disabled={p === currentPage}
        >
          {p}
        </button>
      ))}

      <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
    </div>
  );
}
