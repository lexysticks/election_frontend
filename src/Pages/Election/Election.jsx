import React, { useEffect, useState } from "react";
import api from "../../api/api";
import "./Election.css";

const ELECTION_TYPES = [
  { key: "presidential", label: "Presidential" },
  { key: "governorship", label: "Governorship" },
  { key: "senatorial", label: "Senatorial" },
];

const ITEMS_PER_PAGE = 5;

const Election = () => {
  const [electionType, setElectionType] = useState("presidential");
  const [candidates, setCandidates] = useState([]);
  const [partyVotes, setPartyVotes] = useState([]);
  const [allParties, setAllParties] = useState([]); // all parties list
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [userVoted, setUserVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({ show: false, candidate: null });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const electionEndDate = new Date("2025-12-31T23:59:59");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const distance = electionEndDate - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, mins, secs });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // fetch candidates
      const resCandidates = await api.get(`/vote/candidates/${electionType}/`);
      const candidateList = resCandidates.data || [];
      setCandidates(candidateList);

      // determine if user voted
      const votedCandidate = candidateList.find((c) => c.user_voted);
      if (votedCandidate) {
        setUserVoted(true);
        setSelectedCandidate(votedCandidate.id);
        setMessageType("success");
        setMessage("You have already voted in this category.");
      } else {
        setUserVoted(false);
        setSelectedCandidate(null);
        setMessage("");
      }

      // fetch votes
      const resVotes = await api.get(`/vote/party-votes/${electionType}/`);
      const votes = resVotes.data || [];

      // create all parties with vote_count default 0
      const partyMap = {};
      candidateList.forEach(c => {
        if (!partyMap[c.party]) {
          partyMap[c.party] = { party: c.party, vote_count: 0, party_image_url: c.party_image_url || "/placeholder.png" };
        }
      });

      votes.forEach(v => {
        if (partyMap[v.party]) {
          partyMap[v.party].vote_count = v.vote_count || 0;
        }
      });

      setPartyVotes(Object.values(partyMap));

    } catch (err) {
      setMessageType("error");
      setMessage("Failed to load election data.");
      setCandidates([]);
      setPartyVotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setPage(1);
  }, [electionType]);

  const castVote = async (candidateId) => {
    if (userVoted) return;

    try {
      const res = await api.post("/vote/cast/", { candidate: candidateId });
      setMessageType("success");
      setMessage(res.data.message || "Vote submitted!");
      setUserVoted(true);
      setSelectedCandidate(candidateId);
      await loadData();
    } catch (err) {
      let e = "Vote failed. Please try again.";
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          e = "Session expired. Please log in again.";
          window.location.href = "/login";
        } else if (err.response.data?.error) {
          e = err.response.data.error;
        }
      }
      setMessageType("error");
      setMessage(e);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedCandidates = candidates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(candidates.length / ITEMS_PER_PAGE);

  return (
    <div className="election-container">
      <h1>Election Voting</h1>

      <h2 className="timer">
        Time Remaining: {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m {timeLeft.secs}s
      </h2>

      {message && <div className={`msg-container ${messageType}`}>{message}</div>}

      <div className="type-select">
        <label>Select Election Type:</label>
        <select value={electionType} onChange={(e) => setElectionType(e.target.value)}>
          {ELECTION_TYPES.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
        </select>
      </div>

      <h2>Party Votes</h2>
      <div className="party-votes">
        {partyVotes.map((p) => (
          <div className="party-card" key={p.party}>
            <img className="party-logo" src={p.party_image_url} alt={p.party} />
            <strong>{p.party}</strong>
            <p>{p.vote_count}</p>
          </div>
        ))}
      </div>

      <h2>Candidates</h2>
      {loading
        ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div className="candidate-card skeleton" key={i}>
              <div className="candidate-img-skeleton" />
              <div className="candidate-info-skeleton">
                <div className="line-skeleton" />
                <div className="line-skeleton short" />
                <div className="line-skeleton" />
              </div>
            </div>
          ))
        : paginatedCandidates.map((c) => (
            <div
              key={c.id}
              className={`candidate-card ${selectedCandidate === c.id ? "selected" : ""} ${userVoted ? "disabled" : ""}`}
              onClick={() => !userVoted && setModal({ show: true, candidate: c })}
            >
              <img
                src={c.image_url || "/placeholder.png"}
                alt={c.name}
                className="candidate-img"
                onError={(e) => { if (e.target.src !== "/placeholder.png") e.target.src = "/placeholder.png"; }}
              />
              <div className="candidate-info">
                <p><strong>Name:</strong> {c.name}</p>
                <p><strong>Party:</strong> {c.party}</p>
                <div className="logo-row">
                  <strong>Logo:</strong>
                  {c.party_image_url && <img className="party-logo" src={c.party_image_url} alt="Party Logo" />}
                </div>
                <p><strong>Age:</strong> {c.age}</p>
                <button
                  className="vote-btn"
                  disabled={userVoted}
                  onClick={(e) => { e.stopPropagation(); setModal({ show: true, candidate: c }); }}
                >
                  Vote
                </button>
              </div>
            </div>
          ))}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {modal.show && (
        <div className="alert-overlay">
          <div className="alert-modal">
            <p>Are you sure you want to vote for <strong>{modal.candidate.name}</strong>?</p>
            <div className="alert-buttons">
              <button
                className="confirm-btn"
                disabled={userVoted}
                onClick={async () => { if (!userVoted) { await castVote(modal.candidate.id); setModal({ show: false, candidate: null }); } }}
              >Confirm</button>
              <button className="back-btn" onClick={() => setModal({ show: false, candidate: null })}>Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Election;





// import React, { useEffect, useState } from "react";
// import api from "../../api/api";
// import "./Election.css";

// const ELECTION_TYPES = [
//   { key: "presidential", label: "Presidential" },
//   { key: "governorship", label: "Governorship" },
//   { key: "senatorial", label: "Senatorial" },
// ];

// const ITEMS_PER_PAGE = 5;

// const Election = () => {
//   const [electionType, setElectionType] = useState("presidential");
//   const [candidates, setCandidates] = useState([]);
//   const [partyVotes, setPartyVotes] = useState([]);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("success");
//   const [userVoted, setUserVoted] = useState(false);
//   const [selectedCandidate, setSelectedCandidate] = useState(null);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);

//   // Modal state
//   const [modal, setModal] = useState({ show: false, candidate: null });

//   // Countdown timer
//   const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
//   const electionEndDate = new Date("2025-12-31T23:59:59");

//   // Timer
//   useEffect(() => {
//     const timer = setInterval(() => {
//       const now = new Date();
//       const distance = electionEndDate - now;

//       if (distance <= 0) {
//         setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
//         clearInterval(timer);
//         return;
//       }

//       const days = Math.floor(distance / (1000 * 60 * 60 * 24));
//       const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//       const secs = Math.floor((distance % (1000 * 60)) / 1000);

//       setTimeLeft({ days, hours, mins, secs });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   // Load election data
//   const loadData = async () => {
//     try {
//       setLoading(true);

//       const resCandidates = await api.get(`/vote/candidates/${electionType}/`);
//       const candidateList = resCandidates.data || [];
//       setCandidates(candidateList);

//       // Check if user has voted
//       const votedCandidate = candidateList.find((c) => c.user_voted);
//       if (votedCandidate) {
//         setUserVoted(true);
//         setSelectedCandidate(votedCandidate.id);
//         setMessageType("success");
//         setMessage("You have already voted in this category.");
//       } else {
//         setUserVoted(false);
//         setSelectedCandidate(null);
//         setMessage("");
//       }

//       const resVotes = await api.get(`/vote/party-votes/${electionType}/`);
//       setPartyVotes(resVotes.data || []);
//     } catch (err) {
//       setMessageType("error");
//       setMessage("Failed to load election data.");
//       setCandidates([]);
//       setPartyVotes([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//     setPage(1);
//   }, [electionType]);

//   // Cast vote
//   const castVote = async (candidateId) => {
//     if (userVoted) return;

//     try {
//       const res = await api.post("/vote/cast/", { candidate: candidateId });
//       setMessageType("success");
//       setMessage(res.data.message || "Vote submitted!");
//       setUserVoted(true);
//       setSelectedCandidate(candidateId);
//       await loadData();
//     } catch (err) {
//       let e = "Vote failed. Please try again.";
//       if (err.response) {
//         if (err.response.status === 401 || err.response.status === 403) {
//           e = "Session expired. Please log in again.";
//           window.location.href = "/login";
//         } else if (err.response.data?.error) {
//           e = err.response.data.error;
//         }
//       }
//       setMessageType("error");
//       setMessage(e);
//     }
//   };

//   // Auto-clear messages
//   useEffect(() => {
//     if (message) {
//       const timer = setTimeout(() => setMessage(""), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [message]);

//   // Pagination
//   const startIndex = (page - 1) * ITEMS_PER_PAGE;
//   const paginatedCandidates = candidates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
//   const totalPages = Math.ceil(candidates.length / ITEMS_PER_PAGE);

//   return (
//     <div className="election-container">
//       <h1>Election Voting</h1>

//       <h2 style={{ fontWeight: "bold", marginTop: "5px", marginBottom: "15px" }}>
//         Time Remaining: {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m {timeLeft.secs}s
//       </h2>

//       {message && <div className={`msg-container ${messageType}`}>{message}</div>}

//       <div className="type-select">
//         <label>Select Election Type:</label>
//         <select value={electionType} onChange={(e) => setElectionType(e.target.value)}>
//           {ELECTION_TYPES.map((e) => (
//             <option key={e.key} value={e.key}>{e.label}</option>
//           ))}
//         </select>
//       </div>

//       <h2>Party Votes</h2>
//       <div className="party-votes">
//         {partyVotes.map((p) => (
//           <div className="party-card" key={p.party}>
//             {p.party_image_url && <img className="party-logo" src={p.party_image_url} alt={p.party} />}
//             <strong>{p.party}</strong>
//             <p>{p.vote_count}</p>
//           </div>
//         ))}
//       </div>

//       <h2>Candidates</h2>
//       {loading
//         ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
//             <div className="candidate-card skeleton" key={i}>
//               <div className="candidate-img-skeleton" />
//               <div className="candidate-info-skeleton">
//                 <div className="line-skeleton" />
//                 <div className="line-skeleton short" />
//                 <div className="line-skeleton" />
//               </div>
//             </div>
//           ))
//         : paginatedCandidates.map((c) => (
//             <div
//               key={c.id}
//               className={`candidate-card ${selectedCandidate === c.id ? "selected" : ""} ${userVoted ? "disabled" : ""}`}
//               onClick={() => {
//                 if (!userVoted) setModal({ show: true, candidate: c });
//               }}
//             >
//               <img
//                 src={c.image_url || "/placeholder.png"}
//                 alt={c.name}
//                 className="candidate-img"
//                 onError={(e) => { if (e.target.src !== "/placeholder.png") e.target.src = "/placeholder.png"; }}
//               />

//               <div className="candidate-info">
//                 <p><strong>Name:</strong> {c.name}</p>
//                 <p><strong>Party:</strong> {c.party}</p>

//                 <div className="logo-row">
//                   <strong>Logo:</strong>
//                   {c.party_image_url && <img className="party-logo" src={c.party_image_url} alt="Party Logo" />}
//                 </div>

//                 <p><strong>Age:</strong> {c.age}</p>

//                 <button
//                   className="vote-btn"
//                   disabled={userVoted}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setModal({ show: true, candidate: c });
//                   }}
//                 >
//                   Vote
//                 </button>
//               </div>
//             </div>
//           ))}

//       <div className="pagination">
//         <button disabled={page === 1} onClick={() => setPage(page - 1)} className="page-btn">Previous</button>
//         <span className="page-number">Page {page} of {totalPages}</span>
//         <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="page-btn">Next</button>
//       </div>

//       {modal.show && (
//         <div className="alert-overlay">
//           <div className="alert-modal">
//             <p>Are you sure you want to vote for <strong>{modal.candidate.name}</strong>?</p>
//             <div className="alert-buttons">
//               <button
//                 className="confirm-btn"
//                 disabled={userVoted}
//                 onClick={async () => {
//                   if (!userVoted) {
//                     await castVote(modal.candidate.id);
//                     setModal({ show: false, candidate: null });
//                   }
//                 }}
//               >Confirm</button>
//               <button
//                 className="back-btn"
//                 onClick={() => setModal({ show: false, candidate: null })}
//               >Back</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Election;




// import React, { useEffect, useState } from "react";
// import api from "../../api/api";
// import "./Election.css";

// const ELECTION_TYPES = [
//   { key: "presidential", label: "Presidential" },
//   { key: "governorship", label: "Governorship" },
//   { key: "senatorial", label: "Senatorial" },
// ];

// const ITEMS_PER_PAGE = 5;

// const Election = () => {
//   const [electionType, setElectionType] = useState("presidential");
//   const [candidates, setCandidates] = useState([]);
//   const [partyVotes, setPartyVotes] = useState([]);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("success");
//   const [userVoted, setUserVoted] = useState(false);
//   const [selectedCandidate, setSelectedCandidate] = useState(null);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);

//   const [modal, setModal] = useState({ show: false, candidate: null });

//   const [timeLeft, setTimeLeft] = useState({
//     days: 0,
//     hours: 0,
//     mins: 0,
//     secs: 0,
//   });

//   const electionEndDate = new Date("2025-12-31T23:59:59");

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const now = new Date();
//       const distance = electionEndDate - now;

//       if (distance <= 0) {
//         setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
//         clearInterval(timer);
//         return;
//       }

//       const days = Math.floor(distance / (1000 * 60 * 60 * 24));
//       const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//       const secs = Math.floor((distance % (1000 * 60)) / 1000);

//       setTimeLeft({ days, hours, mins, secs });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const resCandidates = await api.get(`/vote/candidates/${electionType}/`);
//       const candidateList = resCandidates.data || [];
//       setCandidates(candidateList);

//       const votedCandidate = candidateList.find((c) => c.user_voted);
//       if (votedCandidate) {
//         setUserVoted(true);
//         setSelectedCandidate(votedCandidate.id);
//       } else {
//         setUserVoted(false);
//         setSelectedCandidate(null);
//       }

//       const resVotes = await api.get(`/vote/party-votes/${electionType}/`);
//       const votesData = resVotes.data || [];
//       const allParties = [...new Set(candidateList.map((c) => c.party))];

//       const votes = allParties.map((party) => {
//         const found = votesData.find((v) => v.party === party);
//         const candidateWithParty = candidateList.find(c => c.party === party);
//         return {
//           party,
//           vote_count: found ? found.vote_count : 0,
//           party_image_url: candidateWithParty ? candidateWithParty.party_image_url : null,
//         };
//       });

//       setPartyVotes(votes);
//     } catch (err) {
//       setMessageType("error");
//       setMessage("Failed to load election data");
//       setCandidates([]);
//       setPartyVotes([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const castVote = async (candidateId) => {
//     if (userVoted) return;

//     try {
//       const res = await api.post("/vote/cast/", { candidate_id: candidateId });
//       setMessageType("success");
//       setMessage(res.data.message || "Vote submitted!");
//       setUserVoted(true);
//       setSelectedCandidate(candidateId);
//       await loadData();
//     } catch (err) {
//       let e = "You have already voted in this category";
//       if (err.response) {
//         if (err.response.status === 401 || err.response.status === 403) {
//           e = "Unauthorized. Please log in.";
//           window.location.href = "/login";
//         }
//       }
//       setMessageType("error");
//       setMessage(e);
//     }
//   };

//   useEffect(() => {
//     if (message) {
//       const timer = setTimeout(() => setMessage(""), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [message]);

//   useEffect(() => {
//     loadData();
//     setPage(1);
//   }, [electionType]);

//   const startIndex = (page - 1) * ITEMS_PER_PAGE;
//   const paginatedCandidates = candidates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
//   const totalPages = Math.ceil(candidates.length / ITEMS_PER_PAGE);

//   return (
//     <div className="election-container">
//       <h1>Election Voting</h1>

//       {/* COUNTDOWN TIMER */}
//       <h2 style={{ fontWeight: "bold", marginTop: "5px", marginBottom: "15px" }}>
//         Time Remaining: {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m {timeLeft.secs}s
//       </h2>

//       {/* MESSAGE */}
//       {message && (
//         <div className={`msg-container ${messageType}`}>
//           <p className="msg">{message}</p>
//         </div>
//       )}

//       {/* Election Type */}
//       <div className="type-select">
//         <label>Select Election Type:</label>
//         <select
//           value={electionType}
//           onChange={(e) => setElectionType(e.target.value)}
//         >
//           {ELECTION_TYPES.map((e) => (
//             <option key={e.key} value={e.key}>
//               {e.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* PARTY VOTES */}
//       <h2>Party Votes</h2>
//       <div className="party-votes">
//         {partyVotes.map((p) => (
//           <div className="party-card" key={p.party}>
//             {p.party_image_url && (
//               <img
//                 src={p.party_image_url}
//                 alt={`${p.party} Logo`}
//                 className="party-logo"
//               />
//             )}
//             <strong>{p.party}</strong>
//             <p>{p.vote_count}</p>
//           </div>
//         ))}
//       </div>

//       {/* CANDIDATES */}
//       <h2>Candidates</h2>
//       {loading
//         ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
//             <div className="candidate-card skeleton" key={i}>
//               <div className="candidate-img-skeleton" />
//               <div className="candidate-info-skeleton">
//                 <div className="line-skeleton" />
//                 <div className="line-skeleton short" />
//                 <div className="line-skeleton" />
//               </div>
//             </div>
//           ))
//         : paginatedCandidates.map((c) => (
//             <div
//               key={c.id}
//               className={`candidate-card ${
//                 selectedCandidate === c.id ? "selected" : ""
//               } ${userVoted && selectedCandidate !== c.id ? "disabled" : ""}`}
//               onClick={() => {
//                 if (!userVoted) setModal({ show: true, candidate: c });
//               }}
//             >
//               <img
//                 src={c.image_url || "/placeholder.png"}
//                 alt={c.name}
//                 className="candidate-img"
//                 onError={(e) => {
//                   if (e.target.src !== "/placeholder.png") {
//                     e.target.src = "/placeholder.png";
//                   }
//                 }}
//               />

//               <div className="candidate-info">
//                 <p><strong>Name:</strong> {c.name}</p>
//                 <p><strong>Party:</strong> {c.party}</p>

//                 <div className="logo-row">
//                   <strong>Logo:</strong>
//                   <img className="party-logo" src={c.party_image_url} alt="Party Logo" />
//                 </div>

//                 <p><strong>Age:</strong> {c.age}</p>

//                 {/* VOTE BUTTON */}
//                 <button
//                   className="vote-btn"
//                   disabled={userVoted}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setModal({ show: true, candidate: c });
//                   }}
//                 >
//                   Vote
//                 </button>
//               </div>
//             </div>
//           ))}

//       {/* PAGINATION */}
//       <div className="pagination">
//         <button
//           disabled={page === 1}
//           onClick={() => setPage(page - 1)}
//           className="page-btn"
//         >
//           Previous
//         </button>

//         <span className="page-number">
//           Page {page} of {totalPages}
//         </span>

//         <button
//           disabled={page === totalPages}
//           onClick={() => setPage(page + 1)}
//           className="page-btn"
//         >
//           Next
//         </button>
//       </div>

//       {/* ALERT MODAL */}
//       {modal.show && (
//         <div className="alert-overlay">
//           <div className="alert-modal">
//             <p>
//               Are you sure you want to vote for{" "}
//               <strong>{modal.candidate.name}</strong>?
//             </p>
//             <div className="alert-buttons">
//               <button
//                 className="confirm-btn"
//                 onClick={async () => {
//                   await castVote(modal.candidate.id);
//                   setModal({ show: false, candidate: null });
//                 }}
//               >
//                 Confirm
//               </button>
//               <button
//                 className="back-btn"
//                 onClick={() => setModal({ show: false, candidate: null })}
//               >
//                 Back
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Election;
