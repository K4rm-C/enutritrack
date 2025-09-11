import { authAPI } from "../axios";

// Servicios de autenticación
export const loginRequest = (credentials) =>
  authAPI.post("/auth/login", credentials);
export const logoutRequest = () => authAPI.post("/auth/logout");
export const validateTokenRequest = () => authAPI.post("/auth/validate");
