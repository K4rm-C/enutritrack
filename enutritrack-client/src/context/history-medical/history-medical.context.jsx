// src/context/medical-history/medical-history.context.js
import React, { createContext, useContext, useState, useCallback } from "react";
import {
  createMedicalHistoryRequest,
  getMedicalHistoryByUserRequest,
  updateMedicalHistoryRequest,
} from "../../api/history-medical/history-medical.api";

const MedicalHistoryContext = createContext();

export const useMedicalHistory = () => {
  const context = useContext(MedicalHistoryContext);
  if (!context) {
    throw new Error(
      "useMedicalHistory debe usarse dentro de MedicalHistoryProvider"
    );
  }
  return context;
};

export function MedicalHistoryProvider({ children }) {
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setPatient = useCallback((patient) => {
    setSelectedPatient(patient);
  }, []);

  const transformFromServer = useCallback((data) => {
    if (!data) return null;

    const ensureStringArray = (value) => {
      if (Array.isArray(value)) {
        return value.map((item) => String(item || ""));
      } else if (value && value !== "") {
        return [String(value)];
      } else {
        return [];
      }
    };

    return {
      ...data,
      condiciones: ensureStringArray(data.condiciones),
      alergias: ensureStringArray(data.alergias),
      medicamentos: ensureStringArray(data.medicamentos),
      procedimientos: [],
      examenes: [],
    };
  }, []);

  // ✅ CORREGIDO: Transformar datos asegurando que los arrays se envíen correctamente
  const transformToServer = useCallback((data) => {
    console.log("🔍 Datos ANTES de transformar:", data);

    // Función helper para procesar arrays
    const processArray = (arr) => {
      if (!Array.isArray(arr)) return [];
      // Filtrar elementos vacíos o solo con espacios
      return arr
        .map((item) =>
          typeof item === "string" ? item.trim() : String(item || "").trim()
        )
        .filter((item) => item.length > 0);
    };

    const transformed = {
      usuarioId: data.usuarioId,
      condiciones: processArray(data.condiciones),
      alergias: processArray(data.alergias),
      medicamentos: processArray(data.medicamentos),
    };

    console.log("✅ Datos DESPUÉS de transformar:", transformed);
    console.log("📊 Conteos:", {
      condiciones: transformed.condiciones.length,
      alergias: transformed.alergias.length,
      medicamentos: transformed.medicamentos.length,
    });

    return transformed;
  }, []);

  const getMedicalHistoryByUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      console.log("📥 Obteniendo historial para usuario:", userId);
      const res = await getMedicalHistoryByUserRequest(userId);
      console.log("📦 Respuesta del servidor:", res.data);
      const transformedData = transformFromServer(res.data);
      setMedicalHistory(transformedData);
      return transformedData;
    } catch (error) {
      console.error("❌ Error fetching medical history:", error);
      if (error.response?.status !== 404) {
        const errorMessage =
          error.response?.data?.message || "Error al cargar historial médico";
        setError(errorMessage);
        throw error;
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createMedicalHistory = async (medicalHistoryData) => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 Creando historial con datos:", medicalHistoryData);
      const serverData = transformToServer(medicalHistoryData);
      console.log("🚀 Enviando al servidor:", serverData);
      const res = await createMedicalHistoryRequest(serverData);
      console.log("✅ Respuesta del servidor:", res.data);
      const transformedData = transformFromServer(res.data);
      setMedicalHistory(transformedData);
      return transformedData;
    } catch (error) {
      console.error("❌ Error creating medical history:", error);
      console.error("📋 Detalles del error:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "Error al crear historial médico";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMedicalHistory = async (userId, medicalHistoryData) => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 Actualizando historial para usuario:", userId);
      console.log("📋 Datos a actualizar:", medicalHistoryData);
      const res = await updateMedicalHistoryRequest(userId, medicalHistoryData);
      console.log("✅ Respuesta del servidor:", res.data);
      const transformedData = transformFromServer(res.data);
      setMedicalHistory(res);
      return transformedData;
    } catch (error) {
      console.error("❌ Error updating medical history:", error);
      console.error("📋 Detalles del error:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "Error al actualizar historial médico";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearAll = useCallback(() => {
    setMedicalHistory(null);
    setSelectedPatient(null);
    setError(null);
    setLoading(false);
  }, []);

  const clearMedicalHistory = useCallback(() => {
    setMedicalHistory(null);
    setSelectedPatient(null);
  }, []);

  const value = {
    medicalHistory,
    loading,
    error,
    selectedPatient,
    createMedicalHistory,
    getMedicalHistoryByUser,
    updateMedicalHistory,
    clearError,
    setSelectedPatient: setPatient,
    clearAll,
    clearMedicalHistory,
  };

  return (
    <MedicalHistoryContext.Provider value={value}>
      {children}
    </MedicalHistoryContext.Provider>
  );
}
