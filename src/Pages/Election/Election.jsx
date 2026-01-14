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
  const [userVoted, setUserVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState({ show: false, candidate: null });
  const [voting, setVoting] = useState(false);

  // =============================
  // COUNTDOWN
  // =============================
  const electionEndDate = new Date("2025-12-31T23:59:59");
  const [timeLeft, setTimeLeft] = useState({ days:0, hours:0, minutes:0, seconds:0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = electionEndDate - now;
      if(diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days:0, hours:0, minutes:0, seconds:0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000*60*60*24)),
        hours: Math.floor((diff/(1000*60*60)) %24),
        minutes: Math.floor((diff/(1000*60)) %60),
        seconds: Math.floor((diff/1000)%60)
      });
    },1000);
    return ()=> clearInterval(interval);
  },[]);

  // =============================
  // LOAD DATA
  // =============================
  const loadData = async () => {
    if(loadingData) return;
    setLoadingData(true);
    try {
      setLoading(true);
      const resCandidates = await api.get(`/vote/candidates/${electionType}/`);
      const list = resCandidates.data || [];
      setCandidates(list);

      const votedCandidate = list.find(c=>c.user_voted);
      if(votedCandidate){
        setUserVoted(true);
        setSelectedCandidate(votedCandidate.id);
        setMessage("You have already voted in this election.");
        setMessageType("success");
      } else {
        setUserVoted(false);
        setSelectedCandidate(null);
        setMessage("");
      }

      const resVotes = await api.get(`/vote/party-votes/${electionType}/`);
      const votes = resVotes.data || [];

      const partyMap = {};
      list.forEach(c=>{
        if(!partyMap[c.party]){
          partyMap[c.party] = {
            party:c.party,
            vote_count:0,
            party_image_url:c.party_image_url || "/placeholder.png"
          };
        }
      });
      votes.forEach(v=>{
        if(partyMap[v.party]){
          partyMap[v.party].vote_count = v.vote_count;
        }
      });
      setPartyVotes(Object.values(partyMap));
    } catch {
      setMessage("Failed to load election data.");
      setMessageType("error");
      setCandidates([]);
      setPartyVotes([]);
    } finally {
      setLoading(false);
      setLoadingData(false);
    }
  };

  useEffect(()=>{
    loadData();
    setPage(1);
  },[electionType]);

  // =============================
  // CAST VOTE
  // =============================
  const castVote = async (candidateId) => {
    if(userVoted || voting) return; // prevent double POST
    setVoting(true);
    try{
      const res = await api.post("/vote/cast/", { candidate_id: candidateId });
      setMessage(res.data?.message || "Vote submitted successfully!");
      setMessageType("success");
      setUserVoted(true);
      setSelectedCandidate(candidateId);
      setModal({ show:false, candidate:null });
      await loadData();
    } catch(err){
      if(err.response?.status===401) window.location.href="/login";
      else {
        setMessage("Vote failed. Please try again.");
        setMessageType("error");
      }
    } finally{
      setVoting(false);
    }
  };

  // =============================
  // AUTO HIDE MESSAGES
  // =============================
  useEffect(()=>{
    if(message){
      const timer = setTimeout(()=>setMessage(""),3000);
      return ()=>clearTimeout(timer);
    }
  },[message]);

  // =============================
  // FILTER & PAGINATION
  // =============================
  const filteredCandidates = candidates.filter(
    c=>c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       c.party.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const startIndex = (page-1)*ITEMS_PER_PAGE;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex+ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredCandidates.length/ITEMS_PER_PAGE);

  // =============================
  // SKELETONS
  // =============================
  const renderSkeletons = ()=>
    Array.from({length:ITEMS_PER_PAGE}, (_,i)=>(
      <div key={i} className="candidate-card skeleton">
        <div className="candidate-img placeholder" />
        <div className="candidate-info">
          <p className="placeholder-text"></p>
          <p className="placeholder-text"></p>
          <p className="placeholder-text"></p>
          <button className="vote-btn" disabled>Vote</button>
        </div>
      </div>
    ));

  // =============================
  // RENDER
  // =============================
  return (
    <div className="election-container">
      <h1>Election Voting</h1>

      {/* Countdown */}
      <div className="countdown">
        <strong>Election Ends In</strong>
        <div className="countdown-time">
          <div>{timeLeft.days}<small>Days</small></div>
          <div>{timeLeft.hours}<small>Hours</small></div>
          <div>{timeLeft.minutes}<small>Minutes</small></div>
          <div>{timeLeft.seconds}<small>Seconds</small></div>
        </div>
      </div>

      {message && <div className={`msg-container ${messageType}`}>{message}</div>}

      <div className="type-select">
        <label>Select Election Type:</label>
        <select value={electionType} onChange={e=>setElectionType(e.target.value)}>
          {ELECTION_TYPES.map(e=><option key={e.key} value={e.key}>{e.label}</option>)}
        </select>
      </div>

      <h2>Party Votes</h2>
      <div className="party-votes">
        {partyVotes.map(p=>(
          <div key={p.party} className="party-card">
            <img src={p.party_image_url} alt={p.party} className="party-logo" onError={e=>e.target.src="/placeholder.png"}/>
            <strong>{p.party}</strong>
            <p>{p.vote_count}</p>
          </div>
        ))}
      </div>

      <div className="candidates-header">
        <h2>Candidates</h2>
        <input type="text" placeholder="Search candidates..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="search-input"/>
      </div>

      {loading ? renderSkeletons() :
        paginatedCandidates.map(c=>(
          <div
            key={c.id}
            className={`candidate-card ${selectedCandidate===c.id?"selected":""} ${userVoted||modal.show?"disabled":""}`}
            onClick={()=>!userVoted && !modal.show && setModal({show:true, candidate:c})} // prevent double modal
          >
            <img src={c.image_url||"/placeholder.png"} alt={c.name} className="candidate-img"/>
            <div className="candidate-info">
              <p><strong>Name:</strong> {c.name}</p>
              <p><strong>Party:</strong> {c.party}</p>
              <p><strong>Age:</strong> {c.age}</p>
              <button
                className="vote-btn"
                disabled={userVoted || voting}
                onClick={e=>{ 
                  e.stopPropagation(); 
                  if(!voting) setModal({show:true, candidate:c}); // prevent double click
                }}
              >
                Vote
              </button>
            </div>
          </div>
        ))
      }

      <div className="pagination">
        <button disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page===totalPages} onClick={()=>setPage(page+1)}>Next</button>
      </div>

      {modal.show && (
        <div className="alert-overlay">
          <div className="alert-modal">
            <p>Are you sure you want to vote for <strong>{modal.candidate.name}</strong>?</p>
            <div className="alert-buttons">
              <button 
                className="confirm-btn" 
                onClick={()=>{ if(!voting) castVote(modal.candidate.id); }}
              >
                Confirm
              </button>
              <button className="back-btn" onClick={()=>setModal({show:false,candidate:null})}>Back</button>
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
//   const [userVoted, setUserVoted] = useState(false);
//   const [selectedCandidate, setSelectedCandidate] = useState(null);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [loadingData, setLoadingData] = useState(false); // prevent double fetch
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("success");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [modal, setModal] = useState({ show: false, candidate: null });
//   const [voting, setVoting] = useState(false);

//   // =============================
//   // COUNTDOWN
//   // =============================
//   const electionEndDate = new Date("2025-12-31T23:59:59");
//   const [timeLeft, setTimeLeft] = useState({ days:0, hours:0, minutes:0, seconds:0 });

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const now = new Date();
//       const diff = electionEndDate - now;
//       if(diff <= 0) {
//         clearInterval(interval);
//         setTimeLeft({ days:0, hours:0, minutes:0, seconds:0 });
//         return;
//       }
//       setTimeLeft({
//         days: Math.floor(diff / (1000*60*60*24)),
//         hours: Math.floor((diff/(1000*60*60)) %24),
//         minutes: Math.floor((diff/(1000*60)) %60),
//         seconds: Math.floor((diff/1000)%60)
//       });
//     },1000);
//     return ()=> clearInterval(interval);
//   },[]);

//   // =============================
//   // LOAD DATA
//   // =============================
//   const loadData = async () => {
//     if(loadingData) return; // prevent double fetch
//     setLoadingData(true);
//     try {
//       setLoading(true);
//       const resCandidates = await api.get(`/vote/candidates/${electionType}/`);
//       const list = resCandidates.data || [];
//       setCandidates(list);

//       const votedCandidate = list.find(c=>c.user_voted);
//       if(votedCandidate){
//         setUserVoted(true);
//         setSelectedCandidate(votedCandidate.id);
//         setMessage("You have already voted in this election.");
//         setMessageType("success");
//       } else {
//         setUserVoted(false);
//         setSelectedCandidate(null);
//         setMessage("");
//       }

//       const resVotes = await api.get(`/vote/party-votes/${electionType}/`);
//       const votes = resVotes.data || [];

//       const partyMap = {};
//       list.forEach(c=>{
//         if(!partyMap[c.party]){
//           partyMap[c.party] = {
//             party:c.party,
//             vote_count:0,
//             party_image_url:c.party_image_url || "/placeholder.png"
//           };
//         }
//       });
//       votes.forEach(v=>{
//         if(partyMap[v.party]){
//           partyMap[v.party].vote_count = v.vote_count;
//         }
//       });
//       setPartyVotes(Object.values(partyMap));
//     } catch {
//       setMessage("Failed to load election data.");
//       setMessageType("error");
//       setCandidates([]);
//       setPartyVotes([]);
//     } finally {
//       setLoading(false);
//       setLoadingData(false);
//     }
//   };

//   useEffect(()=>{
//     loadData();
//     setPage(1);
//   },[electionType]);

//   // =============================
//   // CAST VOTE
//   // =============================
//   const castVote = async (candidateId) => {
//     if(userVoted || voting) return;
//     setVoting(true);
//     try{
//       const res = await api.post("/vote/cast/", { candidate_id: candidateId });
//       setMessage(res.data?.message || "Vote submitted successfully!");
//       setMessageType("success");
//       setUserVoted(true);
//       setSelectedCandidate(candidateId);
//       setModal({ show:false, candidate:null });
//       await loadData(); // safe fetch, will only run once
//     } catch(err){
//       if(err.response?.status===401) window.location.href="/login";
//       else {
//         setMessage("Vote failed. Please try again.");
//         setMessageType("error");
//       }
//     } finally{
//       setVoting(false);
//     }
//   };

//   useEffect(()=>{
//     if(message){
//       const timer = setTimeout(()=>setMessage(""),3000);
//       return ()=>clearTimeout(timer);
//     }
//   },[message]);

//   // =============================
//   // FILTER & PAGINATION
//   // =============================
//   const filteredCandidates = candidates.filter(
//     c=>c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.party.toLowerCase().includes(searchQuery.toLowerCase())
//   );
//   const startIndex = (page-1)*ITEMS_PER_PAGE;
//   const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex+ITEMS_PER_PAGE);
//   const totalPages = Math.ceil(filteredCandidates.length/ITEMS_PER_PAGE);

//   // =============================
//   // SKELETONS
//   // =============================
//   const renderSkeletons = ()=>
//     Array.from({length:ITEMS_PER_PAGE}, (_,i)=>(
//       <div key={i} className="candidate-card skeleton">
//         <div className="candidate-img placeholder" />
//         <div className="candidate-info">
//           <p className="placeholder-text"></p>
//           <p className="placeholder-text"></p>
//           <p className="placeholder-text"></p>
//           <button className="vote-btn" disabled>Vote</button>
//         </div>
//       </div>
//     ));

//   // =============================
//   // RENDER
//   // =============================
//   return (
//     <div className="election-container">
//       <h1>Election Voting</h1>

//       {/* Countdown */}
//       <div className="countdown">
//         <strong>Election Ends In</strong>
//         <div className="countdown-time">
//           <div>{timeLeft.days}<small>Days</small></div>
//           <div>{timeLeft.hours}<small>Hours</small></div>
//           <div>{timeLeft.minutes}<small>Minutes</small></div>
//           <div>{timeLeft.seconds}<small>Seconds</small></div>
//         </div>
//       </div>

//       {message && <div className={`msg-container ${messageType}`}>{message}</div>}

//       <div className="type-select">
//         <label>Select Election Type:</label>
//         <select value={electionType} onChange={e=>setElectionType(e.target.value)}>
//           {ELECTION_TYPES.map(e=><option key={e.key} value={e.key}>{e.label}</option>)}
//         </select>
//       </div>

//       <h2>Party Votes</h2>
//       <div className="party-votes">
//         {partyVotes.map(p=>(
//           <div key={p.party} className="party-card">
//             <img src={p.party_image_url} alt={p.party} className="party-logo" onError={e=>e.target.src="/placeholder.png"}/>
//             <strong>{p.party}</strong>
//             <p>{p.vote_count}</p>
//           </div>
//         ))}
//       </div>

//       <div className="candidates-header">
//         <h2>Candidates</h2>
//         <input type="text" placeholder="Search candidates..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="search-input"/>
//       </div>

//       {loading ? renderSkeletons() :
//         paginatedCandidates.map(c=>(
//           <div
//             key={c.id}
//             className={`candidate-card ${selectedCandidate===c.id?"selected":""} ${userVoted?"disabled":""}`}
//             onClick={()=>!userVoted && setModal({show:true, candidate:c})} // card clickable
//           >
//             <img src={c.image_url||"/placeholder.png"} alt={c.name} className="candidate-img"/>
//             <div className="candidate-info">
//               <p><strong>Name:</strong> {c.name}</p>
//               <p><strong>Party:</strong> {c.party}</p>
//               <p><strong>Age:</strong> {c.age}</p>
//               <button
//                 className="vote-btn"
//                 disabled={userVoted || voting}
//                 onClick={e=>{ e.stopPropagation(); setModal({show:true, candidate:c}); }} // button opens modal
//               >
//                 Vote
//               </button>
//             </div>
//           </div>
//         ))
//       }

//       <div className="pagination">
//         <button disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button>
//         <span>Page {page} of {totalPages}</span>
//         <button disabled={page===totalPages} onClick={()=>setPage(page+1)}>Next</button>
//       </div>

//       {modal.show && (
//         <div className="alert-overlay">
//           <div className="alert-modal">
//             <p>Are you sure you want to vote for <strong>{modal.candidate.name}</strong>?</p>
//             <div className="alert-buttons">
//               <button className="confirm-btn" onClick={()=>castVote(modal.candidate.id)}>Confirm</button>
//               <button className="back-btn" onClick={()=>setModal({show:false,candidate:null})}>Back</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Election;













