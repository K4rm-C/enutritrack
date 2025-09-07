// contexts/RecommendationsContext.js
import { createContext, useContext, useState } from "react";
import {
  createRecommendationRequest,
  getRecommendationsByUserRequest,
  getRecommendationsByUserAndTypeRequest,
  deleteRecommendationRequest,
  quickNutritionRecommendationRequest,
  quickExerciseRecommendationRequest,
  quickMedicalRecommendationRequest,
} from "../../api/recommendation/recommendation.api";

const RecommendationsContext = createContext();

export const useRecommendations = () => {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error(
      "useRecommendations must be used within RecommendationsProvider"
    );
  }
  return context;
};

export function RecommendationsProvider({ children }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRecommendation = async (recommendationData) => {
    try {
      const res = await createRecommendationRequest(recommendationData);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getRecommendationsByUser = async (userId) => {
    try {
      const res = await getRecommendationsByUserRequest(userId);
      setRecommendations(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getRecommendationsByUserAndType = async (userId, type) => {
    try {
      const res = await getRecommendationsByUserAndTypeRequest(userId, type);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const deleteRecommendation = async (id) => {
    try {
      const res = await deleteRecommendationRequest(id);
      if (res.status === 200 || res.status === 204) {
        setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
      }
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Funciones de recomendaciones rápidas - ahora reciben el objeto completo
  const quickNutritionRecommendation = async (recommendationData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await quickNutritionRecommendationRequest(recommendationData);
      if (res.data) {
        setRecommendations((prev) => [res.data, ...prev]);
      }
      return res.data;
    } catch (error) {
      console.error("Error generating nutrition recommendation:", error);
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const quickExerciseRecommendation = async (recommendationData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await quickExerciseRecommendationRequest(recommendationData);
      setRecommendations((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Error generating exercise recommendation:", error);
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const quickMedicalRecommendation = async (recommendationData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await quickMedicalRecommendationRequest(recommendationData);
      if (res.data) {
        setRecommendations((prev) => [res.data, ...prev]);
      }
      return res.data;
    } catch (error) {
      console.error("Error generating medical recommendation:", error);
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecommendationsContext.Provider
      value={{
        recommendations,
        loading,
        error,
        createRecommendation,
        getRecommendationsByUser,
        getRecommendationsByUserAndType,
        deleteRecommendation,
        quickNutritionRecommendation,
        quickExerciseRecommendation,
        quickMedicalRecommendation,
      }}
    >
      {children}
    </RecommendationsContext.Provider>
  );
}
