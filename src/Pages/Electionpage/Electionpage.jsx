import React, { useEffect, useState } from "react";
import axios from "axios";

const ElectionPage = ({ electionType }) => {
  const [candidates, setCandidates] = useState([]);
  const [partyVotes, setPartyVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!electionType) return;

    const loadData = async () => {
      try {
        const resCandidates = await axios.get(
          `http://localhost:8000/api/candidates/${electionType}/`
        );

        const resVotes = await axios.get(
          `http://localhost:8000/api/party-votes/${electionType}/`
        );

        setCandidates(resCandidates.data || []);
        setPartyVotes(resVotes.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [electionType]);

  const handleVote = async (candidateId) => {
    try {
      await axios.post(
        "http://localhost:8000/api/vote/",
        { candidate: candidateId },
        { withCredentials: true }
      );

      alert("Vote submitted successfully!");
    } catch (error) {
      alert("You already voted or must log in.");
    }
  };

  if (loading) return <p>Loading candidates...</p>;

  return (
    <div className="election-container">
      <h2>{electionType.toUpperCase()} ELECTION</h2>

      {/* 🟩 Party Votes Section */}
      <h3>Party Votes</h3>

      <div className="party-wrapper">
        {partyVotes.map((party) => (
          <div key={party.party} className="party-card">
            {party.party_image_url && (
              <img
                src={party.party_image_url}
                alt={party.party}
                className="party-logo"
              />
            )}

            <strong>{party.party}</strong>
            <p>
              Votes: <b>{party.vote_count || 0}</b>
            </p>
          </div>
        ))}
      </div>

      {/* 🟩 Candidate Grid */}
      <div className="candidate-grid">
        {candidates.map((c) => (
          <div key={c.id} className="candidate-card">
            <img
              src={c.image || "/default-profile.png"}
              alt={c.name}
              className="candidate-img"
            />

            <div className="candidate-info">
              <p><strong>Name:</strong> {c.name}</p>
              <p><strong>Party:</strong> {c.party}</p>

              {/* Show logo for each candidate */}
              {c.party_image_url && (
                <img
                  src={c.party_image_url}
                  alt={`${c.party} logo`}
                  className="party-logo small"
                />
              )}

              <p><strong>Age:</strong> {c.age}</p>
            </div>

            <button onClick={() => handleVote(c.id)} className="vote-btn">
              Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectionPage;




// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const ElectionPage = ({ electionType }) => {
//   const [candidates, setCandidates] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!electionType) return;

//     axios
//       .get(`http://localhost:8000/api/candidates/${electionType}/`)
//       .then((res) => {
//         setCandidates(res.data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.log(err);
//         setLoading(false);
//       });
//   }, [electionType]);

//   const handleVote = async (candidateId) => {
//     try {
//       await axios.post(
//         "http://localhost:8000/api/vote/",
//         { candidate: candidateId },
//         { withCredentials: true }
//       );
//       alert("Vote submitted successfully!");
//     } catch (error) {
//       alert("You already voted or you must log in.");
//     }
//   };

//   if (loading) return <p className="loading-text">Loading candidates...</p>;

//   return (
//     <div className="election-container">
//       <h2 className="title">{electionType.toUpperCase()} ELECTION</h2>

//       {candidates.length === 0 && <p>No candidates available.</p>}

//       <div className="candidate-grid">
//         {candidates.map((c) => (
//           <div key={c.id} className="candidate-card">
//             <img
//               src={c.image || "/default-profile.png"}
//               alt={c.name}
//               className="candidate-img"
//             />

//             <div className="candidate-info">
//               <p><strong>Name:</strong> {c.name}</p>
//               <p><strong>Party:</strong> {c.party}</p>
//               <p><strong>Age:</strong> {c.age}</p>
//             </div>

//             <button
//               onClick={() => handleVote(c.id)}
//               className="vote-btn"
//             >
//               Vote
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ElectionPage;
