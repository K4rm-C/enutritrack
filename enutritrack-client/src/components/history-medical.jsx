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
} from "lucide-react";

const MedicalHistoryDashboard = ({ darkMode = false }) => {
  const {
    medicalHistory,
    loading,
    error,
    getMedicalHistoryByUser,
    createMedicalHistory,
    updateMedicalHistory,
  } = useMedicalHistory();

  const { user } = useAuth();
  const userId = user?.id;

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    condiciones: [],
    alergias: [],
    medicamentos: [],
  });
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (userId) {
      console.log("User ID changed, loading medical history:", userId);
      loadMedicalHistory();
    }
  }, [userId]);

  useEffect(() => {
    if (medicalHistory) {
      setFormData({
        condiciones: medicalHistory.condiciones || [],
        alergias: medicalHistory.alergias || [],
        medicamentos: medicalHistory.medicamentos || [],
      });
    } else {
      setFormData({
        condiciones: [],
        alergias: [],
        medicamentos: [],
      });
    }
  }, [medicalHistory]);

  const loadMedicalHistory = async () => {
    try {
      await getMedicalHistoryByUser(userId);
      setLocalError(null);
    } catch (error) {
      setLocalError("Error al cargar el historial médico");
    }
  };

  const handleSave = async () => {
    try {
      if (medicalHistory) {
        await updateMedicalHistory(userId, formData);
        setSuccessMessage("Historial médico actualizado correctamente");
      } else {
        await createMedicalHistory({
          ...formData,
          usuarioId: userId,
        });
        setSuccessMessage("Historial médico creado correctamente");
      }
      setEditing(false);

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setLocalError("Error al guardar el historial médico");
      console.error("Error saving medical history:", error);
    }
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

  const MedicalSection = ({ title, icon: Icon, field, placeholder }) => (
    <div
      className={`p-4 border rounded-lg ${
        darkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="flex items-center space-x-2 mb-4">
        <Icon
          className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        />
        <h4
          className={`font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h4>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder={placeholder}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addItem(field, e.target.value);
                  e.target.value = "";
                  e.preventDefault();
                }
              }}
              className={`flex-1 px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-600 border-gray-500 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                addItem(field, input.value);
                input.value = "";
              }}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            {formData[field].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded bg-gray-100 dark:bg-gray-700"
              >
                <span className={darkMode ? "text-white" : "text-gray-900"}>
                  {item}
                </span>
                <button
                  onClick={() => removeItem(field, index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {formData[field] && formData[field].length > 0 ? (
            formData[field].map((item, index) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <span className={darkMode ? "text-white" : "text-gray-900"}>
                  {item}
                </span>
              </div>
            ))
          ) : (
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              No hay información registrada
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600">Cargando historial médico...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensajes de estado */}
      {error && (
        <div
          className={`p-4 rounded-lg bg-red-100 border border-red-300 text-red-800`}
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadMedicalHistory}
              className="text-red-600 hover:text-red-800"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {localError && (
        <div
          className={`p-4 rounded-lg bg-red-100 border border-red-300 text-red-800`}
        >
          {localError}
        </div>
      )}

      {successMessage && (
        <div
          className={`p-4 rounded-lg bg-green-100 border border-green-300 text-green-800`}
        >
          {successMessage}
        </div>
      )}

      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Historial Médico
            </h3>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {medicalHistory
                ? "Historial existente"
                : "Sin historial médico registrado"}
            </p>
          </div>

          {editing ? (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  "Guardar"
                )}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  if (medicalHistory) {
                    setFormData({
                      condiciones: medicalHistory.condiciones || [],
                      alergias: medicalHistory.alergias || [],
                      medicamentos: medicalHistory.medicamentos || [],
                    });
                  }
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              {medicalHistory ? "Editar" : "Crear Historial"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MedicalSection
            title="Condiciones Médicas"
            icon={Heart}
            field="condiciones"
            placeholder="Ej: Diabetes, Hipertensión"
          />

          <MedicalSection
            title="Alergias"
            icon={AlertCircle}
            field="alergias"
            placeholder="Ej: Penicilina, Mariscos"
          />

          <MedicalSection
            title="Medicamentos"
            icon={Pill}
            field="medicamentos"
            placeholder="Ej: Metformina 500mg"
          />
        </div>

        {editing && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              💡 Presiona Enter después de escribir cada elemento para agregarlo
              a la lista.
            </p>
          </div>
        )}
      </div>

      {/* Información Adicional */}
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <h3
          className={`text-xl font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Información Importante
        </h3>
        <div
          className={`p-4 rounded-lg ${
            darkMode
              ? "bg-blue-900/20 border-blue-500/30"
              : "bg-blue-50 border-blue-200"
          } border`}
        >
          <div className="flex items-start space-x-3">
            <FileText
              className={`h-6 w-6 mt-1 ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <div>
              <h4
                className={`font-semibold ${
                  darkMode ? "text-blue-400" : "text-blue-900"
                }`}
              >
                Tu historial médico es confidencial
              </h4>
              <p className={darkMode ? "text-blue-300" : "text-blue-800"}>
                Toda la información médica que proporcionas está protegida y
                solo es accesible para ti y los profesionales de salud
                autorizados. Mantener tu historial actualizado nos ayuda a
                proporcionarte recomendaciones más precisas y personalizadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryDashboard;
