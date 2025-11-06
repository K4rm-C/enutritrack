// contexts/MedicalHistoryContext.js
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
  const [currentPatient, setCurrentPatient] = useState(null);

  const clearError = () => {
    setError(null);
  };

  const setPatient = (patient) => {
    setCurrentPatient(patient);
  };

  const createMedicalHistory = async (medicalHistoryData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createMedicalHistoryRequest(medicalHistoryData);
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
      setMedicalHistory(res.data);
      return res.data;
    } catch (error) {
      console.log("Error fetching medical history:", error);
      const errorMessage =
        error.response?.data?.message || "Error al cargar historial médico";
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

  const getPatientMedicalHistory = async (patientId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMedicalHistoryByUserRequest(patientId);
      setMedicalHistory(res.data);
      return res.data;
    } catch (error) {
      console.log("Error fetching patient medical history:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al cargar historial médico del paciente";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePatientMedicalHistory = async (patientId, medicalHistoryData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateMedicalHistoryRequest(
        patientId,
        medicalHistoryData
      );
      setMedicalHistory(res.data);
      return res.data;
    } catch (error) {
      console.error("Error updating patient medical history:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al actualizar historial médico del paciente";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearMedicalHistory = useCallback(() => {
    setMedicalHistory(null);
    setCurrentPatient(null);
    setError(null);
  }, []);

  return (
    <MedicalHistoryContext.Provider
      value={{
        medicalHistory,
        loading,
        error,
        currentPatient,
        createMedicalHistory,
        getMedicalHistoryByUser: getPatientMedicalHistory,
        updateMedicalHistory: updatePatientMedicalHistory,
        getMedicalHistoryByUser,
        updateMedicalHistory,
        clearError,
        setPatient,
        clearMedicalHistory,
      }}
    >
      {children}
    </MedicalHistoryContext.Provider>
  );
}
