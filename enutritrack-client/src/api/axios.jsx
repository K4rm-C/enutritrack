import axios from "axios";

// URLs base para cada microservicio (mantener igual)
const API_BASE_URL_USER = "http://35.239.67.227:3001/";
const API_BASE_URL_MEDICAL = "http://35.239.67.227:3002/";
const API_BASE_URL_NUTRITION = "http://35.239.67.227:3003/";
const API_BASE_URL_AUTH = "http://35.239.67.227:3004/";
const API_BASE_URL_ACTIVITY = "http://35.239.67.227:3005/";
const API_BASE_URL_RECOMMENDATION = "http://35.239.67.227:3006/";
const API_BASE_URL_CITAS_MEDIAS = "http://35.239.67.227:3008/";
const API_BASE_URL_ALERTAS = "http://35.239.67.227:3009/";

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
