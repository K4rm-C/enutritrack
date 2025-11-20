// components/appointments/MedicalAppointmentsManager.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  MoreVertical,
  X,
  Save,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Square,
  Eye,
  Download,
  Send,
  Phone,
  Video,
  MapPin,
  Users,
  ArrowLeft,
  ChevronUp,
  ChevronRight,
  Loader,
  Star,
  MessageCircle,
  Mail,
  Map,
  Info,
} from "lucide-react";
import { useAppointments } from "../context/citas-medicas/citas-medicas.context";
import { useUsers } from "../context/user/user.context";
import { useAuth } from "../context/auth/auth.context";
import { useTheme } from "../context/dark-mode.context";
import { toast } from "react-toastify";

const MedicalAppointmentsManager = () => {
  const {
    appointments,
    loading,
    error,
    getMyAppointments,
    updateAppointment,
    createAppointment,
    deleteAppointment,
    changeAppointmentState,
    loadAppointmentStates,
    loadConsultationTypes,
    appointmentStates,
    consultationTypes,
    clearError,
  } = useAppointments();

  const { getUsersByDoctorId, getUserById } = useUsers();
  const { user } = useAuth();
  const { darkMode } = useTheme();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [showPatientsDropdown, setShowPatientsDropdown] = useState(false);
  const [searchPatientTerm, setSearchPatientTerm] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user?.id]);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, filterStatus, showAllAppointments]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadAppointmentStates(),
        loadConsultationTypes(),
        loadPatients(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
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

  const loadAppointments = async () => {
    try {
      const filters = {};
      if (filterStatus) filters.estadoCitaId = filterStatus;

      // Solo aplicar filtro de fecha si NO estamos mostrando todas las citas
      if (selectedDate && !showAllAppointments) {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        filters.fechaInicio = startDate.toISOString();
      }

      await getMyAppointments(filters);
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
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

  const handleCreateAppointment = () => {
    if (!selectedPatient) {
      toast.error("Por favor seleccione un paciente primero");
      return;
    }
    setCurrentAppointment({
      type: "create",
      data: {
        usuarioId: selectedPatient.id,
        fechaHoraProgramada: new Date().toISOString(),
      },
    });
    setEditDialogOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setCurrentAppointment({
      type: "edit",
      data: appointment,
    });
    setEditDialogOpen(true);
  };

  const handleViewAppointment = (appointment) => {
    setCurrentAppointment({
      type: "view",
      data: appointment,
    });
    setViewDialogOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta cita?")) {
      try {
        await deleteAppointment(appointmentId);
        toast.success("Cita eliminada correctamente");
        loadAppointments();
      } catch (error) {
        toast.error("Error al eliminar la cita");
      }
    }
  };

  const handleChangeAppointmentState = async (
    appointmentId,
    stateId,
    stateName
  ) => {
    try {
      await changeAppointmentState(appointmentId, stateId);
      toast.success(`Cita marcada como ${stateName}`);
      loadAppointments();
    } catch (error) {
      toast.error("Error al cambiar el estado de la cita");
    }
  };

  const handleSaveAppointment = async (appointmentData) => {
    try {
      // Para crear una nueva cita, necesitamos incluir el usuarioId
      const dataToSend =
        currentAppointment.type === "create"
          ? {
              ...appointmentData,
              usuarioId: selectedPatient.id, // Asegurar que se envíe el usuarioId
              tipoConsultaId: appointmentData.tipoConsultaId,
              estadoCitaId: appointmentData.estadoCitaId,
            }
          : appointmentData;

      console.log("Enviando datos:", dataToSend); // Para debug

      if (currentAppointment.type === "create") {
        await createAppointment(dataToSend);
        toast.success("Cita creada correctamente");
      } else {
        await updateAppointment(currentAppointment.data.id, dataToSend);
        toast.success("Cita actualizada correctamente");
      }
      setEditDialogOpen(false);
      loadAppointments();
    } catch (error) {
      console.error("Error al guardar cita:", error);
      toast.error("Error al guardar la cita");
    }
  };

  // Funciones de utilidad
  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Hora inválida";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha/hora inválida";
    }
  };

  const getStatusColor = (estadoNombre) => {
    switch (estadoNombre?.toLowerCase()) {
      case "programada":
        return "blue";
      case "en proceso":
        return "yellow";
      case "completada":
        return "green";
      case "cancelada":
        return "red";
      case "no asistió":
        return "orange";
      case "reprogramada":
        return "purple";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (estadoNombre) => {
    switch (estadoNombre?.toLowerCase()) {
      case "programada":
        return <Calendar className="h-4 w-4" />;
      case "en proceso":
        return <Play className="h-4 w-4" />;
      case "completada":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelada":
        return <XCircle className="h-4 w-4" />;
      case "no asistió":
        return <AlertCircle className="h-4 w-4" />;
      case "reprogramada":
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredAppointments =
    appointments.citas?.filter((appointment) => {
      const patientName = appointment.usuario?.nombre?.toLowerCase() || "";
      const patientEmail =
        appointment.usuario?.cuenta?.email?.toLowerCase() || "";
      const motivo = appointment.motivo?.toLowerCase() || "";

      const matchesSearch =
        patientName.includes(searchTerm.toLowerCase()) ||
        patientEmail.includes(searchTerm.toLowerCase()) ||
        motivo.includes(searchTerm.toLowerCase());

      const matchesStatus =
        !filterStatus || appointment.estadoCita?.id === filterStatus;

      return matchesSearch && matchesStatus;
    }) || [];

  // Estadísticas actualizadas
  const appointmentStats = {
    total: appointments.total || 0,
    programadas: filteredAppointments.filter(
      (a) => a.estadoCita?.nombre === "Programada"
    ).length,
    enProceso: filteredAppointments.filter(
      (a) => a.estadoCita?.nombre === "En Proceso"
    ).length,
    completadas: filteredAppointments.filter(
      (a) => a.estadoCita?.nombre === "Completada"
    ).length,
    hoy: showAllAppointments
      ? filteredAppointments.filter((a) => {
          if (!a.fechaHoraProgramada) return false;
          const appointmentDate = new Date(
            a.fechaHoraProgramada
          ).toDateString();
          const today = new Date().toDateString();
          return appointmentDate === today;
        }).length
      : filteredAppointments.length, // Si no estamos mostrando todas, todas son de hoy
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-2xl">
            <h1
              className={`text-4xl font-bold mb-2 tracking-tight ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Gestión de Citas Médicas
            </h1>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Programa y gestiona las citas con tus pacientes
            </p>
          </div>

          <button
            onClick={handleCreateAppointment}
            disabled={!selectedPatient}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Cita
          </button>
        </div>

        {/* Selector de Paciente */}
        <div className="mb-8">
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
                      ? selectedPatient.nombre || "Nombre no disponible"
                      : "Seleccionar paciente"}
                  </span>
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {selectedPatient
                      ? selectedPatient.email || "Email no disponible"
                      : "Elija un paciente para programar citas"}
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
                  {patients
                    .filter(
                      (patient) =>
                        patient.nombre
                          ?.toLowerCase()
                          .includes(searchPatientTerm.toLowerCase()) ||
                        patient.email
                          ?.toLowerCase()
                          .includes(searchPatientTerm.toLowerCase())
                    )
                    .map((patient) => (
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
                              {patient.nombre || "Nombre no disponible"}
                            </p>
                            <p
                              className={`text-sm truncate ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {patient.email || "Email no disponible"}
                            </p>
                          </div>
                          {selectedPatient?.id === patient.id && (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
                  {appointmentStats.total}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Citas
                </p>
              </div>
              <Calendar className="h-6 w-6 text-blue-500" />
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
                  {appointmentStats.programadas}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Programadas
                </p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
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
                  {appointmentStats.hoy}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {showAllAppointments ? "Hoy" : "Del Día"}
                </p>
              </div>
              <Calendar className="h-6 w-6 text-emerald-500" />
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
                  {appointmentStats.enProceso}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  En Proceso
                </p>
              </div>
              <Play className="h-6 w-6 text-orange-500" />
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
                  {appointmentStats.completadas}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Completadas
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda - MODIFICADO */}
        <div
          className={`p-6 rounded-2xl mb-8 ${
            darkMode
              ? "bg-white/5 border border-white/10"
              : "bg-white border border-gray-200/50"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Buscar citas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-white/20 bg-white/10 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                darkMode
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="">Todos los estados</option>
              {appointmentStates.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.nombre}
                </option>
              ))}
            </select>

            {/* Input de fecha solo se muestra cuando NO estamos mostrando todas las citas */}
            {!showAllAppointments && (
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              />
            )}

            {/* Toggle para mostrar todas las citas */}
            <div
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                darkMode
                  ? "border-white/20 bg-white/10"
                  : "border-gray-300 bg-white"
              }`}
            >
              <input
                type="checkbox"
                id="showAllAppointments"
                checked={showAllAppointments}
                onChange={(e) => setShowAllAppointments(e.target.checked)}
                className="w-4 h-4 text-emerald-500 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <label
                htmlFor="showAllAppointments"
                className={`text-sm font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Mostrar todas
              </label>
            </div>

            <button
              onClick={loadAppointments}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtrar
            </button>
          </div>

          {/* Indicador de qué estamos mostrando */}
          <div className="mt-3">
            <div
              className={`flex items-center space-x-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Info className="h-4 w-4" />
              <span className="text-sm">
                {showAllAppointments
                  ? "Mostrando todas las citas sin filtrar por fecha"
                  : `Mostrando citas del ${selectedDate.toLocaleDateString(
                      "es-ES"
                    )}`}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Citas */}
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
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-left font-semibold">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold">Motivo</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div
                        className={`flex flex-col items-center justify-center ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <Calendar className="h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg mb-2">No hay citas programadas</p>
                        <p className="text-sm">
                          {selectedPatient
                            ? `No hay citas para ${selectedPatient.nombre} con los filtros actuales`
                            : "Seleccione un paciente para ver sus citas"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <AppointmentRow
                      key={appointment.id}
                      appointment={appointment}
                      darkMode={darkMode}
                      onEdit={handleEditAppointment}
                      onView={handleViewAppointment}
                      onDelete={handleDeleteAppointment}
                      onChangeState={handleChangeAppointmentState}
                      appointmentStates={appointmentStates}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diálogos */}
        {editDialogOpen && (
          <AppointmentEditDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSave={handleSaveAppointment}
            currentAppointment={currentAppointment}
            consultationTypes={consultationTypes}
            appointmentStates={appointmentStates}
            darkMode={darkMode}
          />
        )}

        {viewDialogOpen && (
          <AppointmentViewDialog
            open={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            appointment={currentAppointment?.data}
            darkMode={darkMode}
            onEdit={handleEditAppointment}
          />
        )}
      </div>
    </div>
  );
};

// Componente para cada fila de cita (sin cambios)
const AppointmentRow = ({
  appointment,
  darkMode,
  onEdit,
  onView,
  onDelete,
  onChangeState,
  appointmentStates,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (estadoNombre) => {
    switch (estadoNombre?.toLowerCase()) {
      case "programada":
        return "blue";
      case "en proceso":
        return "yellow";
      case "completada":
        return "green";
      case "cancelada":
        return "red";
      case "no asistió":
        return "orange";
      case "reprogramada":
        return "purple";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (estadoNombre) => {
    switch (estadoNombre?.toLowerCase()) {
      case "programada":
        return <Calendar className="h-4 w-4" />;
      case "en proceso":
        return <Play className="h-4 w-4" />;
      case "completada":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelada":
        return <XCircle className="h-4 w-4" />;
      case "no asistió":
        return <AlertCircle className="h-4 w-4" />;
      case "reprogramada":
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha/hora inválida";
    }
  };

  const availableStates = appointmentStates.filter(
    (state) => !state.esFinal && state.nombre !== appointment.estadoCita?.nombre
  );

  return (
    <tr
      className={`border-b transition-colors ${
        darkMode
          ? "border-gray-700 hover:bg-gray-800/50"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              darkMode ? "bg-blue-900/50" : "bg-blue-100"
            }`}
          >
            <User
              className={`h-5 w-5 ${
                darkMode ? "text-blue-300" : "text-blue-600"
              }`}
            />
          </div>
          <div>
            <p
              className={`font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {appointment.usuario?.nombre || "Paciente no disponible"}
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {appointment.usuario?.cuenta?.email || "Email no disponible"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div>
          <p className={darkMode ? "text-white" : "text-gray-900"}>
            {formatDateTime(appointment.fechaHoraProgramada)}
          </p>
          {appointment.fechaHoraInicio && (
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Inició: {formatDateTime(appointment.fechaHoraInicio)}
            </p>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            darkMode
              ? "bg-purple-900/50 text-purple-300"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {appointment.tipoConsulta?.nombre || "No especificado"}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          {getStatusIcon(appointment.estadoCita?.nombre)}
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              getStatusColor(appointment.estadoCita?.nombre) === "blue"
                ? darkMode
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-blue-100 text-blue-800"
                : getStatusColor(appointment.estadoCita?.nombre) === "yellow"
                ? darkMode
                  ? "bg-yellow-900/50 text-yellow-300"
                  : "bg-yellow-100 text-yellow-800"
                : getStatusColor(appointment.estadoCita?.nombre) === "green"
                ? darkMode
                  ? "bg-green-900/50 text-green-300"
                  : "bg-green-100 text-green-800"
                : getStatusColor(appointment.estadoCita?.nombre) === "red"
                ? darkMode
                  ? "bg-red-900/50 text-red-300"
                  : "bg-red-100 text-red-800"
                : getStatusColor(appointment.estadoCita?.nombre) === "orange"
                ? darkMode
                  ? "bg-orange-900/50 text-orange-300"
                  : "bg-orange-100 text-orange-800"
                : darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {appointment.estadoCita?.nombre || "Desconocido"}
          </span>
        </div>
      </td>

      <td className="px-6 py-4">
        <p
          className={`text-sm max-w-xs truncate ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {appointment.motivo || "Sin motivo especificado"}
        </p>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(appointment)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            onClick={() => onEdit(appointment)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title="Editar cita"
          >
            <Edit3 className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
              }`}
              title="Más acciones"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showActions && (
              <div
                className={`absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-lg z-10 ${
                  darkMode
                    ? "border-gray-600 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="py-1">
                  {availableStates.map((state) => (
                    <button
                      key={state.id}
                      onClick={() => {
                        onChangeState(appointment.id, state.id, state.nombre);
                        setShowActions(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        darkMode
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      Cambiar a {state.nombre}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      onDelete(appointment.id);
                      setShowActions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      darkMode
                        ? "hover:bg-red-900/50 text-red-300"
                        : "hover:bg-red-50 text-red-600"
                    }`}
                  >
                    Eliminar cita
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

// Diálogo para editar/crear citas (sin cambios)
const AppointmentEditDialog = ({
  open,
  onClose,
  onSave,
  currentAppointment,
  consultationTypes,
  appointmentStates,
  darkMode,
}) => {
  const [formData, setFormData] = useState({
    fechaHoraProgramada: "",
    tipoConsultaId: "",
    estadoCitaId: "",
    motivo: "",
    observaciones: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentAppointment?.data) {
      const appointment = currentAppointment.data;
      setFormData({
        fechaHoraProgramada: appointment.fechaHoraProgramada
          ? new Date(appointment.fechaHoraProgramada).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        tipoConsultaId: appointment.tipoConsulta?.id || "",
        estadoCitaId: appointment.estadoCita?.id || "",
        motivo: appointment.motivo || "",
        observaciones: appointment.observaciones || "",
      });
    } else {
      // Valores por defecto para nueva cita
      const defaultState = appointmentStates.find(
        (state) => state.nombre === "Programada"
      );
      const defaultConsulta = consultationTypes[0];

      setFormData({
        fechaHoraProgramada: new Date().toISOString().slice(0, 16),
        tipoConsultaId: defaultConsulta?.id || "",
        estadoCitaId: defaultState?.id || "",
        motivo: "",
        observaciones: "",
      });
    }
    setErrors({});
  }, [currentAppointment, consultationTypes, appointmentStates]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fechaHoraProgramada) {
      newErrors.fechaHoraProgramada = "La fecha y hora son requeridas";
    }

    if (!formData.tipoConsultaId) {
      newErrors.tipoConsultaId = "El tipo de consulta es requerido";
    }

    if (!formData.estadoCitaId) {
      newErrors.estadoCitaId = "El estado de la cita es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error en el diálogo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
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
        {/* Header */}
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
              <Calendar
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
                {currentAppointment?.type === "create"
                  ? "Nueva Cita Médica"
                  : "Editar Cita Médica"}
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {currentAppointment?.type === "create"
                  ? "Complete los datos de la nueva cita"
                  : "Actualice la información de la cita"}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 max-h-[70vh] overflow-y-auto"
        >
          <div className="space-y-6">
            {/* Fecha y Hora */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Fecha y Hora *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.fechaHoraProgramada}
                onChange={(e) =>
                  handleChange("fechaHoraProgramada", e.target.value)
                }
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } ${errors.fechaHoraProgramada ? "border-red-500" : ""}`}
              />
              {errors.fechaHoraProgramada && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fechaHoraProgramada}
                </p>
              )}
            </div>

            {/* Tipo de Consulta */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tipo de Consulta *
              </label>
              <select
                required
                value={formData.tipoConsultaId}
                onChange={(e) => handleChange("tipoConsultaId", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } ${errors.tipoConsultaId ? "border-red-500" : ""}`}
              >
                <option value="">Seleccionar tipo de consulta</option>
                {consultationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nombre} ({type.duracionMinutos} min)
                  </option>
                ))}
              </select>
              {errors.tipoConsultaId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tipoConsultaId}
                </p>
              )}
            </div>

            {/* Estado de Cita */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Estado *
              </label>
              <select
                required
                value={formData.estadoCitaId}
                onChange={(e) => handleChange("estadoCitaId", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } ${errors.estadoCitaId ? "border-red-500" : ""}`}
              >
                <option value="">Seleccionar estado</option>
                {appointmentStates.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.nombre}
                  </option>
                ))}
              </select>
              {errors.estadoCitaId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.estadoCitaId}
                </p>
              )}
            </div>

            {/* Motivo */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Motivo de la Consulta
              </label>
              <textarea
                value={formData.motivo}
                onChange={(e) => handleChange("motivo", e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Describa el motivo de la consulta..."
              />
            </div>

            {/* Observaciones */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleChange("observaciones", e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>

          {/* Actions */}
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
              type="submit"
              disabled={
                loading ||
                !formData.fechaHoraProgramada ||
                !formData.tipoConsultaId ||
                !formData.estadoCitaId
              }
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div
                    className={`animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2`}
                  ></div>
                  Guardando...
                </div>
              ) : currentAppointment?.type === "create" ? (
                "Crear Cita"
              ) : (
                "Actualizar Cita"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Diálogo para ver detalles de cita (sin cambios)
const AppointmentViewDialog = ({
  open,
  onClose,
  appointment,
  darkMode,
  onEdit,
}) => {
  if (!open || !appointment) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha/hora inválida";
    }
  };

  const getStatusColor = (estadoNombre) => {
    switch (estadoNombre?.toLowerCase()) {
      case "programada":
        return "blue";
      case "en proceso":
        return "yellow";
      case "completada":
        return "green";
      case "cancelada":
        return "red";
      case "no asistió":
        return "orange";
      case "reprogramada":
        return "purple";
      default:
        return "gray";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div
        className={`max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl ${
          darkMode
            ? "bg-gradient-to-b from-gray-800 to-gray-900"
            : "bg-gradient-to-b from-white to-gray-50"
        } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        {/* Header */}
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
                Detalles de la Cita
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Información completa de la consulta médica
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(appointment)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
              }`}
              title="Editar cita"
            >
              <Edit3 className="h-5 w-5" />
            </button>
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
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información del Paciente */}
            <div>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Información del Paciente
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      darkMode ? "bg-blue-900/50" : "bg-blue-100"
                    }`}
                  >
                    <User
                      className={`h-6 w-6 ${
                        darkMode ? "text-blue-300" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {appointment.usuario?.nombre || "No disponible"}
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {appointment.usuario?.cuenta?.email || "No disponible"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Teléfono:
                    </span>
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      {appointment.usuario?.telefono || "No disponible"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Género:
                    </span>
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      {appointment.usuario?.genero?.nombre || "No disponible"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Fecha Nacimiento:
                    </span>
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      {appointment.usuario?.fecha_nacimiento
                        ? new Date(
                            appointment.usuario.fecha_nacimiento
                          ).toLocaleDateString("es-ES")
                        : "No disponible"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la Cita */}
            <div>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Información de la Cita
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Estado:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getStatusColor(appointment.estadoCita?.nombre) === "blue"
                        ? darkMode
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-blue-100 text-blue-800"
                        : getStatusColor(appointment.estadoCita?.nombre) ===
                          "yellow"
                        ? darkMode
                          ? "bg-yellow-900/50 text-yellow-300"
                          : "bg-yellow-100 text-yellow-800"
                        : getStatusColor(appointment.estadoCita?.nombre) ===
                          "green"
                        ? darkMode
                          ? "bg-green-900/50 text-green-300"
                          : "bg-green-100 text-green-800"
                        : getStatusColor(appointment.estadoCita?.nombre) ===
                          "red"
                        ? darkMode
                          ? "bg-red-900/50 text-red-300"
                          : "bg-red-100 text-red-800"
                        : darkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {appointment.estadoCita?.nombre || "Desconocido"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Tipo de Consulta:
                  </span>
                  <span className={darkMode ? "text-white" : "text-gray-900"}>
                    {appointment.tipoConsulta?.nombre || "No especificado"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Duración:
                  </span>
                  <span className={darkMode ? "text-white" : "text-gray-900"}>
                    {appointment.tipoConsulta?.duracionMinutos || 30} minutos
                  </span>
                </div>

                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Programada:
                  </span>
                  <span className={darkMode ? "text-white" : "text-gray-900"}>
                    {formatDateTime(appointment.fechaHoraProgramada)}
                  </span>
                </div>

                {appointment.fechaHoraInicio && (
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Inició:
                    </span>
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      {formatDateTime(appointment.fechaHoraInicio)}
                    </span>
                  </div>
                )}

                {appointment.fechaHoraFin && (
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Finalizó:
                    </span>
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      {formatDateTime(appointment.fechaHoraFin)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Motivo y Observaciones */}
          <div className="mt-8 space-y-6">
            <div>
              <h3
                className={`text-lg font-semibold mb-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Motivo de la Consulta
              </h3>
              <p
                className={`p-4 rounded-xl ${
                  darkMode
                    ? "bg-white/5 text-gray-300"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                {appointment.motivo || "No se especificó motivo"}
              </p>
            </div>

            {appointment.observaciones && (
              <div>
                <h3
                  className={`text-lg font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Observaciones
                </h3>
                <p
                  className={`p-4 rounded-xl ${
                    darkMode
                      ? "bg-white/5 text-gray-300"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  {appointment.observaciones}
                </p>
              </div>
            )}

            {appointment.diagnostico && (
              <div>
                <h3
                  className={`text-lg font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Diagnóstico
                </h3>
                <p
                  className={`p-4 rounded-xl ${
                    darkMode
                      ? "bg-white/5 text-gray-300"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  {appointment.diagnostico}
                </p>
              </div>
            )}

            {appointment.tratamientoRecomendado && (
              <div>
                <h3
                  className={`text-lg font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Tratamiento Recomendado
                </h3>
                <p
                  className={`p-4 rounded-xl ${
                    darkMode
                      ? "bg-white/5 text-gray-300"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  {appointment.tratamientoRecomendado}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalAppointmentsManager;
