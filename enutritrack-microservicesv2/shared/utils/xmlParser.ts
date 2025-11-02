// shared/utils/xmlParser.ts
import { parseString } from "xml2js";

/**
 * Parsea XML a JSON
 */
export const parseXmlToJson = (xml: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) {
        reject(new Error("XML inválido"));
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Convierte JSON a XML
 */
export const convertJsonToXml = (
  obj: any,
  rootName: string = "root"
): string => {
  const convertObject = (obj: any, indent: string = ""): string => {
    let xml = "";

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (value === null || value === undefined) {
          xml += `${indent}<${key}></${key}>\n`;
        } else if (typeof value === "object" && !Array.isArray(value)) {
          xml += `${indent}<${key}>\n`;
          xml += convertObject(value, indent + "  ");
          xml += `${indent}</${key}>\n`;
        } else if (Array.isArray(value)) {
          value.forEach((item) => {
            if (typeof item === "object") {
              xml += `${indent}<${key}>\n`;
              xml += convertObject(item, indent + "  ");
              xml += `${indent}</${key}>\n`;
            } else {
              xml += `${indent}<${key}>${escapeXml(
                item.toString()
              )}</${key}>\n`;
            }
          });
        } else {
          xml += `${indent}<${key}>${escapeXml(value.toString())}</${key}>\n`;
        }
      }
    }

    return xml;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${convertObject(
    obj,
    "  "
  )}</${rootName}>`;
};

/**
 * Escapa caracteres especiales para XML
 */
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
};

/**
 * Middleware para parsear requests XML
 */
export const xmlMiddleware = (req: any, res: any, next: any) => {
  if (req.is("application/xml") && req.body) {
    const xmlString = req.body.toString();

    parseXmlToJson(xmlString)
      .then((json) => {
        req.body = json;
        next();
      })
      .catch((error) => {
        res.status(400).json({
          success: false,
          error: "XML inválido",
        });
      });
  } else {
    next();
  }
};

/**
 * Formatea respuesta como XML
 */
export const formatXmlResponse = (
  data: any,
  rootName: string = "response"
): string => {
  const response = {
    success: true,
    data: data,
  };

  return convertJsonToXml(response, rootName);
};

/**
 * Maneja errores y los formatea como XML
 */
export const formatXmlError = (error: string, code: number = 400): string => {
  const errorResponse = {
    success: false,
    error: error,
  };

  return convertJsonToXml(errorResponse, "error");
};
