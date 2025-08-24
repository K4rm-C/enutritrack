import React, { useState } from "react";
import {
  User,
  Heart,
  Activity,
  Lightbulb,
  FileText,
  Settings,
  Edit,
  Save,
  Camera,
  Mail,
  Phone,
  Calendar,
  Ruler,
  Weight,
  Target,
  TrendingUp,
  Apple,
  Utensils,
  Clock,
  BarChart3,
  Plus,
  Trash2,
  Bell,
  Shield,
  Moon,
  Sun,
  Download,
  Upload,
  Droplets,
} from "lucide-react";

const ProfileDashboard = ({ darkMode = false }) => {
  const [activeTab, setActiveTab] = useState("perfil");
  const [editingProfile, setEditingProfile] = useState(false);

  // Estados para datos del usuario
  const [profileData, setProfileData] = useState({
    nombre: "Juan Pérez",
    email: "juan@email.com",
    telefono: "+52 81 1234 5678",
    edad: 28,
    altura: 175,
    pesoActual: 75,
    pesoObjetivo: 70,
    genero: "M",
    nivelActividad: "moderado",
  });

  const [nutritionGoals, setNutritionGoals] = useState({
    calorias: 2200,
    proteinas: 110,
    carbohidratos: 275,
    grasas: 73,
    agua: 2.5,
  });

  const [medicalHistory, setMedicalHistory] = useState([
    {
      id: 1,
      fecha: "2024-01-15",
      tipo: "Consulta",
      descripcion: "Revisión general",
      doctor: "Dr. García",
    },
    {
      id: 2,
      fecha: "2024-01-30",
      tipo: "Análisis",
      descripcion: "Perfil lipídico",
      resultado: "Normal",
    },
  ]);

  const tabs = [
    { id: "perfil", name: "Perfil", icon: User },
    { id: "nutricion", name: "Nutrición", icon: Apple },
    { id: "actividad", name: "Actividad Física", icon: Activity },
    { id: "recomendaciones", name: "Recomendaciones", icon: Lightbulb },
    { id: "historial", name: "Historial Médico", icon: FileText },
    { id: "configuracion", name: "Configuración", icon: Settings },
  ];

  // Componente de Perfil
  const ProfileSection = () => (
    <div className="space-y-6">
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Información Personal
          </h3>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {editingProfile ? (
              <Save className="h-4 w-4 mr-2" />
            ) : (
              <Edit className="h-4 w-4 mr-2" />
            )}
            {editingProfile ? "Guardar" : "Editar"}
          </button>
        </div>

        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            <div
              className={`w-24 h-24 ${
                darkMode ? "bg-emerald-900/30" : "bg-emerald-100"
              } rounded-full flex items-center justify-center`}
            >
              <User className="h-12 w-12 text-emerald-600" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-700 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h4
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {profileData.nombre}
            </h4>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {profileData.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Email
                </p>
                <p
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {profileData.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Teléfono
                </p>
                <p
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {profileData.telefono}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Edad
                </p>
                <p
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {profileData.edad} años
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Ruler
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Altura
                </p>
                <p
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {profileData.altura} cm
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Weight
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Peso Actual
                </p>
                <p
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {profileData.pesoActual} kg
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Target
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Peso Objetivo
                </p>
                <p
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {profileData.pesoObjetivo} kg
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          Estadísticas Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className={`text-center p-4 rounded-lg ${
              darkMode ? "bg-emerald-900/20" : "bg-emerald-50"
            }`}
          >
            <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">-5kg</p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Progreso
            </p>
          </div>
          <div
            className={`text-center p-4 rounded-lg ${
              darkMode ? "bg-blue-900/20" : "bg-blue-50"
            }`}
          >
            <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">85%</p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Meta Diaria
            </p>
          </div>
          <div
            className={`text-center p-4 rounded-lg ${
              darkMode ? "bg-orange-900/20" : "bg-orange-50"
            }`}
          >
            <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">120</p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Min Activos
            </p>
          </div>
          <div
            className={`text-center p-4 rounded-lg ${
              darkMode ? "bg-purple-900/20" : "bg-purple-50"
            }`}
          >
            <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">98%</p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Salud
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Nutrición
  const NutritionSection = () => (
    <div className="space-y-6">
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <h3
          className={`text-xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Objetivos Nutricionales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className={`text-center p-4 border rounded-lg ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                darkMode ? "bg-red-900/20" : "bg-red-100"
              }`}
            >
              <span className="text-2xl">🔥</span>
            </div>
            <h4
              className={`font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Calorías
            </h4>
            <p className="text-2xl font-bold text-red-600">
              {nutritionGoals.calorias}
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              kcal/día
            </p>
          </div>
          <div
            className={`text-center p-4 border rounded-lg ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                darkMode ? "bg-blue-900/20" : "bg-blue-100"
              }`}
            >
              <span className="text-2xl">💪</span>
            </div>
            <h4
              className={`font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Proteínas
            </h4>
            <p className="text-2xl font-bold text-blue-600">
              {nutritionGoals.proteinas}g
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              por día
            </p>
          </div>
          <div
            className={`text-center p-4 border rounded-lg ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                darkMode ? "bg-green-900/20" : "bg-green-100"
              }`}
            >
              <span className="text-2xl">🌾</span>
            </div>
            <h4
              className={`font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Carbohidratos
            </h4>
            <p className="text-2xl font-bold text-green-600">
              {nutritionGoals.carbohidratos}g
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              por día
            </p>
          </div>
          <div
            className={`text-center p-4 border rounded-lg ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                darkMode ? "bg-yellow-900/20" : "bg-yellow-100"
              }`}
            >
              <span className="text-2xl">🥑</span>
            </div>
            <h4
              className={`font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Grasas
            </h4>
            <p className="text-2xl font-bold text-yellow-600">
              {nutritionGoals.grasas}g
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              por día
            </p>
          </div>
          <div
            className={`text-center p-4 border rounded-lg ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                darkMode ? "bg-cyan-900/20" : "bg-cyan-100"
              }`}
            >
              <Droplets className="h-8 w-8 text-cyan-600" />
            </div>
            <h4
              className={`font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Agua
            </h4>
            <p className="text-2xl font-bold text-cyan-600">
              {nutritionGoals.agua}L
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              por día
            </p>
          </div>
        </div>
      </div>

      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <h3
          className={`text-xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Registro de Comidas
        </h3>
        <div className="space-y-4">
          {["Desayuno", "Almuerzo", "Cena", "Snacks"].map((meal) => (
            <div
              key={meal}
              className={`flex items-center justify-between p-4 border rounded-lg ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Utensils
                  className={`h-5 w-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <div>
                  <h4
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {meal}
                  </h4>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    0 alimentos registrados
                  </p>
                </div>
              </div>
              <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Registro
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Componente de Actividad Física
  const ActivitySection = () => (
    <div className="space-y-6">
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <h3
          className={`text-xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Actividad Física Hoy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`text-center p-4 rounded-lg ${
              darkMode ? "bg-green-900/20" : "bg-green-50"
            }`}
          >
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">8,532</p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Pasos
            </p>
          </div>
          <div
            className={`text-center p-4 rounded-lg ${
              darkMode ? "bg-blue-900/20" : "bg-blue-50"
            }`}
          >
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">45</p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Minutos Activos
            </p>
          </div>
          <div
            className={`text-center p-4 rounded-lg ${
              darkMode ? "bg-orange-900/20" : "bg-orange-50"
            }`}
          >
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">320</p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Calorías Quemadas
            </p>
          </div>
        </div>
      </div>

      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Rutinas de Ejercicio
          </h3>
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Rutina
          </button>
        </div>
        <div className="space-y-4">
          <div
            className={`flex items-center justify-between p-4 border rounded-lg ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div>
              <h4
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Cardio Matutino
              </h4>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                30 min • Nivel: Moderado
              </p>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Iniciar
            </button>
          </div>
          <div
            className={`flex items-center justify-between p-4 border rounded-lg ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div>
              <h4
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Entrenamiento de Fuerza
              </h4>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                45 min • Nivel: Intenso
              </p>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Iniciar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Recomendaciones
  const RecommendationsSection = () => (
    <div className="space-y-6">
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <h3
          className={`text-xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Recomendaciones Personalizadas
        </h3>
        <div className="space-y-4">
          <div
            className={`flex items-start space-x-3 p-4 rounded-lg ${
              darkMode
                ? "bg-blue-900/20 border-blue-500/30"
                : "bg-blue-50 border-blue-200"
            } border`}
          >
            <Droplets
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
                Hidratación
              </h4>
              <p className={darkMode ? "text-blue-300" : "text-blue-800"}>
                Aumenta tu consumo de agua. Te recomendamos 2.5L diarios basado
                en tu actividad.
              </p>
            </div>
          </div>
          <div
            className={`flex items-start space-x-3 p-4 rounded-lg ${
              darkMode
                ? "bg-green-900/20 border-green-500/30"
                : "bg-green-50 border-green-200"
            } border`}
          >
            <Apple
              className={`h-6 w-6 mt-1 ${
                darkMode ? "text-green-400" : "text-green-600"
              }`}
            />
            <div>
              <h4
                className={`font-semibold ${
                  darkMode ? "text-green-400" : "text-green-900"
                }`}
              >
                Nutrición
              </h4>
              <p className={darkMode ? "text-green-300" : "text-green-800"}>
                Incluye más proteínas en tu desayuno. Esto te ayudará a mantener
                la saciedad.
              </p>
            </div>
          </div>
          <div
            className={`flex items-start space-x-3 p-4 rounded-lg ${
              darkMode
                ? "bg-orange-900/20 border-orange-500/30"
                : "bg-orange-50 border-orange-200"
            } border`}
          >
            <Activity
              className={`h-6 w-6 mt-1 ${
                darkMode ? "text-orange-400" : "text-orange-600"
              }`}
            />
            <div>
              <h4
                className={`font-semibold ${
                  darkMode ? "text-orange-400" : "text-orange-900"
                }`}
              >
                Ejercicio
              </h4>
              <p className={darkMode ? "text-orange-300" : "text-orange-800"}>
                Intenta caminar 10,000 pasos diarios. Estás cerca de tu meta
                actual.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <h3
          className={`text-xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Planes Sugeridos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h4
              className={`font-semibold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Plan de Pérdida de Peso
            </h4>
            <p
              className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Diseñado para perder 0.5kg por semana de forma saludable.
            </p>
            <button className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Ver Plan
            </button>
          </div>
          <div
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h4
              className={`font-semibold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Plan de Mantenimiento
            </h4>
            <p
              className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Mantén tu peso actual con hábitos saludables.
            </p>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Ver Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Historial Médico
  const MedicalHistorySection = () => (
    <div className="space-y-6">
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Historial Médico
          </h3>
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </button>
        </div>
        <div className="space-y-4">
          {medicalHistory.map((record) => (
            <div
              key={record.id}
              className={`flex items-center justify-between p-4 border rounded-lg ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    darkMode ? "bg-blue-900/20" : "bg-blue-100"
                  }`}
                >
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {record.descripcion}
                  </h4>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {record.fecha} • {record.doctor || record.resultado}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    record.tipo === "Consulta"
                      ? darkMode
                        ? "bg-blue-900/20 text-blue-400"
                        : "bg-blue-100 text-blue-800"
                      : darkMode
                      ? "bg-green-900/20 text-green-400"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {record.tipo}
                </span>
                <button
                  className={`hover:text-red-600 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Componente de Configuración
  const SettingsSection = () => (
    <div className="space-y-6">
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <h3
          className={`text-xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Configuración General
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Notificaciones
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Recordatorios de comidas y ejercicio
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {darkMode ? (
                <Sun
                  className={`h-5 w-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
              ) : (
                <Moon
                  className={`h-5 w-5 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
              )}
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Modo Oscuro
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Cambiar apariencia de la aplicación
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={darkMode}
                readOnly
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Privacidad
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Configurar privacidad de datos
                </p>
              </div>
            </div>
            <button className="text-emerald-600 hover:text-emerald-700 font-medium">
              Configurar
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl border p-6`}
      >
        <h3
          className={`text-xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Datos y Privacidad
        </h3>
        <div className="space-y-4">
          <button
            className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${
              darkMode
                ? "border-gray-700 hover:bg-gray-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Download
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <span
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Exportar Datos
              </span>
            </div>
          </button>
          <button
            className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${
              darkMode
                ? "border-gray-700 hover:bg-gray-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Upload
                className={`h-5 w-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <span
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Importar Datos
              </span>
            </div>
          </button>
          <button
            className={`w-full flex items-center justify-between p-4 border border-red-300 rounded-lg text-red-600 transition-colors ${
              darkMode ? "hover:bg-red-900/20" : "hover:bg-red-50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Trash2 className="h-5 w-5" />
              <span className="font-medium">Eliminar Cuenta</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeTab) {
      case "perfil":
        return <ProfileSection />;
      case "nutricion":
        return <NutritionSection />;
      case "actividad":
        return <ActivitySection />;
      case "recomendaciones":
        return <RecommendationsSection />;
      case "historial":
        return <MedicalHistorySection />;
      case "configuracion":
        return <SettingsSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div
      className={`lg:w-[1263px] w-full ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      } p-6`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className={`text-4xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mb-2`}
          >
            Mi Perfil
          </h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Gestiona tu información personal y configuraciones
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl border p-2`}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-emerald-600 text-white shadow-md"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">{renderActiveSection()}</div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
