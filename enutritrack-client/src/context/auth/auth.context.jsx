// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import {
  loginRequest,
  logoutRequest,
  validateTokenRequest,
} from "../../api/auth/auth.api";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth ya esta usado");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const res = await loginRequest(credentials);
      setUser(res.data.user);
      setIsAuthenticated(true);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.log("Error al cerrar sesión en el servidor:", error);
    } finally {
      Cookies.remove("access_token");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const validateToken = async () => {
    try {
      const res = await validateTokenRequest();
      if (res.data.valid) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
      return res.data;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await validateToken();
      } catch (error) {
        console.log("No hay token válido");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        validateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
