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
  const { user } = useAuth();
  const {
    recommendations,
    getRecommendationsByUser,
    createRecommendationGeneral,
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
  const userId = user.userId;

  useEffect(() => {
    getRecommendationsByUser(user.userId);
  }, [userId]);

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
    setLoading(true);
    setError(null);
    try {
      let newRecommendation;
      console.log("Generando recomendación con datos:", {
        tipo,
        datosEntrada,
        userId: user.userId,
      });
      switch (tipo) {
        case RecommendationType.NUTRITION:
          // Pasar datosEntrada como segundo parámetro
          newRecommendation = await quickNutritionRecommendation(
            user.userId,
            datosEntrada // Asegúrate de que esto se pase
          );
          break;
        case RecommendationType.EXERCISE:
          newRecommendation = await quickExerciseRecommendation(
            user.userId,
            datosEntrada // Asegúrate de que esto se pase
          );
          break;
        case RecommendationType.MEDICAL:
          newRecommendation = await quickMedicalRecommendation(
            user.userId,
            datosEntrada // Asegúrate de que esto se pase
          );
          break;
        default:
          const recommendationData = {
            usuarioId: user.userId,
            tipo,
            datosEntrada,
          };
          newRecommendation = await createRecommendationGeneral(
            recommendationData
          );
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

  const deactivateRecommendation = async (id) => {
    try {
      await deleteRecommendation(id);
      if (user && user.userId) {
        await getRecommendationsByUser(user.userId);
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
    const [formData, setFormData] = useState({});
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
      <div className="space-y-8">
        <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Información Personal
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              Proporciona información sobre tu equipamiento, lesiones y
              objetivos para una recomendación de ejercicio personalizada.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
            Equipo disponible
          </label>
          <div className="flex flex-wrap gap-3">
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
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                  (formData.equipo_disponible || []).includes(item)
                    ? "bg-blue-500 text-white shadow-lg transform scale-105 ring-2 ring-blue-300"
                    : "bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
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
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
            Objetivo principal
          </label>
          <select
            value={formData.objetivo || ""}
            onChange={(e) => handleChange("objetivo", e.target.value)}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          >
            <option value="">Seleccionar objetivo</option>
            <option value="ganar masa muscular">Ganar masa muscular</option>
            <option value="perder peso">Perder peso</option>
            <option value="mejorar resistencia">Mejorar resistencia</option>
            <option value="mejorar flexibilidad">Mejorar flexibilidad</option>
            <option value="rehabilitación">Rehabilitación</option>
          </select>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
            Días disponibles por semana
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="7"
              value={formData.dias_semana || 3}
              onChange={(e) =>
                handleChange("dias_semana", parseInt(e.target.value))
              }
              className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                  ((formData.dias_semana || 3) - 1) * 16.67
                }%, #e5e7eb ${
                  ((formData.dias_semana || 3) - 1) * 16.67
                }%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-xl shadow-lg">
              <span className="text-xl font-bold">
                {formData.dias_semana || 3}
              </span>
            </div>
          </div>
        </div>
      </div>
    );

    const renderMedicalForm = () => (
      <div className="space-y-8">
        <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 rounded-2xl border border-red-200/50 dark:border-red-700/50">
          <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
              Información Médica
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              Esta información nos ayuda a proporcionar recomendaciones médicas
              más precisas y seguras para ti.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-red-500 rounded-full mr-3"></div>
            Síntomas actuales
          </label>
          <div className="flex flex-wrap gap-3 mb-4">
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
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                  (formData.sintomas_actuales || []).includes(item)
                    ? "bg-red-500 text-white shadow-lg transform scale-105 ring-2 ring-red-300"
                    : "bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:border-red-300 hover:shadow-md"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Otros síntomas (separados por coma)"
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500"
            onChange={(e) => handleChange("otros_sintomas", e.target.value)}
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-red-500 rounded-full mr-3"></div>
            Preocupaciones principales
          </label>
          <textarea
            placeholder="Ej: control de diabetes, presión arterial, colesterol..."
            value={formData.preocupaciones || ""}
            onChange={(e) => handleChange("preocupaciones", e.target.value)}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            rows="3"
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-red-500 rounded-full mr-3"></div>
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
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-red-500 rounded-full mr-3"></div>
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
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>
    );

    const renderNutritionForm = () => (
      <div className="space-y-8">
        <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
          <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              Información Nutricional
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
              Comparte tus preferencias y restricciones alimenticias para
              recibir un plan nutricional personalizado.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
            Preferencias alimenticias
          </label>
          <div className="grid grid-cols-2 gap-4">
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
                className={`px-6 py-4 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm ${
                  (formData.preferencias || []).includes(item)
                    ? "bg-green-500 text-white shadow-lg transform scale-105 ring-2 ring-green-300"
                    : "bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:border-green-300 hover:shadow-md"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
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
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
            Objetivo nutricional
          </label>
          <select
            value={formData.objetivo || ""}
            onChange={(e) => handleChange("objetivo", e.target.value)}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
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

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
            Comidas que te gustan
          </label>
          <textarea
            placeholder="Ej: pollo a la plancha, ensaladas, frutas..."
            value={formData.comidas_gustan || ""}
            onChange={(e) => handleChange("comidas_gustan", e.target.value)}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            rows="2"
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
            Comidas que no te gustan
          </label>
          <textarea
            placeholder="Ej: pescado, brócoli, alimentos picantes..."
            value={formData.comidas_no_gustan || ""}
            onChange={(e) => handleChange("comidas_no_gustan", e.target.value)}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500 resize-none"
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
          return "border-blue-200 dark:border-blue-800 shadow-blue-100/50 dark:shadow-blue-900/20";
        case RecommendationType.MEDICAL:
          return "border-red-200 dark:border-red-800 shadow-red-100/50 dark:shadow-red-900/20";
        case RecommendationType.NUTRITION:
          return "border-green-200 dark:border-green-800 shadow-green-100/50 dark:shadow-green-900/20";
        default:
          return "border-purple-200 dark:border-purple-800 shadow-purple-100/50 dark:shadow-purple-900/20";
      }
    };

    const getGradientButton = () => {
      switch (tipo) {
        case RecommendationType.EXERCISE:
          return "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800";
        case RecommendationType.MEDICAL:
          return "bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800";
        case RecommendationType.NUTRITION:
          return "bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800";
        default:
          return "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800";
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div
          className={`bg-white dark:bg-gray-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 ${getFormColor()} shadow-2xl`}
        >
          <div className="sticky top-0 bg-white dark:bg-gray-900 p-8 border-b-2 border-gray-100 dark:border-gray-800 rounded-t-3xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg">
                  {getFormIcon()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Personalizar {getTypeName(tipo)}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Completa la información para una recomendación más precisa
                  </p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {tipo === RecommendationType.EXERCISE && renderExerciseForm()}
            {tipo === RecommendationType.MEDICAL && renderMedicalForm()}
            {tipo === RecommendationType.NUTRITION && renderNutritionForm()}

            <div className="flex justify-end space-x-4 mt-10 pt-8 border-t-2 border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 font-semibold border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-8 py-3 ${getGradientButton()} text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 active:scale-95`}
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
        gradient:
          "bg-gradient-to-br from-green-500 via-green-600 to-emerald-700",
        icon: Apple,
        type: RecommendationType.NUTRITION,
      },
      {
        title: "Ejercicio",
        subtitle: "Rutina de actividad",
        gradient: "bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700",
        icon: Activity,
        type: RecommendationType.EXERCISE,
      },
      {
        title: "Médico",
        subtitle: "Consejos de salud",
        gradient: "bg-gradient-to-br from-red-500 via-red-600 to-pink-700",
        icon: Stethoscope,
        type: RecommendationType.MEDICAL,
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
              ? "bg-gray-800/50 border-gray-700 shadow-2xl shadow-gray-900/20"
              : "bg-white border-gray-200 shadow-2xl shadow-gray-100/50"
          } rounded-3xl border-2 p-8 hover:shadow-3xl transition-all duration-500 backdrop-blur-sm`}
        >
          <div className="flex items-center mb-8">
            <div
              className={`w-14 h-14 ${
                darkMode
                  ? "bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg shadow-gray-900/30"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg shadow-gray-200/50"
              } rounded-2xl flex items-center justify-center mr-4`}
            >
              <Zap
                className={`w-8 h-8 ${
                  darkMode ? "text-yellow-400" : "text-yellow-600"
                }`}
              />
            </div>
            <div>
              <h3
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-1`}
              >
                Generar Recomendaciones
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Selecciona el tipo de recomendación que necesitas
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
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
                className={`${action.gradient} text-white p-6 rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <action.icon className="w-8 h-8" />
                  </div>
                  <div className="font-bold text-base mb-1">{action.title}</div>
                  <div className="text-sm opacity-90 font-medium">
                    {action.subtitle}
                  </div>
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
            <div className="space-y-8">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                <div>
                  <h2
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    {selectedType === "all"
                      ? "Todas las Recomendaciones"
                      : `Recomendaciones de ${getTypeName(selectedType)}`}
                  </h2>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Gestiona y revisa tus recomendaciones personalizadas
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className={`px-4 py-2 rounded-xl ${
                      darkMode
                        ? "bg-purple-900/30 text-purple-300 border border-purple-700/50"
                        : "bg-purple-100 text-purple-700 border border-purple-200"
                    } shadow-sm`}
                  >
                    <span className="font-semibold text-lg">
                      {filteredRecommendations.length}
                    </span>
                    <span className="text-xs ml-1 opacity-80">
                      {filteredRecommendations.length === 1
                        ? "recomendación"
                        : "recomendaciones"}
                    </span>
                  </div>
                </div>
              </div>

              {filteredRecommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className={`${
                    darkMode
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50"
                      : "bg-gradient-to-br from-white to-gray-50 border-gray-200/50"
                  } rounded-3xl border-2 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] group relative`}
                >
                  <div
                    className={`h-1.5 bg-gradient-to-r ${getCardGradient(
                      recommendation.tipo
                    )} shadow-sm`}
                  ></div>

                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 opacity-5 dark:opacity-10">
                    <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full blur-2xl"></div>
                  </div>

                  <div className="relative p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-5">
                        <div
                          className={`p-4 rounded-2xl border-2 shadow-xl ${getTypeColor(
                            recommendation.tipo
                          )} group-hover:scale-110 transition-all duration-300 backdrop-blur-sm`}
                        >
                          {getTypeIcon(recommendation.tipo)}
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-xl font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            } mb-3 leading-tight`}
                          >
                            Recomendación de {getTypeName(recommendation.tipo)}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div
                              className={`flex items-center space-x-3 p-3 rounded-xl ${
                                darkMode
                                  ? "bg-gray-800/50 border border-gray-700/50"
                                  : "bg-white/70 border border-gray-200/50"
                              } backdrop-blur-sm shadow-sm`}
                            >
                              <div
                                className={`p-2 rounded-lg ${
                                  darkMode ? "bg-blue-900/30" : "bg-blue-100"
                                }`}
                              >
                                <Calendar
                                  className={`w-4 h-4 ${
                                    darkMode ? "text-blue-400" : "text-blue-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <span
                                  className={`block text-xs font-medium ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Generada
                                </span>
                                <span
                                  className={`font-semibold ${
                                    darkMode ? "text-gray-200" : "text-gray-700"
                                  }`}
                                >
                                  {new Date(
                                    recommendation.fechaGeneracion
                                  ).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`flex items-center space-x-3 p-3 rounded-xl ${
                                darkMode
                                  ? "bg-gray-800/50 border border-gray-700/50"
                                  : "bg-white/70 border border-gray-200/50"
                              } backdrop-blur-sm shadow-sm`}
                            >
                              <div
                                className={`p-2 rounded-lg ${
                                  isExpired(recommendation.vigenciaHasta)
                                    ? darkMode
                                      ? "bg-red-900/30"
                                      : "bg-red-100"
                                    : darkMode
                                    ? "bg-green-900/30"
                                    : "bg-green-100"
                                }`}
                              >
                                <Clock
                                  className={`w-4 h-4 ${
                                    isExpired(recommendation.vigenciaHasta)
                                      ? darkMode
                                        ? "text-red-400"
                                        : "text-red-600"
                                      : darkMode
                                      ? "text-green-400"
                                      : "text-green-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <span
                                  className={`block text-xs font-medium ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Válida hasta
                                </span>
                                <span
                                  className={`font-semibold ${
                                    isExpired(recommendation.vigenciaHasta)
                                      ? darkMode
                                        ? "text-red-400"
                                        : "text-red-600"
                                      : darkMode
                                      ? "text-gray-200"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {new Date(
                                    recommendation.vigenciaHasta
                                  ).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col space-y-2">
                          {isExpired(recommendation.vigenciaHasta) && (
                            <span
                              className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md ${
                                darkMode
                                  ? "bg-red-900/40 text-red-300 border border-red-700/50"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              } backdrop-blur-sm`}
                            >
                              ⚠️ Vencida
                            </span>
                          )}
                          {!recommendation.activa && (
                            <span
                              className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md ${
                                darkMode
                                  ? "bg-gray-700/50 text-gray-400 border border-gray-600/50"
                                  : "bg-gray-100 text-gray-600 border border-gray-200"
                              } backdrop-blur-sm`}
                            >
                              💤 Inactiva
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setSelectedRecommendation(recommendation)
                            }
                            className={`p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                              darkMode
                                ? "text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-700/50 hover:border-blue-600"
                                : "text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300"
                            } transform hover:scale-105`}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {recommendation.activa && (
                            <button
                              onClick={() =>
                                deactivateRecommendation(recommendation.id)
                              }
                              className={`p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                                darkMode
                                  ? "text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 border border-red-700/50 hover:border-red-600"
                                  : "text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300"
                              } transform hover:scale-105`}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`${
                        darkMode
                          ? "bg-gray-800/30 border border-gray-700/50"
                          : "bg-white/50 border border-gray-200/50"
                      } rounded-2xl p-6 backdrop-blur-sm shadow-inner`}
                    >
                      <div
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        } leading-relaxed text-base`}
                      >
                        <p className="line-clamp-3 mb-4">
                          {recommendation.contenido}
                        </p>
                        <button
                          onClick={() =>
                            setSelectedRecommendation(recommendation)
                          }
                          className={`inline-flex items-center space-x-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                            darkMode
                              ? "text-purple-400 hover:text-purple-300 bg-purple-900/20 hover:bg-purple-900/30 border border-purple-700/50"
                              : "text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200"
                          } shadow-sm hover:shadow-md transform hover:scale-105`}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Leer completa</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredRecommendations.length === 0 && (
                <div
                  className={`text-center py-20 ${
                    darkMode
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50"
                      : "bg-gradient-to-br from-white to-gray-50 border-gray-200/50"
                  } rounded-3xl border-2 shadow-2xl relative overflow-hidden`}
                >
                  {/* Decorative background */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-8 left-8 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-8 right-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl"></div>
                  </div>

                  <div className="relative">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-200 dark:from-purple-900/40 dark:via-purple-800/40 dark:to-pink-900/40 rounded-3xl flex items-center justify-center mb-8 shadow-2xl backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50">
                      <Lightbulb
                        className={`w-16 h-16 ${
                          darkMode ? "text-purple-400" : "text-purple-600"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      } mb-3`}
                    >
                      No hay recomendaciones
                    </h3>
                    <p
                      className={`text-lg ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } mb-8 max-w-md mx-auto leading-relaxed`}
                    >
                      {selectedType === "all"
                        ? "Aún no tienes recomendaciones. Genera tu primera recomendación usando las acciones rápidas."
                        : `No tienes recomendaciones de ${getTypeName(
                            selectedType
                          )}.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`${
              darkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50"
                : "bg-gradient-to-br from-white to-gray-50 border-gray-200/50"
            } rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-3xl border-2 relative`}
          >
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full blur-3xl"></div>
            </div>

            <div
              className={`sticky top-0 ${
                darkMode ? "bg-gray-800/90" : "bg-white/90"
              } p-8 border-b-2 ${
                darkMode ? "border-gray-700/50" : "border-gray-200/50"
              } rounded-t-3xl backdrop-blur-sm relative z-10`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div
                    className={`p-4 rounded-2xl border-2 shadow-xl ${getTypeColor(
                      selectedRecommendation.tipo
                    )} backdrop-blur-sm`}
                  >
                    {getTypeIcon(selectedRecommendation.tipo)}
                  </div>
                  <div>
                    <h2
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      } mb-2`}
                    >
                      Recomendación de{" "}
                      {getTypeName(selectedRecommendation.tipo)}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                          darkMode
                            ? "bg-gray-700/50 border border-gray-600/50"
                            : "bg-gray-100/70 border border-gray-200/50"
                        } backdrop-blur-sm`}
                      >
                        <Calendar
                          className={`w-4 h-4 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {new Date(
                            selectedRecommendation.fechaGeneracion
                          ).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className={`p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                    darkMode
                      ? "text-gray-400 hover:text-gray-300 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50"
                      : "text-gray-400 hover:text-gray-600 bg-gray-100/70 hover:bg-gray-200 border border-gray-200/50"
                  } backdrop-blur-sm transform hover:scale-105`}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-200px)] relative z-10">
              <div className="p-8">
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-800/30 border border-gray-700/50"
                      : "bg-white/70 border border-gray-200/50"
                  } rounded-2xl p-8 backdrop-blur-sm shadow-inner`}
                >
                  <div className="prose prose-lg max-w-none">
                    <div
                      className={`whitespace-pre-wrap font-sans ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      } leading-relaxed text-base`}
                      style={{
                        lineHeight: "1.8",
                        textAlign: "justify",
                      }}
                    >
                      {selectedRecommendation.contenido}
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-8 pt-6 border-t-2 ${
                    darkMode ? "border-gray-700/50" : "border-gray-200/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div
                        className={`flex items-center space-x-3 p-4 rounded-xl ${
                          darkMode
                            ? "bg-gray-800/50 border border-gray-700/50"
                            : "bg-white/70 border border-gray-200/50"
                        } backdrop-blur-sm shadow-sm`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isExpired(selectedRecommendation.vigenciaHasta)
                              ? darkMode
                                ? "bg-red-900/30"
                                : "bg-red-100"
                              : darkMode
                              ? "bg-green-900/30"
                              : "bg-green-100"
                          }`}
                        >
                          <Calendar
                            className={`w-5 h-5 ${
                              isExpired(selectedRecommendation.vigenciaHasta)
                                ? darkMode
                                  ? "text-red-400"
                                  : "text-red-600"
                                : darkMode
                                ? "text-green-400"
                                : "text-green-600"
                            }`}
                          />
                        </div>
                        <div>
                          <span
                            className={`block text-xs font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Válida hasta
                          </span>
                          <span
                            className={`font-bold ${
                              isExpired(selectedRecommendation.vigenciaHasta)
                                ? darkMode
                                  ? "text-red-400"
                                  : "text-red-600"
                                : darkMode
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          >
                            {new Date(
                              selectedRecommendation.vigenciaHasta
                            ).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {selectedRecommendation.activa ? (
                        <span
                          className={`px-6 py-3 text-sm font-bold rounded-xl shadow-md ${
                            darkMode
                              ? "bg-green-900/40 text-green-300 border border-green-700/50"
                              : "bg-green-100 text-green-800 border border-green-200"
                          } backdrop-blur-sm`}
                        >
                          ✅ Activa
                        </span>
                      ) : (
                        <span
                          className={`px-6 py-3 text-sm font-bold rounded-xl shadow-md ${
                            darkMode
                              ? "bg-gray-700/50 text-gray-400 border border-gray-600/50"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          } backdrop-blur-sm`}
                        >
                          💤 Inactiva
                        </span>
                      )}
                    </div>

                    {selectedRecommendation.activa && (
                      <button
                        onClick={() => {
                          deactivateRecommendation(selectedRecommendation.id);
                          setSelectedRecommendation(null);
                        }}
                        className={`flex items-center space-x-3 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                          darkMode
                            ? "bg-red-900/30 text-red-300 hover:bg-red-900/40 border border-red-700/50 hover:border-red-600"
                            : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300"
                        } transform hover:scale-105 backdrop-blur-sm`}
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>Desactivar</span>
                      </button>
                    )}
                  </div>
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
