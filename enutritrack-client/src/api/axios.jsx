import axios from "axios";

// Detectar si estamos en desarrollo local o producción
const isLocalDevelopment = () => {
  if (typeof window === "undefined") return true; // SSR fallback
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === ""
  );
};

// Función helper para obtener la URL base según el entorno
const getBaseUrl = (localUrl, relativePath) => {
  return isLocalDevelopment() ? localUrl : relativePath;
};

// URLs base para cada microservicio (híbrido: local o producción automático)
const API_BASE_URL_USER = getBaseUrl("http://localhost:3001/", "/users/");
const API_BASE_URL_MEDICAL = getBaseUrl(
  "http://localhost:3002/",
  "/medical-history/"
);
const API_BASE_URL_NUTRITION = getBaseUrl(
  "http://localhost:3003/",
  "/nutrition/"
);
const API_BASE_URL_AUTH = getBaseUrl("http://localhost:3004/", "/auth/");
const API_BASE_URL_ACTIVITY = getBaseUrl(
  "http://localhost:3005/",
  "/physical-activity/"
);
const API_BASE_URL_RECOMMENDATION = getBaseUrl(
  "http://localhost:3006/",
  "/recommendations/"
);
const API_BASE_URL_CITAS_MEDIAS = getBaseUrl(
  "http://localhost:3008/",
  "/citas-medicas/"
);
const API_BASE_URL_ALERTAS = getBaseUrl("http://localhost:3009/", "/alerts/");

// Función para convertir objeto a XML
const objectToXml = (obj, rootName = "root") => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?><${rootName}>`;

  const toXml = (obj) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          xml += `<${key}>${toXml(obj[key])}</${key}>`;
        } else {
          xml += `<${key}>${obj[key]}</${key}>`;
        }
      }
    }
    return "";
  };

  toXml(obj);
  xml += `</${rootName}>`;
  return xml;
};

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/xml", // Cambiar a XML
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

      // Convertir data de JSON a XML antes de enviar
      if (config.data && typeof config.data === "object") {
        config.data = objectToXml(config.data, "request");
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      // Si la respuesta es XML, convertir a JSON
      if (
        response.headers["content-type"]?.includes("application/xml") &&
        typeof response.data === "string"
      ) {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(
            response.data,
            "application/xml"
          );
          response.data = xmlToJson(xmlDoc);
        } catch (error) {
          console.error("Error parsing XML response:", error);
        }
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        console.error("Error de autenticación:", error.response.data);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Función para convertir XML a JSON
const xmlToJson = (xml) => {
  let obj = {};

  if (xml.nodeType === 1) {
    // element node
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    // text node
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;
      if (typeof obj[nodeName] === "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push === "undefined") {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }

  return obj;
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
