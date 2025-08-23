import React, { useState } from "react";

const ActivityChart = ({ weeklyData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Mock data for the chart - replace with real data from weeklyData
  const activityData = [
    { day: "Lun", minutes: 45, calories: 320 },
    { day: "Mar", minutes: 60, calories: 450 },
    { day: "Mié", minutes: 30, calories: 210 },
    { day: "Jue", minutes: 75, calories: 520 },
    { day: "Vie", minutes: 90, calories: 630 },
    { day: "Sáb", minutes: 120, calories: 850 },
    { day: "Dom", minutes: 40, calories: 280 },
  ];

  const maxMinutes = Math.max(...activityData.map((d) => d.minutes));
  const maxCalories = Math.max(...activityData.map((d) => d.calories));

  const periods = [
    { key: "week", label: "Esta semana" },
    { key: "month", label: "Este mes" },
    { key: "year", label: "Este año" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            📊
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Actividad Física
          </h3>
        </div>

        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedPeriod === period.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {activityData.reduce((sum, day) => sum + day.minutes, 0)}
          </p>
          <p className="text-sm text-blue-600 font-medium">Minutos totales</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">
            {activityData.reduce((sum, day) => sum + day.calories, 0)}
          </p>
          <p className="text-sm text-red-600 font-medium">Calorías quemadas</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {Math.round(
              activityData.reduce((sum, day) => sum + day.minutes, 0) / 7
            )}
          </p>
          <p className="text-sm text-green-600 font-medium">Promedio diario</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        <div className="flex items-end justify-between h-full pb-8">
          {activityData.map((day, index) => {
            const minuteHeight = (day.minutes / maxMinutes) * 100;
            const calorieHeight = (day.calories / maxCalories) * 100;

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Bars */}
                <div
                  className="relative flex items-end space-x-1 mb-2"
                  style={{ height: "200px" }}
                >
                  {/* Minutes bar */}
                  <div className="relative group">
                    <div
                      className="w-6 bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${minuteHeight}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.minutes} min
                    </div>
                  </div>

                  {/* Calories bar */}
                  <div className="relative group">
                    <div
                      className="w-6 bg-red-500 rounded-t-sm hover:bg-red-600 transition-colors cursor-pointer"
                      style={{ height: `${calorieHeight}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.calories} kcal
                    </div>
                  </div>
                </div>

                {/* Day label */}
                <span className="text-xs text-gray-600 font-medium">
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2 -ml-8">
          <span className="text-xs text-gray-400">{maxMinutes}</span>
          <span className="text-xs text-gray-400">
            {Math.round(maxMinutes / 2)}
          </span>
          <span className="text-xs text-gray-400">0</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2" />
          <span className="text-sm text-gray-600">Minutos</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2" />
          <span className="text-sm text-gray-600">Calorías</span>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            Meta semanal: 150 minutos
          </span>
          <span className="text-sm text-gray-600">
            {activityData.reduce((sum, day) => sum + day.minutes, 0)}/150 min
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                (activityData.reduce((sum, day) => sum + day.minutes, 0) /
                  150) *
                  100,
                100
              )}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 min</span>
          <span>
            {Math.round(
              (activityData.reduce((sum, day) => sum + day.minutes, 0) / 150) *
                100
            )}
            % completado
          </span>
          <span>150 min</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;
