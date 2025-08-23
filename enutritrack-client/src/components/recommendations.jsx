import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecommendations } from "../context/recommendation/recommendation.context";
import { useAuth } from "../context/auth/auth.context";

const RecommendationsWidget = ({ recommendations = [] }) => {
  const navigate = useNavigate();
  const {
    quickNutritionRecommendation,
    quickExerciseRecommendation,
    quickMedicalRecommendation,
  } = useRecommendations();
  const { user } = useAuth();

  const quickRecommendations = [
    {
      type: "NUTRITION",
      title: "Consejo Nutricional",
      icon: "🥗",
      color: "bg-green-500",
      action: () => quickNutritionRecommendation(user?.id),
    },
    {
      type: "EXERCISE",
      title: "Rutina de Ejercicio",
      icon: "💪",
      color: "bg-blue-500",
      action: () => quickExerciseRecommendation(user?.id),
    },
    {
      type: "MEDICAL",
      title: "Consejo Médico",
      icon: "🏥",
      color: "bg-red-500",
      action: () => quickMedicalRecommendation(user?.id),
    },
  ];

  // Sample recent recommendations
  const recentRecommendations = [
    {
      id: 1,
      type: "NUTRITION",
      title: "Aumentar proteínas",
      description: "Considera agregar más proteínas magras a tu dieta diaria",
      priority: "high",
      createdAt: new Date("2025-01-15"),
    },
    {
      id: 2,
      type: "EXERCISE",
      title: "Ejercicio cardiovascular",
      description: "Realiza 30 minutos de cardio 3 veces por semana",
      priority: "medium",
      createdAt: new Date("2025-01-14"),
    },
    {
      id: 3,
      type: "MEDICAL",
      title: "Control de presión",
      description:
        "Programa un chequeo médico para control de presión arterial",
      priority: "high",
      createdAt: new Date("2025-01-13"),
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "NUTRITION":
        return "🥗";
      case "EXERCISE":
        return "💪";
      case "MEDICAL":
        return "🏥";
      default:
        return "💡";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            🤖
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Recomendaciones IA
          </h3>
        </div>
        <button
          onClick={() => navigate("/recommendations")}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Ver todas
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Obtener Recomendación
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {quickRecommendations.map((rec, index) => (
            <button
              key={index}
              onClick={rec.action}
              className={`${rec.color} hover:opacity-90 text-white p-3 rounded-lg transition-opacity flex items-center text-left`}
            >
              <span className="text-lg mr-3">{rec.icon}</span>
              <div>
                <p className="font-medium text-sm">{rec.title}</p>
                <p className="text-xs opacity-90">Generar con IA</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Recommendations */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Recomendaciones Recientes
        </h4>
        <div className="space-y-3">
          {recentRecommendations.slice(0, 3).map((rec) => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-sm mr-2">{getTypeIcon(rec.type)}</span>
                  <h5 className="font-medium text-sm text-gray-900">
                    {rec.title}
                  </h5>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                    rec.priority
                  )}`}
                >
                  {rec.priority === "high"
                    ? "Alta"
                    : rec.priority === "medium"
                    ? "Media"
                    : "Baja"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {rec.createdAt.toLocaleDateString("es-ES")}
                </span>
                <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {recentRecommendations.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            No tienes recomendaciones aún
          </p>
          <button
            onClick={() => navigate("/recommendations")}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Generar Recomendaciones
          </button>
        </div>
      )}

      {/* AI Status */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>IA activa</span>
          </div>
          <span>Última actualización: Hace 2h</span>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsWidget;
