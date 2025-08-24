import React from "react";
import { useAuth } from "../../context/auth/auth.context";
import { useDarkMode } from "./layout";
import { Sun, Moon } from "lucide-react";

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useDarkMode();

  return (
    <header
      className={`${
        darkMode
          ? "bg-gray-800 shadow-lg border-gray-700"
          : "bg-white shadow-sm border-gray-200"
      } border-b sticky top-0 z-30 transition-colors duration-300`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className={`lg:hidden p-2 rounded-md ${
              darkMode
                ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            } transition-colors`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Left side - Logo/Title (visible on desktop) */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center">
              <img
                src="/Logo_ico.png"
                alt="Enutritrack Logo"
                className="w-14 h-15 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <h1
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                EnutriTrack
              </h1>
            </div>
          </div>

          {/* Center - Search bar (desktop) */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className={`h-5 w-5 ${
                    darkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar alimentos, ejercicios..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  darkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl transition-all duration-300 ${
                darkMode
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-gray-800 hover:bg-gray-900 text-white"
              } shadow-lg hover:shadow-xl`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              className={`p-2 rounded-full transition-colors ${
                darkMode
                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                  : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 5.5 8.25v.5a6 6 0 0 1-5.5 8.25 6 6 0 0 1-5.5-8.25v-.5a6 6 0 0 1 5.5-8.25z"
                />
              </svg>
              <span className="sr-only">Ver notificaciones</span>
            </button>

            {/* User profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p
                  className={`text-sm font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user?.nombre || user?.email || "Usuario"}
                </p>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {user?.email}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "👤"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
