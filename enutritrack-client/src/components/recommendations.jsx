import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth/auth.context";
import { useRecommendations } from "../context/recommendation/recommendation.context";
import {
  Heart,
  Activity,
  Apple,
  Stethoscope,
  Calendar,
  User,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Eye,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Target,
  Zap,
  ChevronRight,
  BookOpen,
  Award,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Dumbbell,
  Pill,
  Utensils,
  Info,
} from "lucide-react";

// Tipos basados en el modelo
const RecommendationType = {
  NUTRITION: "nutrition",
  EXERCISE: "exercise",
  MEDICAL: "medical",
  GENERAL: "general",
};

const RecommendationApp = ({ darkMode = false, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const {
    recommendations,
    getRecommendationsByUser,
    createRecommendation,
    deleteRecommendation,
    quickNutritionRecommendation,
    quickExerciseRecommendation,
    quickMedicalRecommendation,
  } = useRecommendations();

  const [selectedType, setSelectedType] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showForm, setShowForm] = useState(null);
  const [formData, setFormData] = useState({});

  // Cargar recomendaciones al montar el componente
  useEffect(() => {
    const loadRecommendations = async () => {
      if (user && user.id) {
        try {
          setLoading(true);
          setError(null);
          await getRecommendationsByUser(user.id);
        } catch (error) {
          console.error("Error loading recommendations:", error);
          setError("Error al cargar las recomendaciones");
          setDebugInfo({
            message: error.message,
            userId: user.id,
            timestamp: new Date().toISOString(),
          });
        } finally {
          setLoading(false);
        }
      }
    };

    if (user && user.id && !loading) {
      loadRecommendations();
    }
  }, [user?.id]);

  const getTypeIcon = (type) => {
    switch (type) {
      case RecommendationType.NUTRITION:
        return <Apple className="w-5 h-5" />;
      case RecommendationType.EXERCISE:
        return <Activity className="w-5 h-5" />;
      case RecommendationType.MEDICAL:
        return <Stethoscope className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case RecommendationType.NUTRITION:
        return darkMode
          ? "bg-green-900/30 text-green-400 border-green-500/30"
          : "bg-green-100 text-green-800 border-green-200";
      case RecommendationType.EXERCISE:
        return darkMode
          ? "bg-blue-900/30 text-blue-400 border-blue-500/30"
          : "bg-blue-100 text-blue-800 border-blue-200";
      case RecommendationType.MEDICAL:
        return darkMode
          ? "bg-red-900/30 text-red-400 border-red-500/30"
          : "bg-red-100 text-red-800 border-red-200";
      default:
        return darkMode
          ? "bg-purple-900/30 text-purple-400 border-purple-500/30"
          : "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case RecommendationType.NUTRITION:
        return "Nutrición";
      case RecommendationType.EXERCISE:
        return "Ejercicio";
      case RecommendationType.MEDICAL:
        return "Médico";
      default:
        return "General";
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  const filteredRecommendations = recommendations.filter(
    (rec) =>
      (selectedType === "all" || rec.tipo === selectedType) &&
      (rec.contenido.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTypeName(rec.tipo).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Reemplaza la función generateRecommendation en tu componente

  const generateRecommendation = async (tipo, datosEntrada = {}) => {
    if (!user || !user.id) {
      setError("Usuario no autenticado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let newRecommendation;

      // Log para debug
      console.log("Generando recomendación con datos:", {
        tipo,
        datosEntrada,
        userId: user.id,
      });

      switch (tipo) {
        case RecommendationType.NUTRITION:
          // Pasar datosEntrada como segundo parámetro
          newRecommendation = await quickNutritionRecommendation(
            user.id,
            datosEntrada // Asegúrate de que esto se pase
          );
          break;
        case RecommendationType.EXERCISE:
          newRecommendation = await quickExerciseRecommendation(
            user.id,
            datosEntrada // Asegúrate de que esto se pase
          );
          break;
        case RecommendationType.MEDICAL:
          newRecommendation = await quickMedicalRecommendation(
            user.id,
            datosEntrada // Asegúrate de que esto se pase
          );
          break;
        default:
          const recommendationData = {
            usuarioId: user.id,
            tipo,
            datosEntrada,
          };
          newRecommendation = await createRecommendation(recommendationData);
      }

      console.log("Recomendación generada:", newRecommendation);

      // Limpiar el formulario después de generar
      setFormData({});
    } catch (error) {
      console.error("Error generating recommendation:", error);
      setError(`Error al generar la recomendación: ${error.message}`);
    } finally {
      setLoading(false);
      setShowForm(null);
    }
  };

    // ... resto del código del componente permanece igual

  const deactivateRecommendation = async (id) => {
    try {
      await deleteRecommendation(id);
      if (user && user.id) {
        await getRecommendationsByUser(user.id);
      }
    } catch (error) {
      console.error("Error deactivating recommendation:", error);
      setError("Error al desactivar la recomendación");
    }
  };

  const getCardGradient = (type) => {
    switch (type) {
      case RecommendationType.NUTRITION:
        return darkMode
          ? "from-green-900/20 to-green-800/10"
          : "from-green-50 to-green-100";
      case RecommendationType.EXERCISE:
        return darkMode
          ? "from-blue-900/20 to-blue-800/10"
          : "from-blue-50 to-blue-100";
      case RecommendationType.MEDICAL:
        return darkMode
          ? "from-red-900/20 to-red-800/10"
          : "from-red-50 to-red-100";
      default:
        return darkMode
          ? "from-purple-900/20 to-purple-800/10"
          : "from-purple-50 to-purple-100";
    }
  };

  // Input Forms for datosEntrada
  const DatosEntradaForm = ({ tipo, onGenerate, onCancel }) => {
    const handleSubmit = (e) => {
      e.preventDefault();
          console.log("Enviando datos del formulario:", {
            tipo,
            formData,
          });
      onGenerate(tipo, formData);
    };

    const handleChange = (field, value) => {
      setFormData({ ...formData, [field]: value });
    };

    const handleArrayChange = (field, item) => {
      const current = formData[field] || [];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      handleChange(field, updated);
    };

    const renderExerciseForm = () => (
      <div className="space-y-6">
        <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Proporciona información sobre tu equipamiento, lesiones y objetivos
            para una recomendación de ejercicio personalizada.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Equipo disponible
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              "pesas",
              "bicicleta estática",
              "bandas de resistencia",
              "máquinas de gimnasio",
              "ninguno",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleArrayChange("equipo_disponible", item)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (formData.equipo_disponible || []).includes(item)
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Lesiones o limitaciones
          </label>
          <input
            type="text"
            placeholder="Ej: rodilla derecha, espalda baja..."
            value={formData.lesiones || ""}
            onChange={(e) =>
              handleChange(
                "lesiones",
                e.target.value.split(",").map((item) => item.trim())
              )
            }
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Objetivo principal
          </label>
          <select
            value={formData.objetivo || ""}
            onChange={(e) => handleChange("objetivo", e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar objetivo</option>
            <option value="ganar masa muscular">Ganar masa muscular</option>
            <option value="perder peso">Perder peso</option>
            <option value="mejorar resistencia">Mejorar resistencia</option>
            <option value="mejorar flexibilidad">Mejorar flexibilidad</option>
            <option value="rehabilitación">Rehabilitación</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Días disponibles por semana
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="7"
              value={formData.dias_semana || 3}
              onChange={(e) =>
                handleChange("dias_semana", parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 min-w-[30px] text-center">
              {formData.dias_semana || 3}
            </span>
          </div>
        </div>
      </div>
    );

    const renderMedicalForm = () => (
      <div className="space-y-6">
        <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <Info className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Esta información nos ayuda a proporcionar recomendaciones médicas
            más precisas y seguras para ti.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Síntomas actuales
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              "fatiga",
              "dolores de cabeza",
              "mareos",
              "náuseas",
              "dolor articular",
              "insomnio",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleArrayChange("sintomas_actuales", item)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (formData.sintomas_actuales || []).includes(item)
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Otros síntomas (separados por coma)"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent mt-2"
            onChange={(e) => handleChange("otros_sintomas", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Preocupaciones principales
          </label>
          <textarea
            placeholder="Ej: control de diabetes, presión arterial, colesterol..."
            value={formData.preocupaciones || ""}
            onChange={(e) => handleChange("preocupaciones", e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Medicamentos actuales
          </label>
          <input
            type="text"
            placeholder="Ej: metformina 500mg, losartán 50mg..."
            value={formData.medicamentos || ""}
            onChange={(e) =>
              handleChange(
                "medicamentos",
                e.target.value.split(",").map((item) => item.trim())
              )
            }
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Alergias conocidas
          </label>
          <input
            type="text"
            placeholder="Ej: penicilina, mariscos, polvo..."
            value={formData.alergias || ""}
            onChange={(e) =>
              handleChange(
                "alergias",
                e.target.value.split(",").map((item) => item.trim())
              )
            }
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>
    );

    const renderNutritionForm = () => (
      <div className="space-y-6">
        <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <Info className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Comparte tus preferencias y restricciones alimenticias para recibir
            un plan nutricional personalizado.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Preferencias alimenticias
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              "vegetariano",
              "vegano",
              "sin gluten",
              "sin lactosa",
              "bajo en carbohidratos",
              "alto en proteínas",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleArrayChange("preferencias", item)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  (formData.preferencias || []).includes(item)
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Alergias alimentarias
          </label>
          <input
            type="text"
            placeholder="Ej: nueces, mariscos, lácteos..."
            value={formData.alergias_alimentarias || ""}
            onChange={(e) =>
              handleChange(
                "alergias_alimentarias",
                e.target.value.split(",").map((item) => item.trim())
              )
            }
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Objetivo nutricional
          </label>
          <select
            value={formData.objetivo || ""}
            onChange={(e) => handleChange("objetivo", e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Seleccionar objetivo</option>
            <option value="perder peso">Perder peso</option>
            <option value="ganar masa muscular">Ganar masa muscular</option>
            <option value="mejorar energía">Mejorar energía</option>
            <option value="controlar condición médica">
              Controlar condición médica
            </option>
            <option value="mantener peso">Mantener peso</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Comidas que te gustan
          </label>
          <textarea
            placeholder="Ej: pollo a la plancha, ensaladas, frutas..."
            value={formData.comidas_gustan || ""}
            onChange={(e) => handleChange("comidas_gustan", e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Comidas que no te gustan
          </label>
          <textarea
            placeholder="Ej: pescado, brócoli, alimentos picantes..."
            value={formData.comidas_no_gustan || ""}
            onChange={(e) => handleChange("comidas_no_gustan", e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="2"
          />
        </div>
      </div>
    );

    const getFormIcon = () => {
      switch (tipo) {
        case RecommendationType.EXERCISE:
          return <Dumbbell className="w-6 h-6 text-blue-500" />;
        case RecommendationType.MEDICAL:
          return <Pill className="w-6 h-6 text-red-500" />;
        case RecommendationType.NUTRITION:
          return <Utensils className="w-6 h-6 text-green-500" />;
        default:
          return <Info className="w-6 h-6 text-purple-500" />;
      }
    };

    const getFormColor = () => {
      switch (tipo) {
        case RecommendationType.EXERCISE:
          return "border-blue-200 dark:border-blue-800";
        case RecommendationType.MEDICAL:
          return "border-red-200 dark:border-red-800";
        case RecommendationType.NUTRITION:
          return "border-green-200 dark:border-green-800";
        default:
          return "border-purple-200 dark:border-purple-800";
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div
          className={`bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 ${getFormColor()}`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {getFormIcon()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Personalizar {getTypeName(tipo)}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completa la información para una recomendación más precisa
                  </p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {tipo === RecommendationType.EXERCISE && renderExerciseForm()}
            {tipo === RecommendationType.MEDICAL && renderMedicalForm()}
            {tipo === RecommendationType.NUTRITION && renderNutritionForm()}

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Generar Recomendación
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Quick Actions Component
  const QuickActions = () => {
    const actions = [
      {
        title: "Nutrición",
        subtitle: "Plan alimenticio",
        gradient: "bg-gradient-to-r from-green-500 to-emerald-600",
        icon: Apple,
        type: RecommendationType.NUTRITION,
      },
      {
        title: "Ejercicio",
        subtitle: "Rutina de actividad",
        gradient: "bg-gradient-to-r from-blue-500 to-cyan-600",
        icon: Activity,
        type: RecommendationType.EXERCISE,
      },
      {
        title: "Médico",
        subtitle: "Consejos de salud",
        gradient: "bg-gradient-to-r from-red-500 to-pink-600",
        icon: Stethoscope,
        type: RecommendationType.MEDICAL,
      },
      {
        title: "General",
        subtitle: "Bienestar integral",
        gradient: "bg-gradient-to-r from-purple-500 to-violet-600",
        icon: Heart,
        type: RecommendationType.GENERAL,
      },
    ];

    const handleGenerate = (tipo, formData) => {
      generateRecommendation(tipo, formData);
    };

    return (
      <>
        <div
          className={`${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } rounded-2xl border p-6 hover:shadow-xl transition-all duration-300`}
        >
          <div className="flex items-center mb-6">
            <div
              className={`w-10 h-10 ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              } rounded-xl flex items-center justify-center mr-3 shadow-md`}
            >
              <Zap
                className={`w-6 h-6 ${
                  darkMode ? "text-yellow-400" : "text-yellow-600"
                }`}
              />
            </div>
            <h3
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Generar Recomendaciones
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  if (action.type === RecommendationType.GENERAL) {
                    generateRecommendation(action.type, {});
                  } else {
                    setShowForm(action.type);
                    setFormData({});
                  }
                }}
                disabled={loading}
                className={`${action.gradient} text-white p-5 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-sm mb-1">{action.title}</div>
                  <div className="text-xs opacity-90">{action.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <DatosEntradaForm
            tipo={showForm}
            onGenerate={handleGenerate}
            onCancel={() => setShowForm(null)}
          />
        )}
      </>
    );
  };

  // Stats Cards Component
  const StatsCard = ({ title, value, unit, icon, color, trend }) => {
    const Icon = icon;
    const colorClasses = {
      green: darkMode
        ? "bg-green-900/30 text-green-400"
        : "bg-green-100 text-green-600",
      blue: darkMode
        ? "bg-blue-900/30 text-blue-400"
        : "bg-blue-100 text-blue-600",
      red: darkMode ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600",
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

    const TrendIcon =
      trend > 0 ? TrendingUp : trend < 0 ? AlertTriangle : BarChart3;

    return (
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-2xl border p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
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
                  vs. anterior
                </span>
              </div>
            )}
          </div>
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              colorClasses[color] || colorClasses.green
            } shadow-lg group-hover:scale-110 transition-transform`}
          >
            <Icon className="w-7 h-7" />
          </div>
        </div>
      </div>
    );
  };

  // User Profile Menu
  const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="text-right hidden md:block">
            <p
              className={`font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {user?.nombre || "Usuario"}
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {user?.edad ? `${user.edad} años` : ""} • {user?.genero || ""}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
        </button>

        {isOpen && (
          <div
            className={`absolute right-0 top-14 w-48 p-2 rounded-xl shadow-2xl ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border z-50`}
          >
            <button
              onClick={toggleDarkMode}
              className="w-full text-left p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>{darkMode ? "Modo Claro" : "Modo Oscuro"}</span>
            </button>
            <button
              onClick={logout}
              className="w-full text-left p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-500"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Mobile Menu
  const MobileMenu = () => {
    if (!mobileMenuOpen) return null;

    return (
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          darkMode ? "bg-gray-900/80" : "bg-black/50"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`w-80 h-full ${
            darkMode ? "bg-gray-900" : "bg-white"
          } shadow-2xl p-6`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-400 to-green-500 rounded-xl shadow-lg">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h1
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                SaludIA
              </h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-lg ${
                darkMode
                  ? "text-gray-400 hover:bg-gray-800"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-2 mb-8">
            <div className="flex items-center mb-4">
              <Filter
                className={`w-5 h-5 mr-3 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              />
              <h3
                className={`font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Filtrar por Tipo
              </h3>
            </div>

            <button
              onClick={() => {
                setSelectedType("all");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                selectedType === "all"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                  : `${
                      darkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
              }`}
            >
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5" />
                <span className="font-medium">Todas</span>
              </div>
            </button>

            {Object.values(RecommendationType).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  selectedType === type
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                    : `${
                        darkMode
                          ? "text-gray-300 hover:bg-gray-800"
                          : "text-gray-600 hover:bg-gray-50"
                      }`
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getTypeIcon(type)}
                  <span className="font-medium">{getTypeName(type)}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleDarkMode}
              className="w-full text-left p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>{darkMode ? "Modo Claro" : "Modo Oscuro"}</span>
            </button>
            <button
              onClick={logout}
              className="w-full text-left p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-500"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Debug Panel
  const DebugPanel = () => {
    if (!error || !debugInfo) return null;

    return (
      <div
        className={`fixed bottom-4 right-4 max-w-md p-4 rounded-xl ${
          darkMode ? "bg-red-900/80 text-white" : "bg-red-100 text-red-800"
        } shadow-xl z-50`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold">Error</h3>
          <button onClick={() => setError(null)} className="text-xl">
            ×
          </button>
        </div>
        <p className="text-sm mb-2">{error}</p>
        <details>
          <summary className="text-sm cursor-pointer">
            Detalles técnicos
          </summary>
          <pre className="text-xs mt-2 overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      {/* Header */}
      <div
        className={`${
          darkMode
            ? "bg-gray-800 shadow-xl border-gray-700"
            : "bg-white shadow-xl border-gray-100"
        } border-b sticky top-0 z-30`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                className="lg:hidden p-2 rounded-lg"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu
                  className={`w-6 h-6 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                />
              </button>
              <div className="p-2 bg-gradient-to-r from-green-400 to-green-500 rounded-xl shadow-lg">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-1`}
                >
                  Recomendaciones IA
                </h1>
                <p
                  className={`${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  } flex items-center text-sm`}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Consejos personalizados para tu salud
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div
                className={`relative rounded-xl overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Buscar recomendaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-3 pl-10 pr-4 focus:outline-none ${
                    darkMode
                      ? "bg-gray-700 text-white placeholder-gray-400"
                      : "bg-gray-100 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                className={`p-2 rounded-xl ${
                  darkMode
                    ? "text-gray-400 hover:bg-gray-700"
                    : "text-gray-500 hover:bg-gray-100"
                } transition-colors`}
              >
                <Bell className="w-6 h-6" />
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Desktop */}
          <div className="lg:col-span-1 hidden lg:block">
            <div
              className={`${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } rounded-2xl border shadow-xl p-6 sticky top-8`}
            >
              <div className="flex items-center mb-6">
                <Filter
                  className={`w-5 h-5 mr-3 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                />
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Filtrar por Tipo
                </h3>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedType("all")}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                    selectedType === "all"
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105"
                      : `${
                          darkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-600 hover:bg-gray-50"
                        } hover:scale-102`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">Todas</span>
                    </div>
                    {selectedType === "all" && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {Object.values(RecommendationType).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                      selectedType === type
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105"
                        : `${
                            darkMode
                              ? "text-gray-300 hover:bg-gray-700"
                              : "text-gray-600 hover:bg-gray-50"
                          } hover:scale-102`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(type)}
                        <span className="font-medium">{getTypeName(type)}</span>
                      </div>
                      {selectedType === type && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4
                  className={`font-medium mb-4 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Estadísticas
                </h4>
                <div className="space-y-3">
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-700"}
                    >
                      Total
                    </span>
                    <span className="font-bold text-purple-500">
                      {recommendations.length}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-700"}
                    >
                      Activas
                    </span>
                    <span className="font-bold text-green-500">
                      {recommendations.filter((r) => r.activa).length}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-700"}
                    >
                      Por vencer
                    </span>
                    <span className="font-bold text-yellow-500">
                      {
                        recommendations.filter((r) => {
                          const days =
                            (new Date(r.vigenciaHasta) - new Date()) /
                            (1000 * 60 * 60 * 24);
                          return days <= 7 && days > 0;
                        }).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar - Mobile */}
            <div className="mb-6 md:hidden">
              <div
                className={`relative rounded-xl overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Buscar recomendaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-3 pl-10 pr-4 focus:outline-none ${
                    darkMode
                      ? "bg-gray-700 text-white placeholder-gray-400"
                      : "bg-gray-100 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Recomendaciones Activas"
                value={recommendations.filter((r) => r.activa).length}
                icon={CheckCircle}
                color="green"
                trend={+15}
              />

              <StatsCard
                title="Por Vencer (7 días)"
                value={
                  recommendations.filter((r) => {
                    const days =
                      (new Date(r.vigenciaHasta) - new Date()) /
                      (1000 * 60 * 60 * 24);
                    return days <= 7 && days > 0;
                  }).length
                }
                icon={Clock}
                color="blue"
                trend={-5}
              />

              <StatsCard
                title="Generadas este Mes"
                value={12}
                icon={Award}
                color="purple"
                trend={+23}
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <QuickActions />
            </div>

            {/* Recommendations List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedType === "all"
                    ? "Todas las Recomendaciones"
                    : `Recomendaciones de ${getTypeName(selectedType)}`}
                </h2>
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {filteredRecommendations.length} recomendaciones
                </span>
              </div>

              {filteredRecommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className={`${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-2xl border shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${getCardGradient(
                      recommendation.tipo
                    )}`}
                  ></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-xl border shadow-lg ${getTypeColor(
                            recommendation.tipo
                          )} group-hover:scale-110 transition-transform`}
                        >
                          {getTypeIcon(recommendation.tipo)}
                        </div>
                        <div>
                          <h3
                            className={`text-lg font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            } mb-1`}
                          >
                            Recomendación de {getTypeName(recommendation.tipo)}
                          </h3>
                          <div className="flex items-center space-x-6 text-sm">
                            <span
                              className={`flex items-center space-x-2 ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              <Calendar className="w-4 h-4" />
                              <span>
                                Generada:{" "}
                                {new Date(
                                  recommendation.fechaGeneracion
                                ).toLocaleDateString()}
                              </span>
                            </span>
                            <span
                              className={`flex items-center space-x-2 ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              <span>
                                Válida hasta:{" "}
                                {new Date(
                                  recommendation.vigenciaHasta
                                ).toLocaleDateString()}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isExpired(recommendation.vigenciaHasta) && (
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              darkMode
                                ? "bg-red-900/30 text-red-400"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            Vencida
                          </span>
                        )}
                        {!recommendation.activa && (
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              darkMode
                                ? "bg-gray-700 text-gray-400"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            Inactiva
                          </span>
                        )}
                        <button
                          onClick={() =>
                            setSelectedRecommendation(recommendation)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode
                              ? "text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
                              : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {recommendation.activa && (
                          <button
                            onClick={() =>
                              deactivateRecommendation(recommendation.id)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                                : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                            }`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      className={`${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } leading-relaxed`}
                    >
                      <p className="line-clamp-3">{recommendation.contenido}</p>
                      <button
                        onClick={() =>
                          setSelectedRecommendation(recommendation)
                        }
                        className={`mt-2 text-sm font-medium inline-flex items-center space-x-1 ${
                          darkMode
                            ? "text-purple-400 hover:text-purple-300"
                            : "text-purple-600 hover:text-purple-700"
                        } transition-colors`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Leer más</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredRecommendations.length === 0 && (
                <div
                  className={`text-center py-16 ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-2xl border`}
                >
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <Lightbulb
                      className={`w-12 h-12 ${
                        darkMode ? "text-purple-400" : "text-purple-600"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    No hay recomendaciones
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } mb-6`}
                  >
                    {selectedType === "all"
                      ? "Aún no tienes recomendaciones. Genera tu primera recomendación usando las acciones rápidas."
                      : `No tienes recomendaciones de ${getTypeName(
                          selectedType
                        )}.`}
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="w-5 h-5" />
                      <span>Generar Recomendación</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl`}
          >
            <div
              className={`sticky top-0 ${
                darkMode ? "bg-gray-800" : "bg-white"
              } p-6 border-b ${
                darkMode ? "border-gray-700" : "border-gray-100"
              } rounded-t-2xl`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-xl border shadow-lg ${getTypeColor(
                      selectedRecommendation.tipo
                    )}`}
                  >
                    {getTypeIcon(selectedRecommendation.tipo)}
                  </div>
                  <div>
                    <h2
                      className={`text-xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      } mb-1`}
                    >
                      Recomendación de{" "}
                      {getTypeName(selectedRecommendation.tipo)}
                    </h2>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Generada el{" "}
                      {new Date(
                        selectedRecommendation.fechaGeneracion
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className={`p-2 rounded-xl transition-colors ${
                    darkMode
                      ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                <pre
                  className={`whitespace-pre-wrap font-sans ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } leading-relaxed`}
                >
                  {selectedRecommendation.contenido}
                </pre>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span
                      className={`flex items-center space-x-2 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>
                        Válida hasta:{" "}
                        {new Date(
                          selectedRecommendation.vigenciaHasta
                        ).toLocaleDateString()}
                      </span>
                    </span>
                    {selectedRecommendation.activa ? (
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          darkMode
                            ? "bg-green-900/30 text-green-400"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        Activa
                      </span>
                    ) : (
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          darkMode
                            ? "bg-gray-700 text-gray-400"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Inactiva
                      </span>
                    )}
                  </div>

                  {selectedRecommendation.activa && (
                    <button
                      onClick={() => {
                        deactivateRecommendation(selectedRecommendation.id);
                        setSelectedRecommendation(null);
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                        darkMode
                          ? "bg-red-900/20 text-red-400 hover:bg-red-900/30"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Desactivar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-2xl p-8 shadow-2xl`}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <RefreshCw
                  className={`w-12 h-12 animate-spin ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-2`}
                >
                  Generando Recomendación
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  La IA está analizando tu perfil para crear consejos
                  personalizados...
                </p>
              </div>
            </div>
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ID de usuario: {user?.id}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <MobileMenu />

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
};

export default RecommendationApp;
