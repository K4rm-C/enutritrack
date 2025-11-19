import { activityAPI } from "../axios";

export const createPhysicalActivityRequest = (activityData) =>
  activityAPI.post("/physical-activity", activityData);
export const getPhysicalActivitiesByUserRequest = (userId) =>
  activityAPI.get(`/physical-activity/user/${userId}`);
export const getPhysicalActivityByIdRequest = (id) =>
  activityAPI.get(`/physical-activity/${id}`);
export const updatePhysicalActivityRequest = (id, activityData) =>
  activityAPI.put(`/physical-activity/${id}`, activityData);
export const deletePhysicalActivityRequest = (id) =>
  activityAPI.delete(`/physical-activity/${id}`);
export const getActivityTypesRequest = () =>
  activityAPI.get("/physical-activity/types");
export const getWeeklySummaryRequest = (userId, startDate) =>
  activityAPI.get(
    `/physical-activity/user/${userId}/weekly-summary?startDate=${startDate.toISOString()}`
  );
export const getMonthlyStatsRequest = (userId, year, month) =>
  activityAPI.get(
    `/physical-activity/user/${userId}/monthly-stats?year=${year}&month=${month}`
  );
