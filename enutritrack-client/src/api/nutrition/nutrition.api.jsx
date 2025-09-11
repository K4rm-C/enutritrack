import { nutritionAPI } from "../axios";

export const createFoodRecordRequest = (foodRecord) =>
  nutritionAPI.post("/nutrition", foodRecord);
export const getFoodRecordsByUserRequest = (userId) =>
  nutritionAPI.get(`/nutrition/user/${userId}`);
export const getDailySummaryRequest = (userId, date) => {
  const params = date ? { date: date.toISOString().split("T")[0] } : {};
  return nutritionAPI.get(`/nutrition/daily-summary/${userId}`, { params });
};
export const getFoodRecordByIdRequest = (id) =>
  nutritionAPI.get(`/nutrition/${id}`);
export const updateFoodRecordRequest = (id, foodRecord) =>
  nutritionAPI.patch(`/nutrition/${id}`, foodRecord);
export const deleteFoodRecordRequest = (id) =>
  nutritionAPI.delete(`/nutrition/${id}`);
