import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  use,
} from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Weight,
  BarChart3,
  Flame,
  Clock,
  Calendar,
  Droplets,
  Apple,
  Bed,
  UserCircle,
  Menu,
  Search,
  LayoutDashboard,
  Utensils,
  ClipboardList,
  Dumbbell,
  Lightbulb,
  History,
  Settings,
  UserCog,
  Bell,
  LogOut,
  ChevronUp,
  ChevronDown,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useAuth } from "../context/auth/auth.context";
import Perfil from "../components/profile";
import Recomendaciones from "../components/recommendations";
import NutricionTracker from "../components/nutrition-tracker";
import ActivityTracker from "../components/activity-tracker";
import HistoryMedical from "../components/history-medical";

// Dark Mode Context
const DarkModeContext = createContext();

const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
};

// Enhanced StatsCard Component
const StatsCard = ({
  title,
  value,
  unit,
  iconName,
  color,
  trend,
  darkMode,
}) => {
  const icons = {
    calories: Flame,
    activity: Activity,
    weight: Weight,
    bmi: BarChart3,
  };

  const Icon = icons[iconName] || Activity;

  const colorClasses = {
    red: darkMode ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600",
    blue: darkMode
      ? "bg-blue-900/30 text-blue-400"
      : "bg-blue-100 text-blue-600",
    green: darkMode
      ? "bg-green-900/30 text-green-400"
      : "bg-green-100 text-green-600",
    purple: darkMode
      ? "bg-purple-900/30 text-purple-400"
      : "bg-purple-100 text-purple-600",
  };

  const trendColor =
    trend > 0
      ? darkMode
        ? "text-green-400"
        : "text-green-600"
      : trend < 0
      ? darkMode
        ? "text-red-400"
        : "text-red-600"
      : darkMode
      ? "text-gray-400"
      : "text-gray-500";

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-xl border p-6 hover:shadow-lg transition-all duration-300 hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              darkMode ? "text-gray-400" : "text-gray-600"
            } mb-2`}
          >
            {title}
          </p>
          <div className="flex items-baseline">
            <p
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {unit && (
              <p
                className={`ml-2 text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {unit}
              </p>
            )}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center mt-3 ${trendColor}`}>
              <TrendIcon className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
              <span
                className={`ml-1 text-xs ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                vs. semana anterior
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            colorClasses[color] || colorClasses.green
          } shadow-lg`}
        >
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
};

// Enhanced QuickActions Component
const QuickActions = ({ darkMode }) => {
  const actions = [
    {
      title: "Registrar Comida",
      subtitle: "Añade tu última comida",
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
      icon: "🍽️",
    },
    {
      title: "Log Ejercicio",
      subtitle: "Registra tu actividad",
      color: "bg-gradient-to-r from-blue-500 to-cyan-600",
      icon: "🏃‍♂️",
    },
    {
      title: "Ver Progreso",
      subtitle: "Revisa tus estadísticas",
      color: "bg-gradient-to-r from-purple-500 to-violet-600",
      icon: "📊",
    },
    {
      title: "Recomendación IA",
      subtitle: "Obtén consejos personalizados",
      color: "bg-gradient-to-r from-pink-500 to-rose-600",
      icon: "🤖",
    },
  ];

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-xl border p-6`}
    >
      <div className="flex items-center mb-6">
        <div
          className={`w-8 h-8 ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          } rounded-lg flex items-center justify-center mr-3`}
        >
          ⚡
        </div>
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Acciones Rápidas
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`${action.color} text-white p-4 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="text-left">
              <div className="font-semibold text-sm">{action.title}</div>
              <div className="text-xs opacity-90">{action.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Enhanced NutritionSummary Component
const NutritionSummary = ({ summary, darkMode }) => {
  const nutrients = [
    {
      name: "Calorías",
      current: 0,
      target: 2000,
      unit: "kcal",
      color: "bg-red-500",
      icon: "🔥",
    },
    {
      name: "Proteínas",
      current: 0,
      target: 150,
      unit: "g",
      color: "bg-blue-500",
      icon: "🥩",
    },
    {
      name: "Carbohidratos",
      current: 0,
      target: 250,
      unit: "g",
      color: "bg-yellow-500",
      icon: "🍞",
    },
    {
      name: "Grasas",
      current: 0,
      target: 65,
      unit: "g",
      color: "bg-green-500",
      icon: "🥑",
    },
  ];

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-xl border p-6`}
    >
      <div className="flex items-center mb-6">
        <Apple
          className={`w-6 h-6 mr-3 ${
            darkMode ? "text-green-400" : "text-green-600"
          }`}
        />
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Resumen Nutricional de Hoy
        </h3>
        <span
          className={`ml-auto text-sm ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          sábado, 23 ago
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {nutrients.map((nutrient, index) => {
          const percentage = Math.min(
            (nutrient.current / nutrient.target) * 100,
            100
          );
          const isLow = percentage < 30;

          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{nutrient.icon}</span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    {nutrient.name}
                  </span>
                </div>
                {isLow && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      darkMode
                        ? "bg-orange-900/30 text-orange-400"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    Necesitas más
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span
                    className={`font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {nutrient.current.toLocaleString()}
                  </span>
                  <span
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    de {nutrient.target.toLocaleString()} {nutrient.unit}
                  </span>
                </div>

                <div
                  className={`w-full ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  } rounded-full h-2`}
                >
                  <div
                    className={`${nutrient.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs">
                  <span
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {nutrient.current}
                  </span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {percentage.toFixed(0)}%
                  </span>
                  <span
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {nutrient.target} {nutrient.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced ActivityChart Component
const ActivityChart = ({ weeklyData, darkMode }) => {
  const mockData = [
    { day: "Lun", minutes: 45, calories: 320 },
    { day: "Mar", minutes: 60, calories: 450 },
    { day: "Mié", minutes: 30, calories: 210 },
    { day: "Jue", minutes: 75, calories: 520 },
    { day: "Vie", minutes: 40, calories: 280 },
    { day: "Sáb", minutes: 90, calories: 630 },
    { day: "Dom", minutes: 55, calories: 380 },
  ];

  const maxMinutes = Math.max(...mockData.map((d) => d.minutes));

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-xl border p-6`}
    >
      <div className="flex items-center mb-6">
        <Activity
          className={`w-6 h-6 mr-3 ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        />
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Actividad Semanal
        </h3>
      </div>

      <div className="space-y-4">
        {mockData.map((data, index) => {
          const heightPercentage = (data.minutes / maxMinutes) * 100;
          const isToday = data.day === "Sáb";

          return (
            <div key={index} className="flex items-center space-x-4">
              <div
                className={`w-8 text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {data.day}
              </div>
              <div className="flex-1 flex items-center space-x-3">
                <div
                  className={`flex-1 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  } rounded-full h-3 relative overflow-hidden`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isToday
                        ? "bg-gradient-to-r from-blue-500 to-purple-500"
                        : darkMode
                        ? "bg-gradient-to-r from-blue-600 to-blue-500"
                        : "bg-gradient-to-r from-blue-500 to-blue-400"
                    }`}
                    style={{ width: `${heightPercentage}%` }}
                  ></div>
                </div>
                <div
                  className={`text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } w-12`}
                >
                  {data.minutes}min
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  } w-16`}
                >
                  {data.calories} cal
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced RecommendationsWidget Component
const RecommendationsWidget = ({ recommendations, darkMode }) => {
  const mockRecommendations = [
    {
      type: "nutrition",
      title: "Aumenta tu ingesta de proteína",
      description: "Te faltan 45g de proteína para alcanzar tu meta diaria",
      priority: "high",
      icon: "🥩",
    },
    {
      type: "activity",
      title: "¡Excelente semana de ejercicio!",
      description: "Has superado tu meta semanal en un 12%",
      priority: "success",
      icon: "🏆",
    },
    {
      type: "hydration",
      title: "Mantente hidratado",
      description: "Recuerda beber al menos 2L de agua hoy",
      priority: "medium",
      icon: "💧",
    },
  ];

  const priorityColors = {
    high: darkMode
      ? "border-red-500/50 bg-red-900/20"
      : "border-red-200 bg-red-50",
    success: darkMode
      ? "border-green-500/50 bg-green-900/20"
      : "border-green-200 bg-green-50",
    medium: darkMode
      ? "border-blue-500/50 bg-blue-900/20"
      : "border-blue-200 bg-blue-50",
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-xl border p-6`}
    >
      <div className="flex items-center mb-6">
        <div
          className={`w-8 h-8 ${
            darkMode ? "bg-purple-900/30" : "bg-purple-100"
          } rounded-lg flex items-center justify-center mr-3`}
        >
          🤖
        </div>
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Recomendaciones IA
        </h3>
      </div>

      <div className="space-y-4">
        {mockRecommendations.map((rec, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              priorityColors[rec.priority]
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-lg flex-shrink-0">{rec.icon}</span>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-1`}
                >
                  {rec.title}
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {rec.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ darkMode }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();

  const userInfo = {
    nombre: user?.nombre || "Usuario",
    email: user?.correo || "correo",
    peso: user?.pesoActual || 70,
    altura: user?.altura || 170,
  };

  const dailySummary = { totalCalories: 0 };
  const weeklySummary = { totalMinutes: 0 };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-4xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mb-2`}
          >
            {getGreeting()}, {userInfo.nombre}! 👋
          </h1>
          <div className="flex items-center space-x-4">
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-600"
              } flex items-center`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(currentTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Time Display */}
          <div
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl border px-6 py-4 shadow-lg`}
          >
            <div className="flex items-center space-x-2">
              <Clock
                className={`w-5 h-5 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Hora actual
                </p>
                <p
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {currentTime.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Calorías Hoy"
          value={dailySummary?.totalCalories || 0}
          unit="kcal"
          iconName="calories"
          color="red"
          trend={+5.2}
          darkMode={darkMode}
        />
        <StatsCard
          title="Actividad Semanal"
          value={weeklySummary?.totalMinutes || 0}
          unit="min"
          iconName="activity"
          color="blue"
          trend={+12.8}
          darkMode={darkMode}
        />
        <StatsCard
          title="Peso Actual"
          value={userInfo?.peso || 0}
          unit="kg"
          iconName="weight"
          color="purple"
          trend={-2.1}
          darkMode={darkMode}
        />
        <StatsCard
          title="IMC"
          value={
            userInfo?.pesopesoActual && userInfo?.altura
              ? (
                  userInfo.pesoActual / Math.pow(userInfo.altura / 100, 2)
                ).toFixed(1)
              : 0
          }
          unit=""
          iconName="bmi"
          color="green"
          trend={-0.5}
          darkMode={darkMode}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <NutritionSummary summary={dailySummary} darkMode={darkMode} />
          <ActivityChart weeklyData={weeklySummary} darkMode={darkMode} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <QuickActions darkMode={darkMode} />
          <RecommendationsWidget recommendations={[]} darkMode={darkMode} />
        </div>
      </div>

      {/* Health Tips Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } rounded-xl border p-6`}
        >
          <div className="flex items-center mb-6">
            <div
              className={`w-10 h-10 ${
                darkMode ? "bg-green-900/30" : "bg-green-100"
              } rounded-xl flex items-center justify-center mr-4`}
            >
              💡
            </div>
            <h3
              className={`text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Consejos de Salud
            </h3>
          </div>
          <div className="space-y-4">
            <div
              className={`p-4 ${
                darkMode
                  ? "bg-green-900/20 border-green-500/30"
                  : "bg-green-50 border-green-200"
              } border rounded-xl`}
            >
              <div className="flex items-center mb-2">
                <Droplets
                  className={`w-5 h-5 mr-2 ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    darkMode ? "text-green-400" : "text-green-800"
                  }`}
                >
                  Hidratación
                </span>
              </div>
              <p
                className={`text-sm ${
                  darkMode ? "text-green-300" : "text-green-700"
                }`}
              >
                Bebe al menos 8 vasos de agua al día para mantener tu cuerpo
                hidratado.
              </p>
            </div>
            <div
              className={`p-4 ${
                darkMode
                  ? "bg-blue-900/20 border-blue-500/30"
                  : "bg-blue-50 border-blue-200"
              } border rounded-xl`}
            >
              <div className="flex items-center mb-2">
                <Apple
                  className={`w-5 h-5 mr-2 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    darkMode ? "text-blue-400" : "text-blue-800"
                  }`}
                >
                  Nutrición
                </span>
              </div>
              <p
                className={`text-sm ${
                  darkMode ? "text-blue-300" : "text-blue-700"
                }`}
              >
                Incluye 5 porciones de frutas y verduras en tu dieta diaria.
              </p>
            </div>
            <div
              className={`p-4 ${
                darkMode
                  ? "bg-purple-900/20 border-purple-500/30"
                  : "bg-purple-50 border-purple-200"
              } border rounded-xl`}
            >
              <div className="flex items-center mb-2">
                <Bed
                  className={`w-5 h-5 mr-2 ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    darkMode ? "text-purple-400" : "text-purple-800"
                  }`}
                >
                  Descanso
                </span>
              </div>
              <p
                className={`text-sm ${
                  darkMode ? "text-purple-300" : "text-purple-700"
                }`}
              >
                Duerme entre 7-9 horas por noche para una óptima recuperación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Generic Content Component for other sections
const GenericContent = ({ title, darkMode }) => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow-sm p-6 border ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            {title}
          </h1>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Contenido de {title} - Este es el área principal donde se mostrará
            el contenido específico de esta sección.
          </p>

          {/* Demo content based on section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-green-50"
              } border ${darkMode ? "border-gray-600" : "border-green-200"}`}
            >
              <h3
                className={`font-semibold ${
                  darkMode ? "text-green-400" : "text-green-700"
                }`}
              >
                Funcionalidad 1
              </h3>
              <p
                className={`text-sm mt-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Contenido específico para esta sección.
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-blue-50"
              } border ${darkMode ? "border-gray-600" : "border-blue-200"}`}
            >
              <h3
                className={`font-semibold ${
                  darkMode ? "text-blue-400" : "text-blue-700"
                }`}
              >
                Funcionalidad 2
              </h3>
              <p
                className={`text-sm mt-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Más información relevante.
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-purple-50"
              } border ${darkMode ? "border-gray-600" : "border-purple-200"}`}
            >
              <h3
                className={`font-semibold ${
                  darkMode ? "text-purple-400" : "text-purple-700"
                }`}
              >
                Funcionalidad 3
              </h3>
              <p
                className={`text-sm mt-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Características adicionales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component with Sidebar
const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeContent, setActiveContent] = useState("dashboard");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState({
    nutricion: false,
    actividad: false,
    configuracion: false,
  });
  const { user, logout } = useAuth();

  const userInfo = {
    nombre: user.nombre,
    email: user.email,
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleSubMenu = (menu) => {
    setMenuOpen({
      ...menuOpen,
      [menu]: !menuOpen[menu],
    });
  };

  const logout_ = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: "perfil",
      name: "Perfil",
      icon: <UserCircle className="w-5 h-5" />,
    },
    {
      id: "nutricion",
      name: "Nutrición",
      icon: <Utensils className="w-5 h-5" />,
    },
    {
      id: "actividad",
      name: "Actividad Física",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      id: "recomendaciones",
      name: "Recomendaciones",
      icon: <Lightbulb className="w-5 h-5" />,
    },
    {
      id: "historial",
      name: "Historial Médico",
      icon: <History className="w-5 h-5" />,
    },
  ];

  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      perfil: "Perfil",
      plan_nutricional: "Plan Nutricional",
      seguimiento: "Seguimiento Nutricional",
      rutinas: "Rutinas de Ejercicio",
      progreso: "Progreso Físico",
      recomendaciones: "Recomendaciones",
      historial: "Historial Médico",
      cuenta: "Configuración de Cuenta",
      notificaciones: "Configuración de Notificaciones",
    };
    return titles[activeContent] || "EnutriTrack";
  };

  const renderContent = () => {
    if (activeContent === "dashboard") {
      return <DashboardContent darkMode={darkMode} />;
    }
    if (activeContent === "perfil") {
      return <Perfil darkMode={darkMode} />;
    }
    if (activeContent === "recomendaciones") {
      return <Recomendaciones darkMode={darkMode} />;
    }
    if (activeContent === "nutricion") {
      return <NutricionTracker darkMode={darkMode} />;
    }
    if (activeContent === "actividad") {
      return <ActivityTracker darkMode={darkMode} />;
    }
    if (activeContent === "historial") {
      return <HistoryMedical darkMode={darkMode} />;
    }
    return <GenericContent title={getPageTitle()} darkMode={darkMode} />;
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <div
        className={`min-h-screen flex transition-colors duration-300 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 ${
            darkMode ? "bg-gray-800 shadow-2xl" : "bg-white shadow-xl"
          } transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Header del Sidebar */}
          <div
            className={`flex items-center justify-between h-16 px-6 border-b ${
              darkMode
                ? "border-gray-700 bg-gradient-to-r from-green-900/30 to-green-800/30"
                : "border-gray-200 bg-gradient-to-r from-green-50 to-green-100"
            }`}
          >
            <div className="flex items-center">
              <img
                src="/Logo_ico.png"
                alt="Enutritrack Logo"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <h1
                className={`ml-3 text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                EnutriTrack
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`lg:hidden p-1.5 rounded-md ${
                darkMode
                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                  : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              } transition-colors`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.hasSubMenu) {
                      toggleSubMenu(item.id);
                    } else {
                      setActiveContent(item.id);
                      // Close sidebar on mobile when selecting an item
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }
                  }}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeContent === item.id ||
                    (item.subItems &&
                      item.subItems.some((sub) => sub.id === activeContent))
                      ? darkMode
                        ? "bg-green-900/50 text-green-400 shadow-sm"
                        : "bg-green-100 text-green-700 shadow-sm"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center">
                    <span
                      className={`mr-3 flex-shrink-0 ${
                        activeContent === item.id ||
                        (item.subItems &&
                          item.subItems.some((sub) => sub.id === activeContent))
                          ? darkMode
                            ? "text-green-400"
                            : "text-green-600"
                          : darkMode
                          ? "text-gray-400 group-hover:text-gray-300"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.hasSubMenu && (
                    <span
                      className={`ml-2 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {menuOpen[item.id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </button>

                {/* Submenú */}
                {item.hasSubMenu && menuOpen[item.id] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          setActiveContent(subItem.id);
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          activeContent === subItem.id
                            ? darkMode
                              ? "bg-green-900/30 text-green-400"
                              : "bg-green-50 text-green-700"
                            : darkMode
                            ? "text-gray-400 hover:bg-gray-700/50 hover:text-gray-300"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        }`}
                      >
                        <span className="mr-3 flex-shrink-0">
                          {subItem.icon}
                        </span>
                        <span className="truncate">{subItem.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Sección de Usuario */}
          <div
            className={`p-4 border-t ${
              darkMode
                ? "border-gray-700 bg-gray-800/50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div
              className={`flex items-center mb-3 p-3 ${
                darkMode ? "bg-gray-700" : "bg-white"
              } rounded-xl shadow-sm`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                <span className="text-sm font-semibold text-white">
                  {userInfo?.nombre
                    ? userInfo.nombre.charAt(0).toUpperCase()
                    : "AP"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } truncate`}
                >
                  {userInfo?.nombre || "Usuario"}
                </p>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  } truncate`}
                >
                  {userInfo?.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout_}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 ${
                darkMode ? "hover:bg-red-900/20" : "hover:bg-red-50"
              } rounded-xl transition-all duration-200 group`}
            >
              <LogOut className="w-4 h-4 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <header
            className={`${
              darkMode
                ? "bg-gray-800 shadow-lg border-gray-700"
                : "bg-white shadow-sm border-gray-200"
            } border-b sticky top-0 z-30 transition-colors duration-300`}
          >
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Left side - Menu toggle and logo */}
                <div className="flex items-center">
                  <button
                    onClick={toggleSidebar}
                    className={`lg:hidden p-2 rounded-md ${
                      darkMode
                        ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                        : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    } transition-colors`}
                  >
                    <Menu className="h-6 w-6" />
                  </button>

                  {/* Logo visible when sidebar is closed on desktop */}
                  <div
                    className={`${
                      sidebarOpen ? "hidden" : "flex"
                    } lg:flex items-center ml-4 lg:ml-0`}
                  >
                    <img
                      src="/Logo_ico.png"
                      alt="Enutritrack Logo"
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <h1
                      className={`ml-3 text-xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      EnutriTrack
                    </h1>
                  </div>
                </div>

                {/* Center - Search bar */}
                <div className="hidden md:block flex-1 max-w-lg mx-8">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search
                        className={`h-5 w-5 ${
                          darkMode ? "text-gray-400" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar alimentos, ejercicios..."
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                        darkMode
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Right side - Theme toggle, notifications, and user menu */}
                <div className="flex items-center space-x-2">
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      darkMode
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "bg-gray-800 hover:bg-gray-900 text-white"
                    } shadow-lg hover:shadow-xl`}
                  >
                    {darkMode ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>

                  {/* Notifications */}
                  <button
                    className={`p-2 rounded-full transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                        : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={toggleUserMenu}
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-sm font-semibold">
                          {userInfo.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="hidden sm:block text-left">
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {userInfo.nombre}
                        </p>
                        <p
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          } truncate max-w-32`}
                        >
                          {userInfo.email}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } transition-transform ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {userMenuOpen && (
                      <div
                        className={`absolute right-0 mt-2 w-64 ${
                          darkMode ? "bg-gray-800" : "bg-white"
                        } rounded-lg shadow-lg border ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        } py-2 z-50`}
                      >
                        <div
                          className={`px-4 py-3 border-b ${
                            darkMode ? "border-gray-700" : "border-gray-100"
                          }`}
                        >
                          <p
                            className={`text-sm font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {user.nombre}
                          </p>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            } truncate`}
                          >
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={logout_}
                          className={`flex items-center w-full px-4 py-2 text-sm text-red-600 ${
                            darkMode ? "hover:bg-red-900/20" : "hover:bg-red-50"
                          } transition-colors`}
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main
            className={`flex-1 overflow-auto ${
              darkMode
                ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"
                : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
            } transition-colors duration-300`}
          >
            {renderContent()}
          </main>
        </div>
      </div>
    </DarkModeContext.Provider>
  );
};

export default Dashboard;
