// src/components/medical-history/MedicalHistoryManager.js
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  X,
  Save,
  Pill,
  Heart,
  Stethoscope,
  FileText,
  Calendar,
  User,
  Eye,
  ChevronDown,
  CheckCircle,
  Users,
  Shield,
  Trash2,
  History,
  Activity,
  AlertTriangle,
  Thermometer,
  Brain,
  Bone,
  Eye as EyeIcon,
  Scan,
} from "lucide-react";
import { useMedicalHistory } from "../context/history-medical/history-medical.context";
import { useUsers } from "../context/user/user.context";
import { useAuth } from "../context/auth/auth.context";
import { useTheme } from "../context/dark-mode.context";
import { toast } from "react-toastify";

const MedicalHistoryManager = () => {
  const {
    medicalHistory,
    loading,
    error,
    getMedicalHistoryByUser,
    createMedicalHistory,
    updateMedicalHistory,
    clearError,
  } = useMedicalHistory();

  const { getUsersByDoctorId, getUserById } = useUsers();
  const { user } = useAuth();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [showPatientsDropdown, setShowPatientsDropdown] = useState(false);
  const [searchPatientTerm, setSearchPatientTerm] = useState("");

  const [activeTab, setActiveTab] = useState("condiciones");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [currentView, setCurrentView] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { darkMode } = useTheme();

  // Cargar pacientes al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadPatients();
    }
  }, [user?.id]);

  // Cargar historial médico cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient?.id) {
      loadMedicalHistory();
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

  const loadMedicalHistory = async (userId = null) => {
    try {
      const targetUserId = userId || selectedPatient?.id;
      if (!targetUserId) return;

      await getMedicalHistoryByUser(targetUserId);
    } catch (error) {
      console.error("Error loading medical history:", error);
      if (error.response?.status !== 404) {
        toast.error("Error al cargar el historial médico del paciente");
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
      // ✅ Limpiar el historial actual inmediatamente

      const patientDetails = await getUserById(patient.id);
      setSelectedPatient(patientDetails);
      setShowPatientsDropdown(false);
      setSearchPatientTerm("");

      // ✅ Forzar la recarga del historial médico
      await loadMedicalHistory(patientDetails.id);
    } catch (error) {
      console.error("Error loading patient details:", error);
      toast.error("Error al cargar los detalles del paciente");
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup al desmontar el componente
      setSelectedPatient(null);
    };
  }, []);

  // ✅ Modificar el efecto que depende de selectedPatient
  useEffect(() => {
    if (selectedPatient?.id) {
      // Limpiar el historial anterior antes de cargar el nuevo
      loadMedicalHistory(selectedPatient.id);
    }
  }, [selectedPatient?.id]);

  const handleCreateHistory = () => {
    if (!selectedPatient) {
      toast.error("Por favor seleccione un paciente primero");
      return;
    }
    setCurrentEdit({
      isNew: true,
      pacienteId: selectedPatient.id, // CAMBIADO: usar selectedPatient.id
      condiciones: [],
      alergias: [],
      medicamentos: [],
    });
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!medicalHistory) {
      toast.error("No hay historial médico para editar");
      return;
    }
    setCurrentEdit({
      isNew: false,
      ...medicalHistory,
      pacienteId: selectedPatient.id, // CAMBIADO: usar selectedPatient.id
    });
    setEditDialogOpen(true);
  };

  const handleView = () => {
    if (!medicalHistory) {
      toast.error("No hay historial médico para visualizar");
      return;
    }
    setCurrentView(medicalHistory);
    setViewDialogOpen(true);
  };

  const handleSaveMedicalHistory = async (formData) => {
    try {
      // CORREGIDO: Usar el formato correcto que espera el backend
      const medicalHistoryData = {
        condiciones: formData.condiciones,
        alergias: formData.alergias,
        medicamentos: formData.medicamentos,
      };

      if (currentEdit.isNew) {
        await createMedicalHistory(medicalHistoryData);
        toast.success("Historial médico creado exitosamente");
      } else {
        await updateMedicalHistory(selectedPatient.id, medicalHistoryData);
        toast.success("Historial médico actualizado exitosamente");
      }

      setEditDialogOpen(false);
      setCurrentEdit(null);
    } catch (error) {
      console.error("Error saving medical history:", error);
      toast.error("Error al guardar el historial médico");
    }
  };

  const getConditionIcon = (conditionName) => {
    // Asegurarnos de que conditionName sea una string
    const name = String(conditionName || "").toLowerCase();

    if (
      name.includes("card") ||
      name.includes("corazón") ||
      name.includes("heart")
    ) {
      return <Heart className="h-4 w-4 text-red-500" />;
    } else if (
      name.includes("diabet") ||
      name.includes("gluc") ||
      name.includes("azúcar")
    ) {
      return <Activity className="h-4 w-4 text-blue-500" />;
    } else if (
      name.includes("presión") ||
      name.includes("hipertens") ||
      name.includes("tensión")
    ) {
      return <Thermometer className="h-4 w-4 text-orange-500" />;
    } else {
      return <Stethoscope className="h-4 w-4 text-emerald-500" />;
    }
  };

  const getAllergyIcon = () => {
    return <AlertTriangle className="h-4 w-4 text-red-400" />;
  };

  const getMedicationIcon = () => {
    return <Pill className="h-4 w-4 text-emerald-500" />;
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

  // Estadísticas para el dashboard
  const medicalHistoryStats = {
    condiciones: Array.isArray(medicalHistory?.condiciones)
      ? medicalHistory.condiciones.length
      : 0,
    alergias: Array.isArray(medicalHistory?.alergias)
      ? medicalHistory.alergias.length
      : 0,
    medicamentos: Array.isArray(medicalHistory?.medicamentos)
      ? medicalHistory.medicamentos.length
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
                ? "border-blue-400 border-t-transparent"
                : "border-blue-600 border-t-transparent"
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
              Gestión de Historial Médico
            </h1>

            {/* Selector de pacientes */}
            <div className="relative mt-4">
              <button
                onClick={() => setShowPatientsDropdown(!showPatientsDropdown)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  darkMode
                    ? "border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
                    : "border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
                } ${showPatientsDropdown ? "ring-2 ring-blue-500" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
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
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
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
                                ? "bg-blue-900/50 border-blue-500"
                                : "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                darkMode ? "bg-blue-700" : "bg-blue-100"
                              }`}
                            >
                              <User
                                className={`h-4 w-4 ${
                                  darkMode ? "text-blue-200" : "text-blue-600"
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
                              <CheckCircle className="h-5 w-5 text-blue-500" />
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

          <div className="flex space-x-3">
            <button
              onClick={handleView}
              disabled={!medicalHistory}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="h-5 w-5 mr-2" />
              Ver
            </button>
            <button
              onClick={medicalHistory ? handleEdit : handleCreateHistory}
              disabled={!selectedPatient}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {medicalHistory ? (
                <>
                  <Edit3 className="h-5 w-5 mr-2" />
                  Editar
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Crear
                </>
              )}
            </button>
          </div>
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
                      ? "bg-gradient-to-br from-blue-600 to-blue-700"
                      : "bg-gradient-to-br from-blue-500 to-blue-600"
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
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        medicalHistory
                          ? darkMode
                            ? "bg-emerald-900/50 text-emerald-300"
                            : "bg-emerald-100 text-emerald-800"
                          : darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {medicalHistory
                        ? "Historial disponible"
                        : "Sin historial médico"}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`flex items-center space-x-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Modo Doctor - Gestión de historial médico</span>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas del historial médico */}
        {selectedPatient && medicalHistory && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                    {medicalHistoryStats.condiciones}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Condiciones
                  </p>
                </div>
                <Stethoscope className="h-6 w-6 text-blue-500" />
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
                    {medicalHistoryStats.alergias}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Alergias
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
                    {medicalHistoryStats.medicamentos}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Medicamentos
                  </p>
                </div>
                <Pill className="h-6 w-6 text-purple-500" />
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

        {/* Contenido principal */}
        {selectedPatient && medicalHistory && (
          <>
            {/* Navigation Tabs */}
            <div
              className={`p-6 rounded-2xl mb-8 ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    key: "condiciones",
                    label: "Condiciones",
                    icon: Stethoscope,
                    count: medicalHistoryStats.condiciones,
                  },
                  {
                    key: "alergias",
                    label: "Alergias",
                    icon: AlertTriangle,
                    count: medicalHistoryStats.alergias,
                  },
                  {
                    key: "medicamentos",
                    label: "Medicamentos",
                    icon: Pill,
                    count: medicalHistoryStats.medicamentos,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                      activeTab === tab.key
                        ? darkMode
                          ? "bg-blue-900/50 border border-blue-700 text-blue-300"
                          : "bg-blue-50 border border-blue-200 text-blue-700"
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
                            ? "bg-blue-800 text-blue-200"
                            : "bg-blue-200 text-blue-800"
                          : darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div
              className={`p-6 rounded-2xl mb-8 ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={`Buscar en ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                      darkMode
                        ? "border-white/20 bg-white/10 text-white placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Tabla de contenido */}
            <div
              className={`rounded-2xl overflow-hidden ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-gray-200/50"
              }`}
            >
              <MedicalHistoryTable
                activeTab={activeTab}
                medicalHistory={medicalHistory}
                searchTerm={searchTerm}
                darkMode={darkMode}
                getConditionIcon={getConditionIcon}
                getAllergyIcon={getAllergyIcon}
                getMedicationIcon={getMedicationIcon}
              />
            </div>
          </>
        )}

        {/* Mensaje cuando no hay historial */}
        {selectedPatient && !medicalHistory && !loading && (
          <div
            className={`p-12 rounded-2xl text-center ${
              darkMode
                ? "bg-white/5 border border-white/10"
                : "bg-white border border-gray-200/50"
            }`}
          >
            <History className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3
              className={`text-xl font-semibold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              No hay historial médico registrado
            </h3>
            <p
              className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Comience creando un historial médico para{" "}
              {getPatientName(selectedPatient)}
            </p>
            <button
              onClick={handleCreateHistory}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5 inline mr-2" />
              Crear Historial Médico
            </button>
          </div>
        )}

        {/* Edit Dialog */}
        {editDialogOpen && (
          <EditMedicalHistoryDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSave={handleSaveMedicalHistory}
            currentEdit={currentEdit}
            darkMode={darkMode}
            loading={loading}
          />
        )}

        {/* View Dialog */}
        {viewDialogOpen && (
          <ViewMedicalHistoryDialog
            open={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            medicalHistory={currentView}
            darkMode={darkMode}
            getConditionIcon={getConditionIcon}
            getAllergyIcon={getAllergyIcon}
            getMedicationIcon={getMedicationIcon}
          />
        )}
      </div>
    </div>
  );
};

const MedicalHistoryTable = ({
  activeTab,
  medicalHistory,
  searchTerm,
  darkMode,
  getConditionIcon,
  getAllergyIcon,
  getMedicationIcon,
}) => {
  const renderTableContent = () => {
    // Aseguramos que items siempre sea un array de strings
    const items = Array.isArray(medicalHistory[activeTab])
      ? medicalHistory[activeTab]
      : [];

    const filteredItems = items.filter((item) => {
      const itemString = String(item || "");
      return itemString.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (filteredItems.length === 0) {
      return (
        <tr>
          <td colSpan="1" className="px-6 py-8 text-center">
            <div
              className={`flex flex-col items-center justify-center ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <FileText className="h-12 w-12 mb-2 opacity-50" />
              <p>No hay {activeTab} registrados</p>
              {searchTerm && (
                <p className="text-sm mt-2">
                  No se encontraron resultados para "{searchTerm}"
                </p>
              )}
            </div>
          </td>
        </tr>
      );
    }

    return filteredItems.map((item, index) => {
      // Asegurarnos de que item sea una string
      const itemString = String(item || "");

      return (
        <tr
          key={index}
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
                  activeTab === "condiciones"
                    ? "bg-blue-500/10"
                    : activeTab === "alergias"
                    ? "bg-red-500/10"
                    : "bg-purple-500/10"
                }`}
              >
                {activeTab === "condiciones" && getConditionIcon(itemString)}
                {activeTab === "alergias" && getAllergyIcon()}
                {activeTab === "medicamentos" && getMedicationIcon()}
              </div>
              <div>
                <p className={darkMode ? "text-white" : "text-gray-900"}>
                  {itemString}
                </p>
              </div>
            </div>
          </td>
        </tr>
      );
    });
  };

  const getTableHeaders = () => {
    switch (activeTab) {
      case "condiciones":
        return ["Condición Médica"];
      case "alergias":
        return ["Alergia"];
      case "medicamentos":
        return ["Medicamento"];
      default:
        return ["Item"];
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={darkMode ? "bg-gray-800/50" : "bg-gray-50"}>
            {getTableHeaders().map((header, index) => (
              <th key={index} className="px-6 py-4 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderTableContent()}</tbody>
      </table>
    </div>
  );
};

// Componente para editar/crear historial médico - SIMPLIFICADO
const EditMedicalHistoryDialog = ({
  open,
  onClose,
  onSave,
  currentEdit,
  darkMode,
  loading,
}) => {
  const [formData, setFormData] = useState({
    condiciones: [],
    alergias: [],
    medicamentos: [],
    ...currentEdit,
  });

  const [activeSection, setActiveSection] = useState("condiciones");

  useEffect(() => {
    if (currentEdit) {
      setFormData({
        condiciones: Array.isArray(currentEdit.condiciones)
          ? currentEdit.condiciones
          : [],
        alergias: Array.isArray(currentEdit.alergias)
          ? currentEdit.alergias
          : [],
        medicamentos: Array.isArray(currentEdit.medicamentos)
          ? currentEdit.medicamentos
          : [],
      });
    }
  }, [currentEdit]);

  const handleSave = () => {
    // Asegurarnos de que todos los campos sean arrays
    const dataToSave = {
      condiciones: formData.condiciones,
      alergias: formData.alergias,
      medicamentos: formData.medicamentos,
    };
    onSave(dataToSave);
  };

  const handleAddItem = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...(Array.isArray(prev[section]) ? prev[section] : []), ""],
    }));
  };

  const handleRemoveItem = (section, index) => {
    setFormData((prev) => ({
      ...prev,
      [section]: (Array.isArray(prev[section]) ? prev[section] : []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleUpdateItem = (section, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: (Array.isArray(prev[section]) ? prev[section] : []).map(
        (item, i) => (i === index ? value : item)
      ),
    }));
  };

  const renderSectionForm = () => {
    const items = Array.isArray(formData[activeSection])
      ? formData[activeSection]
      : [];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {activeSection === "condiciones" && "Condiciones Médicas"}
            {activeSection === "alergias" && "Alergias"}
            {activeSection === "medicamentos" && "Medicamentos"}
          </h3>
          <button
            onClick={() => handleAddItem(activeSection)}
            className="flex items-center px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </button>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              darkMode
                ? "border-gray-600 bg-gray-800"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h4
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {activeSection.slice(0, -1)} #{index + 1}
              </h4>
              <button
                onClick={() => handleRemoveItem(activeSection, index)}
                className="p-1 text-red-500 hover:bg-red-500/10 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Nombre *
              </label>
              <input
                type="text"
                value={item}
                onChange={(e) =>
                  handleUpdateItem(activeSection, index, e.target.value)
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                placeholder={
                  activeSection === "condiciones"
                    ? "Ej: Diabetes Tipo 2"
                    : activeSection === "alergias"
                    ? "Ej: Penicilina"
                    : "Ej: Metformina 500mg"
                }
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {activeSection === "condiciones" && (
              <Stethoscope className="h-12 w-12 mx-auto mb-2 opacity-50" />
            )}
            {activeSection === "alergias" && (
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            )}
            {activeSection === "medicamentos" && (
              <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
            )}
            <p>No hay {activeSection} registrados</p>
          </div>
        )}
      </div>
    );
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
                darkMode ? "bg-blue-700" : "bg-blue-100"
              }`}
            >
              <Edit3
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
                {currentEdit?.isNew
                  ? "Crear Historial Médico"
                  : "Editar Historial Médico"}
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Complete la información del historial médico del paciente
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

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
            {["condiciones", "alergias", "medicamentos"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === section
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-white text-blue-700 shadow"
                    : darkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          {/* Form Content */}
          {renderSectionForm()}

          {/* Action Buttons */}
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
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Guardando...
                </div>
              ) : currentEdit?.isNew ? (
                "Crear Historial"
              ) : (
                "Actualizar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para visualizar historial médico - SIMPLIFICADO
const ViewMedicalHistoryDialog = ({
  open,
  onClose,
  medicalHistory,
  darkMode,
  getConditionIcon,
  getAllergyIcon,
  getMedicationIcon,
}) => {
  if (!open || !medicalHistory) return null;

  const sections = [
    {
      key: "condiciones",
      title: "Condiciones Médicas",
      icon: Stethoscope,
      data: Array.isArray(medicalHistory.condiciones)
        ? medicalHistory.condiciones
        : [],
    },
    {
      key: "alergias",
      title: "Alergias",
      icon: AlertTriangle,
      data: Array.isArray(medicalHistory.alergias)
        ? medicalHistory.alergias
        : [],
    },
    {
      key: "medicamentos",
      title: "Medicamentos",
      icon: Pill,
      data: Array.isArray(medicalHistory.medicamentos)
        ? medicalHistory.medicamentos
        : [],
    },
  ];

  const renderSectionContent = (section) => {
    if (!section.data || section.data.length === 0) {
      return (
        <div
          className={`text-center py-8 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <section.icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No hay {section.key} registrados</p>
        </div>
      );
    }

    return section.data.map((item, index) => (
      <div
        key={index}
        className={`p-4 rounded-lg border mb-4 ${
          darkMode
            ? "border-gray-600 bg-gray-800/50"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              section.key === "condiciones"
                ? "bg-blue-500/10"
                : section.key === "alergias"
                ? "bg-red-500/10"
                : "bg-purple-500/10"
            }`}
          >
            {section.key === "condiciones" && getConditionIcon(item)}
            {section.key === "alergias" && getAllergyIcon()}
            {section.key === "medicamentos" && getMedicationIcon()}
          </div>
          <div>
            <p
              className={`font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {item}
            </p>
          </div>
        </div>
      </div>
    ));
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
                Historial Médico
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Información del historial médico del paciente
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

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Secciones del historial */}
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.key}>
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <section.icon
                      className={`h-5 w-5 ${
                        section.key === "condiciones"
                          ? "text-blue-500"
                          : section.key === "alergias"
                          ? "text-red-500"
                          : "text-purple-500"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {section.title} ({section.data?.length || 0})
                  </h3>
                </div>
                {renderSectionContent(section)}
              </div>
            ))}
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

export default MedicalHistoryManager;
