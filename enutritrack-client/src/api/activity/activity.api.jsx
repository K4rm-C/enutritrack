// api/physical-activity/physicalActivityAuth.js
import axios from "../../api/axios";

export const createPhysicalActivityRequest = (activity) =>
  axios.post("/physical-activity", activity);
export const getPhysicalActivitiesByUserRequest = (userId) =>
  axios.get(`/physical-activity/user/${userId}`);
export const getWeeklySummaryRequest = (userId, startDate) => {
  const params = startDate
    ? { startDate: startDate.toISOString().split("T")[0] }
    : {};
  return axios.get(`/physical-activity/weekly-summary/${userId}`, { params });
};
export const getPhysicalActivityByIdRequest = (id) =>
  axios.get(`/physical-activity/${id}`);
export const updatePhysicalActivityRequest = (id, activity) =>
  axios.patch(`/physical-activity/${id}`, activity);
export const deletePhysicalActivityRequest = (id) =>
  axios.delete(`/physical-activity/${id}`);
