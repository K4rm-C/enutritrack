import React from "react";

const StatsCard = ({ title, value, unit, icon, color, trend }) => {
  const colorClasses = {
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
    pink: "bg-pink-100 text-pink-600",
  };

  const trendColor =
    trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500";
  const trendIcon = trend > 0 ? "↗" : trend < 0 ? "↘" : "→";

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {unit && (
              <p className="ml-2 text-sm font-medium text-gray-500">{unit}</p>
            )}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center mt-2 ${trendColor}`}>
              <span className="text-sm font-medium">
                {trendIcon} {Math.abs(trend)}%
              </span>
              <span className="ml-1 text-xs text-gray-500">
                vs. semana anterior
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            colorClasses[color] || colorClasses.green
          }`}
        >
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
