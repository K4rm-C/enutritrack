import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  AlertTriangle,
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
  Bell,
  AlertOctagon,
  CheckSquare,
  Clock,
  Calendar,
} from "lucide-react";
import { useAlerts } from "../context/alertas/alertas.context";
import { useUsers } from "../context/user/user.context";
import { useAuth } from "../context/auth/auth.context";
import { useTheme } from "../context/dark-mode.context";
import { toast } from "react-toastify";

const AlertsManager = () => {
  const {
    alerts,
    loading,
    error,
    getAlertsByUser,
    createAlert,
    updateAlert,
    deleteAlert,
    clearError,
    alertTypes,
    getAlertTypes,
    alertCategories,
    getAlertCategories,
    priorityLevels,
    getPriorityLevels,
    alertStates,
    getAlertStates,
    takeActionOnAlert,
  } = useAlerts();

  const { getUsersByDoctorId, getUserById } = useUsers();
  const { user } = useAuth();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [showPatientsDropdown, setShowPatientsDropdown] = useState(false);
  const [searchPatientTerm, setSearchPatientTerm] = useState("");

  const [activeTab, setActiveTab] = useState("pendientes");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [currentView, setCurrentView] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const { darkMode } = useTheme();

  // Cargar pacientes y datos de alertas al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadPatients();
      getAlertTypes();
      getAlertCategories();
      getPriorityLevels();
      getAlertStates();
    }
  }, [user?.id]);

  // Agrega este useEffect para debuggear
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      console.log("=== DEBUG ESTADOS DE ALERTAS ===");
      alerts.forEach((alert) => {
        console.log(`Alerta: "${alert.titulo}"`, {
          estado_id: alert.estado_alerta_id,
          estado_nombre: alert.estado_alerta?.nombre,
          fecha_resolucion: alert.fecha_resolucion,
          es_resuelta_por_fecha: alert.fecha_resolucion !== null,
          es_resuelta_por_estado: alert.estado_alerta?.nombre
            ?.toLowerCase()
            .includes("resuelta"),
        });
      });
    }
  }, [alerts]);

  // Cargar alertas cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient?.id) {
      loadAlerts();
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

  const loadAlerts = async () => {
    try {
      await getAlertsByUser(selectedPatient.id);
    } catch (error) {
      console.error("Error loading alerts:", error);
      if (error.response?.status !== 404) {
        toast.error("Error al cargar las alertas del paciente");
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
      tipo_alerta_id: "",
      nivel_prioridad_id: "",
      estado_alerta_id: "",
      titulo: "",
      mensaje: "",
      notas_resolucion: "",
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (alert) => {
    // Solo permitir editar alertas no resueltas
    if (alert.fecha_resolucion) {
      toast.info("No se puede editar una alerta ya resuelta");
      return;
    }

    setCurrentEdit({
      item: alert,
      isNew: false,
      tipo_alerta_id: alert.tipo_alerta_id,
      nivel_prioridad_id: alert.nivel_prioridad_id,
      estado_alerta_id: alert.estado_alerta_id,
      titulo: alert.titulo,
      mensaje: alert.mensaje,
      notas_resolucion: alert.notas_resolucion || "",
    });
    setEditDialogOpen(true);
  };

  const handleView = (alert) => {
    setCurrentView(alert);
    setViewDialogOpen(true);
  };

  const handleTakeAction = (alert) => {
    setCurrentAction(alert);
    setActionDialogOpen(true);
  };

  const handleDelete = async (alert) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta alerta?")) {
      try {
        await deleteAlert(alert.id);
        toast.success("Alerta eliminada correctamente");
      } catch (error) {
        console.error("Error deleting alert:", error);
        toast.error("Error al eliminar la alerta");
      }
    }
  };
  const getResolvedStateId = () => {
    if (!alertStates || !Array.isArray(alertStates)) {
      console.warn("alertStates no está disponible");
      return null;
    }

    const resolvedState = alertStates.find(
      (state) => state.nombre && state.nombre.toLowerCase().includes("resuelta")
    );

    if (!resolvedState) {
      console.warn(
        'Estado "Resuelta" no encontrado. Estados disponibles:',
        alertStates
      );
    }

    return resolvedState?.id;
  };

  const handleSaveAlert = async (formData) => {
    try {
      if (currentEdit.isNew) {
        // CREAR NUEVA ALERTA
        const newAlertData = {
          usuario_id: selectedPatient.id,
          doctor_id: user.id,
          tipo_alerta_id: formData.tipo_alerta_id,
          nivel_prioridad_id: formData.nivel_prioridad_id,
          estado_alerta_id: formData.estado_alerta_id,
          titulo: formData.titulo,
          mensaje: formData.mensaje,
          notas_resolucion: formData.notas_resolucion,
          fecha_deteccion: new Date(),
        };
        await createAlert(newAlertData);
        toast.success("Alerta creada correctamente");
      } else {
        // ACTUALIZAR ALERTA EXISTENTE
        const resolvedStateId = getResolvedStateId();
        const isResolving = formData.estado_alerta_id === resolvedStateId;

        console.log("=== DEBUG ACTUALIZACIÓN ===", {
          resolvedStateId,
          isResolving,
          estadoActual: currentEdit.estado_alerta_id,
          nuevoEstado: formData.estado_alerta_id,
        });

        // Solo campos permitidos en UpdateAlertDto
        const updateData = {
          estado_alerta_id: formData.estado_alerta_id,
          titulo: formData.titulo,
          mensaje: formData.mensaje,
          notas_resolucion: formData.notas_resolucion,
        };

        // Si el nuevo estado es "Resuelta", establecer fecha_resolucion
        if (isResolving && resolvedStateId) {
          updateData.fecha_resolucion = new Date();
          updateData.resuelta_por = user.id;
          console.log(
            "Marcando como resuelta con fecha:",
            updateData.fecha_resolucion
          );
        } else if (!isResolving && currentEdit.item.fecha_resolucion) {
          // Si estaba resuelta pero ahora no, limpiar fecha_resolucion
          updateData.fecha_resolucion = null;
          updateData.resuelta_por = null;
          console.log("Limpiando fecha de resolución");
        }

        await updateAlert(currentEdit.item.id, updateData);
        toast.success("Alerta actualizada correctamente");
      }

      setEditDialogOpen(false);
      setCurrentEdit(null);
    } catch (error) {
      console.error("Error saving alert:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Error al guardar la alerta");
    }
  };

  const handleSaveAction = async (actionData) => {
    try {
      // Primero registrar la acción
      await takeActionOnAlert(currentAction.id, {
        doctor_id: user.id,
        accion_tomada: actionData.accion_tomada,
        descripcion: actionData.descripcion,
      });

      // Si se marca como resuelta, actualizar el estado Y la fecha
      if (actionData.resolver) {
        const resolvedStateId = getResolvedStateId();
        if (resolvedStateId) {
          await updateAlert(currentAction.id, {
            estado_alerta_id: resolvedStateId,
            fecha_resolucion: new Date(),
            resuelta_por: user.id,
            notas_resolucion: actionData.descripcion,
          });
          console.log(
            "Alerta marcada como resuelta con estado ID:",
            resolvedStateId
          );
        } else {
          console.error('No se pudo encontrar el estado "Resuelta"');
          toast.warning('No se pudo encontrar el estado "Resuelta"');
        }
      }

      toast.success("Acción registrada correctamente");
      setActionDialogOpen(false);
      setCurrentAction(null);
    } catch (error) {
      console.error("Error saving action:", error);
      toast.error("Error al registrar la acción");
    }
  };

  // Funciones de utilidad
  const getPriorityColor = (nivelPrioridad) => {
    if (!nivelPrioridad) return "gray";

    const level = nivelPrioridad.nivel_numerico;
    if (level >= 4) return "red";
    if (level >= 3) return "orange";
    if (level >= 2) return "yellow";
    return "green";
  };

  const getPriorityIcon = (nivelPrioridad) => {
    if (!nivelPrioridad) return <AlertCircle className="h-4 w-4" />;

    const level = nivelPrioridad.nivel_numerico;
    if (level >= 4) return <AlertOctagon className="h-4 w-4" />;
    if (level >= 3) return <AlertTriangle className="h-4 w-4" />;
    if (level >= 2) return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStateColor = (estadoAlerta) => {
    if (!estadoAlerta) return "gray";

    const state = estadoAlerta.nombre.toLowerCase();
    if (state.includes("resuelta")) return "green";
    if (state.includes("pendiente")) return "yellow";
    if (state.includes("en progreso")) return "blue";
    if (state.includes("critica")) return "red";
    return "gray";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES");
    } catch {
      return "Fecha inválida";
    }
  };

  const isResolved = (alert) => {
    // Verificar por fecha de resolución Y por estado
    const porFecha = alert.fecha_resolucion !== null;
    const porEstado = alert.estado_alerta?.nombre
      ?.toLowerCase()
      .includes("resuelta");

    console.log(`Alerta "${alert.titulo}":`, {
      porFecha,
      porEstado,
      fecha_resolucion: alert.fecha_resolucion,
      estado: alert.estado_alerta?.nombre,
    });

    return porFecha || porEstado;
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

  // Filtrar alertas
  const filteredAlerts = alerts?.filter((alert) => {
    const matchesSearch =
      alert.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.mensaje?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      !filterPriority || alert.nivel_prioridad_id === filterPriority;
    const matchesType = !filterType || alert.tipo_alerta_id === filterType;
    const matchesCategory =
      !filterCategory || alert.tipo_alerta?.categoria_id === filterCategory;

    // Filtro por pestaña activa
    const matchesTab =
      activeTab === "todas"
        ? true
        : activeTab === "pendientes"
        ? !isResolved(alert)
        : activeTab === "resueltas"
        ? isResolved(alert)
        : true;

    return (
      matchesSearch &&
      matchesPriority &&
      matchesType &&
      matchesCategory &&
      matchesTab
    );
  });

  // Estadísticas para el dashboard
  // Estadísticas para el dashboard - usa la misma lógica que isResolved
  const alertStats = {
    total: alerts?.length || 0,
    pendientes: alerts?.filter((alert) => !isResolved(alert)).length || 0,
    resueltas: alerts?.filter((alert) => isResolved(alert)).length || 0,
    alta:
      alerts?.filter((alert) => alert.nivel_prioridad?.nivel_numerico >= 4)
        .length || 0,
    criticas:
      alerts?.filter((alert) =>
        alert.estado_alerta?.nombre?.toLowerCase().includes("critica")
      ).length || 0,
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
              Gestión de Alertas
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
            Nueva Alerta
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
                <span>Modo Doctor - Gestión de alertas</span>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas del paciente */}
        {selectedPatient && (
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
                    {alertStats.total}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total Alertas
                  </p>
                </div>
                <Bell className="h-6 w-6 text-blue-500" />
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
                    {alertStats.pendientes}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Pendientes
                  </p>
                </div>
                <AlertCircle className="h-6 w-6 text-yellow-500" />
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
                    {alertStats.resueltas}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Resueltas
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
                    {alertStats.alta}
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
                    {alertStats.criticas}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Críticas
                  </p>
                </div>
                <AlertOctagon className="h-6 w-6 text-purple-500" />
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
                  {alerts?.filter((alert) => !alert.doctor_id).length || 0}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Sin Asignar
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

        {/* Navigation Tabs y Filtros - Solo mostrar si hay paciente seleccionado */}
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
                {[
                  {
                    key: "todas",
                    label: "Todas",
                    icon: Bell,
                    count: alertStats.total,
                  },
                  {
                    key: "pendientes",
                    label: "Pendientes",
                    icon: AlertCircle,
                    count: alertStats.pendientes,
                  },
                  {
                    key: "resueltas",
                    label: "Resueltas",
                    icon: CheckCircle,
                    count: alertStats.resueltas,
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

                {/* Filtro de categorías */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="">Todas las categorías</option>
                  {alertCategories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
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
                    placeholder="Buscar en alertas..."
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
                  {priorityLevels?.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.nombre} (Nivel {priority.nivel_numerico})
                    </option>
                  ))}
                </select>

                {/* Type Filter */}
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
                  {alertTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nombre}
                    </option>
                  ))}
                </select>

                {/* Add New Button */}
                <button
                  onClick={handleAddNew}
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nueva Alerta
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
                        Alerta
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
                        Fecha Detección
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Asignado a
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!filteredAlerts || filteredAlerts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center">
                          <div
                            className={`flex flex-col items-center justify-center ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            <Bell className="h-12 w-12 mb-2 opacity-50" />
                            <p>No hay alertas para este paciente</p>
                            <button
                              onClick={handleAddNew}
                              className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Crear la primera alerta
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAlerts.map((alert) => {
                        const isAlertResolved = isResolved(alert);

                        return (
                          <tr
                            key={alert.id}
                            className={`border-b transition-colors ${
                              darkMode
                                ? "border-gray-700 hover:bg-gray-800/50"
                                : "border-gray-200 hover:bg-gray-50"
                            } ${isAlertResolved ? "opacity-60" : ""}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    darkMode ? "bg-red-900/50" : "bg-red-100"
                                  }`}
                                >
                                  <Bell className="h-4 w-4 text-red-500" />
                                </div>
                                <div className="max-w-md">
                                  <p
                                    className={`font-medium line-clamp-2 ${
                                      darkMode ? "text-white" : "text-gray-900"
                                    }`}
                                  >
                                    {alert.titulo}
                                  </p>
                                  <p
                                    className={`text-sm mt-1 line-clamp-2 ${
                                      darkMode
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {alert.mensaje}
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
                                {alert.tipo_alerta?.nombre || "No especificado"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {getPriorityIcon(alert.nivel_prioridad)}
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    getPriorityColor(alert.nivel_prioridad) ===
                                    "red"
                                      ? darkMode
                                        ? "bg-red-900/50 text-red-300"
                                        : "bg-red-100 text-red-800"
                                      : getPriorityColor(
                                          alert.nivel_prioridad
                                        ) === "orange"
                                      ? darkMode
                                        ? "bg-orange-900/50 text-orange-300"
                                        : "bg-orange-100 text-orange-800"
                                      : getPriorityColor(
                                          alert.nivel_prioridad
                                        ) === "yellow"
                                      ? darkMode
                                        ? "bg-yellow-900/50 text-yellow-300"
                                        : "bg-yellow-100 text-yellow-800"
                                      : darkMode
                                      ? "bg-green-900/50 text-green-300"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {alert.nivel_prioridad?.nombre ||
                                    "No especificada"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  getStateColor(alert.estado_alerta) === "green"
                                    ? darkMode
                                      ? "bg-green-900/50 text-green-300"
                                      : "bg-green-100 text-green-800"
                                    : getStateColor(alert.estado_alerta) ===
                                      "yellow"
                                    ? darkMode
                                      ? "bg-yellow-900/50 text-yellow-300"
                                      : "bg-yellow-100 text-yellow-800"
                                    : getStateColor(alert.estado_alerta) ===
                                      "blue"
                                    ? darkMode
                                      ? "bg-blue-900/50 text-blue-300"
                                      : "bg-blue-100 text-blue-800"
                                    : darkMode
                                    ? "bg-red-900/50 text-red-300"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {alert.estado_alerta?.nombre ||
                                  "No especificado"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p
                                className={`text-sm ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {formatDate(alert.fecha_deteccion)}
                              </p>
                              {alert.fecha_resolucion && (
                                <p
                                  className={`text-xs ${
                                    darkMode ? "text-gray-500" : "text-gray-600"
                                  }`}
                                >
                                  Resuelta: {formatDate(alert.fecha_resolucion)}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p
                                className={`text-sm ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {alert.doctor?.nombre || "No asignado"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleView(alert)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    darkMode
                                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                      : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                  }`}
                                  title="Ver alerta"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {!isAlertResolved && (
                                  <>
                                    <button
                                      onClick={() => handleTakeAction(alert)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        darkMode
                                          ? "hover:bg-blue-900/50 text-gray-400 hover:text-blue-300"
                                          : "hover:bg-blue-100 text-gray-500 hover:text-blue-600"
                                      }`}
                                      title="Tomar acción"
                                    >
                                      <CheckSquare className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleEdit(alert)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        darkMode
                                          ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                          : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                      }`}
                                      title="Editar alerta"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDelete(alert)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    darkMode
                                      ? "hover:bg-red-900/50 text-gray-400 hover:text-red-300"
                                      : "hover:bg-red-100 text-gray-500 hover:text-red-600"
                                  }`}
                                  title="Eliminar alerta"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
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

        {/* Edit Dialog */}
        {editDialogOpen && (
          <EditAlertDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSave={handleSaveAlert}
            currentEdit={currentEdit}
            alertTypes={alertTypes}
            priorityLevels={priorityLevels}
            alertStates={alertStates}
            darkMode={darkMode}
          />
        )}

        {/* View Dialog */}
        {viewDialogOpen && (
          <ViewAlertDialog
            open={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            alert={currentView}
            darkMode={darkMode}
          />
        )}

        {/* Action Dialog */}
        {actionDialogOpen && (
          <ActionAlertDialog
            open={actionDialogOpen}
            onClose={() => setActionDialogOpen(false)}
            onSave={handleSaveAction}
            alert={currentAction}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

// Componente para editar/crear alertas
const EditAlertDialog = ({
  open,
  onClose,
  onSave,
  currentEdit,
  alertTypes,
  priorityLevels,
  alertStates,
  darkMode,
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentEdit) {
      setFormData({
        tipo_alerta_id: currentEdit.tipo_alerta_id || "",
        nivel_prioridad_id: currentEdit.nivel_prioridad_id || "",
        estado_alerta_id: currentEdit.estado_alerta_id || "",
        titulo: currentEdit.titulo || "",
        mensaje: currentEdit.mensaje || "",
        notas_resolucion: currentEdit.notas_resolucion || "",
      });
    }
  }, [currentEdit]);

  const handleSave = () => {
    if (!formData.tipo_alerta_id) {
      toast.error("El tipo de alerta es requerido");
      return;
    }
    if (!formData.nivel_prioridad_id) {
      toast.error("El nivel de prioridad es requerido");
      return;
    }
    if (!formData.estado_alerta_id) {
      toast.error("El estado de la alerta es requerido");
      return;
    }
    if (!formData.titulo) {
      toast.error("El título es requerido");
      return;
    }
    if (!formData.mensaje) {
      toast.error("El mensaje es requerido");
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
              <Bell
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
                {currentEdit?.isNew ? "Crear Alerta" : "Editar Alerta"}
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {currentEdit?.isNew
                  ? "Complete todos los campos requeridos"
                  : "Actualice la información de la alerta"}
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
            {/* Tipo de Alerta */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tipo de Alerta *
              </label>
              <select
                value={formData.tipo_alerta_id || ""}
                onChange={(e) => handleChange("tipo_alerta_id", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              >
                <option value="">Seleccionar tipo...</option>
                {alertTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridad y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Nivel de Prioridad *
                </label>
                <select
                  value={formData.nivel_prioridad_id || ""}
                  onChange={(e) =>
                    handleChange("nivel_prioridad_id", e.target.value)
                  }
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="">Seleccionar prioridad...</option>
                  {priorityLevels?.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.nombre} (Nivel {priority.nivel_numerico})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Estado *
                </label>
                <select
                  value={formData.estado_alerta_id || ""}
                  onChange={(e) =>
                    handleChange("estado_alerta_id", e.target.value)
                  }
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="">Seleccionar estado...</option>
                  {alertStates?.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Título */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo || ""}
                onChange={(e) => handleChange("titulo", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Título descriptivo de la alerta..."
              />
            </div>

            {/* Mensaje */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Mensaje *
              </label>
              <textarea
                value={formData.mensaje || ""}
                onChange={(e) => handleChange("mensaje", e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Descripción detallada de la alerta..."
              />
            </div>

            {/* Notas de Resolución */}
            {!currentEdit?.isNew && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Notas de Resolución
                </label>
                <textarea
                  value={formData.notas_resolucion || ""}
                  onChange={(e) =>
                    handleChange("notas_resolucion", e.target.value)
                  }
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                  }`}
                  placeholder="Notas sobre la resolución de la alerta..."
                />
              </div>
            )}
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
              disabled={
                !formData.tipo_alerta_id ||
                !formData.nivel_prioridad_id ||
                !formData.estado_alerta_id ||
                !formData.titulo ||
                !formData.mensaje
              }
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentEdit?.isNew ? "Crear Alerta" : "Actualizar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para visualizar alertas
const ViewAlertDialog = ({ open, onClose, alert, darkMode }) => {
  if (!open || !alert) return null;

  const isResolved = alert.fecha_resolucion !== null;

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
                Detalles de la Alerta
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Información completa de la alerta del sistema
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
                  Título
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {alert.titulo}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Tipo de Alerta
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {alert.tipo_alerta?.nombre || "No especificado"}
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
                  {alert.nivel_prioridad?.nivel_numerico >= 4 ? (
                    <AlertOctagon className="h-4 w-4 text-red-500" />
                  ) : alert.nivel_prioridad?.nivel_numerico >= 3 ? (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  ) : alert.nivel_prioridad?.nivel_numerico >= 2 ? (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span
                    className={darkMode ? "text-gray-200" : "text-gray-800"}
                  >
                    {alert.nivel_prioridad?.nombre || "No especificada"} (Nivel{" "}
                    {alert.nivel_prioridad?.nivel_numerico})
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
                      isResolved ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <span
                    className={darkMode ? "text-gray-200" : "text-gray-800"}
                  >
                    {alert.estado_alerta?.nombre || "No especificado"}
                  </span>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Fecha de Detección
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {new Date(alert.fecha_deteccion).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {isResolved && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Fecha de Resolución
                  </label>
                  <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                    {new Date(alert.fecha_resolucion).toLocaleDateString(
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
              )}

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Doctor Asignado
                </label>
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {alert.doctor?.nombre || "No asignado"}
                </p>
              </div>

              {isResolved && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Resuelta por
                  </label>
                  <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                    {alert.resuelta_por_doctor?.nombre || "No especificado"}
                  </p>
                </div>
              )}
            </div>

            {/* Mensaje */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Mensaje
              </label>
              <div
                className={`p-4 rounded-xl ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                  {alert.mensaje}
                </p>
              </div>
            </div>

            {/* Notas de Resolución */}
            {alert.notas_resolucion && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Notas de Resolución
                </label>
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                    {alert.notas_resolucion}
                  </p>
                </div>
              </div>
            )}

            {/* Acciones tomadas */}
            {alert.alertas_acciones && alert.alertas_acciones.length > 0 && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Acciones Tomadas
                </label>
                <div className="space-y-3">
                  {alert.alertas_acciones.map((accion, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl ${
                        darkMode ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={
                            darkMode ? "text-gray-200" : "text-gray-800"
                          }
                        >
                          {accion.accion_tomada}
                        </span>
                        <span
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {new Date(accion.fecha_accion).toLocaleDateString(
                            "es-ES"
                          )}
                        </span>
                      </div>
                      {accion.descripcion && (
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {accion.descripcion}
                        </p>
                      )}
                      <p
                        className={`text-xs mt-2 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Por: {accion.doctor?.nombre}
                      </p>
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

// Componente para tomar acción en alertas
const ActionAlertDialog = ({ open, onClose, onSave, alert, darkMode }) => {
  const [formData, setFormData] = useState({
    accion_tomada: "",
    descripcion: "",
    resolver: false,
  });

  useEffect(() => {
    if (alert) {
      setFormData({
        accion_tomada: "",
        descripcion: "",
        resolver: false,
      });
    }
  }, [alert]);

  const handleSave = () => {
    if (!formData.accion_tomada) {
      toast.error("La acción tomada es requerida");
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

  if (!open || !alert) return null;

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
              <CheckSquare
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
                Tomar Acción en Alerta
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Registre las acciones tomadas para esta alerta
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
            {/* Información de la alerta */}
            <div
              className={`p-4 rounded-xl ${
                darkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <h3
                className={`font-medium mb-2 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {alert.titulo}
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {alert.mensaje}
              </p>
            </div>

            {/* Acción tomada */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Acción Tomada *
              </label>
              <input
                type="text"
                value={formData.accion_tomada || ""}
                onChange={(e) => handleChange("accion_tomada", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Describa la acción tomada..."
              />
            </div>

            {/* Descripción */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Descripción Detallada
              </label>
              <textarea
                value={formData.descripcion || ""}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Describa en detalle las acciones realizadas..."
              />
            </div>

            {/* Resolver alerta */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="resolverAlerta"
                checked={formData.resolver || false}
                onChange={(e) => handleChange("resolver", e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label
                htmlFor="resolverAlerta"
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Marcar esta alerta como resuelta
              </label>
            </div>

            {formData.resolver && (
              <div
                className={`p-3 rounded-lg ${
                  darkMode
                    ? "bg-emerald-900/20 border border-emerald-800"
                    : "bg-emerald-50 border border-emerald-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    darkMode ? "text-emerald-300" : "text-emerald-800"
                  }`}
                >
                  Al marcar esta alerta como resuelta, se registrará la fecha de
                  resolución y se cambiará su estado automáticamente.
                </p>
              </div>
            )}
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
              disabled={!formData.accion_tomada}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Registrar Acción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsManager;
