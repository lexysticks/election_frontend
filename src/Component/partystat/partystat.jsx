// src/components/Election/PartyStats.jsx
import React from "react";

export default function PartyStats({ partyCounts, loading }) {
  return (
    <div className="party-stats">
      {loading && partyCounts.length === 0
        ? [1, 2, 3].map((i) => <div key={i} className="party-card skeleton-small" />)
        : partyCounts.map((p) => (
            <div key={p.party} className="party-card">
              <h3 className="count">{p.vote_count}</h3>
              <p className="party-name">{p.party}</p>
            </div>
          ))}
    </div>
  );
}
