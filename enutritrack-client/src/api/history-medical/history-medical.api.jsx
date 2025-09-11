// api/medical-history/medicalHistoryAuth.js
import { medicalAPI } from "../../api/axios";

export const createMedicalHistoryRequest = (medicalHistory) =>
  medicalAPI.post("/medical-history", medicalHistory);
export const getMedicalHistoryByUserRequest = (userId) =>
  medicalAPI.get(`/medical-history/${userId}`);
export const updateMedicalHistoryRequest = (userId, medicalHistory) =>
  medicalAPI.patch(`/medical-history/${userId}`, medicalHistory);
