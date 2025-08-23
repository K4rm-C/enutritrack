import React from "react";

const NutritionSummary = ({ summary }) => {
  const nutritionData = [
    {
      name: "Calorías",
      current: summary?.totalCalories || 0,
      goal: 2000,
      unit: "kcal",
      color: "bg-red-500",
      lightColor: "bg-red-100",
    },
    {
      name: "Proteínas",
      current: summary?.totalProtein || 0,
      goal: 150,
      unit: "g",
      color: "bg-blue-500",
      lightColor: "bg-blue-100",
    },
    {
      name: "Carbohidratos",
      current: summary?.totalCarbs || 0,
      goal: 250,
      unit: "g",
      color: "bg-yellow-500",
      lightColor: "bg-yellow-100",
    },
    {
      name: "Grasas",
      current: summary?.totalFat || 0,
      goal: 65,
      unit: "g",
      color: "bg-green-500",
      lightColor: "bg-green-100",
    },
  ];

  const calculatePercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getStatusMessage = (current, goal) => {
    const percentage = (current / goal) * 100;
    if (percentage < 50)
      return { message: "Necesitas más", color: "text-orange-600" };
    if (percentage < 80)
      return { message: "Buen progreso", color: "text-yellow-600" };
    if (percentage < 100)
      return { message: "Casi completo", color: "text-blue-600" };
    return { message: "Objetivo alcanzado", color: "text-green-600" };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            🍎
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Resumen Nutricional de Hoy
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nutritionData.map((nutrient, index) => {
          const percentage = calculatePercentage(
            nutrient.current,
            nutrient.goal
          );
          const status = getStatusMessage(nutrient.current, nutrient.goal);

          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{nutrient.name}</h4>
                <span className={`text-sm font-medium ${status.color}`}>
                  {status.message}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {nutrient.current}
                </span>
                <span className="text-sm text-gray-500">
                  de {nutrient.goal} {nutrient.unit}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${nutrient.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>{Math.round(percentage)}%</span>
                <span>
                  {nutrient.goal} {nutrient.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hydration Tracker */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-xl mr-2">💧</span>
            <h4 className="font-medium text-gray-900">Hidratación</h4>
          </div>
          <span className="text-sm text-gray-500">6 de 8 vasos</span>
        </div>

        <div className="flex space-x-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-6 h-8 rounded-sm ${
                i < 6 ? "bg-blue-500" : "bg-gray-200"
              } transition-colors`}
            />
          ))}
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0</span>
          <span>2L objetivo</span>
        </div>
      </div>

      {/* Quick Add Food */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Agregar Comida
        </button>
      </div>
    </div>
  );
};

export default NutritionSummary;
