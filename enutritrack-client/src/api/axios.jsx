import axios from "axios";

// URLs base para cada microservicio
const API_BASE_URL_USER = "http://35.239.67.227:3001/";
const API_BASE_URL_MEDICAL = "http://35.239.67.227:3002/";
const API_BASE_URL_NUTRITION = "http://35.239.67.227:3003/";
const API_BASE_URL_AUTH = "http://35.239.67.227:3004/";
const API_BASE_URL_ACTIVITY = "http://35.239.67.227:3005/";
const API_BASE_URL_RECOMMENDATION = "http://35.239.67.227:3006/";
const API_BASE_URL_CITAS_MEDIAS = "http://35.239.67.227:3008/";
const API_BASE_URL_ALERTAS = "http://35.239.67.227:3009/";

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      // Obtener token de cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error("Error de autenticación:", error.response.data);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const userAPI = createAxiosInstance(API_BASE_URL_USER);
export const medicalAPI = createAxiosInstance(API_BASE_URL_MEDICAL);
export const citasAPI = createAxiosInstance(API_BASE_URL_CITAS_MEDIAS);
export const nutritionAPI = createAxiosInstance(API_BASE_URL_NUTRITION);
export const authAPI = createAxiosInstance(API_BASE_URL_AUTH);
export const activityAPI = createAxiosInstance(API_BASE_URL_ACTIVITY);
export const recommendationAPI = createAxiosInstance(
  API_BASE_URL_RECOMMENDATION
);
export const alertasAPI = createAxiosInstance(API_BASE_URL_ALERTAS);
