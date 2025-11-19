// components/NutritionManager.js
import React, { useState, useEffect, useRef } from "react";
import { useNutrition } from "../context/nutrition/nutrition.context";
import { useAuth } from "../context/auth/auth.context";
import { useUsers } from "../context/user/user.context";
import { useTheme } from "../context/dark-mode.context";
import {
  Plus,
  Search,
  Trash2,
  X,
  Calendar,
  Clock,
  Utensils,
  BarChart3,
  Apple,
  Scale,
  Zap,
  Beef,
  Carrot,
  Dessert,
  ChevronDown,
  ChevronUp,
  Users,
  User,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Target,
  Info,
  List,
} from "lucide-react";
import { toast } from "react-toastify";

// Componente de carga mejorado
const LoadingSpinner = ({ darkMode, size = "medium" }) => {
  const sizes = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-2 ${
          darkMode
            ? "border-emerald-400 border-t-transparent"
            : "border-emerald-600 border-t-transparent"
        } ${sizes[size]}`}
      ></div>
    </div>
  );
};

// Modal de creación de alimentos como componente separado con estado interno
const CreateFoodModal = ({
  darkMode,
  isOpen,
  onClose,
  onCreate,
  searchQuery,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    calorias_por_100g: "",
    proteinas_g_por_100g: "",
    carbohidratos_g_por_100g: "",
    grasas_g_por_100g: "",
    fibra_g_por_100g: "",
    categoria: "",
  });

  const nameInputRef = useRef(null);

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: searchQuery || "",
        descripcion: "",
        calorias_por_100g: "",
        proteinas_g_por_100g: "",
        carbohidratos_g_por_100g: "",
        grasas_g_por_100g: "",
        fibra_g_por_100g: "",
        categoria: "",
      });

      // Usar setTimeout para asegurar que el modal esté renderizado antes de enfocar
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`w-full max-w-md rounded-2xl p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-xl transform transition-all duration-300 scale-100`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <Plus className="h-5 w-5 mr-2 text-emerald-500" />
            Crear Nuevo Alimento
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Nombre del Alimento *
            </label>
            <input
              ref={nameInputRef}
              type="text"
              name="nombre"
              placeholder="Ej: Manzana, Pechuga de Pollo..."
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                darkMode
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              }`}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Calorías (por 100g) *
              </label>
              <input
                type="number"
                name="calorias_por_100g"
                placeholder="0"
                value={formData.calorias_por_100g}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                min="0"
                step="0.1"
                required
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Categoría
              </label>
              <input
                type="text"
                name="categoria"
                placeholder="Ej: Fruta, Proteína..."
                value={formData.categoria}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
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
                name="proteinas_g_por_100g"
                placeholder="0"
                step="0.1"
                value={formData.proteinas_g_por_100g}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                min="0"
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
                name="carbohidratos_g_por_100g"
                placeholder="0"
                step="0.1"
                value={formData.carbohidratos_g_por_100g}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                min="0"
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
                name="grasas_g_por_100g"
                placeholder="0"
                step="0.1"
                value={formData.grasas_g_por_100g}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                min="0"
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Descripción (Opcional)
            </label>
            <textarea
              name="descripcion"
              placeholder="Descripción adicional del alimento..."
              value={formData.descripcion}
              onChange={handleChange}
              rows={2}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                darkMode
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                darkMode
                  ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-white"
                  : "border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.nombre || !formData.calorias_por_100g}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Crear Alimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NutritionManager = () => {
  const {
    foodRecords,
    foods,
    dailySummary,
    loading,
    error,
    clearError,
    createFoodRecord,
    addFoodItem,
    getFoodRecordsByUser,
    getDailySummary,
    deleteFoodRecordItem,
    deleteFoodRecord,
    searchFoods,
    clearFoods,
    createFood,
  } = useNutrition();

  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { getUsersByDoctorId, getUserById } = useUsers();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [showPatientsDropdown, setShowPatientsDropdown] = useState(false);
  const [searchPatientTerm, setSearchPatientTerm] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("registros");
  const [newRecord, setNewRecord] = useState({
    tipo_comida: "desayuno",
    notas: "",
  });
  const [expandedRecords, setExpandedRecords] = useState(new Set());
  const [foodQuantities, setFoodQuantities] = useState({});
  const [showCreateFoodModal, setShowCreateFoodModal] = useState(false);
  const [searchingFoods, setSearchingFoods] = useState(false);
  const [activeRecordSearch, setActiveRecordSearch] = useState(null);

  // Eliminamos el estado newFood del componente principal

  // Debounce mejorado para búsqueda de alimentos
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      clearFoods();
      setSearchingFoods(false);
      return;
    }

    setSearchingFoods(true);
    const timeoutId = setTimeout(async () => {
      try {
        await handleSearchFoods(searchQuery);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Error al buscar alimentos");
      } finally {
        setSearchingFoods(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Cargar pacientes del doctor
  useEffect(() => {
    loadPatients();
  }, [user]);

  // Cargar registros cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient?.id) {
      loadFoodRecords();
      loadDailySummary();
    }
  }, [selectedPatient, selectedDate]);

  // Función para calcular el resumen total (no solo del día)
  const calculateTotalSummary = () => {
    if (!foodRecords || foodRecords.length === 0) {
      return {
        total_calorias: 0,
        total_proteinas: 0,
        total_carbohidratos: 0,
        total_grasas: 0,
        total_comidas: 0,
        promedio_calorias_por_comida: 0,
      };
    }

    const total = foodRecords.reduce(
      (acc, record) => {
        const nutrients = getTotalNutrients(record.items);
        return {
          calorias: acc.calorias + nutrients.calorias,
          proteinas: acc.proteinas + nutrients.proteinas,
          carbohidratos: acc.carbohidratos + nutrients.carbohidratos,
          grasas: acc.grasas + nutrients.grasas,
          comidas: acc.comidas + 1,
        };
      },
      { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, comidas: 0 }
    );

    return {
      total_calorias: total.calorias,
      total_proteinas: total.proteinas,
      total_carbohidratos: total.carbohidratos,
      total_grasas: total.grasas,
      total_comidas: total.comidas,
      promedio_calorias_por_comida:
        total.comidas > 0 ? total.calorias / total.comidas : 0,
    };
  };

  const loadPatients = async () => {
    try {
      setPatientsLoading(true);
      const patientsData = await getUsersByDoctorId(user.id);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (error) {
      console.error("Error loading patients:", error);
      toast.error("Error al cargar la lista de pacientes");
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const loadFoodRecords = async () => {
    try {
      await getFoodRecordsByUser(selectedPatient.id);
    } catch (error) {
      console.error("Error loading food records:", error);
    }
  };

  const loadDailySummary = async () => {
    try {
      await getDailySummary(selectedPatient.id, selectedDate);
    } catch (error) {
      console.error("Error loading daily summary:", error);
    }
  };

  const handleSelectPatient = async (patient) => {
    try {
      const patientDetails = await getUserById(patient.id);
      setSelectedPatient(patientDetails);
      setShowPatientsDropdown(false);
      setSearchPatientTerm("");
      clearFoods();
      setExpandedRecords(new Set());
      setSearchQuery("");
      setActiveRecordSearch(null);
    } catch (error) {
      console.error("Error loading patient details:", error);
      toast.error("Error al cargar los detalles del paciente");
    }
  };

  const handleCreateRecord = async () => {
    if (!selectedPatient) {
      toast.error("Por favor seleccione un paciente primero");
      return;
    }

    try {
      await createFoodRecord({
        usuarioId: selectedPatient.id,
        fecha: selectedDate,
        ...newRecord,
      });
      toast.success("Registro de comida creado exitosamente");
      setNewRecord({ tipo_comida: "desayuno", notas: "" });
      await Promise.all([loadFoodRecords(), loadDailySummary()]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddFoodItem = async (recordId, food, cantidad) => {
    if (!cantidad || cantidad < 1) {
      toast.error("Por favor ingrese una cantidad válida");
      return;
    }

    try {
      await addFoodItem(recordId, {
        alimentoId: food.id,
        cantidad_gramos: parseInt(cantidad),
      });
      toast.success(`${food.nombre} agregado al registro`);
      setActiveRecordSearch(null);
      setSearchQuery("");
      setFoodQuantities((prev) => ({
        ...prev,
        [`${recordId}-${food.id}`]: "",
      }));

      // Recargar datos inmediatamente
      await Promise.all([loadFoodRecords(), loadDailySummary()]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSearchFoods = async (query) => {
    try {
      await searchFoods(query);
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este registro?")
    ) {
      try {
        await deleteFoodRecord(recordId);
        toast.success("Registro eliminado exitosamente");

        // Recargar datos inmediatamente
        await Promise.all([loadFoodRecords(), loadDailySummary()]);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleDeleteFoodItem = async (itemId, foodName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${foodName}?`)) {
      try {
        await deleteFoodRecordItem(itemId);
        toast.success("Alimento eliminado del registro");

        // Recargar datos inmediatamente
        await Promise.all([loadFoodRecords(), loadDailySummary()]);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Modificamos handleCreateFood para recibir los datos del modal
  const handleCreateFood = async (foodData) => {
    try {
      const foodDataToSend = {
        ...foodData,
        calorias_por_100g: parseFloat(foodData.calorias_por_100g) || 0,
        proteinas_g_por_100g: parseFloat(foodData.proteinas_g_por_100g) || 0,
        carbohidratos_g_por_100g:
          parseFloat(foodData.carbohidratos_g_por_100g) || 0,
        grasas_g_por_100g: parseFloat(foodData.grasas_g_por_100g) || 0,
        fibra_g_por_100g: foodData.fibra_g_por_100g
          ? parseFloat(foodData.fibra_g_por_100g)
          : null,
      };

      await createFood(foodDataToSend);
      toast.success("Alimento creado exitosamente");
      setShowCreateFoodModal(false);

      if (searchQuery) {
        await handleSearchFoods(searchQuery);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Resto del código permanece igual...
  const toggleRecordExpansion = (recordId) => {
    setExpandedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const getPatientName = (patient) => {
    if (!patient) return "Nombre no disponible";
    if (typeof patient === "string") return patient;
    if (typeof patient === "object") {
      return patient.nombre || patient.name || "Nombre no disponible";
    }
    return "Nombre no disponible";
  };

  const getPatientEmail = (patient) => {
    if (!patient) return "Email no disponible";
    if (typeof patient === "string") return patient;
    if (typeof patient === "object") {
      return patient.email || patient.correo || "Email no disponible";
    }
    return "Email no disponible";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMealTypeColor = (tipo) => {
    const colors = {
      desayuno: "bg-gradient-to-br from-orange-500 to-orange-600",
      almuerzo: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      comida: "bg-gradient-to-br from-red-500 to-red-600",
      merienda: "bg-gradient-to-br from-green-500 to-green-600",
      cena: "bg-gradient-to-br from-blue-500 to-blue-600",
      snack: "bg-gradient-to-br from-purple-500 to-purple-600",
    };
    return colors[tipo] || "bg-gradient-to-br from-gray-500 to-gray-600";
  };

  const getMealTypeIcon = (tipo) => {
    const icons = {
      desayuno: <Dessert className="h-4 w-4" />,
      almuerzo: <Beef className="h-4 w-4" />,
      comida: <Utensils className="h-4 w-4" />,
      merienda: <Apple className="h-4 w-4" />,
      cena: <Carrot className="h-4 w-4" />,
      snack: <Zap className="h-4 w-4" />,
    };
    return icons[tipo] || <Utensils className="h-4 w-4" />;
  };

  const getTotalNutrients = (items) => {
    return (
      items?.reduce(
        (acc, item) => ({
          calorias: acc.calorias + (Number(item.calorias) || 0),
          proteinas: acc.proteinas + (Number(item.proteinas_g) || 0),
          carbohidratos:
            acc.carbohidratos + (Number(item.carbohidratos_g) || 0),
          grasas: acc.grasas + (Number(item.grasas_g) || 0),
        }),
        { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 }
      ) || { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 }
    );
  };

  const filteredPatients = patients.filter((patient) => {
    const patientName = getPatientName(patient).toLowerCase();
    const patientEmail = getPatientEmail(patient).toLowerCase();
    const searchTermLower = searchPatientTerm.toLowerCase();

    return (
      patientName.includes(searchTermLower) ||
      patientEmail.includes(searchTermLower)
    );
  });

  // Calcular el resumen total
  const totalSummary = calculateTotalSummary();

  const patientStats = {
    totalRegistros: foodRecords.length,
    totalCalorias: totalSummary.total_calorias,
    comidasHoy: foodRecords.filter(
      (record) =>
        new Date(record.fecha).toDateString() === selectedDate.toDateString()
    ).length,
  };

  // Componente para la búsqueda de alimentos (sin cambios)
  const FoodSearchSection = ({ recordId }) => (
    <div
      className={`mb-4 p-4 rounded-xl border transition-all duration-300 ${
        darkMode
          ? "bg-gray-800/50 border-emerald-500/30"
          : "bg-white border-emerald-500/30 shadow-sm"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
          <input
            type="text"
            placeholder="Buscar alimentos (ej: manzana, pollo, arroz)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
            }`}
          />
          {searchingFoods && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner darkMode={darkMode} size="small" />
            </div>
          )}
        </div>
        <button
          onClick={() => setShowCreateFoodModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Search Results */}
      <div className="rounded-lg overflow-hidden">
        {searchingFoods ? (
          <div className="text-center py-8">
            <LoadingSpinner darkMode={darkMode} size="medium" />
            <p
              className={`mt-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Buscando alimentos...
            </p>
          </div>
        ) : foods.length > 0 ? (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {foods.map((food) => (
              <div
                key={food.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  darkMode
                    ? "border-gray-600 bg-gray-700 hover:border-emerald-500"
                    : "border-gray-200 bg-white hover:border-emerald-400 hover:shadow-sm"
                }`}
              >
                <div className="flex-1 mb-2 sm:mb-0 sm:mr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="font-semibold">{food.nombre}</div>
                    {food.categoria && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          darkMode
                            ? "bg-emerald-900/50 text-emerald-300"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {food.categoria}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      <span className="font-medium text-emerald-500">
                        {food.calorias_por_100g}
                      </span>{" "}
                      cal
                    </div>
                    <div
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      P:{" "}
                      <span className="font-medium">
                        {food.proteinas_g_por_100g}g
                      </span>
                    </div>
                    <div
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      C:{" "}
                      <span className="font-medium">
                        {food.carbohidratos_g_por_100g}g
                      </span>
                    </div>
                    <div
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      G:{" "}
                      <span className="font-medium">
                        {food.grasas_g_por_100g}g
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none">
                    <input
                      type="number"
                      placeholder="100"
                      value={foodQuantities[`${recordId}-${food.id}`] || ""}
                      onChange={(e) =>
                        setFoodQuantities((prev) => ({
                          ...prev,
                          [`${recordId}-${food.id}`]: e.target.value,
                        }))
                      }
                      className={`w-full sm:w-20 px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                        darkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      min="1"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const cantidad =
                        foodQuantities[`${recordId}-${food.id}`] || 100;
                      handleAddFoodItem(recordId, food, parseInt(cantidad));
                    }}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && searchQuery.trim().length >= 2 ? (
          <div className="text-center py-8">
            <Search
              className={`h-12 w-12 mx-auto mb-3 ${
                darkMode ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <p
              className={`font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              No se encontraron alimentos
            </p>
            <p
              className={`text-sm mb-4 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Intenta con otros términos o crea un nuevo alimento
            </p>
            <button
              onClick={() => setShowCreateFoodModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Crear "{searchQuery}"</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles
              className={`h-12 w-12 mx-auto mb-3 ${
                darkMode ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <p
              className={`font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Busca alimentos
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Escribe al menos 2 caracteres para buscar
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["manzana", "pollo", "arroz", "yogur"].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (patientsLoading) {
    return (
      <div
        className={`min-h-screen transition-all duration-500 ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}
      >
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner darkMode={darkMode} size="large" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con selector de pacientes */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
              Gestión de Nutrición
            </h1>

            {/* Selector de pacientes */}
            <div className="relative">
              <button
                onClick={() => setShowPatientsDropdown(!showPatientsDropdown)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  darkMode
                    ? "border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
                    : "border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
                } ${showPatientsDropdown ? "ring-2 ring-emerald-500" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-emerald-500" />
                  <div className="text-left">
                    <span className="font-medium block">
                      {selectedPatient
                        ? getPatientName(selectedPatient)
                        : "Seleccionar paciente"}
                    </span>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedPatient
                        ? getPatientEmail(selectedPatient)
                        : "Elija un paciente de la lista"}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    showPatientsDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showPatientsDropdown && (
                <div
                  className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-lg z-50 ${
                    darkMode
                      ? "border-gray-600 bg-gray-800"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="relative">
                      <Search
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Buscar pacientes..."
                        value={searchPatientTerm}
                        onChange={(e) => setSearchPatientTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                          darkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {filteredPatients.length === 0 ? (
                      <div
                        className={`p-4 text-center ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {searchPatientTerm
                          ? "No se encontraron pacientes"
                          : "No hay pacientes disponibles"}
                      </div>
                    ) : (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className={`w-full text-left p-3 border-b transition-colors ${
                            darkMode
                              ? "border-gray-700 hover:bg-gray-700 text-white"
                              : "border-gray-100 hover:bg-gray-50 text-gray-900"
                          } ${
                            selectedPatient?.id === patient.id
                              ? darkMode
                                ? "bg-emerald-900/50 border-emerald-500"
                                : "bg-emerald-50 border-emerald-200"
                              : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                darkMode ? "bg-emerald-700" : "bg-emerald-100"
                              }`}
                            >
                              <User
                                className={`h-4 w-4 ${
                                  darkMode
                                    ? "text-emerald-200"
                                    : "text-emerald-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {getPatientName(patient)}
                              </p>
                              <p
                                className={`text-sm truncate ${
                                  darkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                {getPatientEmail(patient)}
                              </p>
                            </div>
                            {selectedPatient?.id === patient.id && (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className={`px-4 py-2 rounded-xl border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <Calendar className="inline h-5 w-5 mr-2 text-emerald-500" />
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className={`bg-transparent outline-none ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Información del paciente seleccionado */}
        {selectedPatient && (
          <div
            className={`p-6 rounded-2xl mb-8 ${
              darkMode
                ? "bg-gray-800/50 border border-gray-700"
                : "bg-white border border-gray-200/50 shadow-sm"
            }`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg`}
                >
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {getPatientName(selectedPatient)}
                  </h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      {getPatientEmail(selectedPatient)}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        darkMode
                          ? "bg-emerald-900/50 text-emerald-300"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {patientStats.comidasHoy} comidas hoy
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-auto">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        darkMode ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    >
                      {patientStats.totalRegistros}
                    </div>
                    <div
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Registros
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        darkMode ? "text-orange-400" : "text-orange-600"
                      }`}
                    >
                      {patientStats.comidasHoy}
                    </div>
                    <div
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Comidas Hoy
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {patientStats.totalCalorias.toFixed(0)}
                    </div>
                    <div
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Calorías
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              darkMode
                ? "bg-red-900/20 border-red-800 text-red-200"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
              <button
                onClick={clearError}
                className={`p-1 rounded ${
                  darkMode ? "hover:bg-red-800" : "hover:bg-red-100"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {selectedPatient && (
          <>
            <div
              className={`p-2 rounded-2xl mb-8 ${
                darkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white border border-gray-200/50 shadow-sm"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  {
                    key: "registros",
                    label: "Registros de Comida",
                    icon: Utensils,
                    description: "Gestiona las comidas del día",
                  },
                  {
                    key: "resumen",
                    label: "Resumen Nutricional",
                    icon: BarChart3,
                    description: "Análisis detallado de nutrientes",
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex flex-col items-center text-center p-6 rounded-xl transition-all duration-200 ${
                      activeTab === tab.key
                        ? darkMode
                          ? "bg-emerald-900/30 border border-emerald-700 text-emerald-300 shadow-lg"
                          : "bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-lg"
                        : darkMode
                        ? "border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon className="h-8 w-8 mb-3" />
                    <span className="font-semibold text-lg mb-1">
                      {tab.label}
                    </span>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {tab.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            {activeTab === "registros" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Create New Record */}
                  <div
                    className={`p-6 rounded-2xl ${
                      darkMode
                        ? "bg-gray-800/50 border border-gray-700"
                        : "bg-white border border-gray-200/50 shadow-sm"
                    }`}
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Plus className="h-5 w-5 mr-2 text-emerald-500" />
                      Nuevo Registro
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Tipo de Comida
                        </label>
                        <select
                          value={newRecord.tipo_comida}
                          onChange={(e) =>
                            setNewRecord({
                              ...newRecord,
                              tipo_comida: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                            darkMode
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        >
                          <option value="desayuno">Desayuno</option>
                          <option value="almuerzo">Almuerzo</option>
                          <option value="comida">Comida</option>
                          <option value="merienda">Merienda</option>
                          <option value="cena">Cena</option>
                          <option value="snack">Snack</option>
                        </select>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Notas (Opcional)
                        </label>
                        <textarea
                          placeholder="Ej: Comida ligera antes del ejercicio..."
                          value={newRecord.notas}
                          onChange={(e) =>
                            setNewRecord({
                              ...newRecord,
                              notas: e.target.value,
                            })
                          }
                          rows={3}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                            darkMode
                              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                          }`}
                        />
                      </div>
                      <button
                        onClick={handleCreateRecord}
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <LoadingSpinner darkMode={darkMode} size="small" />
                        ) : (
                          <>
                            <Plus className="h-5 w-5 mr-2" />
                            Crear Registro
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Daily Summary - Métricas Mejoradas */}
                  <div
                    className={`p-6 rounded-2xl ${
                      darkMode
                        ? "bg-gray-800/50 border border-gray-700"
                        : "bg-white border border-gray-200/50 shadow-sm"
                    }`}
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
                      Resumen del Día
                    </h2>

                    {dailySummary ? (
                      <div className="space-y-4">
                        {/* Calorías Principal */}
                        <div
                          className={`p-4 rounded-xl ${
                            darkMode
                              ? "bg-gray-700/50"
                              : "bg-gradient-to-r from-emerald-50 to-green-50"
                          } border border-emerald-200/50`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Zap className="h-8 w-8 text-emerald-500" />
                              <div>
                                <div className="text-2xl font-bold text-emerald-600">
                                  {dailySummary.total_calorias?.toFixed(0) || 0}
                                </div>
                                <div
                                  className={`text-sm ${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  Calorías Totales
                                </div>
                              </div>
                            </div>
                            <Target className="h-6 w-6 text-emerald-400" />
                          </div>
                        </div>

                        {/* Grid de Métricas */}
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            className={`p-3 rounded-lg text-center ${
                              darkMode ? "bg-gray-700" : "bg-blue-50"
                            }`}
                          >
                            <div className="text-lg font-bold text-blue-500">
                              {dailySummary.total_comidas || 0}
                            </div>
                            <div
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-blue-600"
                              }`}
                            >
                              Comidas
                            </div>
                          </div>
                          <div
                            className={`p-3 rounded-lg text-center ${
                              darkMode ? "bg-gray-700" : "bg-red-50"
                            }`}
                          >
                            <div className="text-lg font-bold text-red-500">
                              {(dailySummary.total_proteinas || 0).toFixed(1)}g
                            </div>
                            <div
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-red-600"
                              }`}
                            >
                              Proteínas
                            </div>
                          </div>
                          <div
                            className={`p-3 rounded-lg text-center ${
                              darkMode ? "bg-gray-700" : "bg-yellow-50"
                            }`}
                          >
                            <div className="text-lg font-bold text-yellow-500">
                              {(dailySummary.total_carbohidratos || 0).toFixed(
                                1
                              )}
                              g
                            </div>
                            <div
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-yellow-600"
                              }`}
                            >
                              Carbohidratos
                            </div>
                          </div>
                          <div
                            className={`p-3 rounded-lg text-center ${
                              darkMode ? "bg-gray-700" : "bg-purple-50"
                            }`}
                          >
                            <div className="text-lg font-bold text-purple-500">
                              {(dailySummary.total_grasas || 0).toFixed(1)}g
                            </div>
                            <div
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-purple-600"
                              }`}
                            >
                              Grasas
                            </div>
                          </div>
                        </div>

                        {/* Promedio por comida */}
                        {dailySummary.total_comidas > 0 && (
                          <div
                            className={`p-3 rounded-lg ${
                              darkMode ? "bg-gray-700" : "bg-gray-100"
                            }`}
                          >
                            <div className="text-center">
                              <div
                                className={`text-sm ${
                                  darkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                Promedio por comida
                              </div>
                              <div className="font-semibold text-emerald-500">
                                {(
                                  (dailySummary.total_calorias || 0) /
                                  dailySummary.total_comidas
                                ).toFixed(0)}{" "}
                                calorías
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3
                          className={`h-12 w-12 mx-auto mb-3 ${
                            darkMode ? "text-gray-600" : "text-gray-400"
                          }`}
                        />
                        <p
                          className={
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }
                        >
                          No hay datos para esta fecha
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Food Records */}
                <div className="lg:col-span-2">
                  <div
                    className={`p-6 rounded-2xl ${
                      darkMode
                        ? "bg-gray-800/50 border border-gray-700"
                        : "bg-white border border-gray-200/50 shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold flex items-center mb-2 sm:mb-0">
                        <Utensils className="h-5 w-5 mr-2 text-emerald-500" />
                        Registros de Comida
                      </h2>
                      <div
                        className={`px-3 py-1 rounded-full ${
                          darkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        } text-sm font-medium`}
                      >
                        {formatDate(selectedDate)}
                      </div>
                    </div>

                    {loading ? (
                      <div className="text-center py-12">
                        <LoadingSpinner darkMode={darkMode} size="large" />
                        <p
                          className={`mt-3 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Cargando registros...
                        </p>
                      </div>
                    ) : foodRecords.length === 0 ? (
                      <div
                        className={`text-center py-12 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <Utensils className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">
                          No hay registros para esta fecha
                        </p>
                        <p className="text-sm">
                          Crea tu primer registro de comida
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {foodRecords.map((record) => {
                          const nutrients = getTotalNutrients(record.items);
                          const isExpanded = expandedRecords.has(record.id);

                          return (
                            <div
                              key={record.id}
                              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                                darkMode
                                  ? "border-gray-700 bg-gray-800/30"
                                  : "border-gray-200 bg-white"
                              } ${isExpanded ? "shadow-lg" : "shadow-sm"}`}
                            >
                              {/* Record Header */}
                              <div
                                className="p-4 cursor-pointer hover:bg-opacity-50 transition-colors"
                                onClick={() => toggleRecordExpansion(record.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${getMealTypeColor(
                                        record.tipo_comida
                                      )} text-white shadow-md`}
                                    >
                                      {getMealTypeIcon(record.tipo_comida)}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold capitalize text-lg">
                                        {record.tipo_comida}
                                      </h3>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <p
                                          className={`text-sm ${
                                            darkMode
                                              ? "text-gray-400"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          {formatTime(record.fecha)}
                                        </p>
                                        {record.notas && (
                                          <span
                                            className={`text-xs px-2 py-1 rounded-full ${
                                              darkMode
                                                ? "bg-gray-700 text-gray-400"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                          >
                                            Con notas
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                      <div className="font-bold text-emerald-500 text-lg">
                                        {nutrients.calorias.toFixed(0)} cal
                                      </div>
                                      <div
                                        className={`text-xs ${
                                          darkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {record.items?.length || 0} alimentos
                                      </div>
                                    </div>
                                    <button
                                      className={`p-2 rounded-lg transition-colors ${
                                        darkMode
                                          ? "hover:bg-gray-700 text-gray-400"
                                          : "hover:bg-gray-200 text-gray-500"
                                      }`}
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="h-5 w-5" />
                                      ) : (
                                        <ChevronDown className="h-5 w-5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                {record.notas && isExpanded && (
                                  <p
                                    className={`mt-3 p-3 rounded-lg ${
                                      darkMode
                                        ? "bg-gray-700 text-gray-300"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {record.notas}
                                  </p>
                                )}
                              </div>

                              {/* Expanded Content */}
                              {isExpanded && (
                                <div className="border-t p-4">
                                  {/* Food Search Section */}
                                  {activeRecordSearch === record.id && (
                                    <FoodSearchSection recordId={record.id} />
                                  )}

                                  {/* Food Items List */}
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-medium text-lg">
                                        Alimentos Consumidos
                                      </h4>
                                      <button
                                        onClick={() => {
                                          setActiveRecordSearch(
                                            activeRecordSearch === record.id
                                              ? null
                                              : record.id
                                          );
                                          if (
                                            activeRecordSearch === record.id
                                          ) {
                                            setSearchQuery("");
                                            clearFoods();
                                          }
                                        }}
                                        className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                                          activeRecordSearch === record.id
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                                        } text-white shadow-md hover:shadow-lg`}
                                      >
                                        {activeRecordSearch === record.id ? (
                                          <>
                                            <X className="h-4 w-4" />
                                            <span>Cancelar</span>
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="h-4 w-4" />
                                            <span>Agregar Alimento</span>
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    {record.items && record.items.length > 0 ? (
                                      <div className="space-y-2">
                                        {record.items.map((item) => (
                                          <div
                                            key={item.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${
                                              darkMode
                                                ? "border-gray-600 bg-gray-700/50"
                                                : "border-gray-200 bg-gray-50"
                                            }`}
                                          >
                                            <div className="flex-1">
                                              <div className="font-medium text-lg">
                                                {item.alimento?.nombre}
                                              </div>
                                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm mt-2">
                                                <div
                                                  className={
                                                    darkMode
                                                      ? "text-gray-400"
                                                      : "text-gray-600"
                                                  }
                                                >
                                                  <span className="font-semibold text-emerald-500">
                                                    {item.cantidad_gramos}g
                                                  </span>
                                                </div>
                                                <div
                                                  className={
                                                    darkMode
                                                      ? "text-gray-400"
                                                      : "text-gray-600"
                                                  }
                                                >
                                                  <span className="font-semibold">
                                                    {item.calorias} cal
                                                  </span>
                                                </div>
                                                <div
                                                  className={
                                                    darkMode
                                                      ? "text-gray-400"
                                                      : "text-gray-600"
                                                  }
                                                >
                                                  P:{" "}
                                                  <span className="font-medium">
                                                    {item.proteinas_g}g
                                                  </span>
                                                </div>
                                                <div
                                                  className={
                                                    darkMode
                                                      ? "text-gray-400"
                                                      : "text-gray-600"
                                                  }
                                                >
                                                  C:{" "}
                                                  <span className="font-medium">
                                                    {item.carbohidratos_g}g
                                                  </span>
                                                </div>
                                                <div
                                                  className={
                                                    darkMode
                                                      ? "text-gray-400"
                                                      : "text-gray-600"
                                                  }
                                                >
                                                  G:{" "}
                                                  <span className="font-medium">
                                                    {item.grasas_g}g
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() =>
                                                handleDeleteFoodItem(
                                                  item.id,
                                                  item.alimento?.nombre
                                                )
                                              }
                                              className={`p-2 rounded-lg transition-colors ml-4 ${
                                                darkMode
                                                  ? "hover:bg-red-900/50 text-gray-400 hover:text-red-300"
                                                  : "hover:bg-red-100 text-gray-500 hover:text-red-600"
                                              }`}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div
                                        className={`text-center py-6 ${
                                          darkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No hay alimentos en este registro</p>
                                        <p className="text-sm mt-1">
                                          Agrega alimentos usando el botón
                                          superior
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Nutrient Summary */}
                                  <div
                                    className={`p-4 rounded-lg border ${
                                      darkMode
                                        ? "border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900"
                                        : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50"
                                    }`}
                                  >
                                    <h5 className="font-semibold mb-3 flex items-center">
                                      <BarChart3 className="h-4 w-4 mr-2 text-emerald-500" />
                                      Resumen Nutricional del Registro
                                    </h5>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-emerald-500">
                                          {nutrients.calorias.toFixed(0)}
                                        </div>
                                        <div
                                          className={`text-xs ${
                                            darkMode
                                              ? "text-gray-400"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          Calorías
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-red-500">
                                          {nutrients.proteinas.toFixed(1)}g
                                        </div>
                                        <div
                                          className={`text-xs ${
                                            darkMode
                                              ? "text-gray-400"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          Proteínas
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-500">
                                          {nutrients.carbohidratos.toFixed(1)}g
                                        </div>
                                        <div
                                          className={`text-xs ${
                                            darkMode
                                              ? "text-gray-400"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          Carbohidratos
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-500">
                                          {nutrients.grasas.toFixed(1)}g
                                        </div>
                                        <div
                                          className={`text-xs ${
                                            darkMode
                                              ? "text-gray-400"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          Grasas
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Delete Record Button */}
                                  <div className="flex justify-end mt-4">
                                    <button
                                      onClick={() =>
                                        handleDeleteRecord(record.id)
                                      }
                                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                        darkMode
                                          ? "hover:bg-red-900/50 text-red-400 hover:text-red-300"
                                          : "hover:bg-red-100 text-red-600 hover:text-red-700"
                                      }`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span>Eliminar Registro</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Nutritional Summary Tab - MODIFICADO PARA MOSTRAR TOTALES */}
            {activeTab === "resumen" && (
              <div className="space-y-6">
                {/* Información del Resumen */}
                <div
                  className={`p-4 rounded-xl ${
                    darkMode
                      ? "bg-blue-900/20 border border-blue-700"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    <p
                      className={`text-sm ${
                        darkMode ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      Mostrando el resumen nutricional total de todos los
                      registros del paciente
                    </p>
                  </div>
                </div>

                {/* Tarjetas de Resumen Total */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    className={`p-6 rounded-2xl border ${
                      darkMode
                        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                        : "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className={`text-3xl font-bold ${
                            darkMode ? "text-emerald-400" : "text-emerald-600"
                          }`}
                        >
                          {totalSummary.total_calorias?.toFixed(0) || 0}
                        </div>
                        <div
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Calorías Totales
                        </div>
                      </div>
                      <Zap
                        className={`h-8 w-8 ${
                          darkMode ? "text-emerald-500" : "text-emerald-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-2xl border ${
                      darkMode
                        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                        : "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className={`text-3xl font-bold ${
                            darkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          {totalSummary.total_comidas || 0}
                        </div>
                        <div
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Total Comidas
                        </div>
                      </div>
                      <Utensils
                        className={`h-8 w-8 ${
                          darkMode ? "text-blue-500" : "text-blue-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-2xl border ${
                      darkMode
                        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                        : "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className={`text-2xl font-bold ${
                            darkMode ? "text-red-400" : "text-red-600"
                          }`}
                        >
                          {(totalSummary.total_proteinas || 0).toFixed(1)}g
                        </div>
                        <div
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Proteínas Totales
                        </div>
                      </div>
                      <Beef
                        className={`h-8 w-8 ${
                          darkMode ? "text-red-500" : "text-red-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-2xl border ${
                      darkMode
                        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                        : "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className={`text-2xl font-bold ${
                            darkMode ? "text-purple-400" : "text-purple-600"
                          }`}
                        >
                          {(
                            (totalSummary.total_proteinas || 0) +
                            (totalSummary.total_carbohidratos || 0) +
                            (totalSummary.total_grasas || 0)
                          ).toFixed(1)}
                          g
                        </div>
                        <div
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Macronutrientes Totales
                        </div>
                      </div>
                      <Scale
                        className={`h-8 w-8 ${
                          darkMode ? "text-purple-500" : "text-purple-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Análisis Detallado */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Distribución de Macronutrientes */}
                  <div
                    className={`p-6 rounded-2xl border ${
                      darkMode
                        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                        : "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm"
                    }`}
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-emerald-500" />
                      Distribución de Macronutrientes Totales
                    </h3>

                    {totalSummary.total_comidas > 0 ? (
                      <div className="space-y-4">
                        {/* Barra de progreso para proteínas */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span
                              className={
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }
                            >
                              Proteínas
                            </span>
                            <span className="font-semibold text-red-500">
                              {(totalSummary.total_proteinas || 0).toFixed(1)}g
                            </span>
                          </div>
                          <div
                            className={`w-full h-2 rounded-full ${
                              darkMode ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className="h-2 rounded-full bg-red-500 transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  ((totalSummary.total_proteinas || 0) / 1000) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Barra de progreso para carbohidratos */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span
                              className={
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }
                            >
                              Carbohidratos
                            </span>
                            <span className="font-semibold text-yellow-500">
                              {(totalSummary.total_carbohidratos || 0).toFixed(
                                1
                              )}
                              g
                            </span>
                          </div>
                          <div
                            className={`w-full h-2 rounded-full ${
                              darkMode ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className="h-2 rounded-full bg-yellow-500 transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  ((totalSummary.total_carbohidratos || 0) /
                                    3000) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Barra de progreso para grasas */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span
                              className={
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }
                            >
                              Grasas
                            </span>
                            <span className="font-semibold text-blue-500">
                              {(totalSummary.total_grasas || 0).toFixed(1)}g
                            </span>
                          </div>
                          <div
                            className={`w-full h-2 rounded-full ${
                              darkMode ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  ((totalSummary.total_grasas || 0) / 700) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Promedio por comida */}
                        <div
                          className={`p-3 rounded-lg ${
                            darkMode ? "bg-gray-700" : "bg-gray-100"
                          }`}
                        >
                          <div className="text-center">
                            <div
                              className={`text-sm ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Promedio por comida
                            </div>
                            <div className="font-semibold text-emerald-500">
                              {totalSummary.promedio_calorias_por_comida.toFixed(
                                0
                              )}{" "}
                              calorías
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3
                          className={`h-12 w-12 mx-auto mb-3 ${
                            darkMode ? "text-gray-600" : "text-gray-400"
                          }`}
                        />
                        <p
                          className={
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }
                        >
                          No hay datos para mostrar
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Comidas por Tipo */}
                  <div
                    className={`p-6 rounded-2xl border ${
                      darkMode
                        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                        : "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm"
                    }`}
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-emerald-500" />
                      Comidas por Tipo (Total)
                    </h3>

                    {foodRecords.length > 0 ? (
                      <div className="space-y-3">
                        {[
                          "desayuno",
                          "almuerzo",
                          "comida",
                          "merienda",
                          "cena",
                          "snack",
                        ].map((tipo) => {
                          const count = foodRecords.filter(
                            (record) => record.tipo_comida === tipo
                          ).length;

                          if (count === 0) return null;

                          return (
                            <div
                              key={tipo}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${getMealTypeColor(
                                    tipo
                                  )} text-white`}
                                >
                                  {getMealTypeIcon(tipo)}
                                </div>
                                <span
                                  className={
                                    darkMode ? "text-gray-300" : "text-gray-700"
                                  }
                                >
                                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                </span>
                              </div>
                              <span
                                className={`font-semibold ${
                                  darkMode
                                    ? "text-emerald-400"
                                    : "text-emerald-600"
                                }`}
                              >
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Utensils
                          className={`h-12 w-12 mx-auto mb-3 ${
                            darkMode ? "text-gray-600" : "text-gray-400"
                          }`}
                        />
                        <p
                          className={
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }
                        >
                          No hay registros de comidas
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista Detallada de Todos los Registros */}
                <div
                  className={`p-6 rounded-2xl border ${
                    darkMode
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                      : "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm"
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <List className="h-5 w-5 mr-2 text-emerald-500" />
                    Detalle de Todos los Registros
                  </h3>

                  {foodRecords.length > 0 ? (
                    <div className="space-y-3">
                      {foodRecords.map((record) => {
                        const nutrients = getTotalNutrients(record.items);
                        return (
                          <div
                            key={record.id}
                            className={`p-4 rounded-lg border ${
                              darkMode
                                ? "border-gray-600 bg-gray-700/30"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${getMealTypeColor(
                                    record.tipo_comida
                                  )} text-white`}
                                >
                                  {getMealTypeIcon(record.tipo_comida)}
                                </div>
                                <div>
                                  <div className="font-semibold capitalize">
                                    {record.tipo_comida}
                                  </div>
                                  <div
                                    className={`text-sm ${
                                      darkMode
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {formatDate(record.fecha)} •{" "}
                                    {formatTime(record.fecha)} •{" "}
                                    {record.items?.length || 0} alimentos
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-emerald-500">
                                  {nutrients.calorias.toFixed(0)} cal
                                </div>
                                <div
                                  className={`text-xs ${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  P: {nutrients.proteinas.toFixed(1)}g • C:{" "}
                                  {nutrients.carbohidratos.toFixed(1)}g
                                </div>
                              </div>
                            </div>
                            {record.notas && (
                              <p
                                className={`mt-2 text-sm p-2 rounded ${
                                  darkMode
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {record.notas}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar
                        className={`h-12 w-12 mx-auto mb-3 ${
                          darkMode ? "text-gray-600" : "text-gray-400"
                        }`}
                      />
                      <p
                        className={darkMode ? "text-gray-400" : "text-gray-600"}
                      >
                        No hay registros para mostrar
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        <CreateFoodModal
          darkMode={darkMode}
          isOpen={showCreateFoodModal}
          onClose={() => setShowCreateFoodModal(false)}
          onCreate={handleCreateFood}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default NutritionManager;
