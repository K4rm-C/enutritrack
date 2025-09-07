import React, { useState, useEffect } from "react";
import { useNutrition } from "../context/nutrition/nutrition.context";
import { useAuth } from "../context/auth/auth.context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Apple,
  Plus,
  Utensils,
  Droplets,
  BarChart3,
  Calendar,
  Edit3,
  Trash2,
  Clock,
  X,
  Save,
  Flame,
  Activity,
  Target,
} from "lucide-react";

const NutritionDashboard = ({ darkMode = false }) => {
  const {
    foodRecords,
    updateFoodRecord,
    deleteFoodRecord,
    createFoodRecord,
    getFoodRecordsByUser,
    getDailySummary,
  } = useNutrition();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [newFoodRecord, setNewFoodRecord] = useState({
    tipo_comida: "almuerzo",
    descripcion: "",
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
    fecha: new Date().toISOString(),
  });
  const [editFormData, setEditFormData] = useState({
    tipo_comida: "",
    descripcion: "",
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
  });

  useEffect(() => {
    getFoodRecordsByUser(user.userId);
    getDailySummary(user.userId, selectedDate);
  }, [user.userId, selectedDate]);

  const handleAddFoodRecord = async () => {
    try {
      await createFoodRecord({
        ...newFoodRecord,
        usuarioId: user.userId,
      });
      setShowAddForm(false);
      setNewFoodRecord({
        tipo_comida: "almuerzo",
        descripcion: "",
        calorias: 0,
        proteinas: 0,
        carbohidratos: 0,
        grasas: 0,
      });
      getFoodRecordsByUser(user.userId);
      toast.success("Comida agregada correctamente", {
        position: "top-right",
        autoClose: 3000,
        theme: darkMode ? "dark" : "light",
      });
    } catch (error) {
      console.error("Error adding food record:", error);
      toast.error("Error al agregar la comida", {
        position: "top-right",
        autoClose: 3000,
        theme: darkMode ? "dark" : "light",
      });
    }
  };

  // Función para formatear números sin decimales innecesarios
  const formatNumber = (value) => {
    const num = parseFloat(value);
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return num.toFixed(1);
  };

  // Función para formatear números grandes
  const formatDisplayNumber = (value) => {
    const num = parseFloat(value);
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return Math.round(num).toLocaleString();
  };

  // Función para iniciar la edición de un registro
  const handleEditClick = (record) => {
    setEditingRecordId(record.id);
    setEditFormData({
      tipo_comida: record.tipo_comida,
      descripcion: record.descripcion,
      calorias: formatNumber(record.calorias),
      proteinas: formatNumber(record.proteinas),
      carbohidratos: formatNumber(record.carbohidratos),
      grasas: formatNumber(record.grasas),
    });
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setEditFormData({
      tipo_comida: "",
      descripcion: "",
      calorias: 0,
      proteinas: 0,
      carbohidratos: 0,
      grasas: 0,
    });
  };

  // Función para guardar los cambios de edición
  const handleSaveEdit = async (recordId) => {
    try {
      await updateFoodRecord(recordId, editFormData);
      setEditingRecordId(null);
      getFoodRecordsByUser(user.id);
      toast.success("Comida actualizada correctamente", {
        position: "top-right",
        autoClose: 3000,
        theme: darkMode ? "dark" : "light",
      });
    } catch (error) {
      console.error("Error updating food record:", error);
      toast.error("Error al actualizar la comida", {
        position: "top-right",
        autoClose: 3000,
        theme: darkMode ? "dark" : "light",
      });
    }
  };

  // Función para eliminar un registro
  const handleDeleteRecord = async (recordId) => {
    try {
      await deleteFoodRecord(recordId);
      getFoodRecordsByUser(user.id);
      toast.success("Comida eliminada correctamente", {
        position: "top-right",
        autoClose: 3000,
        theme: darkMode ? "dark" : "light",
      });
    } catch (error) {
      console.error("Error deleting food record:", error);
      toast.error("Error al eliminar la comida", {
        position: "top-right",
        autoClose: 3000,
        theme: darkMode ? "dark" : "light",
      });
    }
  };

  const mealTypes = {
    desayuno: {
      label: "Desayuno",
      icon: "🌅",
      time: "6:00 - 10:00 AM",
      color: "orange",
    },
    almuerzo: {
      label: "Almuerzo",
      icon: "☀️",
      time: "12:00 - 2:00 PM",
      color: "blue",
    },
    cena: {
      label: "Cena",
      icon: "🌙",
      time: "6:00 - 9:00 PM",
      color: "purple",
    },
    merienda: {
      label: "Merienda",
      icon: "🍎",
      time: "3:00 - 5:00 PM",
      color: "green",
    },
  };

  const filteredRecords = foodRecords.filter((record) => {
    const recordDate = new Date(record.fecha).toDateString();
    const selectedDateStr = selectedDate.toDateString();
    return recordDate === selectedDateStr;
  });

  const calculateLocalSummary = () => {
    return filteredRecords.reduce(
      (acc, record) => ({
        calorias: acc.calorias + (parseFloat(record.calorias) || 0),
        proteinas: acc.proteinas + (parseFloat(record.proteinas) || 0),
        carbohidratos:
          acc.carbohidratos + (parseFloat(record.carbohidratos) || 0),
        grasas: acc.grasas + (parseFloat(record.grasas) || 0),
      }),
      {
        calorias: 0,
        proteinas: 0,
        carbohidratos: 0,
        grasas: 0,
      }
    );
  };

  const localSummary = calculateLocalSummary();

  const getColorClasses = (color) => {
    const colors = {
      orange: {
        bg: darkMode ? "bg-orange-900/20" : "bg-orange-50",
        border: darkMode ? "border-orange-800" : "border-orange-200",
        text: "text-orange-600",
        accent: darkMode ? "bg-orange-800" : "bg-orange-100",
      },
      blue: {
        bg: darkMode ? "bg-blue-900/20" : "bg-blue-50",
        border: darkMode ? "border-blue-800" : "border-blue-200",
        text: "text-blue-600",
        accent: darkMode ? "bg-blue-800" : "bg-blue-100",
      },
      purple: {
        bg: darkMode ? "bg-purple-900/20" : "bg-purple-50",
        border: darkMode ? "border-purple-800" : "border-purple-200",
        text: "text-purple-600",
        accent: darkMode ? "bg-purple-800" : "bg-purple-100",
      },
      green: {
        bg: darkMode ? "bg-green-900/20" : "bg-green-50",
        border: darkMode ? "border-green-800" : "border-green-200",
        text: "text-green-600",
        accent: darkMode ? "bg-green-800" : "bg-green-100",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen">
      {/* Toast Container para notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Mejorado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1
                className={`text-3xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Panel Nutricional
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Monitorea tu ingesta diaria de nutrientes y alcanza tus
                objetivos
              </p>
            </div>
            <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
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
                  type="date"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nueva Comida
              </button>
            </div>
          </div>

          {/* Resumen Nutricional Mejorado */}
          <div
            className={`${
              darkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl"
                : "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg"
            } rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl`}
          >
            <div className="mb-8">
              <h3
                className={`text-2xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Resumen Nutricional del Día
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {localSummary.calorias > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Calorías */}
                <div
                  className={`relative overflow-hidden text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    darkMode
                      ? "bg-gradient-to-br from-red-900/30 to-orange-800/20 border border-red-700/50"
                      : "bg-gradient-to-br from-red-50 to-orange-100 border border-red-200"
                  }`}
                >
                  <div className="relative z-10">
                    <div
                      className={`inline-flex p-3 rounded-full mb-4 ${
                        darkMode ? "bg-red-800/50" : "bg-red-200"
                      }`}
                    >
                      <Flame className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-red-600 mb-1">
                      {formatDisplayNumber(localSummary.calorias)}
                    </p>
                    <p className="text-sm font-medium text-red-600/80">
                      Calorías
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-400/10 rounded-full -translate-y-10 translate-x-10"></div>
                </div>

                {/* Proteínas */}
                <div
                  className={`relative overflow-hidden text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    darkMode
                      ? "bg-gradient-to-br from-blue-900/30 to-indigo-800/20 border border-blue-700/50"
                      : "bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200"
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
                      {formatDisplayNumber(localSummary.proteinas)}g
                    </p>
                    <p className="text-sm font-medium text-blue-600/80">
                      Proteínas
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -translate-y-10 translate-x-10"></div>
                </div>

                {/* Carbohidratos */}
                <div
                  className={`relative overflow-hidden text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    darkMode
                      ? "bg-gradient-to-br from-green-900/30 to-emerald-800/20 border border-green-700/50"
                      : "bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200"
                  }`}
                >
                  <div className="relative z-10">
                    <div
                      className={`inline-flex p-3 rounded-full mb-4 ${
                        darkMode ? "bg-green-800/50" : "bg-green-200"
                      }`}
                    >
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-1">
                      {formatDisplayNumber(localSummary.carbohidratos)}g
                    </p>
                    <p className="text-sm font-medium text-green-600/80">
                      Carbohidratos
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full -translate-y-10 translate-x-10"></div>
                </div>

                {/* Grasas */}
                <div
                  className={`relative overflow-hidden text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    darkMode
                      ? "bg-gradient-to-br from-yellow-900/30 to-amber-800/20 border border-yellow-700/50"
                      : "bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200"
                  }`}
                >
                  <div className="relative z-10">
                    <div
                      className={`inline-flex p-3 rounded-full mb-4 ${
                        darkMode ? "bg-yellow-800/50" : "bg-yellow-200"
                      }`}
                    >
                      <Droplets className="h-8 w-8 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-600 mb-1">
                      {formatDisplayNumber(localSummary.grasas)}g
                    </p>
                    <p className="text-sm font-medium text-yellow-600/80">
                      Grasas
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 rounded-full -translate-y-10 translate-x-10"></div>
                </div>
              </div>
            ) : (
              <div
                className={`text-center py-12 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <div
                  className={`inline-flex p-6 rounded-full mb-4 ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <Utensils className="h-16 w-16 opacity-50" />
                </div>
                <p className="text-lg font-medium mb-2">
                  No hay datos para esta fecha
                </p>
                <p className="text-sm">
                  Comienza agregando tu primera comida del día
                </p>
              </div>
            )}
          </div>

          {/* Formulario de Agregar Comida Mejorado */}
          {showAddForm && (
            <div
              className={`${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } rounded-2xl border-2 border-dashed shadow-lg transition-all duration-300`}
            >
              <div className="p-8">
                <h4
                  className={`text-xl font-bold mb-6 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Agregar Nueva Comida
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <label
                      className={`block text-sm font-semibold mb-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Descripción del Alimento
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
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Ej: Ensalada César con pollo a la plancha"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-3 ${
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
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="desayuno">🌅 Desayuno</option>
                      <option value="almuerzo">☀️ Almuerzo</option>
                      <option value="cena">🌙 Cena</option>
                      <option value="merienda">🍎 Merienda</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-3 ${
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
                          calorias: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-3 ${
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
                          proteinas: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-3 ${
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
                          carbohidratos: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-3 ${
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
                          grasas: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                      darkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddFoodRecord}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-semibold shadow-lg"
                  >
                    Guardar Comida
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Registro de Comidas Mejorado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Object.entries(mealTypes).map(([key, meal]) => {
              const mealRecords = filteredRecords.filter(
                (record) => record.tipo_comida === key
              );
              const colors = getColorClasses(meal.color);

              return (
                <div
                  key={key}
                  className={`${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-2xl border-2 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl`}
                >
                  {/* Header de la comida */}
                  <div
                    className={`${colors.bg} ${colors.border} border-b-2 px-6 py-5`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${colors.accent}`}>
                          <span className="text-2xl">{meal.icon}</span>
                        </div>
                        <div>
                          <h4
                            className={`font-bold text-lg ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {meal.label}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock
                              className={`h-4 w-4 ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            />
                            <span
                              className={`${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {meal.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                            mealRecords.length > 0
                              ? `${colors.text} ${colors.bg} border-2 ${colors.border}`
                              : darkMode
                              ? "text-gray-500 bg-gray-700 border-2 border-gray-600"
                              : "text-gray-500 bg-gray-100 border-2 border-gray-200"
                          }`}
                        >
                          {mealRecords.length}{" "}
                          {mealRecords.length === 1 ? "alimento" : "alimentos"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {mealRecords.length > 0 ? (
                      <div className="space-y-4">
                        {mealRecords.map((record, index) => (
                          <div
                            key={record.id}
                            className={`p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                              darkMode
                                ? "bg-gray-700/50 border-gray-600 hover:border-gray-500"
                                : "bg-gray-50 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {editingRecordId === record.id ? (
                              // Formulario de edición
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h5
                                    className={`font-bold text-lg ${
                                      darkMode ? "text-white" : "text-gray-900"
                                    }`}
                                  >
                                    Editando Alimento
                                  </h5>
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() => handleSaveEdit(record.id)}
                                      className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                      <Save className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className={`p-2 rounded-xl transition-all duration-200 ${
                                        darkMode
                                          ? "bg-gray-600 hover:bg-gray-500 text-gray-300"
                                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                      }`}
                                    >
                                      <X className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="md:col-span-2">
                                    <label
                                      className={`block text-sm font-semibold mb-2 ${
                                        darkMode
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      Descripción
                                    </label>
                                    <input
                                      type="text"
                                      value={editFormData.descripcion}
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          descripcion: e.target.value,
                                        })
                                      }
                                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                        darkMode
                                          ? "bg-gray-600 border-gray-500 text-white"
                                          : "bg-white border-gray-300 text-gray-900"
                                      }`}
                                    />
                                  </div>

                                  <div>
                                    <label
                                      className={`block text-sm font-semibold mb-2 ${
                                        darkMode
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      Tipo
                                    </label>
                                    <select
                                      value={editFormData.tipo_comida}
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          tipo_comida: e.target.value,
                                        })
                                      }
                                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
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
                                      className={`block text-sm font-semibold mb-2 ${
                                        darkMode
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      Calorías
                                    </label>
                                    <input
                                      type="number"
                                      value={editFormData.calorias}
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          calorias:
                                            parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                        darkMode
                                          ? "bg-gray-600 border-gray-500 text-white"
                                          : "bg-white border-gray-300 text-gray-900"
                                      }`}
                                      min="0"
                                      step="1"
                                    />
                                  </div>

                                  <div>
                                    <label
                                      className={`block text-sm font-semibold mb-2 ${
                                        darkMode
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      Proteínas (g)
                                    </label>
                                    <input
                                      type="number"
                                      value={editFormData.proteinas}
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          proteinas:
                                            parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                        darkMode
                                          ? "bg-gray-600 border-gray-500 text-white"
                                          : "bg-white border-gray-300 text-gray-900"
                                      }`}
                                      min="0"
                                      step="0.1"
                                    />
                                  </div>

                                  <div>
                                    <label
                                      className={`block text-sm font-semibold mb-2 ${
                                        darkMode
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      Carbohidratos (g)
                                    </label>
                                    <input
                                      type="number"
                                      value={editFormData.carbohidratos}
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          carbohidratos:
                                            parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                        darkMode
                                          ? "bg-gray-600 border-gray-500 text-white"
                                          : "bg-white border-gray-300 text-gray-900"
                                      }`}
                                      min="0"
                                      step="0.1"
                                    />
                                  </div>

                                  <div>
                                    <label
                                      className={`block text-sm font-semibold mb-2 ${
                                        darkMode
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      Grasas (g)
                                    </label>
                                    <input
                                      type="number"
                                      value={editFormData.grasas}
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          grasas:
                                            parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                        darkMode
                                          ? "bg-gray-600 border-gray-500 text-white"
                                          : "bg-white border-gray-300 text-gray-900"
                                      }`}
                                      min="0"
                                      step="0.1"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Vista normal del registro
                              <div className="flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                  <div className="flex items-center space-x-3 mb-4">
                                    <div
                                      className={`p-2 rounded-lg ${colors.accent}`}
                                    >
                                      <Utensils
                                        className={`h-5 w-5 ${colors.text}`}
                                      />
                                    </div>
                                    <h5
                                      className={`font-bold text-lg ${
                                        darkMode
                                          ? "text-white"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {record.descripcion}
                                    </h5>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div
                                      className={`p-3 rounded-xl ${
                                        darkMode ? "bg-red-900/20" : "bg-red-50"
                                      } border ${
                                        darkMode
                                          ? "border-red-800/50"
                                          : "border-red-200"
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <span
                                          className={`text-sm font-medium ${
                                            darkMode
                                              ? "text-gray-300"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          Calorías
                                        </span>
                                        <span className="font-bold text-red-600">
                                          {formatNumber(record.calorias)}
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      className={`p-3 rounded-xl ${
                                        darkMode
                                          ? "bg-blue-900/20"
                                          : "bg-blue-50"
                                      } border ${
                                        darkMode
                                          ? "border-blue-800/50"
                                          : "border-blue-200"
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <span
                                          className={`text-sm font-medium ${
                                            darkMode
                                              ? "text-gray-300"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          Proteínas
                                        </span>
                                        <span className="font-bold text-blue-600">
                                          {formatNumber(record.proteinas)}g
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      className={`p-3 rounded-xl ${
                                        darkMode
                                          ? "bg-green-900/20"
                                          : "bg-green-50"
                                      } border ${
                                        darkMode
                                          ? "border-green-800/50"
                                          : "border-green-200"
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <span
                                          className={`text-sm font-medium ${
                                            darkMode
                                              ? "text-gray-300"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          Carbohidratos
                                        </span>
                                        <span className="font-bold text-green-600">
                                          {formatNumber(record.carbohidratos)}g
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      className={`p-3 rounded-xl ${
                                        darkMode
                                          ? "bg-yellow-900/20"
                                          : "bg-yellow-50"
                                      } border ${
                                        darkMode
                                          ? "border-yellow-800/50"
                                          : "border-yellow-200"
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <span
                                          className={`text-sm font-medium ${
                                            darkMode
                                              ? "text-gray-300"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          Grasas
                                        </span>
                                        <span className="font-bold text-yellow-600">
                                          {formatNumber(record.grasas)}g
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                  <button
                                    onClick={() => handleEditClick(record)}
                                    className={`p-3 rounded-xl transition-all duration-200 ${
                                      darkMode
                                        ? "hover:bg-gray-600 text-gray-400 hover:text-gray-200"
                                        : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                    }`}
                                    title="Editar alimento"
                                  >
                                    <Edit3 className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteRecord(record.id)
                                    }
                                    className={`p-3 rounded-xl transition-all duration-200 ${
                                      darkMode
                                        ? "hover:bg-red-900/30 text-red-400 hover:text-red-300"
                                        : "hover:bg-red-50 text-red-500 hover:text-red-600"
                                    }`}
                                    title="Eliminar alimento"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div
                          className={`inline-flex p-6 rounded-full mb-4 ${
                            darkMode ? "bg-gray-700" : "bg-gray-100"
                          }`}
                        >
                          <span className="text-4xl opacity-50">
                            {meal.icon}
                          </span>
                        </div>
                        <p
                          className={`text-lg font-medium mb-2 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          No hay alimentos registrados
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          {meal.time}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionDashboard;
