// api/auth/authAuth.js
import axios from "../../api/axios";

export const loginRequest = (credentials) =>
  axios.post("/auth/login", credentials);
export const logoutRequest = () => axios.post("/auth/logout");
export const validateTokenRequest = () => axios.post("/auth/validate");
