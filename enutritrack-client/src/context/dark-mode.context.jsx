import React, { createContext, useContext, useState, useEffect } from "react";

// Create Dark Mode Context
const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
};

// Dark Mode Provider Component
export const DarkModeProvider = ({ children }) => {
  // Estado para el modo oscuro - por defecto usa el preference del sistema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar si hay preferencia guardada en localStorage
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }

    // Si no hay preferencia guardada, usar la del sistema
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // Fallback a modo claro
    return false;
  });

  // Función para alternar el modo oscuro
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", JSON.stringify(newMode));
      return newMode;
    });
  };

  // Función para establecer modo específico
  const setDarkMode = (mode) => {
    setIsDarkMode(mode);
    localStorage.setItem("darkMode", JSON.stringify(mode));
  };

  // Efecto para aplicar/quitar la clase dark del documento
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Opcional: También puedes aplicar estilos al body
    document.body.style.backgroundColor = isDarkMode ? "#111827" : "#ffffff";
    document.body.style.color = isDarkMode ? "#f9fafb" : "#111827";
  }, [isDarkMode]);

  // Escuchar cambios en las preferencias del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      // Solo cambiar automáticamente si no hay preferencia guardada
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Valor del contexto
  const contextValue = {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    // Funciones de utilidad adicionales
    enableDarkMode: () => setDarkMode(true),
    enableLightMode: () => setDarkMode(false),
  };

  return (
    <DarkModeContext.Provider value={contextValue}>
      {children}
    </DarkModeContext.Provider>
  );
};
