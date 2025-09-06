import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
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
  Lightbulb,
  History,
  LogOut,
  ChevronUp,
  ChevronDown,
  Moon,
  Sun,
  X,
  Bell,
  Target,
  Plus,
  Settings,
  ArrowRight,
  ChevronRight,
  Award,
  Zap,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/auth/auth.context";
import Perfil from "../components/profile";
import Recomendaciones from "../components/recommendations";
import NutricionTracker from "../components/nutrition-tracker";
import ActivityTracker from "../components/activity-tracker";
import HistoryMedical from "../components/history-medical";
// Constants
const THEME = {
  colors: {
    primary: { light: "emerald", dark: "emerald" },
    success: { light: "green", dark: "green" },
    warning: { light: "amber", dark: "amber" },
    error: { light: "red", dark: "red" },
    info: { light: "blue", dark: "blue" },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
};

const NUTRITION_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fats: 65,
  water: 2000,
};

// Theme Context
const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

const formatNumber = (num) => {
  // Verificar si num es undefined, null, o no es un número
  if (num === undefined || num === null || isNaN(num)) {
    return "0"; // o cualquier valor por defecto que prefieras
  }

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
};

const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  return (weight / Math.pow(height / 100, 2)).toFixed(1);
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: "Bajo peso", color: "text-blue-600" };
  if (bmi < 25) return { label: "Normal", color: "text-green-600" };
  if (bmi < 30) return { label: "Sobrepeso", color: "text-amber-600" };
  return { label: "Obesidad", color: "text-red-600" };
};

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
};

