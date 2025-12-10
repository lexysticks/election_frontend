// src/components/Election/CandidateCard.jsx
import React from "react";

export default function CandidateCard({
  candidate,
  selected,
  onSelect,
  onVote,
  disabled,
  voted,
}) {
  return (
    <div className={`candidate-card ${voted ? "voted" : ""}`}>
      <img src={candidate.image_url} alt={candidate.name} className="candidate-img" />
      <div className="candidate-info">
        <p><strong>{candidate.name}</strong></p>
        <p>{candidate.party}</p>
        <p>Age: {candidate.age}</p>

        <label className="select-box">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            disabled={voted}
          />
          Select
        </label>

        <button className="vote-btn" disabled={!selected || disabled} onClick={onVote}>
          {voted ? "Voted" : "Vote"}
        </button>
      </div>
    </div>
  );
}
