import { recommendationAPI } from "../axios";

export const createRecommendationRequest = (recommendation) =>
  recommendationAPI.post("/recommendations", recommendation);
export const getRecommendationsByUserRequest = (userId) =>
  recommendationAPI.get(`/recommendations/user/${userId}`);
export const getRecommendationsByUserAndTypeRequest = (userId, type) =>
  recommendationAPI.get(`/recommendations/user/${userId}/type/${type}`);
export const deleteRecommendationRequest = (id) =>
  recommendationAPI.delete(`/recommendations/${id}`);
export const quickNutritionRecommendationRequest = (userId) =>
  recommendationAPI.post(`/recommendations/quick-nutrition/${userId}`);
export const quickExerciseRecommendationRequest = (userId) =>
  recommendationAPI.post(`/recommendations/quick-exercise/${userId}`);
export const quickMedicalRecommendationRequest = (userId) =>
  recommendationAPI.post(`/recommendations/quick-medical/${userId}`);
