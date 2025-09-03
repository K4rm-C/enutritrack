// contexts/MedicalHistoryContext.js
import { createContext, useContext, useState } from "react";
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

  const clearError = () => {
    setError(null);
  };

  const createMedicalHistory = async (medicalHistoryData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createMedicalHistoryRequest(medicalHistoryData);

      // Actualizar el estado con los nuevos datos
      setMedicalHistory(res.data);

      return res.data;
    } catch (error) {
      console.error("Error creating medical history:", error);
      setError(
        error.response?.data?.message || "Error al crear historial médico"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMedicalHistoryByUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMedicalHistoryByUserRequest(userId);

      console.log("🔍 Respuesta del API:", res.data);
      setMedicalHistory(res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching medical history:", error);
      if (error.response?.status === 404) {
        setMedicalHistory(null);
        setError(null);
        return null;
      } else {
        setError(
          error.response?.data?.message || "Error al cargar historial médico"
        );
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const updateMedicalHistory = async (userId, medicalHistoryData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateMedicalHistoryRequest(userId, medicalHistoryData);
      setMedicalHistory(res.data);
      return res.data;
    } catch (error) {
      console.error("Error updating medical history:", error);
      const errorMessage =
        error.response?.data?.message || "Error al actualizar historial médico";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MedicalHistoryContext.Provider
      value={{
        medicalHistory,
        loading,
        error,
        createMedicalHistory,
        getMedicalHistoryByUser,
        updateMedicalHistory,
        clearError,
      }}
    >
      {children}
    </MedicalHistoryContext.Provider>
  );
}
