
import React, { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import api from "../../api/api";
import "./result.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const ELECTION_TYPES = [
  { key: "presidential", label: "Presidential" },
  { key: "governorship", label: "Governorship" },
  { key: "senatorial", label: "Senatorial" },
];

export default function Result() {
  const [electionType, setElectionType] = useState("presidential");
  const [partyVotes, setPartyVotes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Dynamic year
  const currentYear = new Date().getFullYear();

  const loadData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [pRes, cRes] = await Promise.all([
        api.get(`/vote/party-votes/${electionType}/`),
        api.get(`/vote/candidates/${electionType}/`),
      ]);
      setPartyVotes(Array.isArray(pRes.data) ? pRes.data : []);
      setCandidates(Array.isArray(cRes.data) ? cRes.data : []);
    } catch (err) {
      setMessage("Failed to load results. Try again.");
      setPartyVotes([]);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [electionType]);

  const totalVotes = useMemo(
    () => partyVotes.reduce((s, p) => s + (Number(p.vote_count) || 0), 0),
    [partyVotes]
  );

  const leadingParty = useMemo(() => {
    if (!partyVotes.length) return null;
    const sorted = [...partyVotes].sort(
      (a, b) => (b.vote_count || 0) - (a.vote_count || 0)
    );
    return sorted[0];
  }, [partyVotes]);

  const leadingCandidate = useMemo(() => {
    if (!candidates.length || !leadingParty) return null;
    return candidates.find((c) => c.party === leadingParty.party) || candidates[0];
  }, [candidates, leadingParty]);

  const partyWithPercent = partyVotes.map((p) => {
    const votes = Number(p.vote_count) || 0;
    const pct = totalVotes ? Math.round((votes / totalVotes) * 1000) / 10 : 0;
    return { ...p, percent: pct };
  });

  const shortNumber = (n) => {
    if (n === null || n === undefined) return "-";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
  };

  return (
    <div className="result-full-page">
      <main className="content">
        <section className="title-row">
          <div>
            <h1 className="election-title">
              {electionType[0].toUpperCase() + electionType.slice(1)} Election {currentYear}
            </h1>
            <div className="updated">Last Updated: {new Date().toLocaleString()}</div>
          </div>

          <div className="panel card controls-card">
            <label>Select Election Type</label>
            <select
              value={electionType}
              onChange={(e) => setElectionType(e.target.value)}
            >
              {ELECTION_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>

            <button className="refresh-btn" onClick={loadData} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="live-pill">LIVE</div>
        </section>

        {message && <div className="alert">{message}</div>}

        {/* ⭐ TOP CARDS */}
        <section className="stat-cards">
          <div className="stat-card lead">
            <div className="card-title">Leading Candidate</div>
            <div className="card-main lead-name">
              {leadingCandidate ? leadingCandidate.name.toUpperCase() : "—"}
            </div>
            <div className="card-sub">
              {leadingCandidate ? leadingCandidate.party : ""}
            </div>
          </div>

          <div className="stat-card total-votes-card">
            <div className="card-title">Total Votes Cast</div>
            <div className="card-main">{shortNumber(totalVotes)}</div>
            <div className="card-sub">Across all parties</div>
          </div>

          {partyWithPercent.map((p) => (
            <div className="stat-card" key={p.party} style={{ borderColor: pickColor(p.party) }}>
              <div className="card-title">{p.party}</div>
              <div className="card-main">{shortNumber(p.vote_count)}</div>
              <div className="card-sub">{p.percent}% of total votes</div>
            </div>
          ))}
        </section>

        {/* ===================== MAIN GRID ====================== */}
        <section className="main-grid">
          <div className="left-panel">
            <div className="panel card map-card">
              <div className="panel-title">Results By Party</div>

              <div className="map-wrapper" style={{ padding: "20px", borderRadius: "8px", height: "300px" }}>
                <Pie
                  data={{
                    labels: partyWithPercent.map((p) => p.party),
                    datasets: [
                      {
                        data: partyWithPercent.map((p) => Number(p.vote_count) || 0),
                        backgroundColor: partyWithPercent.map((p) => pickColor(p.party)),
                        borderColor: "#000",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    plugins: { legend: { position: "bottom" } },
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>

          <aside className="right-panel">
            <div className="panel card overall-card">
              <div className="panel-title">Overall Results</div>
              <div className="bars">
                {partyWithPercent.length ? (
                  partyWithPercent.map((p) => (
                    <div className="result-row" key={p.party}>
                      <div className="result-label">
                        <div className="party-name">
                          {findCandidateNameForParty(candidates, p.party)}
                        </div>
                        <div className="party-code">({p.party})</div>
                      </div>
                      <div className="bar-wrapper">
                        <div className="bar-bg">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${p.percent}%`,
                              background: pickColor(p.party),
                            }}
                          />
                        </div>
                        <div className="bar-value">
                          {p.percent}% — <strong>{p.vote_count} votes</strong>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No results yet</div>
                )}
              </div>
            </div>

            <div className="panel card secure-card">
              <h4>Your Vote is Secure</h4>
              <p>All transmission is encrypted and confirmed.</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function findCandidateNameForParty(candidates, party) {
  const found = candidates.find((c) => c.party === party);
  return found ? found.name : party;
}

function pickColor(party) {
  if (!party) return "#ccc";
  const up = party.toUpperCase();
  const map = {
    APC: "#0052cc",
    PDP: "#d80027",
    LP: "#ffcc00",
    NNPP: "#009933",
    SDP: "#ff6600",
    YPP: "#9900cc",
    ADC: "#00cccc",
    Accord: "#ff3399",
    AA: "#663300",
    APP: "#ff0000",
    ADP: "#0000ff",
    AAC: "#66cc66",
  };
  return map[up] || randomColorFromString(up);
}

function randomColorFromString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  const c = (h & 0x00ffffff).toString(16).toUpperCase();
  return `#${"00000".slice(0, 6 - c.length) + c}`;
}






