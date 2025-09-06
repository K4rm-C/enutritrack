// contexts/NutritionContext.js
import { createContext, useContext, useState } from "react";
import {
  createFoodRecordRequest,
  getFoodRecordsByUserRequest,
  getDailySummaryRequest,
  getFoodRecordByIdRequest,
  updateFoodRecordRequest,
  deleteFoodRecordRequest,
} from "../../api/nutrition/nutrition.api";

const NutritionContext = createContext();

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error(
      "useNutrition debe ser usado dentro de un NutritionProvider"
    );
  }
  return context;
};

export function NutritionProvider({ children }) {
  const [foodRecords, setFoodRecords] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);

  const createFoodRecord = async (foodRecord) => {
    try {
      const res = await createFoodRecordRequest(foodRecord);
      return res.data;
    } catch (error) {
      console.error(
        "Error en createFoodRecord:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const getFoodRecordsByUser = async (userId) => {
    try {
      const res = await getFoodRecordsByUserRequest(userId);
      setFoodRecords(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getDailySummary = async (userId, date) => {
    try {
      const res = await getDailySummaryRequest(userId, date);
      setDailySummary(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getFoodRecordById = async (id) => {
    try {
      const res = await getFoodRecordByIdRequest(id);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const updateFoodRecord = async (id, foodRecord) => {
    try {
      const res = await updateFoodRecordRequest(id, foodRecord);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const deleteFoodRecord = async (id) => {
    try {
      const res = await deleteFoodRecordRequest(id);
      if (res.status === 200 || res.status === 204) {
        setFoodRecords(foodRecords.filter((record) => record.id !== id));
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <NutritionContext.Provider
      value={{
        foodRecords,
        dailySummary,
        createFoodRecord,
        getFoodRecordsByUser,
        getDailySummary,
        getFoodRecordById,
        updateFoodRecord,
        deleteFoodRecord,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
}
