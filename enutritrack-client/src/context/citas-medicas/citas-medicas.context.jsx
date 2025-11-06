// contexts/appointments/appointments.context.js
import { createContext, useContext, useState, useCallback } from "react";
import {
  createAppointmentRequest,
  getAppointmentsRequest,
  getAppointmentByIdRequest,
  updateAppointmentRequest,
  deleteAppointmentRequest,
  getAppointmentStatesRequest,
  getConsultationTypesRequest,
  getMyAppointmentsRequest,
  changeAppointmentStateRequest,
} from "../../api/citas-medicas/citas-medicas.api";

const AppointmentsContext = createContext();

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error(
      "useAppointments debe usarse dentro de AppointmentsProvider"
    );
  }
  return context;
};

export function AppointmentsProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [appointmentStates, setAppointmentStates] = useState([]);
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => {
    setError(null);
  };

  const createAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createAppointmentRequest(appointmentData);
      return res.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      setError(
        error.response?.data?.message || "Error al crear la cita médica"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAppointments = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAppointmentsRequest(filters);
      setAppointments(res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError(
        error.response?.data?.message || "Error al cargar las citas médicas"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMyAppointments = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Remover myAppointments de los filtros si existe
      const { myAppointments, ...cleanFilters } = filters;

      const res = await getMyAppointmentsRequest(cleanFilters);
      setAppointments(res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching my appointments:", error);
      setError(
        error.response?.data?.message || "Error al cargar mis citas médicas"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAppointmentByIdRequest(id);
      setCurrentAppointment(res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching appointment:", error);
      setError(
        error.response?.data?.message || "Error al cargar la cita médica"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id, appointmentData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateAppointmentRequest(id, appointmentData);
      return res.data;
    } catch (error) {
      console.error("Error updating appointment:", error);
      setError(
        error.response?.data?.message || "Error al actualizar la cita médica"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteAppointmentRequest(id);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      setError(
        error.response?.data?.message || "Error al eliminar la cita médica"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changeAppointmentState = async (id, stateId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await changeAppointmentStateRequest(id, stateId);
      return res.data;
    } catch (error) {
      console.error("Error changing appointment state:", error);
      setError(
        error.response?.data?.message || "Error al cambiar el estado de la cita"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadAppointmentStates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAppointmentStatesRequest();
      setAppointmentStates(res.data);
      return res.data;
    } catch (error) {
      console.error("Error loading appointment states:", error);
      setError(
        error.response?.data?.message || "Error al cargar los estados de cita"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadConsultationTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getConsultationTypesRequest();
      setConsultationTypes(res.data);
      return res.data;
    } catch (error) {
      console.error("Error loading consultation types:", error);
      setError(
        error.response?.data?.message || "Error al cargar los tipos de consulta"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentAppointment = useCallback(() => {
    setCurrentAppointment(null);
  }, []);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        currentAppointment,
        appointmentStates,
        consultationTypes,
        loading,
        error,
        createAppointment,
        getAppointments,
        getMyAppointments,
        getAppointmentById,
        updateAppointment,
        deleteAppointment,
        changeAppointmentState,
        loadAppointmentStates,
        loadConsultationTypes,
        clearError,
        clearCurrentAppointment,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
}
