import { recommendationAPI } from "../axios";

// ========== APIS PARA RECOMENDACIONES ==========
export const createRecommendationRequest = (recommendationData) =>
  recommendationAPI.post("/recommendations", recommendationData);
export const createAIRecommendationRequest = (aiRecommendationData) =>
  recommendationAPI.post("/recommendations/ai", aiRecommendationData);
export const getRecommendationsByUserRequest = (
  userId,
  includeInactive = false
) =>
  recommendationAPI.get(
    `/recommendations/user/${userId}${
      includeInactive ? "?includeInactive=true" : ""
    }`
  );
export const getActiveRecommendationsByUserRequest = (userId) =>
  recommendationAPI.get(`/recommendations/user/${userId}/active`);
export const getRecommendationByIdRequest = (id) =>
  recommendationAPI.get(`/recommendations/${id}`);
export const updateRecommendationRequest = (id, recommendationData) =>
  recommendationAPI.put(`/recommendations/${id}`, recommendationData);
export const deactivateRecommendationRequest = (id) =>
  recommendationAPI.put(`/recommendations/${id}/deactivate`);
export const deleteRecommendationRequest = (id) =>
  recommendationAPI.delete(`/recommendations/${id}`);
export const addRecommendationDataRequest = (id, data) =>
  recommendationAPI.post(`/recommendations/${id}/data`, data);
// ========== APIS PARA TIPOS DE RECOMENDACIÓN ==========
export const getRecommendationTypesRequest = () =>
  recommendationAPI.get("/recommendations/types");
export const createRecommendationTypeRequest = (typeData) =>
  recommendationAPI.post("/recommendations/types", typeData);
export const getRecommendationTypeByIdRequest = (id) =>
  recommendationAPI.get(`/recommendations/types/${id}`);
export const updateRecommendationTypeRequest = (id, typeData) =>
  recommendationAPI.put(`/recommendations/types/${id}`, typeData);
export const deleteRecommendationTypeRequest = (id) =>
  recommendationAPI.delete(`/recommendations/types/${id}`);
// ========== APIS PARA ESTADÍSTICAS ==========
export const getWeeklySummaryRequest = (userId, startDate) =>
  recommendationAPI.get(
    `/recommendations/user/${userId}/weekly-summary?startDate=${startDate.toISOString()}`
  );
export const getMonthlyStatsRequest = (userId, year, month) =>
  recommendationAPI.get(
    `/recommendations/user/${userId}/monthly-stats?year=${year}&month=${month}`
  );
