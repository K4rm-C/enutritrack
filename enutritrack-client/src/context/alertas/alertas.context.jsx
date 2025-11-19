import React, { createContext, useContext, useReducer } from "react";
import {
  createAlertRequest,
  getAlertsByUserRequest,
  getActiveAlertsByUserRequest,
  getAlertByIdRequest,
  updateAlertRequest,
  resolveAlertRequest,
  addAlertActionRequest,
  deleteAlertRequest,
  getAlertTypesRequest,
  getAlertCategoriesRequest,
  getAlertPrioritiesRequest,
  getAlertStatesRequest,
  createAutomaticConfigRequest,
  getAutomaticConfigsByUserRequest,
  updateAutomaticConfigRequest,
  deleteAutomaticConfigRequest,
} from "../../api/alertas/alertas.api";

const AlertsContext = createContext();

const alertsReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_ALERTS":
      return { ...state, alerts: action.payload, loading: false };
    case "SET_ALERT_TYPES":
      return { ...state, alertTypes: action.payload };
    case "SET_ALERT_CATEGORIES":
      return { ...state, alertCategories: action.payload };
    case "SET_PRIORITY_LEVELS":
      return { ...state, priorityLevels: action.payload };
    case "SET_ALERT_STATES":
      return { ...state, alertStates: action.payload };
    case "SET_AUTOMATIC_CONFIGS":
      return { ...state, automaticConfigs: action.payload };
    case "ADD_ALERT":
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case "UPDATE_ALERT":
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload.id ? action.payload : alert
        ),
      };
    case "DELETE_ALERT":
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };
    case "ADD_ALERT_ACTION":
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload.alertId
            ? {
                ...alert,
                acciones: [...(alert.acciones || []), action.payload.action],
              }
            : alert
        ),
      };
    case "SET_SELECTED_PATIENT":
      return { ...state, selectedPatient: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  alerts: [],
  alertTypes: [],
  alertCategories: [],
  priorityLevels: [],
  alertStates: [],
  automaticConfigs: [],
  loading: false,
  error: null,
  selectedPatient: null,
};

export const AlertsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alertsReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const setSelectedPatient = (patient) => {
    dispatch({ type: "SET_SELECTED_PATIENT", payload: patient });
  };

  const getAlertsByUser = async (userId, includeResolved = false) => {
    setLoading(true);
    try {
      const response = await getAlertsByUserRequest(userId, includeResolved);
      dispatch({ type: "SET_ALERTS", payload: response.data });
    } catch (error) {
      setError(error.response?.data?.message || "Error al cargar alertas");
    }
  };

  const getActiveAlertsByUser = async (userId) => {
    setLoading(true);
    try {
      const response = await getActiveAlertsByUserRequest(userId);
      dispatch({ type: "SET_ALERTS", payload: response.data });
    } catch (error) {
      setError(
        error.response?.data?.message || "Error al cargar alertas activas"
      );
    }
  };

  const getAlertTypes = async () => {
    try {
      const response = await getAlertTypesRequest();
      dispatch({ type: "SET_ALERT_TYPES", payload: response.data });
    } catch (error) {
      setError(
        error.response?.data?.message || "Error al cargar tipos de alerta"
      );
    }
  };

  const getAlertCategories = async () => {
    try {
      const response = await getAlertCategoriesRequest();
      dispatch({ type: "SET_ALERT_CATEGORIES", payload: response.data });
    } catch (error) {
      setError(
        error.response?.data?.message || "Error al cargar categorías de alerta"
      );
    }
  };

  const getPriorityLevels = async () => {
    try {
      const response = await getAlertPrioritiesRequest();
      dispatch({ type: "SET_PRIORITY_LEVELS", payload: response.data });
    } catch (error) {
      setError(
        error.response?.data?.message || "Error al cargar niveles de prioridad"
      );
    }
  };

  const getAlertStates = async () => {
    try {
      const response = await getAlertStatesRequest();
      dispatch({ type: "SET_ALERT_STATES", payload: response.data });
    } catch (error) {
      setError(
        error.response?.data?.message || "Error al cargar estados de alerta"
      );
    }
  };

  const createAlert = async (data) => {
    setLoading(true);
    try {
      const response = await createAlertRequest(data);
      dispatch({ type: "ADD_ALERT", payload: response.data });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Error al crear alerta");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (id, data) => {
    setLoading(true);
    try {
      const response = await updateAlertRequest(id, data);
      dispatch({ type: "UPDATE_ALERT", payload: response.data });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Error al actualizar alerta");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id, doctorId, notas) => {
    try {
      const response = await resolveAlertRequest(id, doctorId, notas);
      dispatch({ type: "UPDATE_ALERT", payload: response.data });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Error al resolver alerta");
      throw error;
    }
  };

  const addAlertAction = async (id, data) => {
    try {
      const response = await addAlertActionRequest(id, data);
      dispatch({
        type: "ADD_ALERT_ACTION",
        payload: { alertId: id, action: response.data },
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Error al agregar acción");
      throw error;
    }
  };

  const deleteAlert = async (id) => {
    try {
      await deleteAlertRequest(id);
      dispatch({ type: "DELETE_ALERT", payload: id });
    } catch (error) {
      setError(error.response?.data?.message || "Error al eliminar alerta");
      throw error;
    }
  };

  const getAutomaticConfigsByUser = async (userId) => {
    try {
      const response = await getAutomaticConfigsByUserRequest(userId);
      dispatch({ type: "SET_AUTOMATIC_CONFIGS", payload: response.data });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error al cargar configuraciones automáticas"
      );
    }
  };

  const createAutomaticConfig = async (data) => {
    try {
      const response = await createAutomaticConfigRequest(data);
      dispatch({
        type: "SET_AUTOMATIC_CONFIGS",
        payload: [...state.automaticConfigs, response.data],
      });
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error al crear configuración automática"
      );
      throw error;
    }
  };

  const updateAutomaticConfig = async (id, data) => {
    try {
      const response = await updateAutomaticConfigRequest(id, data);
      dispatch({
        type: "SET_AUTOMATIC_CONFIGS",
        payload: state.automaticConfigs.map((config) =>
          config.id === id ? response.data : config
        ),
      });
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error al actualizar configuración automática"
      );
      throw error;
    }
  };

  const deleteAutomaticConfig = async (id) => {
    try {
      await deleteAutomaticConfigRequest(id);
      dispatch({
        type: "SET_AUTOMATIC_CONFIGS",
        payload: state.automaticConfigs.filter((config) => config.id !== id),
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error al eliminar configuración automática"
      );
      throw error;
    }
  };
  const takeActionOnAlert = async (alertId, actionData) => {
    try {
      const response = await alertsService.addAction(alertId, actionData);
      // Recargar las alertas después de la acción
      if (selectedPatient?.id) {
        await getAlertsByUser(selectedPatient.id);
      }
      return response;
    } catch (error) {
      console.error("Error taking action on alert:", error);
      throw error;
    }
  };

  const value = {
    ...state,
    getAlertsByUser,
    getActiveAlertsByUser,
    getAlertTypes,
    getAlertCategories,
    getPriorityLevels,
    getAlertStates,
    createAlert,
    updateAlert,
    resolveAlert,
    addAlertAction,
    deleteAlert,
    getAutomaticConfigsByUser,
    createAutomaticConfig,
    updateAutomaticConfig,
    deleteAutomaticConfig,
    setSelectedPatient,
    clearError,
    takeActionOnAlert,
  };

  return (
    <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error("useAlerts debe usarse dentro de AlertsProvider");
  }
  return context;
};
