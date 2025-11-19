// hooks/useTheme.js
import { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Leer del localStorage al inicializar
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // Efecto para guardar en localStorage cuando cambie el tema
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    // Aplicar clase al elemento root para consistencia CSS
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const value = {
    darkMode,
    setDarkMode,
    toggleDarkMode: () => setDarkMode((prev) => !prev),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
