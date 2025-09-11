import React, { useState } from "react";
import { useAuth } from "../../context/auth/auth.context";
import { useDarkMode } from "./layout";

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { darkMode } = useDarkMode();
  const [activeItem, setActiveItem] = useState("/dashboard");

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
    },
    {
      name: "Perfil",
      href: "/profile",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      name: "Usuarios",
      href: "/usuarios",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      name: "Nutrición",
      href: "/nutrition",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
      ),
    },
    {
      name: "Actividad Física",
      href: "/activity",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      name: "Recomendaciones",
      href: "/recommendations",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      name: "Historial Médico",
      href: "/medical-history",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 ${
          darkMode ? "bg-gray-800 shadow-2xl" : "bg-white shadow-xl"
        } transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r ${
          darkMode ? "border-gray-700" : "border-gray-200"
        } flex flex-col`}
      >
        {/* Header del Sidebar */}
        <div
          className={`flex items-center justify-between h-16 px-6 border-b ${
            darkMode
              ? "border-gray-700 bg-gradient-to-r from-green-900/30 to-green-800/30"
              : "border-gray-200 bg-gradient-to-r from-green-50 to-green-100"
          }`}
        >
          <div className="flex items-center">
            <img
              src="/Logo_ico.png"
              alt="Enutritrack Logo"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <h1
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              EnutriTrack
            </h1>
          </div>
          <button
            onClick={onClose}
            className={`lg:hidden p-1.5 rounded-md ${
              darkMode
                ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            } transition-colors`}
            aria-label="Cerrar menú"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navegación - flex-1 para ocupar el espacio disponible */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveItem(item.href);
                onClose();
              }}
              className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeItem === item.href
                  ? darkMode
                    ? "bg-green-900/50 text-green-400 shadow-sm border-l-4 border-green-500"
                    : "bg-green-100 text-green-700 shadow-sm border-l-4 border-green-500"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span
                className={`mr-3 flex-shrink-0 ${
                  activeItem === item.href
                    ? darkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : darkMode
                    ? "text-gray-400 group-hover:text-gray-300"
                    : "text-gray-400 group-hover:text-gray-500"
                }`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Sección de Usuario - ahora fijo en el bottom */}
        <div
          className={`p-4 border-t ${
            darkMode
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div
            className={`flex items-center mb-3 p-3 ${
              darkMode ? "bg-gray-700" : "bg-white"
            } rounded-xl shadow-sm`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3 shadow-md">
              <span className="text-sm font-semibold text-white">
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "👤"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                } truncate`}
              >
                {user?.nombre || "Usuario"}
              </p>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                } truncate`}
              >
                {user?.correo}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 ${
              darkMode ? "hover:bg-red-900/20" : "hover:bg-red-50"
            } rounded-xl transition-all duration-200 group`}
          >
            <svg
              className="w-4 h-4 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
