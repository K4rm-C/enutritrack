// api/nutrition/nutrition.api.js
import { nutritionAPI } from "../axios";

// Registros de comida
export const createFoodRecordRequest = (foodRecordData) =>
  nutritionAPI.post("/nutrition/records", foodRecordData);
export const addFoodItemRequest = (recordId, foodItemData) =>
  nutritionAPI.post(`/nutrition/records/${recordId}/items`, foodItemData);
export const getFoodRecordsByUserRequest = (userId) =>
  nutritionAPI.get(`/nutrition/records/user/${userId}`);
export const getDailySummaryRequest = (userId, date) =>
  nutritionAPI.get(
    `/nutrition/daily-summary/${userId}?date=${date.toISOString()}`
  );
export const getFoodRecordByIdRequest = (id) =>
  nutritionAPI.get(`/nutrition/records/${id}`);
export const updateFoodRecordRequest = (id, foodRecordData) =>
  nutritionAPI.patch(`/nutrition/records/${id}`, foodRecordData);
export const deleteFoodRecordItemRequest = (itemId) =>
  nutritionAPI.delete(`/nutrition/records/items/${itemId}`);
export const deleteFoodRecordRequest = (id) =>
  nutritionAPI.delete(`/nutrition/records/${id}`);

// Alimentos
export const searchFoodsRequest = (query) =>
  nutritionAPI.get(`/nutrition/foods/search?q=${encodeURIComponent(query)}`);
export const getFoodsByCategoryRequest = (category) =>
  nutritionAPI.get(`/nutrition/foods/category/${encodeURIComponent(category)}`);
export const createFoodRequest = (foodData) =>
  nutritionAPI.post("/nutrition/foods", foodData);
