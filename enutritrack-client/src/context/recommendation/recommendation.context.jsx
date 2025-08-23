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
    throw new Error("useRecommendations ya esta usado");
  }
  return context;
};

export function RecommendationsProvider({ children }) {
  const [recommendations, setRecommendations] = useState([]);

  const createRecommendation = async (recommendation) => {
    try {
      const res = await createRecommendationRequest(recommendation);
      console.log(res);
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
        setRecommendations(recommendations.filter((rec) => rec.id !== id));
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const quickNutritionRecommendation = async (userId) => {
    try {
      const res = await quickNutritionRecommendationRequest(userId);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const quickExerciseRecommendation = async (userId) => {
    try {
      const res = await quickExerciseRecommendationRequest(userId);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const quickMedicalRecommendation = async (userId) => {
    try {
      const res = await quickMedicalRecommendationRequest(userId);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <RecommendationsContext.Provider
      value={{
        recommendations,
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
