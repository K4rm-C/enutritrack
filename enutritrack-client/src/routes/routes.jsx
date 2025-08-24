import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/auth/auth.context";
import { UsersProvider } from "../context/user/user.context";
import { RecommendationsProvider } from "../context/recommendation/recommendation.context";
import { NutritionProvider } from "../context/nutrition/nutrition.context";
import { MedicalHistoryProvider } from "../context/history-medical/history-medical.context";
import { PhysicalActivityProvider } from "../context/activity/activity.context";
import ProtectedRoutes from "../ProtectedRoutes";

// Pages
import Login from "../pages/login";
import Dashboard from "../pages/dashboard";
import Layout from "../components/layout/layout";

// Components/Forms
import Profile from "../components/profile";
import NutritionTracker from "../components/nutrition-tracker";
import ActivityTracker from "../components/activity-tracker";
import Recommendations from "../components/recommendations";

const AppRoutes = () => {
  return (
    <>
      <AuthProvider>
        <UsersProvider>
          <RecommendationsProvider>
            <NutritionProvider>
              <MedicalHistoryProvider>
                <PhysicalActivityProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />

                      <Route element={<ProtectedRoutes />}>
                        <Route path="/" element={<Layout />}>
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="perfil" element={<Profile />} />
                          <Route
                            path="nutrition"
                            element={<NutritionTracker />}
                          />
                          <Route
                            path="activity"
                            element={<ActivityTracker />}
                          />
                          <Route
                            path="recommendations"
                            element={<Recommendations />}
                          />
                        </Route>
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </PhysicalActivityProvider>
              </MedicalHistoryProvider>
            </NutritionProvider>
          </RecommendationsProvider>
        </UsersProvider>
      </AuthProvider>
    </>
  );
};

export default AppRoutes;
