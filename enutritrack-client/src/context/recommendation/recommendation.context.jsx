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
      setLoading(true);
      setError(null);
      const res = await createRecommendationRequest(recommendationData);
      console.log("Recomendación creada:", res.data);

      // Actualizar la lista local
      if (res.data) {
        setRecommendations((prev) => [res.data, ...prev]);
      }

      return res.data;
    } catch (error) {
      console.error("Error creating recommendation:", error);
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationsByUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Obteniendo recomendaciones para usuario:", userId);
      const res = await getRecommendationsByUserRequest(userId);

      console.log("Respuesta del servidor:", res);

      const recommendationsData = res.data || [];
      setRecommendations(recommendationsData);

      // Mensaje específico cuando no hay recomendaciones
      if (recommendationsData.length === 0) {
        console.log("No se encontraron recomendaciones para este usuario");
      }

      return recommendationsData;
    } catch (error) {
      console.error("Error fetching recommendations:", error);

      // Manejo específico para diferentes tipos de errores
      if (error.response?.status === 401) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
      } else if (error.response?.status === 404) {
        setError("No se encontraron recomendaciones para este usuario.");
        setRecommendations([]);
        return [];
      } else {
        setError(
          error.response?.data?.message || "Error al cargar las recomendaciones"
        );
      }

      // En caso de error, asegurar que el estado esté vacío
      setRecommendations([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationsByUserAndType = async (userId, type) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRecommendationsByUserAndTypeRequest(userId, type);
      return res.data;
    } catch (error) {
      console.error("Error fetching recommendations by type:", error);
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecommendation = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await deleteRecommendationRequest(id);

      if (res.status === 200 || res.status === 204) {
        setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
      }

      return res.data;
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Funciones de recomendaciones rápidas - ahora reciben el objeto completo
  const quickNutritionRecommendation = async (recommendationData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await quickNutritionRecommendationRequest(recommendationData);
      console.log("Recomendación de nutrición generada:", res.data);

      // Actualizar la lista local
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
      console.log("Recomendación de ejercicio generada:", res.data);

      // Actualizar la lista local
      if (res.data) {
        setRecommendations((prev) => [res.data, ...prev]);
      }

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
      console.log("Recomendación médica generada:", res.data);

      // Actualizar la lista local
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
