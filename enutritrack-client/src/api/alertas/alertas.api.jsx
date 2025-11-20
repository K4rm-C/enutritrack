import { alertasAPI } from "../axios";

export const createAlertRequest = (alertData) =>
  alertasAPI.post("/alerts", alertData);
export const getAlertsByUserRequest = (userId, includeResolved = false) =>
  alertasAPI.get(
    `/alerts/user/${userId}${includeResolved ? "?includeResolved=true" : ""}`
  );
export const getActiveAlertsByUserRequest = (userId) =>
  alertasAPI.get(`/alerts/user/${userId}/active`);
export const getAlertByIdRequest = (id) => alertasAPI.get(`/alerts/${id}`);
export const updateAlertRequest = (id, alertData) =>
  alertasAPI.put(`/alerts/${id}`, alertData);
export const resolveAlertRequest = (id, doctorId, notas) =>
  alertasAPI.put(`/alerts/${id}/resolve`, { doctor_id: doctorId, notas });
export const addAlertActionRequest = (id, actionData) =>
  alertasAPI.post(`/alerts/${id}/actions`, actionData);
export const deleteAlertRequest = (id) => alertasAPI.delete(`/alerts/${id}`);
export const getAlertTypesRequest = () => alertasAPI.get("/alerts/types");
export const getAlertCategoriesRequest = () =>
  alertasAPI.get("/alerts/categories");
export const getAlertPrioritiesRequest = () =>
  alertasAPI.get("/alerts/priorities");
export const getAlertStatesRequest = () => alertasAPI.get("/alerts/states");
export const createAutomaticConfigRequest = (configData) =>
  alertasAPI.post("/alerts/automatic-configs", configData);
export const getAutomaticConfigsByUserRequest = (userId) =>
  alertasAPI.get(`/alerts/automatic-configs/user/${userId}`);
export const updateAutomaticConfigRequest = (id, configData) =>
  alertasAPI.put(`/alerts/automatic-configs/${id}`, configData);
export const deleteAutomaticConfigRequest = (id) =>
  alertasAPI.delete(`/alerts/automatic-configs/${id}`);
