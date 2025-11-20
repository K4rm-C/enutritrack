import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/auth/auth.context";
import { UsersProvider } from "../context/user/user.context";
import { RecommendationsProvider } from "../context/recommendation/recommendation.context";
import { NutritionProvider } from "../context/nutrition/nutrition.context";
import { MedicalHistoryProvider } from "../context/history-medical/history-medical.context";
import { AppointmentsProvider } from "../context/citas-medicas/citas-medicas.context";
import { PhysicalActivityProvider } from "../context/activity/activity.context";
import { AlertsProvider } from "../context/alertas/alertas.context";
import { ThemeProvider } from "../context/dark-mode.context";
import ProtectedRoutes from "../ProtectedRoutes";

// Pages
import Login from "../pages/login";
import Dashboard from "../pages/dashboard";
import Layout from "../components/layout/layout";

// Components/Forms
import Profile from "../components/profile";
import UsersTracker from "../components/usuario/users-tracker";
import MedicalHistoryManager from "../components/medical-history-manager";
import MedicalAppointmentsManager from "../components/citas-medicas-manager";
import NutritionManager from "../components/nutrition-manager";
import RecommendationsManager from "../components/recomendaciones-manager";
import PhysicalActivityManager from "../components/actividad-fisica-manager";
import AlertsManager from "../components/alertas-manager";

const AppRoutes = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UsersProvider>
          <RecommendationsProvider>
            <NutritionProvider>
              <MedicalHistoryProvider>
                <AppointmentsProvider>
                  <PhysicalActivityProvider>
                    <AlertsProvider>
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
                              <Route
                                path="history-medical"
                                element={<MedicalHistoryManager />}
                              />
                              <Route
                                path="citas-medicas"
                                element={<MedicalAppointmentsManager />}
                              />
                              <Route
                                path="nutricion"
                                element={<NutritionManager />}
                              />
                              <Route
                                path="recomendacioes"
                                element={<RecommendationsManager />}
                              />
                              <Route
                                path="actividadfiscia"
                                element={<PhysicalActivityManager />}
                              />
                              <Route
                                path="alertas"
                                element={<AlertsManager />}
                              />
                            </Route>
                          </Route>

                          {/* Ruta catch-all para rutas no encontradas */}
                          <Route
                            path="*"
                            element={<Navigate to="/dashboard" replace />}
                          />
                        </Routes>
                      </BrowserRouter>
                    </AlertsProvider>
                  </PhysicalActivityProvider>
                </AppointmentsProvider>
              </MedicalHistoryProvider>
            </NutritionProvider>
          </RecommendationsProvider>
        </UsersProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppRoutes;
