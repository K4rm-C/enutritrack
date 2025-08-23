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
    throw new Error("useMedicalHistory ya esta usado");
  }
  return context;
};

export function MedicalHistoryProvider({ children }) {
  const [medicalHistory, setMedicalHistory] = useState(null);

  const createMedicalHistory = async (medicalHistoryData) => {
    try {
      const res = await createMedicalHistoryRequest(medicalHistoryData);
      setMedicalHistory(res.data);
      console.log(res);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getMedicalHistoryByUser = async (userId) => {
    try {
      const res = await getMedicalHistoryByUserRequest(userId);
      setMedicalHistory(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const updateMedicalHistory = async (userId, medicalHistoryData) => {
    try {
      const res = await updateMedicalHistoryRequest(userId, medicalHistoryData);
      setMedicalHistory(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <MedicalHistoryContext.Provider
      value={{
        medicalHistory,
        createMedicalHistory,
        getMedicalHistoryByUser,
        updateMedicalHistory,
      }}
    >
      {children}
    </MedicalHistoryContext.Provider>
  );
}
