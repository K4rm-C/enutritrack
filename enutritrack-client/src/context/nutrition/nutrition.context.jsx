// contexts/NutritionContext.js
import { createContext, useContext, useState } from "react";
import {
  createFoodRecordRequest,
  addFoodItemRequest,
  getFoodRecordsByUserRequest,
  getDailySummaryRequest,
  getFoodRecordByIdRequest,
  updateFoodRecordRequest,
  deleteFoodRecordItemRequest,
  deleteFoodRecordRequest,
  searchFoodsRequest,
  getFoodsByCategoryRequest,
  createFoodRequest,
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
  const [foods, setFoods] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const createFoodRecord = async (foodRecordData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createFoodRecordRequest(foodRecordData);
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al crear registro de comida";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addFoodItem = async (recordId, foodItemData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await addFoodItemRequest(recordId, foodItemData);
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al agregar alimento";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFoodRecordsByUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFoodRecordsByUserRequest(userId);
      setFoodRecords(res.data);
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al cargar registros de comida";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDailySummary = async (userId, date) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDailySummaryRequest(userId, date);
      setDailySummary(res.data);
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al cargar resumen diario";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFoodRecordById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFoodRecordByIdRequest(id);
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al cargar registro";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFoodRecord = async (id, foodRecordData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateFoodRecordRequest(id, foodRecordData);
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar registro";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteFoodRecordItem = async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await deleteFoodRecordItemRequest(itemId);
      if (res.status === 200 || res.status === 204) {
        setFoodRecords((prev) =>
          prev.map((record) => ({
            ...record,
            items: record.items
              ? record.items.filter((item) => item.id !== itemId)
              : [],
          }))
        );
      }
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar alimento";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteFoodRecord = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await deleteFoodRecordRequest(id);
      if (res.status === 200 || res.status === 204) {
        setFoodRecords((prev) => prev.filter((record) => record.id !== id));
      }
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar registro";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const res = await searchFoodsRequest(query);
      setFoods(res.data);
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al buscar alimentos";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFoodsByCategory = async (category) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFoodsByCategoryRequest(category);
      setFoods(res.data);
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error al cargar alimentos por categoría";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createFood = async (foodData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createFoodRequest(foodData);
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al crear alimento";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearFoods = () => {
    setFoods([]);
  };

  return (
    <NutritionContext.Provider
      value={{
        foodRecords,
        foods,
        dailySummary,
        loading,
        error,
        clearError,
        createFoodRecord,
        addFoodItem,
        getFoodRecordsByUser,
        getDailySummary,
        getFoodRecordById,
        updateFoodRecord,
        deleteFoodRecordItem,
        deleteFoodRecord,
        searchFoods,
        getFoodsByCategory,
        createFood,
        clearFoods,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
}
