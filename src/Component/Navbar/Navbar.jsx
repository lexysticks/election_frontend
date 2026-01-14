// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FiLogIn, FiMenu, FiX } from "react-icons/fi";
// import { FaUserCircle } from "react-icons/fa";
// import "./Navbar.css";

// const Navbar = ({ isAuthenticated, user, onLogout }) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);

//   const navigate = useNavigate();

//   // Close mobile menu when a link is clicked
//   const handleLinkClick = (path) => {
//     setMenuOpen(false);
//     navigate(path);
//   };

//   return (
//     <>
//       <nav className="nav">
//         <div className="logo">
//           <Link
//             to="/"
//             className="logo-text"
//             onClick={() => setMenuOpen(false)}
//           >
//             Voting System
//           </Link>
//         </div>

//         {/* Hamburger */}
//         <div
//           className="hamburger"
//           onClick={() => setMenuOpen(!menuOpen)}
//         >
//           {menuOpen ? <FiX size={25} /> : <FiMenu size={25} />}
//         </div>

//         {/* Navbar links */}
//         <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
//           {/* Mobile login/profile at top */}
//           {menuOpen && (
//             <li className="mobile-nav-top">
//               {!isAuthenticated ? (
//                 <Link
//                   to="/login"
//                   className="login-btn"
//                   onClick={() => setMenuOpen(false)}
//                 >
//                   <FiLogIn /> Login
//                 </Link>
//               ) : (
//                 <div
//                   className="profile-area-mobile"
//                   onClick={() => {
//                     setProfileOpen(true);
//                     setMenuOpen(false);
//                   }}
//                 >
//                   {user?.profile_pic ? (
//                     <img
//                       src={user.profile_pic}
//                       alt="Profile"
//                       className="profile-pic"
//                     />
//                   ) : (
//                     <FaUserCircle />
//                   )}
//                   <span>{user?.first_name}</span>
//                 </div>
//               )}
//             </li>
//           )}

//           <li>
//             <span onClick={() => handleLinkClick("/")}>Dashboard</span>
//           </li>

//           {isAuthenticated && (
//             <li>
//               <span onClick={() => handleLinkClick("/Election")}>Election</span>
//             </li>
//           )}

//           <li>
//             <span onClick={() => handleLinkClick("/Result")}>Results</span>
//           </li>
        
          
//         </ul>

//         {/* Desktop login/profile */}
//         <div className="right-area desktop-only">
//           {!isAuthenticated ? (
//             <Link to="/login" className="login-btn">
//               <FiLogIn /> Login
//             </Link>
//           ) : (
//             <div
//               className="profile-area"
//               onClick={() => setProfileOpen(true)}
//             >
//               {user?.profile_pic ? (
//                 <img
//                   src={user.profile_pic}
//                   alt="Profile"
//                   className="profile-pic"
//                 />
//               ) : (
//                 <FaUserCircle />
//               )}
//               <span>{user?.first_name}</span>
//             </div>
//           )}
//         </div>
//       </nav>

//       {/* Profile Sidebar */}
//       <div className={`profile-sidebar ${profileOpen ? "open" : ""}`}>
//         <div className="sidebar-header">
//           <h2>Profile</h2>
//           <FiX
//             size={20}
//             onClick={() => setProfileOpen(false)}
//           />
//         </div>
//         <div className="sidebar-content">
//           {user?.profile_pic && (
//             <img
//               src={user.profile_pic}
//               alt="Profile"
//               className="profile-pic"
//             />
//           )}
          
//           <p><strong>First Name:</strong> {user?.first_name}</p>
//           <p><strong>Last Name:</strong> {user?.last_name}</p>
//           <p><strong>NIN:</strong> {user?.national_id}</p>
//           <p><strong>DOB:</strong> {user?.dob}</p>
//           <p><strong>State:</strong> {user?.state}</p>
//           <p><strong>LGA:</strong> {user?.lga}</p>
//           <p><strong>VIn:</strong> {user?.vin}</p>

//           {/* Logout button */}
//           <div
//             className="sidebar-link logout"
//             onClick={() => {
//               onLogout();
//               setProfileOpen(false);
//               navigate("/login");
//             }}
//           >
//             Logout
//           </div>
//         </div>
//       </div>

//       {/* Overlay */}
//       {profileOpen && (
//         <div
//           className="overlay"
//           onClick={() => setProfileOpen(false)}
//         />
//       )}
//     </>
//   );
// };

// export default Navbar;






import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn, FiMenu, FiX } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Close mobile menu when a link is clicked
  const handleLinkClick = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="nav">
        <div className="logo">
          <Link
            to="/"
            className="logo-text"
            onClick={() => setMenuOpen(false)}
          >
            Voting System
          </Link>
        </div>

        {/* Hamburger */}
        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={25} /> : <FiMenu size={25} />}
        </div>

        {/* Navbar links */}
        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          {/* Mobile login/profile at top */}
          {menuOpen && (
            <li className="mobile-nav-top">
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="login-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  <FiLogIn /> Login
                </Link>
              ) : (
                <div
                  className="profile-area-mobile"
                  onClick={() => {
                    setProfileOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  {user?.profile_pic ? (
                    <img
                      src={user.profile_pic}
                      alt="Profile"
                      className="profile-pic"
                    />
                  ) : (
                    <FaUserCircle />
                  )}
                  <span>{user?.first_name}</span>
                </div>
              )}
            </li>
          )}

          {/* Dashboard - accessible to everyone */}
          <li>
            <span onClick={() => handleLinkClick("/")}>Dashboard</span>
          </li>

          {/* Election - only for authenticated users */}
          {isAuthenticated && (
            <li>
              <span onClick={() => handleLinkClick("/Election")}>Election</span>
            </li>
          )}

          {/* Results - accessible to everyone */}
          <li>
            <span onClick={() => handleLinkClick("/Result")}>Results</span>
          </li>
        </ul>

        {/* Desktop login/profile */}
        <div className="right-area desktop-only">
          {!isAuthenticated ? (
            <Link to="/login" className="login-btn">
              <FiLogIn /> Login
            </Link>
          ) : (
            <div
              className="profile-area"
              onClick={() => setProfileOpen(true)}
            >
              {user?.profile_pic ? (
                <img
                  src={user.profile_pic}
                  alt="Profile"
                  className="profile-pic"
                />
              ) : (
                <FaUserCircle />
              )}
              <span>{user?.first_name}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Profile Sidebar */}
      <div className={`profile-sidebar ${profileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Profile</h2>
          <FiX size={20} onClick={() => setProfileOpen(false)} />
        </div>
        <div className="sidebar-content">
          {user?.profile_pic && (
            <img src={user.profile_pic} alt="Profile" className="profile-pic" />
          )}

          <p><strong>First Name:</strong> {user?.first_name}</p>
          <p><strong>Last Name:</strong> {user?.last_name}</p>
          <p><strong>NIN:</strong> {user?.national_id}</p>
          {/* <p><strong>DOB:</strong> {user?.dob}</p> */}
          <p><strong>State:</strong> {user?.state}</p>
          <p><strong>LGA:</strong> {user?.lga}</p>
          {/* <p><strong>VIN:</strong> {user?.vin}</p> */}

          {/* Logout button */}
          <div
            className="sidebar-link logout"
            onClick={() => {
              onLogout();
              setProfileOpen(false);
              navigate("/login");
            }}
          >
            Logout
          </div>
        </div>
      </div>

      {/* Overlay */}
      {profileOpen && <div className="overlay" onClick={() => setProfileOpen(false)} />}
    </>
  );
};

export default Navbar;
