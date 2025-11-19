import React, { createContext, useContext, useState, useCallback } from "react";
import {
  createRecommendationRequest,
  createAIRecommendationRequest,
  getRecommendationsByUserRequest,
  getActiveRecommendationsByUserRequest,
  getRecommendationTypesRequest,
  getRecommendationByIdRequest,
  updateRecommendationRequest,
  deactivateRecommendationRequest,
  deleteRecommendationRequest,
  createRecommendationTypeRequest,
  updateRecommendationTypeRequest,
  deleteRecommendationTypeRequest,
  getRecommendationTypeByIdRequest,
  getWeeklySummaryRequest,
  getMonthlyStatsRequest,
} from "../../api/recommendation/recommendation.api";

const RecommendationsContext = createContext();

export const useRecommendations = () => {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error(
      "useRecommendations debe usarse dentro de RecommendationsProvider"
    );
  }
  return context;
};

export function RecommendationsProvider({ children }) {
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationTypes, setRecommendationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setPatient = useCallback((patient) => {
    setSelectedPatient(patient);
  }, []);

  // ========== FUNCIONES PARA RECOMENDACIONES ==========

  const getRecommendationsByUser = async (userId, includeInactive = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRecommendationsByUserRequest(
        userId,
        includeInactive
      );
      setRecommendations(res.data || []);
      return res.data;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      const errorMessage =
        error.response?.data?.message || "Error al cargar recomendaciones";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getActiveRecommendationsByUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getActiveRecommendationsByUserRequest(userId);
      setRecommendations(res.data || []);
      return res.data;
    } catch (error) {
      console.error("Error fetching active recommendations:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al cargar recomendaciones activas";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createRecommendation = async (recommendationData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createRecommendationRequest(recommendationData);
      setRecommendations((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Error creating recommendation:", error);
      const errorMessage =
        error.response?.data?.message || "Error al crear recomendación";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAIRecommendation = async (aiRecommendationData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createAIRecommendationRequest(aiRecommendationData);
      setRecommendations((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Error creating AI recommendation:", error);
      const errorMessage =
        error.response?.data?.message || "Error al crear recomendación con IA";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendation = async (id, recommendationData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateRecommendationRequest(id, recommendationData);
      setRecommendations((prev) =>
        prev.map((rec) => (rec.id === id ? res.data : rec))
      );
      return res.data;
    } catch (error) {
      console.error("Error updating recommendation:", error);
      const errorMessage =
        error.response?.data?.message || "Error al actualizar recomendación";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deactivateRecommendation = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await deactivateRecommendationRequest(id);
      setRecommendations((prev) =>
        prev.map((rec) => (rec.id === id ? res.data : rec))
      );
      return res.data;
    } catch (error) {
      console.error("Error deactivating recommendation:", error);
      const errorMessage =
        error.response?.data?.message || "Error al desactivar recomendación";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecommendation = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteRecommendationRequest(id);
      setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      const errorMessage =
        error.response?.data?.message || "Error al eliminar recomendación";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES PARA TIPOS DE RECOMENDACIÓN ==========

  const getRecommendationTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRecommendationTypesRequest();
      setRecommendationTypes(res.data || []);
      return res.data;
    } catch (error) {
      console.error("Error fetching recommendation types:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al cargar tipos de recomendación";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createRecommendationType = async (typeData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createRecommendationTypeRequest(typeData);
      setRecommendationTypes((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error creating recommendation type:", error);
      const errorMessage =
        error.response?.data?.message || "Error al crear tipo de recomendación";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendationType = async (id, typeData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateRecommendationTypeRequest(id, typeData);
      setRecommendationTypes((prev) =>
        prev.map((type) => (type.id === id ? res.data : type))
      );
      return res.data;
    } catch (error) {
      console.error("Error updating recommendation type:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al actualizar tipo de recomendación";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecommendationType = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteRecommendationTypeRequest(id);
      setRecommendationTypes((prev) => prev.filter((type) => type.id !== id));
    } catch (error) {
      console.error("Error deleting recommendation type:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al eliminar tipo de recomendación";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationTypeById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRecommendationTypeByIdRequest(id);
      return res.data;
    } catch (error) {
      console.error("Error fetching recommendation type:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al cargar tipo de recomendación";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES ADICIONALES ==========

  const getWeeklySummary = async (userId, startDate) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getWeeklySummaryRequest(userId, startDate);
      return res.data;
    } catch (error) {
      console.error("Error fetching weekly summary:", error);
      const errorMessage =
        error.response?.data?.message || "Error al obtener resumen semanal";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyStats = async (userId, year, month) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMonthlyStatsRequest(userId, year, month);
      return res.data;
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al obtener estadísticas mensuales";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Limpiar estado
  const clearAll = useCallback(() => {
    setRecommendations([]);
    setRecommendationTypes([]);
    setSelectedPatient(null);
    setError(null);
    setLoading(false);
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setSelectedPatient(null);
  }, []);

  const value = {
    // Estado
    recommendations,
    recommendationTypes,
    loading,
    error,
    selectedPatient,

    // Acciones para recomendaciones
    getRecommendationsByUser,
    getActiveRecommendationsByUser,
    createRecommendation,
    createAIRecommendation,
    updateRecommendation,
    deactivateRecommendation,
    deleteRecommendation,

    // Acciones para tipos de recomendación
    getRecommendationTypes,
    createRecommendationType,
    updateRecommendationType,
    deleteRecommendationType,
    getRecommendationTypeById,

    // Funciones adicionales
    getWeeklySummary,
    getMonthlyStats,

    // Utilidades
    clearError,
    setSelectedPatient: setPatient,
    clearAll,
    clearRecommendations,
  };

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  );
}
