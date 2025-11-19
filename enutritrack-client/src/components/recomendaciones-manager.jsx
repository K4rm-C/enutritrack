import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Pill,
  Heart,
  Stethoscope,
  FileText,
  Calendar,
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
  MessageSquare,
  Bot,
  UserCheck,
  Sparkles,
  Tag,
  Layers,
} from "lucide-react";
import { useRecommendations } from "../context/recommendation/recommendation.context";
import { useUsers } from "../context/user/user.context";
import { useAuth } from "../context/auth/auth.context";
import { useTheme } from "../context/dark-mode.context";
import { toast } from "react-toastify";

const RecommendationsManager = () => {
  const {
    recommendations,
    loading,
    error,
    getRecommendationsByUser,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation,
    clearError,
    recommendationTypes,
    getRecommendationTypes,
    createRecommendationType,
    updateRecommendationType,
    deleteRecommendationType,
  } = useRecommendations();

  const { getUsersByDoctorId, getUserById } = useUsers();
  const { user } = useAuth();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [showPatientsDropdown, setShowPatientsDropdown] = useState(false);
  const [searchPatientTerm, setSearchPatientTerm] = useState("");

  const [activeTab, setActiveTab] = useState("activas");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [currentView, setCurrentView] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterType, setFilterType] = useState("");
  const { darkMode } = useTheme();

  // Nuevos estados para gestión de tipos
  const [activeSection, setActiveSection] = useState("recommendations");
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [currentTypeEdit, setCurrentTypeEdit] = useState(null);
  const [searchTypeTerm, setSearchTypeTerm] = useState("");

  // Cargar pacientes y tipos de recomendación al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadPatients();
      getRecommendationTypes();
    }
  }, [user?.id]);

  // Cargar recomendaciones cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient?.id) {
      loadRecommendations();
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

  const loadRecommendations = async () => {
    try {
      await getRecommendationsByUser(selectedPatient.id);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      if (error.response?.status !== 404) {
        toast.error("Error al cargar las recomendaciones del paciente");
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
      tipo_recomendacion_id: "",
      contenido: "",
      prioridad: "media",
      vigencia_hasta: "",
      activa: true,
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (recommendation) => {
    // Solo permitir editar recomendaciones creadas por el doctor
    if (recommendation.alerta_generadora_id || recommendation.cita_medica_id) {
      toast.info(
        "Esta recomendación no puede ser editada ya que fue generada automáticamente"
      );
      return;
    }

    setCurrentEdit({
      item: recommendation,
      isNew: false,
      tipo_recomendacion_id: recommendation.tipo_recomendacion_id,
      contenido: recommendation.contenido,
      prioridad: recommendation.prioridad || "media",
      vigencia_hasta: recommendation.vigencia_hasta
        ? recommendation.vigencia_hasta.split("T")[0]
        : "",
      activa: recommendation.activa,
    });
    setEditDialogOpen(true);
  };

  const handleView = (recommendation) => {
    setCurrentView(recommendation);
    setViewDialogOpen(true);
  };

  const handleDelete = async (recommendation) => {
    // Solo permitir eliminar recomendaciones creadas por el doctor
    if (recommendation.alerta_generadora_id || recommendation.cita_medica_id) {
      toast.info(
        "Esta recomendación no puede ser eliminada ya que fue generada automáticamente"
      );
      return;
    }

    if (
      window.confirm("¿Está seguro de que desea eliminar esta recomendación?")
    ) {
      try {
        await deleteRecommendation(recommendation.id);
        toast.success("Recomendación eliminada correctamente");
      } catch (error) {
        console.error("Error deleting recommendation:", error);
        toast.error("Error al eliminar la recomendación");
      }
    }
  };

  const buildRecommendationData = (formData, isNew) => {
    const baseData = {
      tipo_recomendacion_id: formData.tipo_recomendacion_id,
      contenido: formData.contenido,
      prioridad: formData.prioridad,
      vigencia_hasta: formData.vigencia_hasta
        ? new Date(formData.vigencia_hasta).toISOString()
        : null,
      activa: formData.activa,
    };

    if (isNew) {
      return {
        ...baseData,
        usuario_id: selectedPatient.id,
        cita_medica_id: null,
        alerta_generadora_id: null,
      };
    }

    return baseData;
  };

  const handleSaveRecommendation = async (formData) => {
    try {
      const recommendationData = buildRecommendationData(
        formData,
        currentEdit.isNew
      );

      if (currentEdit.isNew) {
        await createRecommendation(recommendationData);
        toast.success("Recomendación creada correctamente");
      } else {
        await updateRecommendation(currentEdit.item.id, recommendationData);
        toast.success("Recomendación actualizada correctamente");
      }

      setEditDialogOpen(false);
      setCurrentEdit(null);
    } catch (error) {
      console.error("Error saving recommendation:", error);
      toast.error("Error al guardar la recomendación");
    }
  };

  // ========== FUNCIONES PARA TIPOS DE RECOMENDACIÓN ==========

  const handleAddType = () => {
    setCurrentTypeEdit({
      item: null,
      isNew: true,
      nombre: "",
      descripcion: "",
      categoria: "",
    });
    setTypeDialogOpen(true);
  };

  const handleEditType = (type) => {
    setCurrentTypeEdit({
      item: type,
      isNew: false,
      nombre: type.nombre,
      descripcion: type.descripcion || "",
      categoria: type.categoria || "",
    });
    setTypeDialogOpen(true);
  };

  const handleDeleteType = async (type) => {
    if (
      window.confirm(
        `¿Está seguro de que desea eliminar el tipo "${type.nombre}"?`
      )
    ) {
      try {
        await deleteRecommendationType(type.id);
        toast.success("Tipo de recomendación eliminado correctamente");
      } catch (error) {
        console.error("Error deleting recommendation type:", error);
        toast.error("Error al eliminar el tipo de recomendación");
      }
    }
  };

  const handleSaveType = async (formData) => {
    try {
      if (currentTypeEdit.isNew) {
        await createRecommendationType(formData);
        toast.success("Tipo de recomendación creado correctamente");
      } else {
        await updateRecommendationType(currentTypeEdit.item.id, formData);
        toast.success("Tipo de recomendación actualizado correctamente");
      }
      setTypeDialogOpen(false);
      setCurrentTypeEdit(null);
    } catch (error) {
      console.error("Error saving recommendation type:", error);
      toast.error("Error al guardar el tipo de recomendación");
    }
  };

  // Funciones de utilidad
  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return "red";
      case "media":
        return "yellow";
      case "baja":
        return "green";
      default:
        return "gray";
    }
  };

  const getPriorityIcon = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return <AlertTriangle className="h-4 w-4" />;
      case "media":
        return <AlertCircle className="h-4 w-4" />;
      case "baja":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (tipoRecomendacion) => {
    if (!tipoRecomendacion) return <FileText className="h-4 w-4" />;

    const category = tipoRecomendacion.categoria?.toLowerCase();
    const nombre = tipoRecomendacion.nombre?.toLowerCase();

    if (category?.includes("dieta") || nombre?.includes("aliment")) {
      return <Pill className="h-4 w-4" />;
    } else if (
      category?.includes("ejercicio") ||
      nombre?.includes("actividad")
    ) {
      return <Heart className="h-4 w-4" />;
    } else if (
      category?.includes("medicamento") ||
      nombre?.includes("tratamiento")
    ) {
      return <Stethoscope className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  const getRecommendationSource = (recommendation) => {
    if (recommendation.alerta_generadora_id) {
      return {
        type: "alerta",
        icon: <AlertTriangle className="h-4 w-4" />,
        text: "Generada por alerta",
      };
    } else if (recommendation.cita_medica_id) {
      return {
        type: "cita",
        icon: <Calendar className="h-4 w-4" />,
        text: "Generada en cita",
      };
    } else {
      return {
        type: "doctor",
        icon: <UserCheck className="h-4 w-4" />,
        text: "Creada por doctor",
      };
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

  const isExpired = (vigencia_hasta) => {
    if (!vigencia_hasta) return false;
    return new Date(vigencia_hasta) < new Date();
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

  // Filtrar recomendaciones
  const filteredRecommendations = recommendations?.filter((rec) => {
    const matchesSearch =
      rec.contenido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.tipo_recomendacion?.nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesPriority = !filterPriority || rec.prioridad === filterPriority;
    const matchesType = !filterType || rec.tipo_recomendacion_id === filterType;

    // Filtro por pestaña activa
    const matchesTab =
      activeTab === "todas"
        ? true
        : activeTab === "activas"
        ? rec.activa && !isExpired(rec.vigencia_hasta)
        : activeTab === "inactivas"
        ? !rec.activa || isExpired(rec.vigencia_hasta)
        : true;

    return matchesSearch && matchesPriority && matchesType && matchesTab;
  });

  // Filtrar tipos de recomendación
  const filteredTypes = recommendationTypes?.filter((type) => {
    const matchesSearch =
      type.nombre?.toLowerCase().includes(searchTypeTerm.toLowerCase()) ||
      type.descripcion?.toLowerCase().includes(searchTypeTerm.toLowerCase()) ||
      type.categoria?.toLowerCase().includes(searchTypeTerm.toLowerCase());
    return matchesSearch;
  });

  // Estadísticas para el dashboard
  const recommendationStats = {
    total: recommendations?.length || 0,
    activas:
      recommendations?.filter(
        (rec) => rec.activa && !isExpired(rec.vigencia_hasta)
      ).length || 0,
    inactivas:
      recommendations?.filter(
        (rec) => !rec.activa || isExpired(rec.vigencia_hasta)
      ).length || 0,
    alta:
      recommendations?.filter((rec) => rec.prioridad === "alta").length || 0,
    expiradas:
      recommendations?.filter((rec) => isExpired(rec.vigencia_hasta)).length ||
      0,
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
              {activeSection === "recommendations"
                ? "Gestión de Recomendaciones"
                : "Tipos de Recomendación"}
            </h1>

            {/* Selector de sección */}
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setActiveSection("recommendations")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeSection === "recommendations"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Recomendaciones
              </button>
              <button
                onClick={() => setActiveSection("types")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeSection === "types"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Tipos de Recomendación
              </button>
            </div>

            {/* Selector de pacientes - solo mostrar en la sección de recomendaciones */}
            {activeSection === "recommendations" && (
              <div className="relative mt-4">
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
            )}
          </div>

          {activeSection === "recommendations" && (
            <button
              onClick={handleAddNew}
              disabled={!selectedPatient}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Recomendación
            </button>
          )}

          {activeSection === "types" && (
            <button
              onClick={handleAddType}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Tipo
            </button>
          )}
        </div>

        {/* Información del paciente seleccionado - solo en recomendaciones */}
        {activeSection === "recommendations" && selectedPatient && (
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
                <span>Modo Doctor - Gestión de recomendaciones</span>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas del paciente - solo en recomendaciones */}
        {activeSection === "recommendations" && selectedPatient && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
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
                    {recommendationStats.total}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total
                  </p>
                </div>
                <MessageSquare className="h-6 w-6 text-blue-500" />
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
                    {recommendationStats.activas}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Activas
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
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
                    {recommendationStats.inactivas}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Inactivas
                  </p>
                </div>
                <XCircle className="h-6 w-6 text-gray-500" />
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
                    {recommendationStats.alta}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Prioridad Alta
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
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
                    {recommendationStats.expiradas}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Expiradas
                  </p>
                </div>
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>

            <div
              className={`p-4 rounded-xl ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="text-center">
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {recommendations?.filter(
                    (rec) => getRecommendationSource(rec).type === "doctor"
                  ).length || 0}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Creadas por Doctor
                </p>
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

        {/* Sección de Recomendaciones */}
        {activeSection === "recommendations" && selectedPatient && (
          <>
            {/* Navigation Tabs y Filtros */}
            <div
              className={`p-6 rounded-2xl mb-8 ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    key: "todas",
                    label: "Todas",
                    icon: FileText,
                    count: recommendationStats.total,
                  },
                  {
                    key: "activas",
                    label: "Activas",
                    icon: CheckCircle,
                    count: recommendationStats.activas,
                  },
                  {
                    key: "inactivas",
                    label: "Inactivas",
                    icon: XCircle,
                    count: recommendationStats.inactivas,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                      activeTab === tab.key
                        ? darkMode
                          ? "bg-emerald-900/50 border border-emerald-700 text-emerald-300"
                          : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                        : darkMode
                        ? "border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        activeTab === tab.key
                          ? darkMode
                            ? "bg-emerald-800 text-emerald-200"
                            : "bg-emerald-200 text-emerald-800"
                          : darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}

                {/* Filtro de tipos de recomendación */}
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
                  {recommendationTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search and Filters */}
            <div
              className={`p-6 rounded-2xl mb-8 ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Buscar en recomendaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                      darkMode
                        ? "border-white/20 bg-white/10 text-white placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>

                {/* Priority Filter */}
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="">Todas las prioridades</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>

                {/* Add New Button */}
                <button
                  onClick={handleAddNew}
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nueva Recomendación
                </button>
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
                        Recomendación
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Prioridad
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Vencimiento
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Origen
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!filteredRecommendations ||
                    filteredRecommendations.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center">
                          <div
                            className={`flex flex-col items-center justify-center ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            <FileText className="h-12 w-12 mb-2 opacity-50" />
                            <p>No hay recomendaciones para este paciente</p>
                            <button
                              onClick={handleAddNew}
                              className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Crear la primera recomendación
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRecommendations.map((recommendation) => {
                        const source = getRecommendationSource(recommendation);
                        const isEditable = source.type === "doctor";
                        const isExpiredRec = isExpired(
                          recommendation.vigencia_hasta
                        );

                        return (
                          <tr
                            key={recommendation.id}
                            className={`border-b transition-colors ${
                              darkMode
                                ? "border-gray-700 hover:bg-gray-800/50"
                                : "border-gray-200 hover:bg-gray-50"
                            } ${isExpiredRec ? "opacity-60" : ""}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    darkMode ? "bg-blue-900/50" : "bg-blue-100"
                                  }`}
                                >
                                  {getTypeIcon(
                                    recommendation.tipo_recomendacion
                                  )}
                                </div>
                                <div className="max-w-md">
                                  <p
                                    className={`font-medium line-clamp-2 ${
                                      darkMode ? "text-white" : "text-gray-900"
                                    }`}
                                  >
                                    {recommendation.contenido}
                                  </p>
                                  <p
                                    className={`text-sm mt-1 ${
                                      darkMode
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {recommendation.tipo_recomendacion
                                      ?.nombre || "Sin tipo"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 text-sm rounded-full ${
                                  darkMode
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {recommendation.tipo_recomendacion?.nombre ||
                                  "No especificado"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {getPriorityIcon(recommendation.prioridad)}
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    getPriorityColor(
                                      recommendation.prioridad
                                    ) === "red"
                                      ? darkMode
                                        ? "bg-red-900/50 text-red-300"
                                        : "bg-red-100 text-red-800"
                                      : getPriorityColor(
                                          recommendation.prioridad
                                        ) === "yellow"
                                      ? darkMode
                                        ? "bg-yellow-900/50 text-yellow-300"
                                        : "bg-yellow-100 text-yellow-800"
                                      : darkMode
                                      ? "bg-green-900/50 text-green-300"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {recommendation.prioridad || "media"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  recommendation.activa && !isExpiredRec
                                    ? darkMode
                                      ? "bg-green-900/50 text-green-300"
                                      : "bg-green-100 text-green-800"
                                    : darkMode
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                {recommendation.activa && !isExpiredRec
                                  ? "Activa"
                                  : "Inactiva"}
                                {isExpiredRec && " (Expirada)"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p
                                className={`text-sm ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {recommendation.vigencia_hasta
                                  ? formatDate(recommendation.vigencia_hasta)
                                  : "Sin vencimiento"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`p-1 rounded ${
                                    darkMode ? "bg-gray-700" : "bg-gray-200"
                                  }`}
                                >
                                  {source.icon}
                                </div>
                                <span className="text-sm">{source.text}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p
                                className={`text-sm ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {formatDate(recommendation.fecha_generacion)}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleView(recommendation)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    darkMode
                                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                      : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                  }`}
                                  title="Ver recomendación"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {isEditable && (
                                  <>
                                    <button
                                      onClick={() => handleEdit(recommendation)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        darkMode
                                          ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                          : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                      }`}
                                      title="Editar recomendación"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDelete(recommendation)
                                      }
                                      className={`p-2 rounded-lg transition-colors ${
                                        darkMode
                                          ? "hover:bg-red-900/50 text-gray-400 hover:text-red-300"
                                          : "hover:bg-red-100 text-gray-500 hover:text-red-600"
                                      }`}
                                      title="Eliminar recomendación"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Sección de Tipos de Recomendación */}
        {activeSection === "types" && (
          <div className="space-y-6">
            {/* Búsqueda y filtros */}
            <div
              className={`p-6 rounded-2xl ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Buscar tipos..."
                    value={searchTypeTerm}
                    onChange={(e) => setSearchTypeTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                      darkMode
                        ? "border-white/20 bg-white/10 text-white placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Tabla de tipos */}
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
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Descripción
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Categoría
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!filteredTypes || filteredTypes.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center">
                          <div
                            className={`flex flex-col items-center justify-center ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            <Layers className="h-12 w-12 mb-2 opacity-50" />
                            <p>No hay tipos de recomendación registrados</p>
                            <button
                              onClick={handleAddType}
                              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Crear el primer tipo
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTypes.map((type) => (
                        <tr
                          key={type.id}
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
                                <Tag className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <p
                                  className={`font-medium ${
                                    darkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {type.nombre}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p
                              className={`text-sm ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {type.descripcion || "Sin descripción"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-sm rounded-full ${
                                darkMode
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {type.categoria || "Sin categoría"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditType(type)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode
                                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                }`}
                                title="Editar tipo"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteType(type)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode
                                    ? "hover:bg-red-900/50 text-gray-400 hover:text-red-300"
                                    : "hover:bg-red-100 text-gray-500 hover:text-red-600"
                                }`}
                                title="Eliminar tipo"
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
          </div>
        )}

        {/* Edit Dialog para recomendaciones */}
        {editDialogOpen && (
          <EditRecommendationDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSave={handleSaveRecommendation}
            currentEdit={currentEdit}
            recommendationTypes={recommendationTypes}
            darkMode={darkMode}
          />
        )}

        {/* View Dialog para recomendaciones */}
        {viewDialogOpen && (
          <ViewRecommendationDialog
            open={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            recommendation={currentView}
            darkMode={darkMode}
          />
        )}

        {/* Edit Dialog para tipos */}
        {typeDialogOpen && (
          <EditTypeDialog
            open={typeDialogOpen}
            onClose={() => setTypeDialogOpen(false)}
            onSave={handleSaveType}
            currentEdit={currentTypeEdit}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

// Componente para editar/crear recomendaciones
const EditRecommendationDialog = ({
  open,
  onClose,
  onSave,
  currentEdit,
  recommendationTypes,
  darkMode,
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentEdit) {
      setFormData({
        tipo_recomendacion_id: currentEdit.tipo_recomendacion_id || "",
        contenido: currentEdit.contenido || "",
        prioridad: currentEdit.prioridad || "media",
        vigencia_hasta: currentEdit.vigencia_hasta || "",
        activa: currentEdit.activa !== undefined ? currentEdit.activa : true,
      });
    }
  }, [currentEdit]);

  const handleSave = () => {
    if (!formData.tipo_recomendacion_id) {
      toast.error("El tipo de recomendación es requerido");
      return;
    }
    if (!formData.contenido) {
      toast.error("El contenido de la recomendación es requerido");
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
              <MessageSquare
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
                  ? "Crear Recomendación"
                  : "Editar Recomendación"}
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {currentEdit?.isNew
                  ? "Complete todos los campos requeridos"
                  : "Actualice la información de la recomendación"}
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
            {/* Tipo de Recomendación */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tipo de Recomendación *
              </label>
              <select
                value={formData.tipo_recomendacion_id || ""}
                onChange={(e) =>
                  handleChange("tipo_recomendacion_id", e.target.value)
                }
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              >
                <option value="">Seleccionar tipo...</option>
                {recommendationTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Contenido */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Contenido de la Recomendación *
              </label>
              <textarea
                value={formData.contenido || ""}
                onChange={(e) => handleChange("contenido", e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Describa la recomendación médica para el paciente..."
              />
            </div>

            {/* Prioridad y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Prioridad
                </label>
                <select
                  value={formData.prioridad || "media"}
                  onChange={(e) => handleChange("prioridad", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Estado
                </label>
                <select
                  value={formData.activa ? "true" : "false"}
                  onChange={(e) =>
                    handleChange("activa", e.target.value === "true")
                  }
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="true">Activa</option>
                  <option value="false">Inactiva</option>
                </select>
              </div>
            </div>

            {/* Vigencia */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Fecha de Vencimiento (Opcional)
              </label>
              <input
                type="date"
                value={formData.vigencia_hasta || ""}
                onChange={(e) => handleChange("vigencia_hasta", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              />
              <p
                className={`text-xs mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Si se especifica, la recomendación se marcará como expirada
                después de esta fecha
              </p>
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
              disabled={!formData.tipo_recomendacion_id || !formData.contenido}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentEdit?.isNew ? "Crear Recomendación" : "Actualizar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para visualizar recomendaciones
const ViewRecommendationDialog = ({
  open,
  onClose,
  recommendation,
  darkMode,
}) => {
  if (!open || !recommendation) return null;

  const source = recommendation.alerta_generadora_id
    ? {
        type: "alerta",
        icon: <AlertTriangle className="h-5 w-5" />,
        text: "Generada por alerta del sistema",
      }
    : recommendation.cita_medica_id
    ? {
        type: "cita",
        icon: <Calendar className="h-5 w-5" />,
        text: "Generada en cita médica",
      }
    : {
        type: "doctor",
        icon: <UserCheck className="h-5 w-5" />,
        text: "Creada manualmente por el doctor",
      };

  const isExpiredRec =
    recommendation.vigencia_hasta &&
    new Date(recommendation.vigencia_hasta) < new Date();

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
                Detalles de la Recomendación
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Información completa de la recomendación médica
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
            {/* Contenido */}
            <div>
              <label
                className={`block text-sm font-medium mb-3 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Recomendación
              </label>
              <div
                className={`p-4 rounded-xl ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {recommendation.contenido}
                </p>
              </div>
            </div>

            {/* Información detallada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Tipo de Recomendación
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {recommendation.tipo_recomendacion?.nombre ||
                    "No especificado"}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Prioridad
                </label>
                <div className="flex items-center space-x-2">
                  {recommendation.prioridad === "alta" ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : recommendation.prioridad === "media" ? (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span
                    className={darkMode ? "text-gray-200" : "text-gray-800"}
                  >
                    {recommendation.prioridad || "media"}
                  </span>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Estado
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      recommendation.activa && !isExpiredRec
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  />
                  <span
                    className={darkMode ? "text-gray-200" : "text-gray-800"}
                  >
                    {recommendation.activa && !isExpiredRec
                      ? "Activa"
                      : "Inactiva"}
                    {isExpiredRec && " (Expirada)"}
                  </span>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Origen
                </label>
                <div className="flex items-center space-x-2">
                  {source.icon}
                  <span
                    className={darkMode ? "text-gray-200" : "text-gray-800"}
                  >
                    {source.text}
                  </span>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Fecha de Generación
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {new Date(recommendation.fecha_generacion).toLocaleDateString(
                    "es-ES",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Vencimiento
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {recommendation.vigencia_hasta
                    ? new Date(
                        recommendation.vigencia_hasta
                      ).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Sin vencimiento"}
                  {isExpiredRec && (
                    <span className="text-red-500 text-sm ml-2">
                      (Expirada)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Datos adicionales si existen */}
            {recommendation.recomendacion_datos &&
              recommendation.recomendacion_datos.length > 0 && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-3 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Datos Adicionales
                  </label>
                  <div
                    className={`p-4 rounded-xl ${
                      darkMode ? "bg-gray-700/50" : "bg-gray-50"
                    }`}
                  >
                    {recommendation.recomendacion_datos.map((dato, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 border-b border-gray-600/30 last:border-b-0"
                      >
                        <span
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          {dato.clave}:
                        </span>
                        <span
                          className={
                            darkMode ? "text-gray-200" : "text-gray-800"
                          }
                        >
                          {dato.valor}
                        </span>
                      </div>
                    ))}
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

// Componente para editar/crear tipos de recomendación
const EditTypeDialog = ({ open, onClose, onSave, currentEdit, darkMode }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentEdit) {
      setFormData({
        nombre: currentEdit.nombre || "",
        descripcion: currentEdit.descripcion || "",
        categoria: currentEdit.categoria || "",
      });
    }
  }, [currentEdit]);

  const handleSave = () => {
    if (!formData.nombre) {
      toast.error("El nombre es requerido");
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div
        className={`max-w-md w-full rounded-2xl overflow-hidden shadow-2xl ${
          darkMode
            ? "bg-gradient-to-b from-gray-800 to-gray-900"
            : "bg-gradient-to-b from-white to-gray-50"
        } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      >
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
              <Tag
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
                {currentEdit?.isNew ? "Crear Tipo" : "Editar Tipo"}
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {currentEdit?.isNew
                  ? "Complete los datos del tipo de recomendación"
                  : "Actualice la información del tipo"}
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

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre || ""}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                placeholder="Ej: Recomendación Nutricional"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Descripción
              </label>
              <textarea
                value={formData.descripcion || ""}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Descripción del tipo de recomendación..."
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
                value={formData.categoria || ""}
                onChange={(e) => handleChange("categoria", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                placeholder="Ej: Nutrición, Ejercicio, Medicación"
              />
            </div>
          </div>

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
              disabled={!formData.nombre}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentEdit?.isNew ? "Crear Tipo" : "Actualizar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsManager;
