import React, { useState, useEffect } from "react";
import { usePhysicalActivity } from "../context/activity/activity.context";
import { useAuth } from "../context/auth/auth.context";
import { Activity, Plus, Clock, TrendingUp, Calendar } from "lucide-react";

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
    if (userId) {
      getPhysicalActivitiesByUser(userId);
      getWeeklySummary(userId, selectedWeek);
    }
  }, [userId, selectedWeek]);

  const handleAddActivity = async () => {
    try {
      await createPhysicalActivity({
        ...newActivity,
        usuarioId: userId,
      });
      setShowAddForm(false);
      setNewActivity({
        tipo_actividad: "",
        duracion: 0,
        caloriasQuemadas: 0,
        fecha: new Date().toISOString(),
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

  const weekDates = getWeekDates(selectedWeek);

  return (
    <div className="space-y-6">
      {/* Resumen Semanal */}
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Resumen Semanal de Actividad
          </h3>
          <div className="flex items-center space-x-2">
            <Calendar
              className={`h-5 w-5 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
            <input
              type="week"
              value={getWeekInputValue(selectedWeek)}
              onChange={(e) => setSelectedWeek(new Date(e.target.value))}
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>

        {weeklySummary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`text-center p-4 rounded-lg ${
                darkMode ? "bg-green-900/20" : "bg-green-50"
              }`}
            >
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {weeklySummary.totalMinutos || 0}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Minutos Totales
              </p>
            </div>
            <div
              className={`text-center p-4 rounded-lg ${
                darkMode ? "bg-orange-900/20" : "bg-orange-50"
              }`}
            >
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">
                {weeklySummary.totalCaloriasQuemadas || 0}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Calorías Quemadas
              </p>
            </div>
            <div
              className={`text-center p-4 rounded-lg ${
                darkMode ? "bg-blue-900/20" : "bg-blue-50"
              }`}
            >
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {Object.keys(weeklySummary.actividadesPorTipo || {}).length}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Tipos de Actividad
              </p>
            </div>
          </div>
        ) : (
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            No hay datos para esta semana
          </p>
        )}
      </div>

      {/* Registro de Actividades */}
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Registro de Actividades
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Actividad
          </button>
        </div>

        {showAddForm && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <h4
              className={`font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Agregar Nueva Actividad
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
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
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Ej: Running, Ciclismo, Natación"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
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
                      duracion: parseInt(e.target.value),
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
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
                      caloriasQuemadas: parseInt(e.target.value),
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Fecha
                </label>
                <input
                  type="datetime-local"
                  value={newActivity.fecha.slice(0, 16)}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, fecha: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleAddActivity}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
                className={`p-4 border rounded-lg ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <h4
                  className={`font-medium mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h4>

                {dateActivities.length > 0 ? (
                  <div className="space-y-2">
                    {dateActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex justify-between items-center p-3 rounded ${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        }`}
                      >
                        <div>
                          <p
                            className={
                              darkMode ? "text-white" : "text-gray-900"
                            }
                          >
                            {activity.tipo_actividad}
                          </p>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {activity.duracion} min •{" "}
                            {activity.caloriasQuemadas} kcal
                          </p>
                        </div>
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {new Date(activity.fecha).toLocaleTimeString(
                            "es-ES",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    No hay actividades registradas
                  </p>
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
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");

  return `${year}-W${Math.ceil((d.getDate() + 1 - d.getDay()) / 7)}`;
}

export default PhysicalActivityDashboard;
