


import React, { useState, useEffect } from "react";
import { Routes, Route, useParams, Navigate } from "react-router-dom";

// Components / Pages
import Layout from "./Component/Layout/Layout";
import Home from "./Pages/Home/Home";
import Hero from "./Pages/Newhome/newhome";
import Login from "./Pages/Login/Login";
import Registration from "./Pages/Registration/Registration";
import Election from "./Pages/Election/Election";
import Result from "./Pages/Result/result";

// Dynamic Election Page Wrapper
const DynamicElectionPage = () => {
  const { type } = useParams();
  return <Election electionType={type} />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("access_token");

    if (savedUser && token) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Login / Registration handler
  const handleLogin = (userData, accessToken, refreshToken) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  return (
    <Routes>
      {/* Layout wrapper */}
      <Route
        element={
          <Layout
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
          />
        }
      >
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/Hero" element={<Hero />} />
        <Route path="/Result" element={<Result />} />
        

        {/* Protected Routes */}
        <Route
          path="/Election"
          element={
            isAuthenticated ? <Election /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/Electionpage/:type"
          element={
            isAuthenticated ? <DynamicElectionPage /> : <Navigate to="/login" />
          }
        />
      </Route>

      {/* Authentication Routes */}
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route
        path="/registration"
        element={<Registration onLogin={handleLogin} />}
      />
    </Routes>
  );
}


export default App;
