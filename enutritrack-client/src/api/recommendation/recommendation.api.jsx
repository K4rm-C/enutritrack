// api/recommendations/recommendationsAuth.js
import axios from "../../api/axios";

export const createRecommendationRequest = (recommendation) =>
  axios.post("/recommendations", recommendation);
export const getRecommendationsByUserRequest = (userId) =>
  axios.get(`/recommendations/user/${userId}`);
export const getRecommendationsByUserAndTypeRequest = (userId, type) =>
  axios.get(`/recommendations/user/${userId}/type/${type}`);
export const deleteRecommendationRequest = (id) =>
  axios.delete(`/recommendations/${id}`);
export const quickNutritionRecommendationRequest = (userId) =>
  axios.post(`/recommendations/quick-nutrition/${userId}`);
export const quickExerciseRecommendationRequest = (userId) =>
  axios.post(`/recommendations/quick-exercise/${userId}`);
export const quickMedicalRecommendationRequest = (userId) =>
  axios.post(`/recommendations/quick-medical/${userId}`);
