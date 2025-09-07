import React, { useState, useEffect } from "react";
import { useMedicalHistory } from "../context/history-medical/history-medical.context";
import { useAuth } from "../context/auth/auth.context";
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Pill,
  Heart,
  Loader,
  RefreshCw,
  Calendar,
  Edit3,
  X,
  Check,
  Stethoscope,
} from "lucide-react";

const MedicalHistoryDashboard = ({ darkMode = false }) => {
  const {
    medicalHistory,
    loading,
    error,
    getMedicalHistoryByUser,
    createMedicalHistory,
    updateMedicalHistory,
    clearError,
  } = useMedicalHistory();

  const { user } = useAuth();
  const userId = user.userId;

  const [editing, setEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    condiciones: [],
    alergias: [],
    medicamentos: [],
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    getMedicalHistoryByUser(userId);
  }, [userId]);

  const resetForm = () => {
    setFormData({
      condiciones: [],
      alergias: [],
      medicamentos: [],
    });
  };

  const handleSave = async () => {
    try {
      clearError();
      setSuccessMessage(null);

      if (editing && editingIndex !== null) {
        await updateMedicalHistory(user.userId, formData);
        setSuccessMessage("✅ Historial médico actualizado correctamente");
        await getMedicalHistoryByUser(userId);
      } else {
        await createMedicalHistory({
          ...formData,
          usuarioId: userId,
        });
        setSuccessMessage("✅ Historial médico creado correctamente");
        await getMedicalHistoryByUser(userId);
      }

      setEditing(false);
      setEditingIndex(null);
      setShowCreateForm(false);
      resetForm();

      // Recargar datos después de guardar
      setTimeout(() => {
        getMedicalHistoryByUser(userId);
      }, 1500);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error saving medical history:", error);
      console.error("📋 Response error:", error.response?.data);
    }
  };

  const startEditing = (index) => {
    const historyArray = Array.isArray(medicalHistory)
      ? medicalHistory
      : [medicalHistory];
    const historyToEdit = historyArray[index];

    setFormData({
      condiciones: historyToEdit?.condiciones || [],
      alergias: historyToEdit?.alergias || [],
      medicamentos: historyToEdit?.medicamentos || [],
    });

    setEditing(true);
    setEditingIndex(index);
    setShowCreateForm(false);
  };

  const startCreating = () => {
    resetForm();
    setEditing(true);
    setEditingIndex(null);
    setShowCreateForm(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditingIndex(null);
    setShowCreateForm(false);
    resetForm();
  };

  const addItem = (field, value) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha no válida";
    }
  };

  // Componente para mostrar una sección médica (LEER o EDITAR)
  const MedicalSection = ({
    title,
    icon: Icon,
    field,
    placeholder,
    isEditing,
    items,
  }) => {
    // Estado local para el input
    const [localInputValue, setLocalInputValue] = useState("");

    const handleLocalInputChange = (value) => {
      setLocalInputValue(value);
    };

    const handleAddItem = () => {
      if (localInputValue.trim()) {
        addItem(field, localInputValue);
        setLocalInputValue("");
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        handleAddItem();
        e.preventDefault();
      }
    };

    return (
      <div
        className={`p-6 rounded-xl border transition-all duration-200 ${
          darkMode
            ? "border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div
            className={`p-2 rounded-lg ${
              darkMode
                ? "bg-blue-900/20 text-blue-400"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h4
            className={`font-semibold text-lg ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h4>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder={placeholder}
                value={localInputValue}
                onChange={(e) => handleLocalInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
              />
              <button
                onClick={handleAddItem}
                className="px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center"
                disabled={!localInputValue.trim()}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {formData[field].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span className={darkMode ? "text-white" : "text-gray-900"}>
                    {item}
                  </span>
                  <button
                    onClick={() => removeItem(field, index)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span className={darkMode ? "text-white" : "text-gray-900"}>
                    {item}
                  </span>
                </div>
              ))
            ) : (
              <div
                className={`text-center py-8 rounded-lg ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  No hay información registrada
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Componente para mostrar una tarjeta de historial médico
  const HistoryCard = ({ history, index, isEditing }) => {
    const displayData = isEditing
      ? formData
      : {
          condiciones: history?.condiciones || [],
          alergias: history?.alergias || [],
          medicamentos: history?.medicamentos || [],
        };

    return (
      <div
        className={`rounded-2xl border transition-all duration-300 ${
          darkMode
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
            : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
        } ${
          isEditing
            ? "ring-2 ring-emerald-500 shadow-lg"
            : "shadow-md hover:shadow-lg"
        }`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-xl ${
                  darkMode
                    ? "bg-blue-900/20 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {isEditing
                    ? showCreateForm
                      ? "Nuevo Historial Médico"
                      : "Editando Historial"
                    : "Historial Médico"}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar
                    className={`h-4 w-4 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                    {isEditing && showCreateForm
                      ? "Nuevo registro"
                      : formatDate(history?.created_at || history?.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center space-x-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Guardar</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEditing(index)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MedicalSection
              title="Condiciones Médicas"
              icon={Heart}
              field="condiciones"
              placeholder="Ej: Diabetes, Hipertensión"
              isEditing={isEditing}
              items={displayData.condiciones}
            />

            <MedicalSection
              title="Alergias"
              icon={AlertCircle}
              field="alergias"
              placeholder="Ej: Penicilina, Mariscos"
              isEditing={isEditing}
              items={displayData.alergias}
            />

            <MedicalSection
              title="Medicamentos"
              icon={Pill}
              field="medicamentos"
              placeholder="Ej: Metformina 500mg"
              isEditing={isEditing}
              items={displayData.medicamentos}
            />
          </div>

          {isEditing && (
            <div
              className={`mt-6 p-4 rounded-xl ${
                darkMode
                  ? "bg-gray-700/50 border-gray-600"
                  : "bg-blue-50 border-blue-200"
              } border`}
            >
              <p
                className={`text-sm flex items-center space-x-2 ${
                  darkMode ? "text-gray-300" : "text-blue-700"
                }`}
              >
                <span>💡</span>
                <span>
                  Presiona Enter después de escribir cada elemento para
                  agregarlo a la lista
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && !medicalHistory) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <Loader className="h-12 w-12 animate-spin text-emerald-500" />
          <Stethoscope className="h-6 w-6 absolute inset-0 m-auto text-white" />
        </div>
        <p
          className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Cargando historial médico...
        </p>
      </div>
    );
  }

  // Preparar array de historiales
  const historyArray = medicalHistory
    ? Array.isArray(medicalHistory)
      ? medicalHistory
      : [medicalHistory]
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Mensajes de estado */}
      {successMessage && (
        <div
          className={`p-6 rounded-2xl border transition-all duration-300 ${
            darkMode
              ? "bg-emerald-900/20 border-emerald-700 text-emerald-200"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Historial Médico
          </h1>
          <p
            className={`mt-2 text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Gestiona y revisa tu información médica personal
          </p>
        </div>

        <div className="flex space-x-3">
          {!editing && (
            <button
              onClick={startCreating}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Nuevo Historial</span>
            </button>
          )}
        </div>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && editing && editingIndex === null && (
        <div className="animate-fade-in">
          <HistoryCard history={null} index={-1} isEditing={true} />
        </div>
      )}

      {/* Lista de historiales */}
      {historyArray.length > 0 ? (
        <div className="space-y-6">
          {historyArray.map((history, index) => (
            <div key={history.id || index} className="animate-fade-in">
              <HistoryCard
                history={history}
                index={index}
                isEditing={editing && editingIndex === index}
              />
            </div>
          ))}
        </div>
      ) : (
        !showCreateForm && (
          <div
            className={`text-center py-16 rounded-2xl border transition-all duration-300 ${
              darkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
            }`}
          >
            <div className="max-w-md mx-auto">
              <div
                className={`p-4 rounded-full mx-auto w-24 h-24 flex items-center justify-center ${
                  darkMode ? "bg-blue-900/20" : "bg-blue-100"
                }`}
              >
                <Stethoscope
                  className={`h-12 w-12 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
              <h3
                className={`text-xl font-semibold mt-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                No tienes historial médico registrado
              </h3>
              <p
                className={`mt-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Comienza creando tu primer historial médico para mantener un
                registro completo de tu información de salud.
              </p>
              <button
                onClick={startCreating}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span className="font-semibold">Crear Primer Historial</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* Información Adicional */}
      <div
        className={`rounded-2xl border transition-all duration-300 ${
          darkMode
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
            : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
        }`}
      >
        <div className="p-6">
          <h3
            className={`text-xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Información Importante
          </h3>
          <div
            className={`p-6 rounded-xl border transition-colors ${
              darkMode
                ? "bg-blue-900/20 border-blue-700/30"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-start space-x-4">
              <FileText
                className={`h-6 w-6 mt-1 flex-shrink-0 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <div>
                <h4
                  className={`font-semibold mb-2 ${
                    darkMode ? "text-blue-300" : "text-blue-900"
                  }`}
                >
                  Tu historial médico es confidencial
                </h4>
                <p className={darkMode ? "text-blue-200" : "text-blue-800"}>
                  Toda la información médica que proporcionas está protegida con
                  encriptación de grado médico y solo es accesible para ti y los
                  profesionales de salud autorizados. Mantener tu historial
                  actualizado nos ayuda a proporcionarte recomendaciones más
                  precisas y personalizadas para tu bienestar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryDashboard;
