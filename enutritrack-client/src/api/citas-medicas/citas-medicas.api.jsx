// api/appointments/appointments.api.js
import { citasAPI } from "../../api/axios";

export const createAppointmentRequest = (appointmentData) =>
  citasAPI.post("/citas-medicas", appointmentData);

export const getAppointmentsRequest = (filters = {}) =>
  citasAPI.get("/citas-medicas", { params: filters });

export const getAppointmentByIdRequest = (id) =>
  citasAPI.get(`/citas-medicas/${id}`);

export const updateAppointmentRequest = (id, appointmentData) =>
  citasAPI.patch(`/citas-medicas/${id}`, appointmentData);

export const deleteAppointmentRequest = (id) =>
  citasAPI.delete(`/citas-medicas/${id}`);

export const changeAppointmentStateRequest = (id, stateId) =>
  citasAPI.patch(`/citas-medicas/${id}/estado/${stateId}`);

export const getAppointmentStatesRequest = () =>
  citasAPI.get("/citas-medicas/estados");

export const getConsultationTypesRequest = () =>
  citasAPI.get("/citas-medicas/tipos-consulta");

export const getMyAppointmentsRequest = (filters = {}) =>
  citasAPI.get("/citas-medicas/mis-citas", { params: filters });
