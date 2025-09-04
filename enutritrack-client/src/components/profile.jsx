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
  ChevronRight,
  Star,
  Award,
  Zap,
  Brain,
  Eye,
  ShieldCheck,
} from "lucide-react";

const ProfileDashboard = ({ darkMode = false }) => {
  const { user, updateUser } = useAuth();
  const { medicalHistory, getMedicalHistoryByUser } = useMedicalHistory();
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
  const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);
        try {
          await Promise.all([
            getMedicalHistoryByUser(user.id),
            getFoodRecordsByUser(user.id),
            getDailySummary(user.id, new Date().toISOString().split("T")[0]),
            getPhysicalActivitiesByUser(user.id),
            getWeeklySummary(user.id, new Date().toISOString().split("T")[0]),
          ]);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateUser(profileData);
      setEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "perfil", name: "Perfil", icon: User, color: "emerald" },
    { id: "nutricion", name: "Nutrición", icon: Apple, color: "green" },
    { id: "actividad", name: "Actividad", icon: Activity, color: "blue" },
    { id: "historial", name: "Historial", icon: FileText, color: "orange" },
  ];

  // Función para obtener clases de color según el modo
  const getColorClasses = (color, type = "bg") => {
    const colors = {
      emerald: {
        bg: darkMode ? "bg-emerald-900/20" : "bg-emerald-50",
        border: darkMode ? "border-emerald-800" : "border-emerald-200",
        text: "text-emerald-600",
        accent: darkMode ? "bg-emerald-800" : "bg-emerald-100",
      },
      green: {
        bg: darkMode ? "bg-green-900/20" : "bg-green-50",
        border: darkMode ? "border-green-800" : "border-green-200",
        text: "text-green-600",
        accent: darkMode ? "bg-green-800" : "bg-green-100",
      },
      blue: {
        bg: darkMode ? "bg-blue-900/20" : "bg-blue-50",
        border: darkMode ? "border-blue-800" : "border-blue-200",
        text: "text-blue-600",
        accent: darkMode ? "bg-blue-800" : "bg-blue-100",
      },
      orange: {
        bg: darkMode ? "bg-orange-900/20" : "bg-orange-50",
        border: darkMode ? "border-orange-800" : "border-orange-200",
        text: "text-orange-600",
        accent: darkMode ? "bg-orange-800" : "bg-orange-100",
      },
      purple: {
        bg: darkMode ? "bg-purple-900/20" : "bg-purple-50",
        border: darkMode ? "border-purple-800" : "border-purple-200",
        text: "text-purple-600",
        accent: darkMode ? "bg-purple-800" : "bg-purple-100",
      },
      red: {
        bg: darkMode ? "bg-red-900/20" : "bg-red-50",
        border: darkMode ? "border-red-800" : "border-red-200",
        text: "text-red-600",
        accent: darkMode ? "bg-red-800" : "bg-red-100",
      },
    };
    return colors[color] ? colors[color][type] : colors.emerald[type];
  };

  // Componente de Perfil
  const ProfileSection = () => (
    <div className="space-y-8">
      {/* Card principal de perfil */}
      <div
        className={`relative overflow-hidden rounded-3xl border-0 shadow-2xl ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-white to-gray-50"
        }`}
      >
        {/* Header con gradiente */}
        <div
          className={`relative px-8 py-8 ${
            darkMode
              ? "bg-gradient-to-r from-emerald-600/20 to-blue-600/20"
              : "bg-gradient-to-r from-emerald-500/10 to-blue-500/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl ${
                    darkMode
                      ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                      : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  }`}
                >
                  <User className="h-12 w-12 text-white" />
                </div>
                <button
                  className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-emerald-500 hover:scale-110 transition-transform duration-200 ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <Camera className="h-5 w-5 text-emerald-600" />
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
                <div className="flex items-center mt-3 space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
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
                    disabled={isLoading}
                    className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Guardar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg"
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
                className={`text-xl font-semibold ${
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
                    type: "email",
                  },
                  {
                    icon: Phone,
                    label: "Teléfono",
                    value: profileData.telefono,
                    field: "telefono",
                    type: "tel",
                  },
                  {
                    icon: Calendar,
                    label: "Edad",
                    value: `${profileData.edad} años`,
                    field: "edad",
                    type: "number",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-xl border ${
                      darkMode
                        ? "border-gray-700 bg-gray-800/50"
                        : "border-gray-200 bg-white"
                    } hover:shadow-md transition-all duration-200`}
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-emerald-900/30" : "bg-emerald-100"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${
                          darkMode ? "text-emerald-400" : "text-emerald-600"
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
                          type={item.type}
                          value={profileData[item.field] || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              [item.field]: e.target.value,
                            }))
                          }
                          className={`w-full mt-2 px-4 py-2 rounded-lg border ${
                            darkMode
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          } focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors`}
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
                className={`text-xl font-semibold ${
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
                    className={`flex items-center space-x-4 p-4 rounded-xl border ${
                      darkMode
                        ? "border-gray-700 bg-gray-800/50"
                        : "border-gray-200 bg-white"
                    } hover:shadow-md transition-all duration-200`}
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-blue-900/30" : "bg-blue-100"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${
                          darkMode ? "text-blue-400" : "text-blue-600"
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
                          className={`w-full mt-2 px-4 py-2 rounded-lg border ${
                            darkMode
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
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
        className={`rounded-3xl border-0 shadow-xl ${
          darkMode ? "bg-gray-800/50" : "bg-white"
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
            {[
              {
                icon: TrendingUp,
                label: "Diferencia",
                value:
                  profileData.pesoActual && profileData.pesoObjetivo
                    ? `${Math.abs(
                        profileData.pesoActual - profileData.pesoObjetivo
                      ).toFixed(1)}kg`
                    : "0kg",
                color: "emerald",
                trend: "up",
              },
              {
                icon: BarChart3,
                label: "Calorías Hoy",
                value: dailySummary?.totalCalorias || 0,
                color: "blue",
                trend: "stable",
              },
              {
                icon: Activity,
                label: "Min Activos",
                value: weeklySummary?.totalDuracion || 0,
                color: "orange",
                trend: "up",
              },
              {
                icon: Heart,
                label: "Registros Médicos",
                value: (() => {
                  if (!medicalHistory) return 0;
                  if (Array.isArray(medicalHistory))
                    return medicalHistory.length;
                  return Object.keys(medicalHistory).length > 0 ? 1 : 0;
                })(),
                color: "purple",
                trend: "stable",
              },
            ].map((item, index) => {
              const colorClasses = getColorClasses(item.color);
              const textColor = darkMode
                ? `text-${item.color}-400`
                : `text-${item.color}-600`;

              return (
                <div
                  key={index}
                  className={`text-center p-6 rounded-2xl border ${colorClasses.border} ${colorClasses.bg} hover:scale-105 transition-transform duration-200`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${colorClasses.accent}`}
                  >
                    <item.icon className={`h-8 w-8 ${textColor}`} />
                  </div>
                  <p className={`text-2xl font-bold ${textColor} mb-2`}>
                    {item.value}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Nutrición
  const NutritionSection = () => (
    <div className="space-y-8">
      {/* Resumen diario */}
      <div
        className={`rounded-3xl border-0 shadow-xl ${
          darkMode ? "bg-gray-800/50" : "bg-white"
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
                color: "orange",
              },
            ].map((item, index) => {
              const colorClasses = getColorClasses(item.color);
              const textColor = darkMode
                ? `text-${item.color}-400`
                : `text-${item.color}-600`;

              return (
                <div
                  key={index}
                  className={`text-center p-6 rounded-2xl border ${
                    colorClasses.border
                  } ${
                    darkMode ? "bg-gray-800/30" : "bg-white"
                  } hover:shadow-lg transition-all duration-200`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${colorClasses.accent}`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <h4
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    {item.label}
                  </h4>
                  <p className={`text-2xl font-bold ${textColor} mb-1`}>
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
              );
            })}
          </div>
        </div>
      </div>

      {/* Registro de comidas */}
      <div
        className={`rounded-3xl border-0 shadow-xl ${
          darkMode ? "bg-gray-800/50" : "bg-white"
        }`}
      >
        <div
          className={`px-8 py-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-100"
          } flex items-center justify-between`}
        >
          <div>
            <h3
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Registros de Comida
            </h3>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              } mt-1`}
            >
              {foodRecords?.length || 0} registros hoy
            </p>
          </div>
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
                      : "border-gray-200 bg-white"
                  } hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-emerald-900/20" : "bg-emerald-100"
                      }`}
                    >
                      <Utensils
                        className={`h-5 w-5 ${
                          darkMode ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      />
                    </div>
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
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
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

  // Componente de Actividad Física
  const ActivitySection = () => (
    <div className="space-y-8">
      {/* Resumen semanal */}
      <div
        className={`rounded-3xl border-0 shadow-xl ${
          darkMode ? "bg-gray-800/50" : "bg-white"
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
            {[
              {
                icon: Activity,
                label: "Actividades",
                value: weeklySummary?.totalActividades || 0,
                color: "green",
              },
              {
                icon: Clock,
                label: "Minutos Total",
                value: weeklySummary?.totalDuracion || 0,
                color: "blue",
              },
              {
                icon: TrendingUp,
                label: "Calorías Quemadas",
                value: weeklySummary?.totalCaloriasQuemadas || 0,
                color: "orange",
              },
            ].map((item, index) => {
              const colorClasses = getColorClasses(item.color);
              const textColor = darkMode
                ? `text-${item.color}-400`
                : `text-${item.color}-600`;

              return (
                <div
                  key={index}
                  className={`text-center p-6 rounded-2xl border ${colorClasses.border} ${colorClasses.bg} hover:scale-105 transition-transform duration-200`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${colorClasses.accent}`}
                  >
                    <item.icon className={`h-8 w-8 ${textColor}`} />
                  </div>
                  <p className={`text-2xl font-bold ${textColor} mb-2`}>
                    {item.value}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista de actividades */}
      <div
        className={`rounded-3xl border-0 shadow-xl ${
          darkMode ? "bg-gray-800/50" : "bg-white"
        }`}
      >
        <div
          className={`px-8 py-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-100"
          } flex items-center justify-between`}
        >
          <div>
            <h3
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Actividades Físicas
            </h3>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              } mt-1`}
            >
              {activities?.length || 0} actividades esta semana
            </p>
          </div>
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
                      : "border-gray-200 bg-white"
                  } hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-blue-900/20" : "bg-blue-100"
                      }`}
                    >
                      <Activity
                        className={`h-5 w-5 ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
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
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
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

  // Componente de Historial Médico
  const MedicalHistorySection = () => {
    const medicalData = medicalHistory
      ? Array.isArray(medicalHistory)
        ? medicalHistory
        : [medicalHistory]
      : [];

    return (
      <div className="space-y-8">
        {/* Header principal */}
        <div
          className={`rounded-3xl border-0 shadow-xl ${
            darkMode ? "bg-gray-800/50" : "bg-white"
          }`}
        >
          <div
            className={`px-8 py-6 border-b ${
              darkMode ? "border-gray-700" : "border-gray-100"
            } flex items-center justify-between`}
          >
            <div>
              <div className="flex items-center space-x-3">
                <div
                  className={`p-3 rounded-xl ${
                    darkMode ? "bg-red-900/20" : "bg-red-100"
                  }`}
                >
                  <Heart
                    className={`h-6 w-6 ${
                      darkMode ? "text-red-400" : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Mi Información Médica
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mt-1`}
                  >
                    {medicalData.length} registros médicos
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Heart,
                  title: "Condiciones",
                  count: medicalData.length,
                  color: "red",
                  items: medicalData.flatMap((d) => d.condiciones || []),
                },
                {
                  icon: AlertCircle,
                  title: "Alergias",
                  count: medicalData.flatMap((d) => d.alergias || []).length,
                  color: "orange",
                  items: medicalData.flatMap((d) => d.alergias || []),
                },
                {
                  icon: Pill,
                  title: "Medicamentos",
                  count: medicalData.flatMap((d) => d.medicamentos || [])
                    .length,
                  color: "blue",
                  items: medicalData.flatMap((d) => d.medicamentos || []),
                },
              ].map((category, index) => {
                const colorClasses = getColorClasses(category.color);
                const textColor = darkMode
                  ? `text-${category.color}-400`
                  : `text-${category.color}-600`;

                return (
                  <div
                    key={index}
                    className={`rounded-2xl border ${colorClasses.border} ${
                      darkMode ? "bg-gray-800/30" : "bg-white"
                    } hover:shadow-lg transition-all duration-200`}
                  >
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div
                          className={`p-3 rounded-xl ${colorClasses.accent}`}
                        >
                          <category.icon className={`h-6 w-6 ${textColor}`} />
                        </div>
                        <div>
                          <h4
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {category.title}
                          </h4>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {category.count} registros
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {category.items.slice(0, 3).map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className={`flex items-center p-3 rounded-lg ${
                              darkMode ? "bg-gray-700/50" : "bg-gray-50"
                            }`}
                          >
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                            <span
                              className={`text-sm ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {item}
                            </span>
                          </div>
                        ))}
                        {category.items.length > 3 && (
                          <div className="text-center pt-2">
                            <span
                              className={`text-sm ${
                                darkMode
                                  ? "text-emerald-400"
                                  : "text-emerald-600"
                              }`}
                            >
                              +{category.items.length - 3} más
                            </span>
                          </div>
                        )}
                      </div>
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      );
    }

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
            className={`text-4xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mb-2`}
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
          className={`flex space-x-1 rounded-2xl p-1 mb-8 ${
            darkMode ? "bg-gray-800/50" : "bg-gray-100"
          }`}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const textColor = darkMode
              ? isActive
                ? "text-white"
                : "text-gray-400 hover:text-white"
              : isActive
              ? "text-white"
              : "text-gray-600 hover:text-gray-900";

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? `bg-${tab.color}-600 ${textColor} shadow-lg scale-105`
                    : `${textColor} hover:bg-white dark:hover:bg-gray-700`
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="transition-all duration-300">{renderContent()}</div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
