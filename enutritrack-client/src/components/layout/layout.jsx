import React, { useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./header";

// Create Dark Mode Context
const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <div
        className={`min-h-screen flex transition-colors duration-300 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="w-full max-w-none">
          <Outlet />
        </div>
      </div>
    </DarkModeContext.Provider>
  );
};

export default Layout;
