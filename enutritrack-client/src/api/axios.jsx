// src/config/axios.js
import axios from "axios";

const API_BASE_URL = "http://localhost:4000/";

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Importante: esto envía cookies automáticamente
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para requests - agregar token si existe
axiosInstance.interceptors.request.use(
  (config) => {
    // Obtener token de cookies
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request config:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      withCredentials: config.withCredentials,
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Error de autenticación:", error.response.data);
      // Opcional: redirigir al login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
