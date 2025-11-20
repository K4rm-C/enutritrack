import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  Clock,
  User,
  Eye,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Shield,
  Loader,
  Activity,
  Flame,
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { usePhysicalActivity } from "../context/activity/activity.context";
import { useUsers } from "../context/user/user.context";
import { useTheme } from "../context/dark-mode.context";
import { useAuth } from "../context/auth/auth.context";
import { toast } from "react-toastify";

const PhysicalActivityManager = () => {
  const {
    physicalActivities,
    loading,
    error,
    getPhysicalActivitiesByUser,
    createPhysicalActivity,
    updatePhysicalActivity,
    deletePhysicalActivity,
    clearError,
    activityTypes,
    getActivityTypes,
  } = usePhysicalActivity();

  const { getUsersByDoctorId, getUserById } = useUsers();
  const { user } = useAuth();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [showPatientsDropdown, setShowPatientsDropdown] = useState(false);
  const [searchPatientTerm, setSearchPatientTerm] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [currentView, setCurrentView] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const { darkMode } = useTheme();

  // Cargar pacientes y tipos de actividad al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadPatients();
      getActivityTypes();
    }
  }, [user?.id]);

  // Cargar actividades cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient?.id) {
      loadPhysicalActivities();
    }
  }, [selectedPatient]);

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

  const loadPhysicalActivities = async () => {
    try {
      console.log("Cargando actividades para paciente:", selectedPatient.id);
      await getPhysicalActivitiesByUser(selectedPatient.id);
      console.log("Actividades cargadas:", physicalActivities);
    } catch (error) {
      console.error("Error loading physical activities:", error);
      if (error.response?.status !== 404) {
        toast.error("Error al cargar las actividades físicas del paciente");
      }
    }
  };

  // Función auxiliar para obtener el nombre del paciente
  const getPatientName = (patient) => {
    if (!patient) return "Nombre no disponible";
    if (typeof patient === "string") return patient;
    if (typeof patient === "object") {
      return (
        patient.nombre ||
        patient.name ||
        patient.fullName ||
        patient.nombreCompleto ||
        "Nombre no disponible"
      );
    }
    return "Nombre no disponible";
  };

  // Función auxiliar para obtener el email del paciente
  const getPatientEmail = (patient) => {
    if (!patient) return "Email no disponible";
    if (typeof patient === "string") return patient;
    if (typeof patient === "object") {
      return (
        patient.email || patient.correo || patient.mail || "Email no disponible"
      );
    }
    return "Email no disponible";
  };

  const handleSelectPatient = async (patient) => {
    try {
      const patientDetails = await getUserById(patient.id);
      setSelectedPatient(patientDetails);
      setShowPatientsDropdown(false);
      setSearchPatientTerm("");
    } catch (error) {
      console.error("Error loading patient details:", error);
      toast.error("Error al cargar los detalles del paciente");
    }
  };

  const handleAddNew = () => {
    if (!selectedPatient) {
      toast.error("Por favor seleccione un paciente primero");
      return;
    }
    setCurrentEdit({
      item: null,
      isNew: true,
      tipo_actividad_id: "",
      duracion_min: 30,
      intensidad: "moderada",
      calorias_quemadas: "",
      notas: "",
      fecha: new Date().toISOString().split("T")[0],
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (activity) => {
    setCurrentEdit({
      item: activity,
      isNew: false,
      tipo_actividad_id: activity.tipo_actividad_id,
      duracion_min: activity.duracion_min,
      intensidad: activity.intensidad || "moderada",
      calorias_quemadas: activity.calorias_quemadas,
      notas: activity.notas || "",
      fecha: activity.fecha
        ? activity.fecha.split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setEditDialogOpen(true);
  };

  const handleView = (activity) => {
    setCurrentView(activity);
    setViewDialogOpen(true);
  };

  const handleDelete = async (activity) => {
    if (
      window.confirm(
        "¿Está seguro de que desea eliminar esta actividad física?"
      )
    ) {
      try {
        await deletePhysicalActivity(activity.id);
        toast.success("Actividad física eliminada correctamente");
      } catch (error) {
        console.error("Error deleting physical activity:", error);
        toast.error("Error al eliminar la actividad física");
      }
    }
  };

  const handleSaveActivity = async (formData) => {
    try {
      // Datos base para ambos casos (crear y actualizar)
      const baseActivityData = {
        tipo_actividad_id: formData.tipo_actividad_id,
        duracion_min: formData.duracion_min,
        intensidad: formData.intensidad,
        calorias_quemadas:
          formData.calorias_quemadas && formData.calorias_quemadas !== ""
            ? Number(formData.calorias_quemadas)
            : undefined,
        notas: formData.notas,
        fecha: new Date(formData.fecha).toISOString(),
      };

      if (currentEdit.isNew) {
        // Para crear: incluir usuario_id
        const activityData = {
          ...baseActivityData,
          usuario_id: selectedPatient.id,
        };
        await createPhysicalActivity(activityData);
        toast.success("Actividad física registrada correctamente");
      } else {
        // Para actualizar: NO incluir usuario_id
        await updatePhysicalActivity(currentEdit.item.id, baseActivityData);
        toast.success("Actividad física actualizada correctamente");
      }

      // Recargar la lista de actividades
      await loadPhysicalActivities();

      setEditDialogOpen(false);
      setCurrentEdit(null);
    } catch (error) {
      console.error("Error saving physical activity:", error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("Error al guardar la actividad física");
      }
    }
  };

  // Funciones de utilidad
  const getIntensityColor = (intensidad) => {
    switch (intensidad) {
      case "leve":
        return "green";
      case "moderada":
        return "yellow";
      case "intensa":
        return "red";
      default:
        return "gray";
    }
  };

  const getIntensityIcon = (intensidad) => {
    switch (intensidad) {
      case "leve":
        return <CheckCircle className="h-4 w-4" />;
      case "moderada":
        return <AlertCircle className="h-4 w-4" />;
      case "intensa":
        return <Flame className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES");
    } catch {
      return "Fecha inválida";
    }
  };

  // Filtrar pacientes basados en búsqueda
  const filteredPatients = patients.filter((patient) => {
    const patientName = getPatientName(patient).toLowerCase();
    const patientEmail = getPatientEmail(patient).toLowerCase();
    const searchTermLower = searchPatientTerm.toLowerCase();

    return (
      patientName.includes(searchTermLower) ||
      patientEmail.includes(searchTermLower)
    );
  });

  // Filtrar actividades físicas
  const filteredActivities = physicalActivities?.filter((activity) => {
    const matchesSearch =
      activity.tipo_actividad?.nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      activity.notas?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      !filterType || activity.tipo_actividad_id === filterType;

    // Filtro por fecha
    const activityDate = new Date(activity.fecha);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    const matchesDate =
      (!startDate || activityDate >= startDate) &&
      (!endDate || activityDate <= endDate);

    return matchesSearch && matchesType && matchesDate;
  });

  // Estadísticas para el dashboard
  const activityStats = {
    total: physicalActivities?.length || 0,
    thisWeek:
      physicalActivities?.filter((act) => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(act.fecha) >= oneWeekAgo;
      }).length || 0,
    totalCalories:
      physicalActivities?.reduce(
        (sum, act) => sum + parseFloat(act.calorias_quemadas || 0),
        0
      ) || 0,
    averageDuration: physicalActivities?.length
      ? physicalActivities.reduce((sum, act) => sum + act.duracion_min, 0) /
        physicalActivities.length
      : 0,
  };

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
          <div
            className={`animate-spin rounded-full h-12 w-12 border-2 ${
              darkMode
                ? "border-emerald-400 border-t-transparent"
                : "border-emerald-600 border-t-transparent"
            }`}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con selector de pacientes */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-2xl">
            <h1
              className={`text-4xl font-bold mb-2 tracking-tight ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Gestión de Actividad Física
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
                  {/* Búsqueda de pacientes */}
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

                  {/* Lista de pacientes */}
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

          <button
            onClick={handleAddNew}
            disabled={!selectedPatient}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Actividad
          </button>
        </div>

        {/* Información del paciente seleccionado */}
        {selectedPatient && (
          <div
            className={`p-6 rounded-2xl mb-8 ${
              darkMode
                ? "bg-white/5 border border-white/10"
                : "bg-white border border-gray-200/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    darkMode
                      ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                      : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  }`}
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
                  </div>
                </div>
              </div>
              <div
                className={`flex items-center space-x-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Modo Doctor - Gestión de actividad física</span>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas del paciente */}
        {selectedPatient && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div
              className={`p-4 rounded-xl ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {activityStats.total}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total Actividades
                  </p>
                </div>
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            </div>

            <div
              className={`p-4 rounded-xl ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {activityStats.thisWeek}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Esta Semana
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>

            <div
              className={`p-4 rounded-xl ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {Math.round(activityStats.totalCalories)}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Calorías Quemadas
                  </p>
                </div>
                <Flame className="h-6 w-6 text-red-500" />
              </div>
            </div>

            <div
              className={`p-4 rounded-xl ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {Math.round(activityStats.averageDuration)}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Promedio (min)
                  </p>
                </div>
                <Clock className="h-6 w-6 text-purple-500" />
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
                <AlertCircle className="h-5 w-5" />
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

        {/* Filtros - Solo mostrar si hay paciente seleccionado */}
        {selectedPatient && (
          <>
            <div
              className={`p-6 rounded-2xl mb-8 ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Buscar actividades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                      darkMode
                        ? "border-white/20 bg-white/10 text-white placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>

                {/* Tipo de actividad */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="">Todos los tipos</option>
                  {activityTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nombre}
                    </option>
                  ))}
                </select>

                {/* Fecha inicio */}
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                  placeholder="Fecha inicio"
                />

                {/* Fecha fin */}
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                  placeholder="Fecha fin"
                />
              </div>
            </div>

            {/* Table */}
            <div
              className={`rounded-2xl overflow-hidden ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={darkMode ? "bg-gray-800/50" : "bg-gray-50"}>
                      <th className="px-6 py-4 text-left font-semibold">
                        Actividad
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Duración
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Intensidad
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Calorías
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Notas
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!filteredActivities || filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center">
                          <div
                            className={`flex flex-col items-center justify-center ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            <Activity className="h-12 w-12 mb-2 opacity-50" />
                            <p>No hay actividades físicas registradas</p>
                            <button
                              onClick={handleAddNew}
                              className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Registrar la primera actividad
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map((activity) => (
                        <tr
                          key={activity.id}
                          className={`border-b transition-colors ${
                            darkMode
                              ? "border-gray-700 hover:bg-gray-800/50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  darkMode ? "bg-blue-900/50" : "bg-blue-100"
                                }`}
                              >
                                <Activity className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <p
                                  className={`font-medium ${
                                    darkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {activity.tipo_actividad?.nombre ||
                                    "Actividad sin nombre"}
                                </p>
                                <p
                                  className={`text-sm ${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  {activity.tipo_actividad?.categoria ||
                                    "Sin categoría"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p
                              className={
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }
                            >
                              {activity.duracion_min} min
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {getIntensityIcon(activity.intensidad)}
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  getIntensityColor(activity.intensidad) ===
                                  "green"
                                    ? darkMode
                                      ? "bg-green-900/50 text-green-300"
                                      : "bg-green-100 text-green-800"
                                    : getIntensityColor(activity.intensidad) ===
                                      "yellow"
                                    ? darkMode
                                      ? "bg-yellow-900/50 text-yellow-300"
                                      : "bg-yellow-100 text-yellow-800"
                                    : darkMode
                                    ? "bg-red-900/50 text-red-300"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {activity.intensidad || "moderada"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p
                              className={
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }
                            >
                              {activity.calorias_quemadas} cal
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p
                              className={
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }
                            >
                              {formatDate(activity.fecha)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p
                              className={`text-sm max-w-xs truncate ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {activity.notas || "Sin notas"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleView(activity)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode
                                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                }`}
                                title="Ver actividad"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(activity)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode
                                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                }`}
                                title="Editar actividad"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(activity)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode
                                    ? "hover:bg-red-900/50 text-gray-400 hover:text-red-300"
                                    : "hover:bg-red-100 text-gray-500 hover:text-red-600"
                                }`}
                                title="Eliminar actividad"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Edit Dialog */}
        {editDialogOpen && (
          <EditActivityDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSave={handleSaveActivity}
            currentEdit={currentEdit}
            activityTypes={activityTypes}
            darkMode={darkMode}
          />
        )}

        {/* View Dialog */}
        {viewDialogOpen && (
          <ViewActivityDialog
            open={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            activity={currentView}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

// Componente para editar/crear actividades
const EditActivityDialog = ({
  open,
  onClose,
  onSave,
  currentEdit,
  activityTypes,
  darkMode,
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentEdit) {
      setFormData({
        tipo_actividad_id: currentEdit.tipo_actividad_id || "",
        duracion_min: currentEdit.duracion_min || 30,
        intensidad: currentEdit.intensidad || "moderada",
        calorias_quemadas: currentEdit.calorias_quemadas || "",
        notas: currentEdit.notas || "",
        fecha: currentEdit.fecha || new Date().toISOString().split("T")[0],
      });
    }
  }, [currentEdit]);

  const handleSave = () => {
    if (!formData.tipo_actividad_id) {
      toast.error("El tipo de actividad es requerido");
      return;
    }
    if (!formData.duracion_min || formData.duracion_min <= 0) {
      toast.error("La duración debe ser mayor a 0");
      return;
    }
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calcular calorías estimadas basado en el tipo de actividad y duración
  const calculateCalories = () => {
    if (formData.tipo_actividad_id && formData.duracion_min) {
      const activityType = activityTypes?.find(
        (type) => type.id === formData.tipo_actividad_id
      );
      if (activityType && activityType.met_value) {
        // Fórmula simplificada: MET * peso * tiempo (asumiendo peso promedio de 70kg)
        const estimatedCalories = (
          (activityType.met_value * 70 * formData.duracion_min) /
          60
        ).toFixed(2);
        handleChange("calorias_quemadas", estimatedCalories);
      }
    }
  };

  // Efecto para calcular calorías cuando cambia el tipo o duración
  useEffect(() => {
    calculateCalories();
  }, [formData.tipo_actividad_id, formData.duracion_min]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div
        className={`max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl ${
          darkMode
            ? "bg-gradient-to-b from-gray-800 to-gray-900"
            : "bg-gradient-to-b from-white to-gray-50"
        } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        {/* Header del modal */}
        <div
          className={`px-6 py-4 border-b ${
            darkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          } flex items-center justify-between`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                darkMode ? "bg-emerald-700" : "bg-emerald-100"
              }`}
            >
              <Activity
                className={`h-6 w-6 ${
                  darkMode ? "text-emerald-200" : "text-emerald-700"
                }`}
              />
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {currentEdit?.isNew
                  ? "Registrar Actividad"
                  : "Editar Actividad"}
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {currentEdit?.isNew
                  ? "Complete los datos de la actividad física"
                  : "Actualice la información de la actividad"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Tipo de Actividad */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tipo de Actividad *
              </label>
              <select
                value={formData.tipo_actividad_id || ""}
                onChange={(e) =>
                  handleChange("tipo_actividad_id", e.target.value)
                }
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              >
                <option value="">Seleccionar tipo...</option>
                {activityTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nombre} (MET: {type.met_value})
                  </option>
                ))}
              </select>
            </div>

            {/* Duración e Intensidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Duración (minutos) *
                </label>
                <input
                  type="number"
                  value={formData.duracion_min || ""}
                  onChange={(e) =>
                    handleChange("duracion_min", parseInt(e.target.value))
                  }
                  min="1"
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Intensidad
                </label>
                <select
                  value={formData.intensidad || "moderada"}
                  onChange={(e) => handleChange("intensidad", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="leve">Leve</option>
                  <option value="moderada">Moderada</option>
                  <option value="intensa">Intensa</option>
                </select>
              </div>
            </div>

            {/* Calorías y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Calorías Quemadas
                </label>
                <input
                  type="number"
                  value={formData.calorias_quemadas || ""}
                  onChange={(e) =>
                    handleChange(
                      "calorias_quemadas",
                      parseFloat(e.target.value)
                    )
                  }
                  step="0.01"
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.fecha || ""}
                  onChange={(e) => handleChange("fecha", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Notas
              </label>
              <textarea
                value={formData.notas || ""}
                onChange={(e) => handleChange("notas", e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Notas adicionales sobre la actividad..."
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                darkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.tipo_actividad_id || !formData.duracion_min}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentEdit?.isNew ? "Registrar Actividad" : "Actualizar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para visualizar actividades
const ViewActivityDialog = ({ open, onClose, activity, darkMode }) => {
  if (!open || !activity) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div
        className={`max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl ${
          darkMode
            ? "bg-gradient-to-b from-gray-800 to-gray-900"
            : "bg-gradient-to-b from-white to-gray-50"
        } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        {/* Header del modal */}
        <div
          className={`px-6 py-4 border-b ${
            darkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          } flex items-center justify-between`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                darkMode ? "bg-blue-700" : "bg-blue-100"
              }`}
            >
              <Eye
                className={`h-6 w-6 ${
                  darkMode ? "text-blue-200" : "text-blue-700"
                }`}
              />
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Detalles de la Actividad
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Información completa de la actividad física
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Tipo de Actividad
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {activity.tipo_actividad?.nombre || "No especificado"}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Categoría
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {activity.tipo_actividad?.categoria || "No especificada"}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Duración
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {activity.duracion_min} minutos
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Intensidad
                </label>
                <div className="flex items-center space-x-2">
                  {activity.intensidad === "leve" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : activity.intensidad === "moderada" ? (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Flame className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={darkMode ? "text-gray-200" : "text-gray-800"}
                  >
                    {activity.intensidad || "moderada"}
                  </span>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Calorías Quemadas
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {activity.calorias_quemadas} calorías
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Fecha
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {new Date(activity.fecha).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* MET Value */}
            {activity.tipo_actividad?.met_value && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Valor MET
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {activity.tipo_actividad.met_value} (Equivalente metabólico)
                </p>
              </div>
            )}

            {/* Notas */}
            {activity.notas && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Notas
                </label>
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                    {activity.notas}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botón de cierre */}
          <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicalActivityManager;