// Enhanced Components
const MetricCard = ({
  title,
  value,
  unit,
  icon: IconComponent,
  color,
  trend,
  subtitle,
  onClick,
  loading = false,
}) => {
  const { darkMode } = useTheme();

  const colorVariants = {
    emerald: darkMode
      ? "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30"
      : "from-emerald-50 to-emerald-100 border-emerald-200",
    blue: darkMode
      ? "from-blue-500/20 to-blue-600/20 border-blue-500/30"
      : "from-blue-50 to-blue-100 border-blue-200",
    amber: darkMode
      ? "from-amber-500/20 to-amber-600/20 border-amber-500/30"
      : "from-amber-50 to-amber-100 border-amber-200",
    red: darkMode
      ? "from-red-500/20 to-red-600/20 border-red-500/30"
      : "from-red-50 to-red-100 border-red-200",
    purple: darkMode
      ? "from-purple-500/20 to-purple-600/20 border-purple-500/30"
      : "from-purple-50 to-purple-100 border-purple-200",
  };

  const textColorVariants = {
    emerald: darkMode ? "text-emerald-400" : "text-emerald-700",
    blue: darkMode ? "text-blue-400" : "text-blue-700",
    amber: darkMode ? "text-amber-400" : "text-amber-700",
    red: darkMode ? "text-red-400" : "text-red-700",
    purple: darkMode ? "text-purple-400" : "text-purple-700",
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return darkMode ? "text-emerald-400" : "text-emerald-600";
    if (trend < 0) return darkMode ? "text-red-400" : "text-red-600";
    return darkMode ? "text-gray-400" : "text-gray-500";
  };

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-sm
        ${
          darkMode
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/80 border-gray-200/50"
        }
        ${
          onClick ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""
        }
        transition-all duration-300 hover:shadow-xl
        ${onClick ? "transform-gpu" : ""}
      `}
    >
      {/* Background Pattern */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          colorVariants[color] || colorVariants.emerald
        } opacity-50`}
      />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } truncate`}
              >
                {title}
              </p>
              {loading && (
                <div
                  className={`ml-2 w-3 h-3 rounded-full animate-pulse ${
                    darkMode ? "bg-gray-600" : "bg-gray-400"
                  }`}
                />
              )}
            </div>

            <div className="flex items-baseline mb-1">
              <p
                className={`text-2xl lg:text-3xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                } truncate`}
              >
                {loading ? "..." : formatNumber(value)}
              </p>
              {unit && (
                <span
                  className={`ml-1 text-sm font-medium ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {unit}
                </span>
              )}
            </div>

            {subtitle && (
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                } mb-2`}
              >
                {subtitle}
              </p>
            )}

            {trend !== undefined && !loading && (
              <div className={`flex items-center ${getTrendColor(trend)}`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">{Math.abs(trend)}%</span>
                <span
                  className={`ml-1 text-xs ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  vs. anterior
                </span>
              </div>
            )}
          </div>

          <div
            className={`ml-4 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              textColorVariants[color] || textColorVariants.emerald
            } bg-white/10 backdrop-blur-sm border border-white/20`}
          >
            <IconComponent className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({
  title,
  subtitle,
  icon,
  gradient,
  onClick,
  badge,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-4 text-left
        ${gradient} text-white
        hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-300 hover:shadow-xl
        transform-gpu group
      `}
    >
      {badge && (
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-xs font-medium">{badge}</span>
        </div>
      )}

      <div className="flex items-center mb-3">
        <div className="text-2xl mr-3 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
      </div>

      <div>
        <div className="font-semibold text-sm mb-1">{title}</div>
        <div className="text-xs opacity-90 leading-relaxed">{subtitle}</div>
      </div>
    </button>
  );
};

const NutritionProgressBar = ({ name, current, target, unit, color, icon }) => {
  const { darkMode } = useTheme();
  const percentage = Math.min((current / target) * 100, 100);
  const isLow = percentage < 30;
  const isComplete = percentage >= 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg mr-3">{icon}</span>
          <span
            className={`font-medium ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {name}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isComplete && (
            <Award
              className={`w-4 h-4 ${
                darkMode ? "text-green-400" : "text-green-600"
              }`}
            />
          )}
          {isLow && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                darkMode
                  ? "bg-amber-900/30 text-amber-400"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              Necesitas más
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span
            className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {formatNumber(current)}
          </span>
          <span className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            de {formatNumber(target)} {unit}
          </span>
        </div>

        <div
          className={`w-full ${
            darkMode ? "bg-gray-700" : "bg-gray-200"
          } rounded-full h-3 overflow-hidden`}
        >
          <div
            className={`h-3 rounded-full transition-all duration-700 ${color} ${
              isComplete ? "animate-pulse" : ""
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs">
          <span className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            0
          </span>
          <span
            className={`font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {percentage.toFixed(0)}%
          </span>
          <span className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {formatNumber(target)} {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

const ActivityChart = ({ data }) => {
  const { darkMode } = useTheme();
  const maxMinutes = Math.max(...data.map((d) => d.minutes));

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const heightPercentage = (item.minutes / maxMinutes) * 100;
        const isToday = item.isToday;

        return (
          <div key={index} className="flex items-center space-x-4 group">
            <div
              className={`w-10 text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {item.day}
            </div>

            <div className="flex-1 flex items-center space-x-3">
              <div
                className={`flex-1 ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                } rounded-full h-4 relative overflow-hidden`}
              >
                <div
                  className={`h-4 rounded-full transition-all duration-700 ${
                    isToday
                      ? "bg-gradient-to-r from-emerald-500 to-blue-500"
                      : darkMode
                      ? "bg-gradient-to-r from-blue-600 to-blue-500"
                      : "bg-gradient-to-r from-blue-500 to-blue-400"
                  } group-hover:shadow-lg`}
                  style={{ width: `${heightPercentage}%` }}
                />
              </div>

              <div
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                } w-16 text-right`}
              >
                {item.minutes}min
              </div>

              <div
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                } w-20 text-right`}
              >
                {formatNumber(item.calories)} cal
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RecommendationCard = ({
  type,
  title,
  description,
  priority,
  icon,
  actionText = "Ver más",
}) => {
  const { darkMode } = useTheme();

  const priorityStyles = {
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
      className={`p-4 rounded-xl border-l-4 ${priorityStyles[priority]} hover:shadow-md transition-all duration-300 group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <h4
              className={`font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              } mb-1`}
            >
              {title}
            </h4>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              } leading-relaxed`}
            >
              {description}
            </p>
          </div>
        </div>

        <button
          className={`ml-3 text-xs px-3 py-1 rounded-full transition-colors ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          }`}
        >
          {actionText}
        </button>
      </div>
    </div>
  );
};

// Main Components
const DashboardHeader = ({ user }) => {
  const { darkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div>
        <h1
          className={`text-3xl lg:text-4xl font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          } mb-2`}
        >
          {getTimeBasedGreeting()}, {user.nombre.split(" ")[0]}
        </h1>
        <div className="flex items-center space-x-6">
          <p
            className={`${
              darkMode ? "text-gray-400" : "text-gray-600"
            } flex items-center`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(currentTime)}
          </p>
          <p
            className={`${
              darkMode ? "text-gray-400" : "text-gray-600"
            } flex items-center`}
          >
            <Target className="w-4 h-4 mr-2" />
            {user.objetivo}
          </p>
        </div>
      </div>

      <div
        className={`${
          darkMode
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/80 border-gray-200/50"
        } backdrop-blur-sm rounded-2xl border px-6 py-4 shadow-lg`}
      >
        <div className="flex items-center space-x-4">
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
  );
};

const DashboardStats = ({ user }) => {
  const { darkMode } = useTheme();
  const bmi = calculateBMI(user.pesoActual, user.altura);
  const bmiCategory = getBMICategory(bmi);

  const stats = useMemo(
    () => [
      {
        title: "Calorías Consumidas",
        value: 1250,
        unit: "kcal",
        icon: Flame,
        color: "red",
        trend: +5.2,
        subtitle: "Meta: 2000 kcal",
      },
      {
        title: "Actividad Semanal",
        value: 285,
        unit: "min",
        icon: Activity,
        color: "blue",
        trend: +12.8,
        subtitle: "Meta: 300 min",
      },
      {
        title: "Peso Actual",
        value: user.pesoActual,
        unit: "kg",
        icon: Weight,
        color: "purple",
        trend: -2.1,
        subtitle: "Última semana",
      },
      {
        title: "Índice de Masa Corporal",
        value: bmi,
        unit: "",
        icon: BarChart3,
        color: "emerald",
        trend: -0.5,
        subtitle: bmiCategory.label,
      },
    ],
    [user.pesoActual, bmi, bmiCategory]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <MetricCard key={index} {...stat} />
      ))}
    </div>
  );
};

const QuickActionsSection = () => {
  const { darkMode } = useTheme();

  const actions = [
    {
      title: "Registrar Comida",
      subtitle: "Añade tu última comida y calcula las calorías automáticamente",
      gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      icon: "🍽️",
      badge: "Nuevo",
    },
    {
      title: "Log Ejercicio",
      subtitle: "Registra tu actividad física y monitorea tu progreso",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: "🏃‍♂️",
    },
    {
      title: "Ver Progreso",
      subtitle: "Analiza tus estadísticas y tendencias de salud",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      icon: "📊",
    },
    {
      title: "Consultar IA",
      subtitle: "Obtén recomendaciones personalizadas basadas en tus datos",
      gradient: "bg-gradient-to-br from-pink-500 to-rose-600",
      icon: "🤖",
    },
  ];

  return (
    <div
      className={`${
        darkMode
          ? "bg-gray-800/80 border-gray-700/50"
          : "bg-white/80 border-gray-200/50"
      } backdrop-blur-sm rounded-2xl border p-6`}
    >
      <div className="flex items-center mb-6">
        <div
          className={`w-10 h-10 ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          } rounded-xl flex items-center justify-center mr-4`}
        >
          <Zap
            className={`w-5 h-5 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          />
        </div>
        <h3
          className={`text-xl font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Acciones Rápidas
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <QuickActionCard
            key={index}
            {...action}
            onClick={() => console.log(`Action: ${action.title}`)}
          />
        ))}
      </div>
    </div>
  );
};

const NutritionOverview = () => {
  const { darkMode } = useTheme();

  const nutritionData = [
    {
      name: "Calorías",
      current: 1250,
      target: NUTRITION_TARGETS.calories,
      unit: "kcal",
      color: "bg-gradient-to-r from-red-500 to-red-600",
      icon: "🔥",
    },
    {
      name: "Proteínas",
      current: 85,
      target: NUTRITION_TARGETS.protein,
      unit: "g",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      icon: "🥩",
    },
    {
      name: "Carbohidratos",
      current: 180,
      target: NUTRITION_TARGETS.carbs,
      unit: "g",
      color: "bg-gradient-to-r from-amber-500 to-amber-600",
      icon: "🍞",
    },
    {
      name: "Grasas",
      current: 45,
      target: NUTRITION_TARGETS.fats,
      unit: "g",
      color: "bg-gradient-to-r from-green-500 to-green-600",
      icon: "🥑",
    },
  ];

  return (
    <div
      className={`${
        darkMode
          ? "bg-gray-800/80 border-gray-700/50"
          : "bg-white/80 border-gray-200/50"
      } backdrop-blur-sm rounded-2xl border p-6`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Apple
            className={`w-6 h-6 mr-3 ${
              darkMode ? "text-emerald-400" : "text-emerald-600"
            }`}
          />
          <h3
            className={`text-xl font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Resumen Nutricional
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Hoy
          </span>
          <div
            className={`w-2 h-2 rounded-full ${
              darkMode ? "bg-emerald-400" : "bg-emerald-500"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {nutritionData.map((nutrient, index) => (
          <NutritionProgressBar key={index} {...nutrient} />
        ))}
      </div>
    </div>
  );
};

const ActivityOverview = () => {
  const { darkMode } = useTheme();

  const weeklyData = [
    { day: "Lun", minutes: 45, calories: 320, isToday: false },
    { day: "Mar", minutes: 60, calories: 450, isToday: false },
    { day: "Mié", minutes: 30, calories: 210, isToday: false },
    { day: "Jue", minutes: 75, calories: 520, isToday: false },
    { day: "Vie", minutes: 40, calories: 280, isToday: false },
    { day: "Sáb", minutes: 90, calories: 630, isToday: true },
    { day: "Dom", minutes: 0, calories: 0, isToday: false },
  ];

  const totalWeeklyMinutes = weeklyData.reduce(
    (sum, day) => sum + day.minutes,
    0
  );
  const averageDaily = Math.round(totalWeeklyMinutes / 7);

  return (
    <div
      className={`${
        darkMode
          ? "bg-gray-800/80 border-gray-700/50"
          : "bg-white/80 border-gray-200/50"
      } backdrop-blur-sm rounded-2xl border p-6`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Activity
            className={`w-6 h-6 mr-3 ${
              darkMode ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <h3
            className={`text-xl font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Actividad Semanal
          </h3>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm ${
            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
          }`}
        >
          {averageDaily} min/día promedio
        </div>
      </div>

      <ActivityChart data={weeklyData} />
    </div>
  );
};

const RecommendationsSection = () => {
  const { darkMode } = useTheme();

  const recommendations = [
    {
      type: "nutrition",
      title: "Aumenta tu ingesta de proteína",
      description:
        "Te faltan 65g de proteína para alcanzar tu meta diaria. Considera agregar pollo, pescado o legumbres.",
      priority: "high",
      icon: "🥩",
    },
    {
      type: "activity",
      title: "Excelente progreso esta semana",
      description:
        "Has superado tu meta semanal de ejercicio en un 12%. ¡Sigue así!",
      priority: "success",
      icon: "🏆",
    },
    {
      type: "hydration",
      title: "Mantente hidratado",
      description:
        "Recuerda beber al menos 2L de agua hoy. Llevas 60% de tu meta diaria.",
      priority: "medium",
      icon: "💧",
    },
  ];

  return (
    <div
      className={`${
        darkMode
          ? "bg-gray-800/80 border-gray-700/50"
          : "bg-white/80 border-gray-200/50"
      } backdrop-blur-sm rounded-2xl border p-6`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 ${
              darkMode ? "bg-purple-900/30" : "bg-purple-100"
            } rounded-xl flex items-center justify-center mr-4`}
          >
            <Lightbulb
              className={`w-5 h-5 ${
                darkMode ? "text-purple-400" : "text-purple-600"
              }`}
            />
          </div>
          <h3
            className={`text-xl font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Recomendaciones IA
          </h3>
        </div>
        <button
          className={`text-sm px-4 py-2 rounded-full transition-colors ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          }`}
        >
          Ver todas
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <RecommendationCard key={index} {...rec} />
        ))}
      </div>
    </div>
  );
};

