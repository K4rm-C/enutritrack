import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  MoreVertical,
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
  ArrowLeft,
  Shield,
  ChevronUp,
  ChevronRight,
  Loader,
} from "lucide-react";
import { useMedicalHistory } from "../context/history-medical/history-medical.context";
import { useUsers } from "../context/user/user.context";
import { useAuth } from "../context/auth/auth.context";
import { toast } from "react-toastify";

const MedicalHistoryManager = ({ darkMode = false }) => {
  const {
    medicalHistory,
    loading,
    error,
    getMedicalHistoryByUser,
    updateMedicalHistory,
    createMedicalHistory,
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
  const [currentEdit, setCurrentEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Estado para almacenar todos los datos médicos del paciente seleccionado
  const [medicalData, setMedicalData] = useState({
    condiciones: [],
    alergias: [],
    medicamentos: [],
  });

  // Cargar pacientes del doctor al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadPatients();
    }
  }, [user?.id]);

  // Cargar historial médico cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient?.id) {
      loadMedicalHistory();
    } else {
      // Limpiar datos médicos cuando no hay paciente seleccionado
      setMedicalData({
        condiciones: [],
        alergias: [],
        medicamentos: [],
      });
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (medicalHistory) {
      // Adaptar la respuesta del backend a nuestro estado local
      const adaptedData = {
        condiciones: medicalHistory.condiciones || [],
        alergias: medicalHistory.alergias || [],
        medicamentos: medicalHistory.medicamentos || [],
      };
      setMedicalData(adaptedData);
    }
  }, [medicalHistory]);

  const loadPatients = async () => {
    try {
      setPatientsLoading(true);
      const patientsData = await getUsersByDoctorId(user.id);
      console.log("Pacientes cargados:", patientsData);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (error) {
      console.error("Error loading patients:", error);
      toast.error("Error al cargar la lista de pacientes");
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const loadMedicalHistory = async () => {
    try {
      await getMedicalHistoryByUser(selectedPatient.id);
    } catch (error) {
      console.error("Error loading medical history:", error);
      // No mostrar error si no hay historial (puede ser el primer acceso)
      if (error.response?.status !== 404) {
        toast.error("Error al cargar el historial médico del paciente");
      }
    }
  };

  // Función auxiliar para obtener el nombre del paciente de manera segura
  const getPatientName = (patient) => {
    if (!patient) return "Nombre no disponible";

    // Si patient es un string, devolverlo directamente
    if (typeof patient === "string") return patient;

    // Si patient es un objeto, buscar la propiedad nombre
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

  // Función auxiliar para obtener el email del paciente de manera segura
  const getPatientEmail = (patient) => {
    if (!patient) return "Email no disponible";

    if (typeof patient === "string") return patient;

    if (typeof patient === "object") {
      // Buscar email en diferentes posibles ubicaciones
      return (
        patient.email || patient.correo || patient.mail || "Email no disponible"
      );
    }

    return "Email no disponible";
  };

  // Función auxiliar para obtener el teléfono del paciente de manera segura
  const getPatientPhone = (patient) => {
    if (!patient) return null;

    if (typeof patient === "object") {
      return (
        patient.telefono || patient.phone || patient.telefono_principal || null
      );
    }

    return null;
  };

  // Función auxiliar para obtener el género del paciente de manera segura
  const getPatientGender = (patient) => {
    if (!patient) return null;

    if (typeof patient === "object") {
      // Si tiene objeto genero, obtener el nombre
      if (patient.genero && typeof patient.genero === "object") {
        return patient.genero.nombre || null;
      }
      return patient.genero || patient.gender || patient.sexo || null;
    }

    return null;
  };

  const handleSelectPatient = async (patient) => {
    try {
      console.log("Paciente seleccionado:", patient);

      // Obtener datos completos del paciente
      const patientDetails = await getUserById(patient.id);
      console.log("Detalles del paciente:", patientDetails);

      setSelectedPatient(patientDetails);
      setShowPatientsDropdown(false);
      setSearchPatientTerm("");
    } catch (error) {
      console.error("Error loading patient details:", error);
      toast.error("Error al cargar los detalles del paciente");
    }
  };

  const handleAddNew = (type) => {
    if (!selectedPatient) {
      toast.error("Por favor seleccione un paciente primero");
      return;
    }
    setCurrentEdit({ type, item: null, index: -1 });
    setEditDialogOpen(true);
  };

  const handleEdit = (type, item, index) => {
    setCurrentEdit({ type, item, index });
    setEditDialogOpen(true);
  };

  const handleDelete = (type, index) => {
    const newItems = [...medicalData[type]];
    newItems.splice(index, 1);
    setMedicalData((prev) => ({
      ...prev,
      [type]: newItems,
    }));

    toast.success(
      type === "condiciones"
        ? "Condición médica eliminada"
        : type === "alergias"
        ? "Alergia eliminada"
        : "Medicamento eliminado"
    );
  };

  const handleSaveItem = (itemData) => {
    const { type, item, index } = currentEdit;
    const newItems = [...medicalData[type]];

    if (index === -1) {
      // Nuevo item - asegurar que tenga el usuario_id del paciente
      newItems.push({
        ...itemData,
        pacienteId: selectedPatient.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      newItems[index] = {
        ...newItems[index],
        ...itemData,
        updated_at: new Date().toISOString(),
      };
    }

    setMedicalData((prev) => ({
      ...prev,
      [type]: newItems,
    }));
    setEditDialogOpen(false);
    setCurrentEdit(null);

    toast.success(
      currentEdit.type === "condiciones"
        ? "Condición médica guardada"
        : currentEdit.type === "alergias"
        ? "Alergia guardada"
        : "Medicamento guardado"
    );
  };

  const handleSaveMedicalHistory = async () => {
    if (!selectedPatient) {
      toast.error("Por favor seleccione un paciente primero");
      return;
    }

    try {
      const medicalHistoryData = {
        pacienteId: selectedPatient.id,
        condiciones: medicalData.condiciones,
        alergias: medicalData.alergias,
        medicamentos: medicalData.medicamentos,
      };

      if (
        medicalHistory &&
        medicalHistory.medicalHistories &&
        medicalHistory.medicalHistories.length > 0
      ) {
        await updateMedicalHistory(selectedPatient.id, medicalHistoryData);
      } else {
        console.log("Creando nuevo historial médico:", medicalHistoryData);
        await createMedicalHistory(medicalHistoryData);
      }

      toast.success("Historial médico del paciente guardado correctamente");
    } catch (error) {
      console.error("Error saving medical history:", error);
      toast.error("Error al guardar el historial médico del paciente");
    }
  };

  // Funciones de utilidad
  const getSeverityColor = (severidad) => {
    switch (severidad) {
      case "leve":
        return "green";
      case "moderada":
        return "yellow";
      case "severa":
        return "red";
      default:
        return "gray";
    }
  };

  const getSeverityIcon = (severidad) => {
    switch (severidad) {
      case "leve":
        return <CheckCircle className="h-4 w-4" />;
      case "moderada":
        return <AlertCircle className="h-4 w-4" />;
      case "severa":
        return <AlertTriangle className="h-4 w-4" />;
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

  // Filtrar datos médicos basados en búsqueda y filtros
  const filteredData = medicalData[activeTab]?.filter((item) => {
    const itemName = item.nombre ? item.nombre.toLowerCase() : "";
    const itemNotes = item.notas ? item.notas.toLowerCase() : "";
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch =
      itemName.includes(searchTermLower) || itemNotes.includes(searchTermLower);

    const matchesStatus =
      !filterStatus ||
      (item.activa !== undefined ? item.activa : item.activo) ===
        (filterStatus === "active");

    return matchesSearch && matchesStatus;
  });

  // Estadísticas para el dashboard del paciente
  const patientStats = {
    condiciones: medicalData.condiciones.length,
    alergias: medicalData.alergias.length,
    medicamentos: medicalData.medicamentos.length,
    condicionesActivas: medicalData.condiciones.filter((c) => c.activa).length,
    alergiasActivas: medicalData.alergias.filter((a) => a.activa).length,
    medicamentosActivos: medicalData.medicamentos.filter((m) => m.activo)
      .length,
  };

  // Componente para mostrar items en tabla
  const renderTableRows = () => {
    if (!selectedPatient) {
      return (
        <tr>
          <td colSpan="7" className="px-6 py-12 text-center">
            <div
              className={`flex flex-col items-center justify-center ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <User className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg mb-2">
                Seleccione un paciente para comenzar
              </p>
              <p className="text-sm">
                Elija un paciente de la lista para ver y gestionar su historial
                médico
              </p>
            </div>
          </td>
        </tr>
      );
    }

    if (!filteredData || filteredData.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="px-6 py-8 text-center">
            <div
              className={`flex flex-col items-center justify-center ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <FileText className="h-12 w-12 mb-2 opacity-50" />
              <p>No hay {activeTab} registradas para este paciente</p>
              <button
                onClick={() => handleAddNew(activeTab)}
                className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Agregar el primero
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return filteredData.map((item, index) => (
      <tr
        key={item.id || index}
        className={`border-b transition-colors ${
          darkMode
            ? "border-gray-700 hover:bg-gray-800/50"
            : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        {activeTab === "condiciones" && (
          <>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-blue-900/50" : "bg-blue-100"
                  }`}
                >
                  <Stethoscope
                    className={`h-4 w-4 ${
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
                    {item.nombre || "Sin nombre"}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.fecha_diagnostico
                      ? `Diagnosticado: ${formatDate(item.fecha_diagnostico)}`
                      : "Sin fecha de diagnóstico"}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-2">
                {getSeverityIcon(item.severidad)}
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    getSeverityColor(item.severidad) === "green"
                      ? darkMode
                        ? "bg-green-900/50 text-green-300"
                        : "bg-green-100 text-green-800"
                      : getSeverityColor(item.severidad) === "yellow"
                      ? darkMode
                        ? "bg-yellow-900/50 text-yellow-300"
                        : "bg-yellow-100 text-yellow-800"
                      : darkMode
                      ? "bg-red-900/50 text-red-300"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.severidad || "No especificada"}
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  item.activa
                    ? darkMode
                      ? "bg-green-900/50 text-green-300"
                      : "bg-green-100 text-green-800"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {item.activa ? "Activa" : "Inactiva"}
              </span>
            </td>
            <td className="px-6 py-4">
              <p
                className={`text-sm max-w-xs truncate ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {item.notas || "Sin notas"}
              </p>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit("condiciones", item, index)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                  }`}
                  title="Editar condición"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete("condiciones", index)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "hover:bg-red-900/50 text-gray-400 hover:text-red-300"
                      : "hover:bg-red-100 text-gray-500 hover:text-red-600"
                  }`}
                  title="Eliminar condición"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </>
        )}

        {activeTab === "alergias" && (
          <>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-red-900/50" : "bg-red-100"
                  }`}
                >
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      darkMode ? "text-red-300" : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.nombre || "Sin nombre"}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.tipo || "Tipo no especificado"}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                {item.tipo || "No especificado"}
              </p>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-2">
                {getSeverityIcon(item.severidad)}
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    getSeverityColor(item.severidad) === "green"
                      ? darkMode
                        ? "bg-green-900/50 text-green-300"
                        : "bg-green-100 text-green-800"
                      : getSeverityColor(item.severidad) === "yellow"
                      ? darkMode
                        ? "bg-yellow-900/50 text-yellow-300"
                        : "bg-yellow-100 text-yellow-800"
                      : darkMode
                      ? "bg-red-900/50 text-red-300"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.severidad || "No especificada"}
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <p
                className={`text-sm max-w-xs truncate ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {item.reaccion || "No especificada"}
              </p>
            </td>
            <td className="px-6 py-4">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  item.activa
                    ? darkMode
                      ? "bg-green-900/50 text-green-300"
                      : "bg-green-100 text-green-800"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {item.activa ? "Activa" : "Inactiva"}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit("alergias", item, index)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                  }`}
                  title="Editar alergia"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete("alergias", index)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "hover:bg-red-900/50 text-gray-400 hover:text-red-300"
                      : "hover:bg-red-100 text-gray-500 hover:text-red-600"
                  }`}
                  title="Eliminar alergia"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </>
        )}

        {activeTab === "medicamentos" && (
          <>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-purple-900/50" : "bg-purple-100"
                  }`}
                >
                  <Pill
                    className={`h-4 w-4 ${
                      darkMode ? "text-purple-300" : "text-purple-600"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.nombre || "Sin nombre"}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.dosis || "Dosis no especificada"}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                {item.dosis || "No especificada"}
              </p>
            </td>
            <td className="px-6 py-4">
              <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                {item.frecuencia || "No especificada"}
              </p>
            </td>
            <td className="px-6 py-4">
              <div className="space-y-1">
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Inicio: {formatDate(item.fecha_inicio)}
                </p>
                {item.fecha_fin && (
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Fin: {formatDate(item.fecha_fin)}
                  </p>
                )}
              </div>
            </td>
            <td className="px-6 py-4">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  item.activo
                    ? darkMode
                      ? "bg-green-900/50 text-green-300"
                      : "bg-green-100 text-green-800"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {item.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td className="px-6 py-4">
              <p
                className={`text-sm max-w-xs truncate ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {item.notas || "Sin notas"}
              </p>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit("medicamentos", item, index)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                  }`}
                  title="Editar medicamento"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete("medicamentos", index)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "hover:bg-red-900/50 text-gray-400 hover:text-red-300"
                      : "hover:bg-red-100 text-gray-500 hover:text-red-600"
                  }`}
                  title="Eliminar medicamento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </>
        )}
      </tr>
    ));
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
              Gestión de Historial Médico
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
            onClick={handleSaveMedicalHistory}
            disabled={loading || !selectedPatient}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div
                className={`animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2`}
              ></div>
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Guardar Cambios
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
                    {getPatientPhone(selectedPatient) && (
                      <p
                        className={darkMode ? "text-gray-400" : "text-gray-500"}
                      >
                        • {getPatientPhone(selectedPatient)}
                      </p>
                    )}
                    {getPatientGender(selectedPatient) && (
                      <p
                        className={darkMode ? "text-gray-400" : "text-gray-500"}
                      >
                        • {getPatientGender(selectedPatient)}
                      </p>
                    )}
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
                    {patientStats.condiciones}
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
              {patientStats.condicionesActivas > 0 && (
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-blue-300" : "text-blue-600"
                  }`}
                >
                  {patientStats.condicionesActivas} activas
                </p>
              )}
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
                    {patientStats.alergias}
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
              {patientStats.alergiasActivas > 0 && (
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-red-300" : "text-red-600"
                  }`}
                >
                  {patientStats.alergiasActivas} activas
                </p>
              )}
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
                    {patientStats.medicamentos}
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
              {patientStats.medicamentosActivos > 0 && (
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-purple-300" : "text-purple-600"
                  }`}
                >
                  {patientStats.medicamentosActivos} activos
                </p>
              )}
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
                  {patientStats.condicionesActivas +
                    patientStats.alergiasActivas +
                    patientStats.medicamentosActivos}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Activos
                </p>
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
                  {
                    medicalData.condiciones.filter(
                      (c) => c.severidad === "severa"
                    ).length
                  }
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Cond. Severas
                </p>
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
                  {
                    medicalData.alergias.filter((a) => a.severidad === "severa")
                      .length
                  }
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Alg. Severas
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

        {/* Navigation Tabs - Solo mostrar si hay paciente seleccionado */}
        {selectedPatient && (
          <>
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
                    label: "Condiciones Médicas",
                    icon: Stethoscope,
                    count: medicalData.condiciones.length,
                  },
                  {
                    key: "alergias",
                    label: "Alergias",
                    icon: AlertTriangle,
                    count: medicalData.alergias.length,
                  },
                  {
                    key: "medicamentos",
                    label: "Medicamentos",
                    icon: Pill,
                    count: medicalData.medicamentos.length,
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
                    placeholder={`Buscar ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                      darkMode
                        ? "border-white/20 bg-white/10 text-white placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>

                {/* Status Filter */}
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
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>

                {/* Add New Button */}
                <button
                  onClick={() => handleAddNew(activeTab)}
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Agregar{" "}
                  {activeTab === "condiciones"
                    ? "Condición"
                    : activeTab === "alergias"
                    ? "Alergia"
                    : "Medicamento"}
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
                      {activeTab === "condiciones" && (
                        <>
                          <th className="px-6 py-4 text-left font-semibold">
                            Condición
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Severidad
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Estado
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Notas
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Acciones
                          </th>
                        </>
                      )}
                      {activeTab === "alergias" && (
                        <>
                          <th className="px-6 py-4 text-left font-semibold">
                            Alergia
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Tipo
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Severidad
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Reacción
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Estado
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Acciones
                          </th>
                        </>
                      )}
                      {activeTab === "medicamentos" && (
                        <>
                          <th className="px-6 py-4 text-left font-semibold">
                            Medicamento
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Dosis
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Frecuencia
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Fechas
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Estado
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Notas
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Acciones
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>{renderTableRows()}</tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Edit Dialog */}
        {editDialogOpen && (
          <EditItemDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSave={handleSaveItem}
            currentEdit={currentEdit}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

// Componente EditItemDialog (se mantiene igual que en versiones anteriores)
const EditItemDialog = ({ open, onClose, onSave, currentEdit, darkMode }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentEdit?.item) {
      setFormData(currentEdit.item);
    } else {
      // Valores por defecto según el tipo
      const defaults = {
        condiciones: { activa: true, severidad: "leve" },
        alergias: { activa: true, severidad: "leve" },
        medicamentos: {
          activo: true,
          fecha_inicio: new Date().toISOString().split("T")[0],
        },
      };
      setFormData(defaults[currentEdit?.type] || {});
    }
  }, [currentEdit]);

  const handleSave = () => {
    if (!formData.nombre) {
      toast.error("El nombre es requerido");
      return;
    }
    onSave(formData);
    setFormData({});
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getTitle = () => {
    if (!currentEdit) return "";
    const action = currentEdit.index === -1 ? "Agregar" : "Editar";
    const types = {
      condiciones: "Condición Médica",
      alergias: "Alergia",
      medicamentos: "Medicamento",
    };
    return `${action} ${types[currentEdit.type]}`;
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
              <FileText
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
                {getTitle()}
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {currentEdit?.index === -1
                  ? "Complete todos los campos requeridos"
                  : "Actualice la información"}
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
            {/* Campo Nombre */}
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
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
                placeholder={
                  currentEdit?.type === "condiciones"
                    ? "Ej: Diabetes tipo 2"
                    : currentEdit?.type === "alergias"
                    ? "Ej: Alergia al polen"
                    : "Ej: Paracetamol 500mg"
                }
              />
            </div>

            {/* Campos específicos para condiciones médicas */}
            {currentEdit?.type === "condiciones" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Severidad
                    </label>
                    <select
                      value={formData.severidad || "leve"}
                      onChange={(e) =>
                        handleChange("severidad", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                        darkMode
                          ? "border-gray-700 bg-gray-800 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                    >
                      <option value="leve">Leve</option>
                      <option value="moderada">Moderada</option>
                      <option value="severa">Severa</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Fecha Diagnóstico
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_diagnostico || ""}
                      onChange={(e) =>
                        handleChange("fecha_diagnostico", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                        darkMode
                          ? "border-gray-700 bg-gray-800 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                    />
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
                  <select
                    value={
                      formData.activa !== undefined ? formData.activa : true
                    }
                    onChange={(e) =>
                      handleChange("activa", e.target.value === "true")
                    }
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                      darkMode
                        ? "border-gray-700 bg-gray-800 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    <option value={true}>Activa</option>
                    <option value={false}>Inactiva</option>
                  </select>
                </div>
              </>
            )}

            {/* Campos específicos para alergias */}
            {currentEdit?.type === "alergias" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Tipo
                    </label>
                    <input
                      type="text"
                      value={formData.tipo || ""}
                      onChange={(e) => handleChange("tipo", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                        darkMode
                          ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                      }`}
                      placeholder="Ej: Alimentaria, Respiratoria, etc."
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Severidad
                    </label>
                    <select
                      value={formData.severidad || "leve"}
                      onChange={(e) =>
                        handleChange("severidad", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                        darkMode
                          ? "border-gray-700 bg-gray-800 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                    >
                      <option value="leve">Leve</option>
                      <option value="moderada">Moderada</option>
                      <option value="severa">Severa</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Reacción
                  </label>
                  <textarea
                    value={formData.reaccion || ""}
                    onChange={(e) => handleChange("reaccion", e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                      darkMode
                        ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                    }`}
                    placeholder="Describa la reacción alérgica..."
                  />
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
                    value={
                      formData.activa !== undefined ? formData.activa : true
                    }
                    onChange={(e) =>
                      handleChange("activa", e.target.value === "true")
                    }
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                      darkMode
                        ? "border-gray-700 bg-gray-800 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    <option value={true}>Activa</option>
                    <option value={false}>Inactiva</option>
                  </select>
                </div>
              </>
            )}

            {/* Campos específicos para medicamentos */}
            {currentEdit?.type === "medicamentos" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Dosis
                    </label>
                    <input
                      type="text"
                      value={formData.dosis || ""}
                      onChange={(e) => handleChange("dosis", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                        darkMode
                          ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                      }`}
                      placeholder="Ej: 500mg, 1 tableta, etc."
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Frecuencia
                    </label>
                    <input
                      type="text"
                      value={formData.frecuencia || ""}
                      onChange={(e) =>
                        handleChange("frecuencia", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                        darkMode
                          ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                      }`}
                      placeholder="Ej: Cada 8 horas, 1 vez al día, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_inicio || ""}
                      onChange={(e) =>
                        handleChange("fecha_inicio", e.target.value)
                      }
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
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_fin || ""}
                      onChange={(e) =>
                        handleChange("fecha_fin", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                        darkMode
                          ? "border-gray-700 bg-gray-800 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                    />
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
                  <select
                    value={
                      formData.activo !== undefined ? formData.activo : true
                    }
                    onChange={(e) =>
                      handleChange("activo", e.target.value === "true")
                    }
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                      darkMode
                        ? "border-gray-700 bg-gray-800 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </select>
                </div>
              </>
            )}

            {/* Campo Notas (común a todos) */}
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
                placeholder="Notas adicionales..."
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
              disabled={!formData.nombre}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentEdit?.index === -1 ? "Agregar" : "Actualizar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryManager;
