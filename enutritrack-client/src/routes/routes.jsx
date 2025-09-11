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
import UsersTracker from "../components/usuario/users-tracker";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <UsersProvider>
        <RecommendationsProvider>
          <NutritionProvider>
            <MedicalHistoryProvider>
              <PhysicalActivityProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoutes />}>
                      <Route path="/" element={<Layout />}>
                        {/* Solo redirige si estás exactamente en "/" */}
                        <Route
                          index
                          element={<Navigate to="/dashboard" replace />}
                        />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="perfil" element={<Profile />} />
                        <Route path="users" element={<UsersTracker />} />
                      </Route>
                    </Route>

                    {/* Ruta catch-all para rutas no encontradas */}
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </BrowserRouter>
              </PhysicalActivityProvider>
            </MedicalHistoryProvider>
          </NutritionProvider>
        </RecommendationsProvider>
      </UsersProvider>
    </AuthProvider>
  );
};

export default AppRoutes;