const HealthTipsSection = () => {
  const { darkMode } = useTheme();

  const tips = [
    {
      category: "Hidratación",
      tip: "Bebe un vaso de agua al despertar para activar tu metabolismo",
      icon: Droplets,
      color: "emerald",
    },
    {
      category: "Nutrición",
      tip: "Incluye proteína en cada comida para mantener la saciedad",
      icon: Apple,
      color: "blue",
    },
    {
      category: "Descanso",
      tip: "Mantén un horario regular de sueño para optimizar la recuperación",
      icon: Bed,
      color: "purple",
    },
  ];

  return (
    <div
      className={`${
        darkMode
          ? "bg-gray-800/80 border-gray-700/50"
          : "bg-white/80 border-gray-200/50"
      } backdrop-blur-sm rounded-2xl border p-6`}
    >
      <div className="flex items-center mb-6">
        <div
          className={`w-10 h-10 ${
            darkMode ? "bg-green-900/30" : "bg-green-100"
          } rounded-xl flex items-center justify-center mr-4`}
        >
          <BookOpen
            className={`w-5 h-5 ${
              darkMode ? "text-green-400" : "text-green-600"
            }`}
          />
        </div>
        <h3
          className={`text-xl font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Tips de Salud
        </h3>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => {
          const colorStyles = {
            emerald: darkMode
              ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-400"
              : "bg-emerald-50 border-emerald-200 text-emerald-700",
            blue: darkMode
              ? "bg-blue-900/20 border-blue-500/30 text-blue-400"
              : "bg-blue-50 border-blue-200 text-blue-700",
            purple: darkMode
              ? "bg-purple-900/20 border-purple-500/30 text-purple-400"
              : "bg-purple-50 border-purple-200 text-purple-700",
          };

          return (
            <div
              key={index}
              className={`p-4 ${
                colorStyles[tip.color]
              } border rounded-xl hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-center mb-2">
                <tip.icon className="w-5 h-5 mr-3" />
                <span className="font-semibold">{tip.category}</span>
              </div>
              <p
                className={`text-sm leading-relaxed ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {tip.tip}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Sidebar Navigation
const Sidebar = ({
  isOpen,
  onClose,
  activeContent,
  setActiveContent,
  user,
  onLogout,
}) => {
  const { darkMode } = useTheme();

  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "perfil", name: "Perfil", icon: UserCircle },
    { id: "nutricion", name: "Nutrición", icon: Utensils },
    { id: "actividad", name: "Actividad Física", icon: Activity },
    { id: "recomendaciones", name: "Recomendaciones", icon: Lightbulb },
    { id: "historial", name: "Historial Médico", icon: History },
  ];

  const handleNavigation = useCallback(
    (itemId) => {
      setActiveContent(itemId);
      if (window.innerWidth < 1024) {
        onClose();
      }
    },
    [setActiveContent, onClose]
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-0
          ${
            darkMode
              ? "bg-gray-900/95 border-gray-700/50"
              : "bg-white/95 border-gray-200/50"
          }
          backdrop-blur-xl border-r shadow-2xl
        `}
      >
        {/* Header */}
        <div
          className={`
          flex items-center justify-between h-20 px-6 border-b
          ${
            darkMode
              ? "border-gray-700/50 bg-gradient-to-r from-emerald-900/30 to-emerald-800/20"
              : "border-gray-200/50 bg-gradient-to-r from-emerald-50 to-emerald-100/50"
          }
        `}
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
            <div className="ml-3">
              <h1
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                EnutriTrack
              </h1>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Tu asistente de salud preventiva
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              darkMode
                ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = activeContent === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl
                  transition-all duration-200 relative overflow-hidden
                  ${
                    isActive
                      ? darkMode
                        ? "bg-emerald-500/20 text-emerald-400 shadow-lg border border-emerald-500/30"
                        : "bg-emerald-100 text-emerald-700 shadow-md border border-emerald-200"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                {isActive && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      darkMode ? "bg-emerald-400" : "bg-emerald-500"
                    } rounded-r-full`}
                  />
                )}
                <IconComponent
                  className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div
          className={`p-4 border-t ${
            darkMode
              ? "border-gray-700/50 bg-gray-800/30"
              : "border-gray-200/50 bg-gray-50/30"
          }`}
        >
          <div
            className={`flex items-center p-4 ${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-sm mb-4 border ${
              darkMode ? "border-gray-700/50" : "border-gray-200/50"
            }`}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mr-3 shadow-md">
              <span className="text-white font-semibold">
                {user.nombre.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                } truncate`}
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
          </div>

          <button
            onClick={onLogout}
            className={`
              w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl
              transition-all duration-200 group
              ${
                darkMode
                  ? "text-red-400 hover:bg-red-900/20"
                  : "text-red-600 hover:bg-red-50"
              }
            `}
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// Header Component
const Header = ({ onToggleSidebar, user, onLogout }) => {
  const { darkMode, setDarkMode } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header
      className={`
      ${
        darkMode
          ? "bg-gray-900/80 border-gray-700/50"
          : "bg-white/80 border-gray-200/50"
      }
      backdrop-blur-xl border-b sticky top-0 z-30 transition-all duration-300
    `}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left */}
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                darkMode
                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                  : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`
                p-2.5 rounded-xl transition-all duration-300 shadow-lg
                ${
                  darkMode
                    ? "bg-amber-500 hover:bg-amber-400 text-white hover:shadow-amber-500/25"
                    : "bg-gray-800 hover:bg-gray-700 text-white hover:shadow-gray-800/25"
                }
                hover:shadow-xl hover:scale-105
              `}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center space-x-3 p-2 rounded-xl transition-colors ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-semibold">
                    {user.nombre.charAt(0)}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.nombre.split(" ")[0]}
                  </p>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Premium
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  } ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                />
              </button>

              {userMenuOpen && (
                <div
                  className={`
                  absolute right-0 mt-2 w-64 rounded-xl shadow-lg border py-2 z-50
                  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }
                  backdrop-blur-xl
                `}
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
                      {user?.nombre || "Usuario"}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {user?.correo || user?.email || "usuario@ejemplo.com"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setUserMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                      darkMode
                        ? "text-red-400 hover:bg-red-900/20"
                        : "text-red-600 hover:bg-red-50"
                    }`}
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
  );
};

// Main Dashboard Content
const DashboardContent = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-8">
      <DashboardHeader user={user} />
      <DashboardStats user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <NutritionOverview />
          <ActivityOverview />
        </div>

        <div className="space-y-8">
          <QuickActionsSection />
          <RecommendationsSection />
        </div>
      </div>

      <HealthTipsSection />
    </div>
  );
};

// Generic Content for other sections
const GenericContent = ({ title }) => {
  const { darkMode } = useTheme();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div
          className={`${
            darkMode
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-2xl border p-8`}
        >
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mb-6`}
          >
            {title}
          </h1>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            } mb-8`}
          >
            Esta sección está en desarrollo. Próximamente tendrás acceso a todas
            las funcionalidades de {title}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`p-6 rounded-xl border ${
                  darkMode
                    ? "bg-gray-700/50 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h3
                  className={`font-semibold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Función {item}
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Descripción de la funcionalidad {item} que estará disponible
                  próximamente.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeContent, setActiveContent] = useState("dashboard");
  const { user, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

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
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <div
        className={`min-h-screen flex transition-all duration-300 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeContent={activeContent}
          setActiveContent={setActiveContent}
          user={user}
          onLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            user={user}
            onLogout={handleLogout}
          />

          <main
            className={`
            flex-1 overflow-auto transition-all duration-300
            ${
              darkMode
                ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"
                : "bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/30"
            }
          `}
          >
            {renderContent()}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default Dashboard;
