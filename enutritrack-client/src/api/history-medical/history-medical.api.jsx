// api/medical-history/medicalHistoryAuth.js
import axios from "../../api/axios";

export const createMedicalHistoryRequest = (medicalHistory) =>
  axios.post("/medical-history", medicalHistory);
export const getMedicalHistoryByUserRequest = (userId) =>
  axios.get(`/medical-history/${userId}`);
export const updateMedicalHistoryRequest = (userId, medicalHistory) =>
  axios.patch(`/medical-history/${userId}`, medicalHistory);
