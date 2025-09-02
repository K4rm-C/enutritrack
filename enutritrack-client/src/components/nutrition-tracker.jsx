import React, { useState, useEffect } from "react";
import { useNutrition } from "../context/nutrition/nutrition.context";
import { useAuth } from "../context/auth/auth.context";
import {
  Apple,
  Plus,
  Utensils,
  Droplets,
  BarChart3,
  Calendar,
} from "lucide-react";

const NutritionDashboard = ({ darkMode = false }) => {
  const {
    foodRecords,
    dailySummary,
    createFoodRecord,
    getFoodRecordsByUser,
    getDailySummary,
  } = useNutrition();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFoodRecord, setNewFoodRecord] = useState({
    tipo_comida: "almuerzo",
    descripcion: "",
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
    fecha: new Date().toISOString(),
  });

  useEffect(() => {
    if (user.id) {
      getFoodRecordsByUser(user.id);
      getDailySummary(user.id, selectedDate);
    }
  }, [user.id, selectedDate]);

  const handleAddFoodRecord = async () => {
    try {
      await createFoodRecord({
        ...newFoodRecord,
        usuarioId: user.id,
      });
      setShowAddForm(false);
      setNewFoodRecord({
        tipo_comida: "almuerzo",
        descripcion: "",
        calorias: 0,
        proteinas: 0,
        carbohidratos: 0,
        grasas: 0,
        fecha: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding food record:", error);
    }
  };

  const mealTypes = {
    desayuno: "Desayuno",
    almuerzo: "Almuerzo",
    cena: "Cena",
    merienda: "Merienda",
  };

  const filteredRecords = foodRecords.filter((record) => {
    const recordDate = new Date(record.fecha).toDateString();
    const selectedDateStr = selectedDate.toDateString();
    return recordDate === selectedDateStr;
  });

  return (
    <div className="space-y-6">
      {/* Resumen Diario */}
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
            Resumen Nutricional del Día
          </h3>
          <div className="flex items-center space-x-2">
            <Calendar
              className={`h-5 w-5 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
            <input
              type="date"
              value={selectedDate.toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>

        {dailySummary ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className={`text-center p-4 rounded-lg ${
                darkMode ? "bg-red-900/20" : "bg-red-50"
              }`}
            >
              <span className="text-2xl">🔥</span>
              <p className="text-2xl font-bold text-red-600">
                {dailySummary.calorias || 0}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Calorías
              </p>
            </div>
            <div
              className={`text-center p-4 rounded-lg ${
                darkMode ? "bg-blue-900/20" : "bg-blue-50"
              }`}
            >
              <span className="text-2xl">💪</span>
              <p className="text-2xl font-bold text-blue-600">
                {dailySummary.proteinas || 0}g
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Proteínas
              </p>
            </div>
            <div
              className={`text-center p-4 rounded-lg ${
                darkMode ? "bg-green-900/20" : "bg-green-50"
              }`}
            >
              <span className="text-2xl">🌾</span>
              <p className="text-2xl font-bold text-green-600">
                {dailySummary.carbohidratos || 0}g
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Carbohidratos
              </p>
            </div>
            <div
              className={`text-center p-4 rounded-lg ${
                darkMode ? "bg-yellow-900/20" : "bg-yellow-50"
              }`}
            >
              <span className="text-2xl">🥑</span>
              <p className="text-2xl font-bold text-yellow-600">
                {dailySummary.grasas || 0}g
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Grasas
              </p>
            </div>
          </div>
        ) : (
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            No hay datos para esta fecha
          </p>
        )}
      </div>

      {/* Registro de Comidas */}
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
            Registro de Comidas
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Comida
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
              Agregar Nueva Comida
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Tipo de Comida
                </label>
                <select
                  value={newFoodRecord.tipo_comida}
                  onChange={(e) =>
                    setNewFoodRecord({
                      ...newFoodRecord,
                      tipo_comida: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="desayuno">Desayuno</option>
                  <option value="almuerzo">Almuerzo</option>
                  <option value="cena">Cena</option>
                  <option value="merienda">Merienda</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Descripción
                </label>
                <input
                  type="text"
                  value={newFoodRecord.descripcion}
                  onChange={(e) =>
                    setNewFoodRecord({
                      ...newFoodRecord,
                      descripcion: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Ej: Ensalada César"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Calorías
                </label>
                <input
                  type="number"
                  value={newFoodRecord.calorias}
                  onChange={(e) =>
                    setNewFoodRecord({
                      ...newFoodRecord,
                      calorias: parseInt(e.target.value),
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
                  Proteínas (g)
                </label>
                <input
                  type="number"
                  value={newFoodRecord.proteinas}
                  onChange={(e) =>
                    setNewFoodRecord({
                      ...newFoodRecord,
                      proteinas: parseInt(e.target.value),
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
                  Carbohidratos (g)
                </label>
                <input
                  type="number"
                  value={newFoodRecord.carbohidratos}
                  onChange={(e) =>
                    setNewFoodRecord({
                      ...newFoodRecord,
                      carbohidratos: parseInt(e.target.value),
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
                  Grasas (g)
                </label>
                <input
                  type="number"
                  value={newFoodRecord.grasas}
                  onChange={(e) =>
                    setNewFoodRecord({
                      ...newFoodRecord,
                      grasas: parseInt(e.target.value),
                    })
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
                onClick={handleAddFoodRecord}
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
          {Object.entries(mealTypes).map(([key, label]) => {
            const mealRecords = filteredRecords.filter(
              (record) => record.tipo_comida === key
            );

            return (
              <div
                key={key}
                className={`p-4 border rounded-lg ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Utensils
                      className={`h-5 w-5 ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <h4
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {label}
                    </h4>
                  </div>
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {mealRecords.length} alimentos
                  </span>
                </div>

                {mealRecords.length > 0 ? (
                  <div className="space-y-2">
                    {mealRecords.map((record) => (
                      <div
                        key={record.id}
                        className={`flex justify-between items-center p-2 rounded ${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        }`}
                      >
                        <div>
                          <p
                            className={
                              darkMode ? "text-white" : "text-gray-900"
                            }
                          >
                            {record.descripcion}
                          </p>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {record.calorias} kcal • P: {record.proteinas}g • C:{" "}
                            {record.carbohidratos}g • G: {record.grasas}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    No hay registros para esta comida
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

export default NutritionDashboard;
