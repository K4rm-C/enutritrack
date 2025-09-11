import { activityAPI } from "../axios";

export const createPhysicalActivityRequest = (activity) =>
  activityAPI.post("/physical-activity", activity);
export const getPhysicalActivitiesByUserRequest = (userId) =>
  activityAPI.get(`/physical-activity/user/${userId}`);
export const getWeeklySummaryRequest = (userId, startDate) => {
  const params = startDate
    ? { startDate: startDate.toISOString().split("T")[0] }
    : {};
  return activityAPI.get(`/physical-activity/weekly-summary/${userId}`, {
    params,
  });
};
export const getPhysicalActivityByIdRequest = (id) =>
  activityAPI.get(`/physical-activity/${id}`);
export const updatePhysicalActivityRequest = (id, activity) =>
  activityAPI.patch(`/physical-activity/${id}`, activity);
export const deletePhysicalActivityRequest = (id) =>
  activityAPI.delete(`/physical-activity/${id}`);
