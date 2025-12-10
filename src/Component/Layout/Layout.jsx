import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

const Layout = ({ isAuthenticated, user, onLogout }) => {
  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={onLogout}
      />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;


