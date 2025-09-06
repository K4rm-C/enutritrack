import React, { useState, useEffect } from "react";
import { usePhysicalActivity } from "../context/activity/activity.context";
import { useAuth } from "../context/auth/auth.context";
import {
  Activity,
  Plus,
  Clock,
  TrendingUp,
  Calendar,
  Flame,
} from "lucide-react";

const PhysicalActivityDashboard = ({ darkMode = false }) => {
  const {
    activities,
    weeklySummary,
    createPhysicalActivity,
    getPhysicalActivitiesByUser,
    getWeeklySummary,
  } = usePhysicalActivity();
  const { user } = useAuth();
  const userId = user?.id;

  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    tipo_actividad: "",
    duracion: 0,
    caloriasQuemadas: 0,
    fecha: new Date().toISOString(),
  });

  useEffect(() => {
    getPhysicalActivitiesByUser(userId);
    getWeeklySummary(userId, selectedWeek);
  }, [userId, selectedWeek]);

  const handleAddActivity = async () => {
    try {
      await createPhysicalActivity({
        ...newActivity,
        usuarioId: user.id,
      });
      setShowAddForm(false);
      setNewActivity({
        tipo_actividad: "",
        duracion: 0,
        caloriasQuemadas: 0,
      });
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const getWeekDates = (date) => {
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      dates.push(currentDate);
    }

    return dates;
  };

  // Función para formatear números
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toLocaleString();
  };

  // Función para formatear calorías
  const formatCalories = (calories) => {
    return calories.toLocaleString("es-ES");
  };

  const weekDates = getWeekDates(selectedWeek);

  return (
    <div className="space-y-8">
      {/* Resumen Semanal - Mejorado */}
      <div
        className={`${
          darkMode
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl"
            : "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg"
        } rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl`}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3
              className={`text-2xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Resumen Semanal de Actividad
            </h3>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Seguimiento de tu progreso semanal
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <Calendar
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </div>
            <input
              type="week"
              value={getWeekInputValue(selectedWeek)}
              onChange={(e) => setSelectedWeek(new Date(e.target.value))}
              className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white hover:border-gray-500"
                  : "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
              }`}
            />
          </div>
        </div>

        {weeklySummary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Minutos Totales */}
            <div
              className={`relative overflow-hidden text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                darkMode
                  ? "bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-700/50"
                  : "bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200"
              }`}
            >
              <div className="relative z-10">
                <div
                  className={`inline-flex p-3 rounded-full mb-4 ${
                    darkMode ? "bg-emerald-800/50" : "bg-emerald-200"
                  }`}
                >
                  <Clock className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-600 mb-1">
                  {formatNumber(weeklySummary.totalMinutos || 0)}
                </p>
                <p className="text-sm font-medium text-emerald-600/80">
                  Minutos Totales
                </p>
              </div>
              {/* Efecto de fondo */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full -translate-y-10 translate-x-10"></div>
            </div>

            {/* Calorías Quemadas */}
            <div
              className={`relative overflow-hidden text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                darkMode
                  ? "bg-gradient-to-br from-orange-900/30 to-red-800/20 border border-orange-700/50"
                  : "bg-gradient-to-br from-orange-50 to-red-100 border border-orange-200"
              }`}
            >
              <div className="relative z-10">
                <div
                  className={`inline-flex p-3 rounded-full mb-4 ${
                    darkMode ? "bg-orange-800/50" : "bg-orange-200"
                  }`}
                >
                  <Flame className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-1">
                  {formatCalories(weeklySummary.totalCaloriasQuemadas || 0)}
                </p>
                <p className="text-sm font-medium text-orange-600/80">
                  Calorías Quemadas
                </p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/10 rounded-full -translate-y-10 translate-x-10"></div>
            </div>

            {/* Tipos de Actividad */}
            <div
              className={`relative overflow-hidden text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                darkMode
                  ? "bg-gradient-to-br from-blue-900/30 to-purple-800/20 border border-blue-700/50"
                  : "bg-gradient-to-br from-blue-50 to-purple-100 border border-blue-200"
              }`}
            >
              <div className="relative z-10">
                <div
                  className={`inline-flex p-3 rounded-full mb-4 ${
                    darkMode ? "bg-blue-800/50" : "bg-blue-200"
                  }`}
                >
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {Object.keys(weeklySummary.actividadesPorTipo || {}).length}
                </p>
                <p className="text-sm font-medium text-blue-600/80">
                  Tipos de Actividad
                </p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          </div>
        ) : (
          <div
            className={`text-center py-12 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay datos para esta semana</p>
            <p className="text-sm">Comienza registrando tu primera actividad</p>
          </div>
        )}
      </div>

      {/* Registro de Actividades */}
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-2xl border shadow-lg p-8`}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3
              className={`text-2xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Registro de Actividades
            </h3>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Administra tu historial de ejercicios
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Actividad
          </button>
        </div>

        {showAddForm && (
          <div
            className={`mb-8 p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${
              darkMode
                ? "bg-gray-700/50 border-gray-600"
                : "bg-gray-50/50 border-gray-300"
            }`}
          >
            <h4
              className={`font-bold text-lg mb-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              ✨ Agregar Nueva Actividad
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Tipo de Actividad
                </label>
                <input
                  type="text"
                  value={newActivity.tipo_actividad}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      tipo_actividad: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Ej: Running, Ciclismo, Natación"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  value={newActivity.duracion}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      duracion: parseInt(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  min="0"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Calorías Quemadas
                </label>
                <input
                  type="number"
                  value={newActivity.caloriasQuemadas}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      caloriasQuemadas: parseInt(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  min="0"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  value={newActivity.fecha.slice(0, 16)}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, fecha: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleAddActivity}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-semibold shadow-lg"
              >
                💾 Guardar Actividad
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-6 py-3 rounded-xl transition-all duration-200 font-semibold ${
                  darkMode
                    ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {weekDates.map((date) => {
            const dateActivities = activities.filter((activity) => {
              const activityDate = new Date(activity.fecha).toDateString();
              return activityDate === date.toDateString();
            });

            return (
              <div
                key={date.toISOString()}
                className={`p-6 border-2 rounded-2xl transition-all duration-200 hover:shadow-md ${
                  darkMode
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h4
                  className={`font-bold text-lg mb-4 capitalize ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  📅{" "}
                  {date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h4>

                {dateActivities.length > 0 ? (
                  <div className="space-y-3">
                    {dateActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex justify-between items-center p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                          darkMode
                            ? "bg-gray-700/50 hover:bg-gray-700"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-lg ${
                              darkMode ? "bg-emerald-800/50" : "bg-emerald-100"
                            }`}
                          >
                            <Activity className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p
                              className={`font-semibold ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {activity.tipo_actividad}
                            </p>
                            <p
                              className={`text-sm ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              ⏱️ {activity.duracion} min • 🔥{" "}
                              {formatCalories(activity.caloriasQuemadas)} kcal
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {new Date(activity.fecha).toLocaleTimeString(
                              "es-ES",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`text-center py-8 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`inline-flex p-4 rounded-full mb-3 ${
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <Activity className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="font-medium">
                      No hay actividades registradas
                    </p>
                    <p className="text-sm">
                      ¡Es un buen día para hacer ejercicio!
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Función auxiliar para formatear la fecha en formato week
function getWeekInputValue(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());

  const year = d.getFullYear();
  const week = Math.ceil((d.getDate() + 1 - d.getDay()) / 7);

  return `${year}-W${week.toString().padStart(2, "0")}`;
}

export default PhysicalActivityDashboard;
