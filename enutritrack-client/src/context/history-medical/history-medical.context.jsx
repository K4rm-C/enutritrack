import { createContext, useContext, useState, useCallback } from "react";
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
      console.log("Enviando datos al backend:", medicalHistoryData);

      const res = await createMedicalHistoryRequest(medicalHistoryData);
      console.log("Respuesta del backend:", res.data);

      setMedicalHistory(res.data);
      return res.data;
    } catch (error) {
      console.error("Error creating medical history:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al crear historial médico";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMedicalHistoryByUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Buscando historial médico para usuario:", userId);

      const res = await getMedicalHistoryByUserRequest(userId);
      console.log("Historial médico encontrado:", res.data);

      setMedicalHistory(res.data);
      return res.data;
    } catch (error) {
      console.log("Error fetching medical history:", error);

      // Si es error 404, no es un error real - simplemente no hay historial
      if (error.response?.status === 404) {
        console.log("No se encontró historial médico para este usuario");
        setMedicalHistory(null);
        return null;
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al cargar historial médico";
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
      console.log(
        "Actualizando historial médico para:",
        userId,
        medicalHistoryData
      );

      const res = await updateMedicalHistoryRequest(userId, medicalHistoryData);
      console.log("Historial médico actualizado:", res.data);

      setMedicalHistory(res.data);
      return res.data;
    } catch (error) {
      console.error("Error updating medical history:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al actualizar historial médico";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearMedicalHistory = useCallback(() => {
    setMedicalHistory(null);
    setError(null);
  }, []);

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
        clearMedicalHistory,
      }}
    >
      {children}
    </MedicalHistoryContext.Provider>
  );
}
