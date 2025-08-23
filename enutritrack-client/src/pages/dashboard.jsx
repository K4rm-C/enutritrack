import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth/auth.context";
import { useNutrition } from "../context/nutrition/nutrition.context";
import { usePhysicalActivity } from "../context/activity/activity.context";
import { useRecommendations } from "../context/recommendation/recommendation.context";
import StatsCard from "../components/stats-cards";
import QuickActions from "../components/quick-actions";
import NutritionSummary from "../components/nutrition-tracker";
import ActivityChart from "../components/activity-tracker";
import RecommendationsWidget from "../components/recommendations";

const Dashboard = () => {
  const { user } = useAuth();
  const { getDailySummary, dailySummary } = useNutrition();
  const { getWeeklySummary, weeklySummary } = usePhysicalActivity();
  const { getRecommendationsByUser, recommendations } = useRecommendations();

  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        await Promise.all([
          getDailySummary(user.id, new Date()),
          getWeeklySummary(user.id, new Date()),
          getRecommendationsByUser(user.id),
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {user?.nombre || user?.email}! 👋
              </h1>
              <p className="text-gray-600 mt-1">{formatDate(currentTime)}</p>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <p className="text-sm text-gray-500">Hora actual</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleTimeString("es-ES")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Calorías Hoy"
            value={dailySummary?.totalCalories || 0}
            unit="kcal"
            icon="🔥"
            color="red"
            trend={+5.2}
          />
          <StatsCard
            title="Actividad Semanal"
            value={weeklySummary?.totalMinutes || 0}
            unit="min"
            icon="🏃‍♂️"
            color="blue"
            trend={+12.8}
          />
          <StatsCard
            title="Peso Actual"
            value={user?.peso || 0}
            unit="kg"
            icon="⚖️"
            color="purple"
            trend={-2.1}
          />
          <StatsCard
            title="IMC"
            value={
              user?.peso && user?.estatura
                ? (user.peso / Math.pow(user.estatura / 100, 2)).toFixed(1)
                : 0
            }
            unit=""
            icon="📊"
            color="green"
            trend={-0.5}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nutrition Summary */}
            <NutritionSummary summary={dailySummary} />

            {/* Activity Chart */}
            <ActivityChart weeklyData={weeklySummary} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions />

            {/* Recommendations Widget */}
            <RecommendationsWidget recommendations={recommendations} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Tips */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                💡
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Consejos de Salud
              </h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">💧 Hidratación:</span> Bebe al
                  menos 8 vasos de agua al día para mantener tu cuerpo
                  hidratado.
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">🥗 Nutrición:</span> Incluye 5
                  porciones de frutas y verduras en tu dieta diaria.
                </p>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <span className="font-medium">😴 Descanso:</span> Duerme entre
                  7-9 horas por noche para una óptima recuperación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
