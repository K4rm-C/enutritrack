import { authAPI } from "../axios";

// Servicios de autenticacion
export const loginRequest = (credentials) =>
  authAPI.post("/auth/login", credentials);
export const logoutRequest = () => authAPI.post("/auth/logout");
export const validateTokenRequest = (data) => authAPI.post("/auth/validate", data);
