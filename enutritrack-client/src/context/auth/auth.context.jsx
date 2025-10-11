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
      
      // Guardar token en cookie del navegador
      if (res.data.access_token) {
        Cookies.set("access_token", res.data.access_token, { expires: 1/96 }); // 15 min
      }
      if (res.data.refresh_token) {
        Cookies.set("refresh_token", res.data.refresh_token, { expires: 7 }); // 7 dias
      }
      
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
      console.log("Error al cerrar sesion en el servidor:", error);
    } finally {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const validateToken = async () => {
    try {
      const token = Cookies.get("access_token");
      if (!token) {
        throw new Error("No token found");
      }
      
      const res = await validateTokenRequest({ token });
      if (res.data.valid) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
      return res.data;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user || !user.id) {
        throw new Error("Usuario no autenticado");
      }
      
      // Actualizar el perfil del usuario en el estado local
      setUser((prevUser) => ({
        ...prevUser,
        ...profileData,
      }));
      
      return { success: true, message: "Perfil actualizado correctamente" };
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await validateToken();
      } catch {
        console.log("No hay token valido");
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
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
