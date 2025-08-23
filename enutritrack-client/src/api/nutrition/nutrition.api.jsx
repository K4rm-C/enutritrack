// api/nutrition/nutritionAuth.js
import axios from "../../api/axios";

export const createFoodRecordRequest = (foodRecord) =>
  axios.post("/nutrition", foodRecord);
export const getFoodRecordsByUserRequest = (userId) =>
  axios.get(`/nutrition/user/${userId}`);
export const getDailySummaryRequest = (userId, date) => {
  const params = date ? { date: date.toISOString().split("T")[0] } : {};
  return axios.get(`/nutrition/daily-summary/${userId}`, { params });
};
export const getFoodRecordByIdRequest = (id) => axios.get(`/nutrition/${id}`);
export const updateFoodRecordRequest = (id, foodRecord) =>
  axios.patch(`/nutrition/${id}`, foodRecord);
export const deleteFoodRecordRequest = (id) => axios.delete(`/nutrition/${id}`);
