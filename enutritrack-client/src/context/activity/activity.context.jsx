// contexts/PhysicalActivityContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import {
  createPhysicalActivityRequest,
  getPhysicalActivitiesByUserRequest,
  getPhysicalActivityByIdRequest,
  updatePhysicalActivityRequest,
  deletePhysicalActivityRequest,
  getActivityTypesRequest,
  getWeeklySummaryRequest,
  getMonthlyStatsRequest,
} from "../../api/activity/activity.api";

const PhysicalActivityContext = createContext();

export const usePhysicalActivity = () => {
  const context = useContext(PhysicalActivityContext);
  if (!context) {
    throw new Error(
      "usePhysicalActivity debe usarse dentro de PhysicalActivityProvider"
    );
  }
  return context;
};

export function PhysicalActivityProvider({ children }) {
  const [physicalActivities, setPhysicalActivities] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setPatient = useCallback((patient) => {
    setSelectedPatient(patient);
  }, []);

  // Obtener actividades físicas por usuario
  const getPhysicalActivitiesByUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPhysicalActivitiesByUserRequest(userId);
      setPhysicalActivities(res.data || []);
      return res.data;
    } catch (error) {
      console.error("Error fetching physical activities:", error);
      const errorMessage =
        error.response?.data?.message || "Error al cargar actividades físicas";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obtener tipos de actividad
  const getActivityTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getActivityTypesRequest();
      setActivityTypes(res.data || []);
      return res.data;
    } catch (error) {
      console.error("Error fetching activity types:", error);
      const errorMessage =
        error.response?.data?.message || "Error al cargar tipos de actividad";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Crear actividad física
  const createPhysicalActivity = async (activityData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createPhysicalActivityRequest(activityData);
      // Agregar la nueva actividad al estado
      setPhysicalActivities((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Error creating physical activity:", error);
      const errorMessage =
        error.response?.data?.message || "Error al crear actividad física";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar actividad física
  const updatePhysicalActivity = async (id, activityData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updatePhysicalActivityRequest(id, activityData);
      // Actualizar la actividad en el estado
      setPhysicalActivities((prev) =>
        prev.map((activity) => (activity.id === id ? res.data : activity))
      );
      return res.data;
    } catch (error) {
      console.error("Error updating physical activity:", error);
      const errorMessage =
        error.response?.data?.message || "Error al actualizar actividad física";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar actividad física
  const deletePhysicalActivity = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deletePhysicalActivityRequest(id);
      // Eliminar la actividad del estado
      setPhysicalActivities((prev) =>
        prev.filter((activity) => activity.id !== id)
      );
    } catch (error) {
      console.error("Error deleting physical activity:", error);
      const errorMessage =
        error.response?.data?.message || "Error al eliminar actividad física";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obtener resumen semanal
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

  // Obtener estadísticas mensuales
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

  // Limpiar actividades
  const clearActivities = useCallback(() => {
    setPhysicalActivities([]);
    setSelectedPatient(null);
    setError(null);
  }, []);

  // Limpiar todo el estado
  const clearAll = useCallback(() => {
    setPhysicalActivities([]);
    setActivityTypes([]);
    setSelectedPatient(null);
    setError(null);
    setLoading(false);
  }, []);

  const value = {
    // Estado
    physicalActivities,
    activityTypes,
    loading,
    error,
    selectedPatient,

    // Acciones
    getPhysicalActivitiesByUser,
    getActivityTypes,
    createPhysicalActivity,
    updatePhysicalActivity,
    deletePhysicalActivity,
    getWeeklySummary,
    getMonthlyStats,
    clearError,
    setSelectedPatient: setPatient,
    clearActivities,
    clearAll,
  };

  return (
    <PhysicalActivityContext.Provider value={value}>
      {children}
    </PhysicalActivityContext.Provider>
  );
}
