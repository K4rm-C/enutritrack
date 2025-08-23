// contexts/PhysicalActivityContext.js
import { createContext, useContext, useState } from "react";
import {
  createPhysicalActivityRequest,
  getPhysicalActivitiesByUserRequest,
  getWeeklySummaryRequest,
  getPhysicalActivityByIdRequest,
  updatePhysicalActivityRequest,
  deletePhysicalActivityRequest,
} from "../../api/activity/activity.api";

const PhysicalActivityContext = createContext();

export const usePhysicalActivity = () => {
  const context = useContext(PhysicalActivityContext);
  if (!context) {
    throw new Error("usePhysicalActivity ya esta usado");
  }
  return context;
};

export function PhysicalActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);

  const createPhysicalActivity = async (activity) => {
    try {
      const res = await createPhysicalActivityRequest(activity);
      console.log(res);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getPhysicalActivitiesByUser = async (userId) => {
    try {
      const res = await getPhysicalActivitiesByUserRequest(userId);
      setActivities(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getWeeklySummary = async (userId, startDate) => {
    try {
      const res = await getWeeklySummaryRequest(userId, startDate);
      setWeeklySummary(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getPhysicalActivityById = async (id) => {
    try {
      const res = await getPhysicalActivityByIdRequest(id);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const updatePhysicalActivity = async (id, activity) => {
    try {
      const res = await updatePhysicalActivityRequest(id, activity);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const deletePhysicalActivity = async (id) => {
    try {
      const res = await deletePhysicalActivityRequest(id);
      if (res.status === 200 || res.status === 204) {
        setActivities(activities.filter((activity) => activity.id !== id));
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <PhysicalActivityContext.Provider
      value={{
        activities,
        weeklySummary,
        createPhysicalActivity,
        getPhysicalActivitiesByUser,
        getWeeklySummary,
        getPhysicalActivityById,
        updatePhysicalActivity,
        deletePhysicalActivity,
      }}
    >
      {children}
    </PhysicalActivityContext.Provider>
  );
}
