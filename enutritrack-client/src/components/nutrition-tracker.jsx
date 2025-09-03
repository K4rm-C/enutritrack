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
    getFoodRecordsByUser(user.id);
    getDailySummary(user.id, selectedDate);
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
      });
      getFoodRecordsByUser(user.id);
      toast.success("¡Comida agregada correctamente!", {
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
    // Si es un número entero, quitar los decimales
    if (Number.isInteger(parseFloat(value))) {
      return parseInt(value);
    }
    // Si tiene decimales, mantenerlos pero sin ceros innecesarios
    return parseFloat(value);
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
      getFoodRecordsByUser(user.id); // Actualizar la lista
      toast.success("¡Comida actualizada correctamente!", {
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
      getFoodRecordsByUser(user.id); // Actualizar la lista
      toast.success("¡Comida eliminada correctamente!", {
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
        <div className="space-y-7">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1
                className={`text-3xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Panel Nutricional
              </h1>
              <p
                className={`mt-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Monitorea tu ingesta diaria de nutrientes
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
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
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Comida
              </button>
            </div>
          </div>

          {/* Resumen Nutricional */}
          <div
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl border shadow-sm`}
          >
            <div className="p-6">
              <h3
                className={`text-xl font-semibold mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Resumen del Día
              </h3>

              {localSummary ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    className={`p-6 rounded-xl ${
                      darkMode ? "bg-red-900/20" : "bg-red-50"
                    } border ${darkMode ? "border-red-800" : "border-red-100"}`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-3 rounded-lg ${
                          darkMode ? "bg-red-800" : "bg-red-100"
                        } mr-4`}
                      >
                        <span className="text-2xl">🔥</span>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-red-600">
                          {Math.round(localSummary.calorias || 0)}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Calorías
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-xl ${
                      darkMode ? "bg-blue-900/20" : "bg-blue-50"
                    } border ${
                      darkMode ? "border-blue-800" : "border-blue-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-3 rounded-lg ${
                          darkMode ? "bg-blue-800" : "bg-blue-100"
                        } mr-4`}
                      >
                        <span className="text-2xl">💪</span>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-blue-600">
                          {Math.round(localSummary.proteinas || 0)}g
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Proteínas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-xl ${
                      darkMode ? "bg-green-900/20" : "bg-green-50"
                    } border ${
                      darkMode ? "border-green-800" : "border-green-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-3 rounded-lg ${
                          darkMode ? "bg-green-800" : "bg-green-100"
                        } mr-4`}
                      >
                        <span className="text-2xl">🌾</span>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-green-600">
                          {Math.round(localSummary.carbohidratos || 0)}g
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Carbohidratos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-xl ${
                      darkMode ? "bg-yellow-900/20" : "bg-yellow-50"
                    } border ${
                      darkMode ? "border-yellow-800" : "border-yellow-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-3 rounded-lg ${
                          darkMode ? "bg-yellow-800" : "bg-yellow-100"
                        } mr-4`}
                      >
                        <span className="text-2xl">🥑</span>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-yellow-600">
                          {Math.round(localSummary.grasas || 0)}g
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Grasas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p
                    className={`text-lg ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    No hay datos para esta fecha
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Comienza agregando tu primera comida del día
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de Agregar Comida */}
          {showAddForm && (
            <div
              className={`${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } rounded-xl border shadow-sm`}
            >
              <div className="p-6">
                <h4
                  className={`text-lg font-semibold mb-6 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Agregar Nueva Comida
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    >
                      <option value="desayuno">🌅 Desayuno</option>
                      <option value="almuerzo">☀️ Almuerzo</option>
                      <option value="cena">🌙 Cena</option>
                      <option value="merienda">🍎 Merienda</option>
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
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      placeholder="Ej: Ensalada César con pollo"
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
                          calorias: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      min="0"
                      step="1"
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
                          proteinas: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      min="0"
                      step="0.1"
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
                          carbohidratos: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      min="0"
                      step="0.1"
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
                          grasas: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`px-6 py-2 rounded-lg border ${
                      darkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddFoodRecord}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Guardar Comida
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Registro de Comidas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  } rounded-xl border shadow-sm overflow-hidden`}
                >
                  <div
                    className={`${colors.bg} ${colors.border} border-b px-6 py-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${colors.accent}`}>
                          <span className="text-xl">{meal.icon}</span>
                        </div>
                        <div>
                          <h4
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {meal.label}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock
                              className={`h-3 w-3 ${
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
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            mealRecords.length > 0
                              ? `${colors.text} ${colors.bg}`
                              : darkMode
                              ? "text-gray-500 bg-gray-700"
                              : "text-gray-500 bg-gray-100"
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
                            className={`p-4 rounded-lg ${
                              darkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-gray-50 border-gray-200"
                            } border transition-all hover:shadow-md`}
                          >
                            {editingRecordId === record.id ? (
                              // Formulario de edición
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h5
                                    className={`font-medium ${
                                      darkMode ? "text-white" : "text-gray-900"
                                    }`}
                                  >
                                    Editando alimento
                                  </h5>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleSaveEdit(record.id)}
                                      className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                    >
                                      <Save className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className={`p-2 rounded-lg ${
                                        darkMode
                                          ? "bg-gray-600 hover:bg-gray-500"
                                          : "bg-gray-200 hover:bg-gray-300"
                                      } transition-colors`}
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label
                                      className={`block text-xs font-medium mb-1 ${
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
                                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                        darkMode
                                          ? "bg-gray-600 border-gray-500 text-white"
                                          : "bg-white border-gray-300 text-gray-900"
                                      }`}
                                    />
                                  </div>

                                  <div>
                                    <label
                                      className={`block text-xs font-medium mb-1 ${
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
                                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
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
                                      className={`block text-xs font-medium mb-1 ${
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
                                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
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
                                      className={`block text-xs font-medium mb-1 ${
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
                                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
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
                                      className={`block text-xs font-medium mb-1 ${
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
                                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
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
                                      className={`block text-xs font-medium mb-1 ${
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
                                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
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
                                <div className="flex-1">
                                  <h5
                                    className={`font-medium mb-2 ${
                                      darkMode ? "text-white" : "text-gray-900"
                                    }`}
                                  >
                                    {record.descripcion}
                                  </h5>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                      <span
                                        className={`${
                                          darkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        Calorías:
                                      </span>
                                      <span
                                        className={`font-medium ${colors.text}`}
                                      >
                                        {record.calorias} kcal
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span
                                        className={`${
                                          darkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        Proteínas:
                                      </span>
                                      <span
                                        className={`font-medium text-blue-600`}
                                      >
                                        {record.proteinas}g
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span
                                        className={`${
                                          darkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        Carbohidratos:
                                      </span>
                                      <span
                                        className={`font-medium text-green-600`}
                                      >
                                        {record.carbohidratos}g
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span
                                        className={`${
                                          darkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        Grasas:
                                      </span>
                                      <span
                                        className={`font-medium text-yellow-600`}
                                      >
                                        {record.grasas}g
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <button
                                    onClick={() => handleEditClick(record)}
                                    className={`p-2 rounded-lg ${
                                      darkMode
                                        ? "hover:bg-gray-600"
                                        : "hover:bg-gray-200"
                                    } transition-colors`}
                                  >
                                    <Edit3
                                      className={`h-4 w-4 ${
                                        darkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteRecord(record.id)
                                    }
                                    className={`p-2 rounded-lg ${
                                      darkMode
                                        ? "hover:bg-red-900/30"
                                        : "hover:bg-red-50"
                                    } transition-colors`}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">{meal.icon}</div>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          No hay alimentos registrados para{" "}
                          {meal.label.toLowerCase()}
                        </p>
                        <p
                          className={`text-xs ${
                            darkMode ? "text-gray-500" : "text-gray-500"
                          } mt-1`}
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
