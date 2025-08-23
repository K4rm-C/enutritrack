import React from "react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Registrar Comida",
      description: "Añade tu última comida",
      icon: "🍽️",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      action: () => navigate("/nutrition?action=add"),
    },
    {
      title: "Log Ejercicio",
      description: "Registra tu actividad",
      icon: "💪",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      action: () => navigate("/activity?action=add"),
    },
    {
      title: "Ver Progreso",
      description: "Revisa tus estadísticas",
      icon: "📊",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      action: () => navigate("/dashboard?section=progress"),
    },
    {
      title: "Recomendación IA",
      description: "Obtén consejos personalizados",
      icon: "🤖",
      color: "bg-pink-500",
      hoverColor: "hover:bg-pink-600",
      action: () => navigate("/recommendations?type=ai"),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
          ⚡
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Acciones Rápidas
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`${action.color} ${action.hoverColor} text-white p-4 rounded-lg transition-colors group text-left`}
          >
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">{action.icon}</span>
            </div>
            <h4 className="font-medium text-sm mb-1">{action.title}</h4>
            <p className="text-xs opacity-90">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Emergency Contact */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span className="font-medium">Emergencia Médica</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
