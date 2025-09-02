import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth/auth.context";
import { useMedicalHistory } from "../context/history-medical/history-medical.context";
import { useNutrition } from "../context/nutrition/nutrition.context";
import { usePhysicalActivity } from "../context/activity/activity.context";
import {
  User,
  Heart,
  Activity,
  FileText,
  Edit3,
  Save,
  Camera,
  Mail,
  Phone,
  Calendar,
  Ruler,
  Weight,
  Target,
  TrendingUp,
  Apple,
  Utensils,
  Clock,
  BarChart3,
  Plus,
  Trash2,
  X,
  Info,
  Shield,
  AlertCircle,
  Pill,
} from "lucide-react";

const ProfileDashboard = ({ darkMode = false }) => {
  const { user, updateUser } = useAuth();
  const {
    medicalHistory,
    getMedicalHistoryByUser,
    createMedicalHistory,
    updateMedicalHistory,
  } = useMedicalHistory();
  const {
    foodRecords,
    dailySummary,
    getFoodRecordsByUser,
    getDailySummary,
    deleteFoodRecord,
  } = useNutrition();
  const {
    activities,
    weeklySummary,
    getPhysicalActivitiesByUser,
    getWeeklySummary,
    deletePhysicalActivity,
  } = usePhysicalActivity();

  const [activeTab, setActiveTab] = useState("perfil");
  const [editingProfile, setEditingProfile] = useState(false);

  const [profileData, setProfileData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    edad: "",
    altura: "",
    pesoActual: "",
    pesoObjetivo: "",
    genero: "",
    nivelActividad: "moderado",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        nombre: user.name || "",
        email: user.email || "",
        telefono: user.telefono || "",
        edad: user.edad || "",
        altura: user.altura || "",
        pesoActual: user.pesoActual || "",
        pesoObjetivo: user.pesoObjetivo || "",
        genero: user.genero || "",
        nivelActividad: user.nivelActividad || "moderado",
      });

      const loadData = async () => {
        try {
          await getMedicalHistoryByUser(user.id);
          await getFoodRecordsByUser(user.id);
          await getDailySummary(
            user.id,
            new Date().toISOString().split("T")[0]
          );
          await getPhysicalActivitiesByUser(user.id);
          await getWeeklySummary(
            user.id,
            new Date().toISOString().split("T")[0]
          );
        } catch (error) {
          // Handle error silently or show user-friendly message
        }
      };

      loadData();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await updateUser(profileData);
      setEditingProfile(false);
    } catch (error) {
      // Handle error
    }
  };

  const tabs = [
    { id: "perfil", name: "Perfil", icon: User, color: "emerald" },
    { id: "nutricion", name: "Nutrición", icon: Apple, color: "green" },
    { id: "actividad", name: "Actividad", icon: Activity, color: "blue" },
    { id: "historial", name: "Historial", icon: FileText, color: "orange" },
  ];

  // Componente de Perfil
  const ProfileSection = () => (
    <div className="space-y-8">
      {/* Card principal de perfil */}
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-2xl ${
          darkMode
            ? "border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900"
            : "border-gray-200 bg-gradient-to-br from-white to-gray-50"
        }`}
      >
        {/* Header con gradiente */}
        <div
          className={`relative px-8 py-6 ${
            darkMode
              ? "bg-gradient-to-r from-emerald-900/20 to-blue-900/20"
              : "bg-gradient-to-r from-emerald-50 to-blue-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl ${
                    darkMode
                      ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                      : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  }`}
                >
                  <User className="h-10 w-10 text-white" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-emerald-500 hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4 text-emerald-600" />
                </button>
              </div>
              <div>
                <h2
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {profileData.nombre || "Usuario"}
                </h2>
                <p
                  className={`text-lg ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {profileData.email}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span
                    className={`text-sm ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    Perfil Activo
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {editingProfile ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg ${
                      darkMode
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-500 text-white hover:bg-gray-600"
                    }`}
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido del perfil */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información personal */}
            <div className="space-y-6">
              <h3
                className={`text-xl font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Información Personal
              </h3>

              <div className="space-y-4">
                {[
                  {
                    icon: Mail,
                    label: "Email",
                    value: profileData.email,
                    field: "email",
                  },
                  {
                    icon: Phone,
                    label: "Teléfono",
                    value: profileData.telefono,
                    field: "telefono",
                  },
                  {
                    icon: Calendar,
                    label: "Edad",
                    value: `${profileData.edad} años`,
                    field: "edad",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                      darkMode
                        ? "border-gray-700 bg-gray-800/50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-white shadow-sm"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {item.label}
                      </p>
                      {editingProfile ? (
                        <input
                          type={
                            item.field === "email"
                              ? "email"
                              : item.field === "telefono"
                              ? "tel"
                              : "text"
                          }
                          value={profileData[item.field] || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              [item.field]: e.target.value,
                            }))
                          }
                          className={`w-full mt-1 px-3 py-2 rounded-lg border transition-colors ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                      ) : (
                        <p
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.value || "No especificado"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas corporales */}
            <div className="space-y-6">
              <h3
                className={`text-xl font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Métricas Corporales
              </h3>

              <div className="space-y-4">
                {[
                  {
                    icon: Ruler,
                    label: "Altura",
                    value: `${profileData.altura} cm`,
                    field: "altura",
                  },
                  {
                    icon: Weight,
                    label: "Peso Actual",
                    value: `${profileData.pesoActual} kg`,
                    field: "pesoActual",
                  },
                  {
                    icon: Target,
                    label: "Peso Objetivo",
                    value: `${profileData.pesoObjetivo} kg`,
                    field: "pesoObjetivo",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                      darkMode
                        ? "border-gray-700 bg-gray-800/50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-white shadow-sm"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {item.label}
                      </p>
                      {editingProfile ? (
                        <input
                          type="number"
                          value={profileData[item.field] || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              [item.field]: e.target.value,
                            }))
                          }
                          className={`w-full mt-1 px-3 py-2 rounded-lg border transition-colors ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                      ) : (
                        <p
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.value || "No especificado"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div
        className={`rounded-2xl border shadow-xl ${
          darkMode
            ? "border-gray-700 bg-gray-800/50"
            : "border-gray-200 bg-white/90"
        }`}
      >
        <div
          className={`px-8 py-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Resumen de Progreso
          </h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div
              className={`text-center p-6 rounded-xl border ${
                darkMode
                  ? "border-emerald-800 bg-emerald-900/20"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-emerald-600">
                {profileData.pesoActual && profileData.pesoObjetivo
                  ? `${Math.abs(
                      profileData.pesoActual - profileData.pesoObjetivo
                    ).toFixed(1)}kg`
                  : "0kg"}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Diferencia
              </p>
            </div>
            <div
              className={`text-center p-6 rounded-xl border ${
                darkMode
                  ? "border-blue-800 bg-blue-900/20"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-blue-600">
                {dailySummary?.totalCalorias || 0}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Calorías Hoy
              </p>
            </div>
            <div
              className={`text-center p-6 rounded-xl border ${
                darkMode
                  ? "border-orange-800 bg-orange-900/20"
                  : "border-orange-200 bg-orange-50"
              }`}
            >
              <Activity className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-orange-600">
                {weeklySummary?.totalDuracion || 0}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Min Activos
              </p>
            </div>
            <div
              className={`text-center p-6 rounded-xl border ${
                darkMode
                  ? "border-purple-800 bg-purple-900/20"
                  : "border-purple-200 bg-purple-50"
              }`}
            >
              <Heart className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-purple-600">
                {(() => {
                  if (!medicalHistory) return 0;
                  if (Array.isArray(medicalHistory))
                    return medicalHistory.length;
                  if (typeof medicalHistory === "object") {
                    const possibleArrays = [
                      "data",
                      "records",
                      "history",
                      "items",
                      "results",
                    ];
                    for (const prop of possibleArrays) {
                      if (
                        medicalHistory[prop] &&
                        Array.isArray(medicalHistory[prop])
                      ) {
                        return medicalHistory[prop].length;
                      }
                    }
                    return Object.keys(medicalHistory).length > 0 ? 1 : 0;
                  }
                  return 0;
                })()}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Registros Médicos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Nutrición usando context real
  const NutritionSection = () => (
    <div className="space-y-8">
      {/* Resumen diario */}
      <div
        className={`rounded-2xl border shadow-xl ${
          darkMode
            ? "border-gray-700 bg-gray-800/50"
            : "border-gray-200 bg-white/90"
        }`}
      >
        <div
          className={`px-8 py-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Resumen Nutricional de Hoy
          </h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🔥",
                label: "Calorías",
                value: dailySummary?.totalCalorias || 0,
                unit: "kcal",
                color: "red",
              },
              {
                icon: "💪",
                label: "Proteínas",
                value: dailySummary?.totalProteinas || 0,
                unit: "g",
                color: "blue",
              },
              {
                icon: "🌾",
                label: "Carbohidratos",
                value: dailySummary?.totalCarbohidratos || 0,
                unit: "g",
                color: "green",
              },
              {
                icon: "🥑",
                label: "Grasas",
                value: dailySummary?.totalGrasas || 0,
                unit: "g",
                color: "yellow",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-xl border hover:shadow-lg transition-all ${
                  darkMode
                    ? "border-gray-700 bg-gray-800/30"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    darkMode
                      ? `bg-${item.color}-900/20`
                      : `bg-${item.color}-100`
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h4
                  className={`font-semibold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {item.label}
                </h4>
                <p className={`text-2xl font-bold text-${item.color}-600 mb-1`}>
                  {item.value}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {item.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registro de comidas del día */}
      <div
        className={`rounded-2xl border shadow-xl ${
          darkMode
            ? "border-gray-700 bg-gray-800/50"
            : "border-gray-200 bg-white/90"
        }`}
      >
        <div
          className={`px-8 py-6 border-b flex items-center justify-between ${
            darkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Registros de Comida
          </h3>
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Comida
          </button>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {foodRecords && foodRecords.length > 0 ? (
              foodRecords.map((record, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    darkMode
                      ? "border-gray-700 bg-gray-800/30"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Utensils
                      className={`h-5 w-5 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                    <div>
                      <h4
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {record.nombreComida || "Comida"}
                      </h4>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {record.calorias} kcal • {record.tipoComida}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFoodRecord(record.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div
                className={`text-center py-12 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <Apple className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No hay registros de comida para hoy</p>
                <p className="text-sm mt-2">
                  Comienza agregando tu primera comida
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Actividad Física usando context real
  const ActivitySection = () => (
    <div className="space-y-8">
      {/* Resumen semanal de actividades */}
      <div
        className={`rounded-2xl border shadow-xl ${
          darkMode
            ? "border-gray-700 bg-gray-800/50"
            : "border-gray-200 bg-white/90"
        }`}
      >
        <div
          className={`px-8 py-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Resumen de Actividad Física
          </h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`text-center p-6 rounded-xl border ${
                darkMode
                  ? "border-green-800 bg-green-900/20"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-green-600">
                {weeklySummary?.totalActividades || 0}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Actividades
              </p>
            </div>
            <div
              className={`text-center p-6 rounded-xl border ${
                darkMode
                  ? "border-blue-800 bg-blue-900/20"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-blue-600">
                {weeklySummary?.totalDuracion || 0}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Minutos Total
              </p>
            </div>
            <div
              className={`text-center p-6 rounded-xl border ${
                darkMode
                  ? "border-orange-800 bg-orange-900/20"
                  : "border-orange-200 bg-orange-50"
              }`}
            >
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-orange-600">
                {weeklySummary?.totalCaloriasQuemadas || 0}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Calorías Quemadas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de actividades */}
      <div
        className={`rounded-2xl border shadow-xl ${
          darkMode
            ? "border-gray-700 bg-gray-800/50"
            : "border-gray-200 bg-white/90"
        }`}
      >
        <div
          className={`px-8 py-6 border-b flex items-center justify-between ${
            darkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Actividades Físicas
          </h3>
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Actividad
          </button>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    darkMode
                      ? "border-gray-700 bg-gray-800/30"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Activity
                      className={`h-5 w-5 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                    <div>
                      <h4
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {activity.tipoActividad}
                      </h4>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {activity.duracion} min • {activity.intensidad} •{" "}
                        {activity.caloriasQuemadas} kcal
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePhysicalActivity(activity.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div
                className={`text-center py-12 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No hay actividades físicas registradas</p>
                <p className="text-sm mt-2">
                  Comienza registrando tu primera actividad
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Historial Médico actualizado con vista previa
  const MedicalHistorySection = () => {
    const getMedicalHistoryData = () => {
      if (!medicalHistory) return [];
      if (Array.isArray(medicalHistory)) return medicalHistory;
      if (typeof medicalHistory === "object") {
        const possibleArrays = [
          "data",
          "records",
          "history",
          "items",
          "results",
        ];
        for (const prop of possibleArrays) {
          if (medicalHistory[prop] && Array.isArray(medicalHistory[prop])) {
            return medicalHistory[prop];
          }
        }
        if (Object.keys(medicalHistory).length > 0) {
          return [medicalHistory];
        }
      }
      return [];
    };

    const medicalData = getMedicalHistoryData();

    // Datos de ejemplo para demostrar la estructura
    const sampleMedicalData = [
      {
        id: 1,
        tipo: "condiciones",
        titulo: "Condiciones Médicas",
        items: ["hipertensión", "diabetes tipo 2"],
        count: 2,
      },
      {
        id: 2,
        tipo: "alergias",
        titulo: "Alergias",
        items: ["penicilina", "mariscos"],
        count: 2,
      },
      {
        id: 3,
        tipo: "medicamentos",
        titulo: "Medicamentos",
        items: ["lisinopril 10mg", "metformina 500mg"],
        count: 2,
      },
    ];

    // Usar datos reales si existen, si no usar datos de ejemplo
    const displayData =
      medicalData.length > 0 ? medicalData : sampleMedicalData;

    return (
      <div className="space-y-8">
        {/* Header principal */}
        <div
          className={`rounded-2xl border shadow-xl ${
            darkMode
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-white/90"
          }`}
        >
          <div
            className={`px-8 py-6 border-b flex items-center justify-between ${
              darkMode ? "border-gray-700" : "border-gray-100"
            }`}
          >
            <div>
              <div className="flex items-center space-x-3">
                <Heart
                  className={`h-6 w-6 ${
                    darkMode ? "text-red-400" : "text-red-500"
                  }`}
                />
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Mi Información Médica
                </h3>
              </div>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Visualizando información médica
              </p>
            </div>
            <button className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Edit3 className="h-4 w-4 mr-2" />
              Editar Información
            </button>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {/* Vista previa de las categorías médicas */}
              {displayData.map((category, index) => (
                <div
                  key={category.id || index}
                  className={`rounded-lg border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between p-4 ${
                      darkMode ? "bg-gray-800/30" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          category.tipo === "condiciones"
                            ? "bg-red-100"
                            : category.tipo === "alergias"
                            ? "bg-orange-100"
                            : category.tipo === "medicamentos"
                            ? "bg-blue-100"
                            : darkMode
                            ? "bg-gray-700"
                            : "bg-gray-100"
                        }`}
                      >
                        {category.tipo === "condiciones" ? (
                          <Heart className="h-5 w-5 text-red-600" />
                        ) : category.tipo === "alergias" ? (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        ) : category.tipo === "medicamentos" ? (
                          <Pill className="h-5 w-5 text-blue-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h4
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {category.titulo ||
                            category.condicion ||
                            category.tipo ||
                            "Información Médica"}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          darkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {category.count || category.items?.length || 1}
                      </span>
                      <Info
                        className={`h-4 w-4 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Lista de elementos */}
                  <div className="p-4">
                    <div className="space-y-2">
                      {category.items ? (
                        category.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className={`flex items-center p-3 rounded-lg ${
                              category.tipo === "condiciones"
                                ? "bg-red-50 border border-red-100"
                                : category.tipo === "alergias"
                                ? "bg-orange-50 border border-orange-100"
                                : category.tipo === "medicamentos"
                                ? "bg-blue-50 border border-blue-100"
                                : darkMode
                                ? "bg-gray-800 border border-gray-700"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <span
                              className={`text-sm ${
                                category.tipo === "condiciones"
                                  ? "text-red-700"
                                  : category.tipo === "alergias"
                                  ? "text-orange-700"
                                  : category.tipo === "medicamentos"
                                  ? "text-blue-700"
                                  : darkMode
                                  ? "text-gray-300"
                                  : "text-gray-700"
                              }`}
                            >
                              {item}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div
                          className={`flex items-center p-3 rounded-lg ${
                            darkMode
                              ? "bg-gray-800 border border-gray-700"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <span
                            className={`text-sm ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {category.descripcion ||
                              category.notas ||
                              "Sin información adicional"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {medicalData.length === 0 && (
                <div
                  className={`text-center py-8 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Datos de ejemplo mostrados</p>
                  <p className="text-xs mt-1">
                    Agrega tu información médica real para personalizar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de salud general */}
        <div
          className={`rounded-2xl border shadow-xl ${
            darkMode
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-white/90"
          }`}
        >
          <div
            className={`px-8 py-6 border-b ${
              darkMode ? "border-gray-700" : "border-gray-100"
            }`}
          >
            <h3
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Resumen de Salud
            </h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* IMC */}
              <div
                className={`p-6 rounded-xl border ${
                  darkMode
                    ? "border-gray-700 bg-gray-800/30"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Índice de Masa Corporal (IMC)
                  </h4>
                  <TrendingUp
                    className={`h-5 w-5 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  />
                </div>
                {profileData.altura && profileData.pesoActual ? (
                  <div>
                    <p className="text-3xl font-bold text-emerald-600 mb-2">
                      {(
                        parseFloat(profileData.pesoActual) /
                        Math.pow(parseFloat(profileData.altura) / 100, 2)
                      ).toFixed(1)}
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Rango normal: 18.5 - 24.9
                    </p>
                  </div>
                ) : (
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Completa tu altura y peso para calcular
                  </p>
                )}
              </div>

              {/* Estado general */}
              <div
                className={`p-6 rounded-xl border ${
                  darkMode
                    ? "border-gray-700 bg-gray-800/30"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Estado General
                  </h4>
                  <Heart
                    className={`h-5 w-5 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Nutrición
                    </span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        dailySummary && dailySummary.totalCalorias > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {dailySummary && dailySummary.totalCalorias > 0
                        ? "Activo"
                        : "Pendiente"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Actividad Física
                    </span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        weeklySummary && weeklySummary.totalDuracion > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {weeklySummary && weeklySummary.totalDuracion > 0
                        ? "Activo"
                        : "Mejorar"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Seguimiento Médico
                    </span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        medicalData.length > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {medicalData.length > 0 ? "Al día" : "Sin datos"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "perfil":
        return <ProfileSection />;
      case "nutricion":
        return <NutritionSection />;
      case "actividad":
        return <ActivitySection />;
      case "historial":
        return <MedicalHistorySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Mi Dashboard
          </h1>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Tu centro de control para una vida saludable
          </p>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`flex space-x-1 rounded-xl p-1 mb-8 ${
            darkMode ? "bg-gray-800/50" : "bg-gray-100"
          }`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-${tab.color}-600 text-white shadow-lg scale-105`
                  : darkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white"
              }`}
            >
              <tab.icon
                className={`h-5 w-5 mr-2 ${
                  activeTab === tab.id ? "text-white" : ""
                }`}
              />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="transition-all duration-300">{renderContent()}</div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
