import React, { useState, useEffect } from "react";
import {
  User,
  Edit3,
  Save,
  Camera,
  Mail,
  Calendar,
  X,
  Users,
  Stethoscope,
  FileText,
  Utensils,
  Lightbulb,
  Clock,
  TrendingUp,
  Bell,
  Shield,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/auth/auth.context";
import { useTheme } from "../context/dark-mode.context";

const ProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState("perfil");
  const [editingProfile, setEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateProfile } = useAuth();
  const { darkMode } = useTheme();

  const [profileData, setProfileData] = useState({
    nombre: "",
    email: "",
    especialidad: "",
    experiencia: "",
    telefono: "",
    direccion: "",
  });

  // Cargar datos del doctor
  useEffect(() => {
    if (user) {
      setProfileData({
        nombre: user.nombre || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile(profileData);
      setEditingProfile(false);
      console.log("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [{ id: "perfil", name: "Perfil", icon: User, color: "emerald" }];

  // Datos simulados para el dashboard del doctor
  const doctorStats = [
    {
      icon: Users,
      title: "42",
      subtitle: "Pacientes Totales",
      status: "+3 esta semana",
      change: "+8.2%",
      changeColor: "text-emerald-600",
      bgColor: darkMode ? "bg-blue-500/10" : "bg-blue-50",
      iconBg: darkMode ? "bg-blue-500/20" : "bg-blue-100",
      iconColor: "text-blue-600",
      statusColor: "text-blue-600",
    },
    {
      icon: FileText,
      title: "156",
      subtitle: "Historiales Médicos",
      status: "12 actualizados hoy",
      change: "+12.5%",
      changeColor: "text-emerald-600",
      bgColor: darkMode ? "bg-purple-500/10" : "bg-purple-50",
      iconBg: darkMode ? "bg-purple-500/20" : "bg-purple-100",
      iconColor: "text-purple-600",
      statusColor: "text-purple-600",
    },
    {
      icon: Utensils,
      title: "892",
      subtitle: "Registros de Comidas",
      status: "34 registrados hoy",
      change: "+18.3%",
      changeColor: "text-emerald-600",
      bgColor: darkMode ? "bg-amber-500/10" : "bg-amber-50",
      iconBg: darkMode ? "bg-amber-500/20" : "bg-amber-100",
      iconColor: "text-amber-600",
      statusColor: "text-amber-600",
    },
    {
      icon: Lightbulb,
      title: "215",
      subtitle: "Recomendaciones Generadas",
      status: "7 nuevas hoy",
      change: "+9.7%",
      changeColor: "text-emerald-600",
      bgColor: darkMode ? "bg-emerald-500/10" : "bg-emerald-50",
      iconBg: darkMode ? "bg-emerald-500/20" : "bg-emerald-100",
      iconColor: "text-emerald-600",
      statusColor: "text-emerald-600",
    },
  ];

  // Componente de Perfil
  const ProfileSection = () => {
    return (
      <div className="space-y-8">
        {/* Cards de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {doctorStats.map((metric, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "bg-white/5 border border-white/10 hover:bg-white/10"
                  : "bg-white border border-gray-200/50 hover:shadow-lg"
              } ${metric.bgColor}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${metric.iconBg}`}>
                  <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
                <div
                  className={`text-sm font-medium ${metric.changeColor} flex items-center`}
                >
                  {metric.change}
                </div>
              </div>

              <div className="space-y-1">
                <h3
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {metric.title}
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {metric.subtitle}
                </p>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    metric.statusColor
                  } ${darkMode ? "bg-white/10" : "bg-white/80"}`}
                >
                  {metric.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Card principal de perfil */}
        <div
          className={`relative overflow-hidden rounded-2xl shadow-lg backdrop-blur-sm ${
            darkMode
              ? "bg-white/5 border border-white/10"
              : "bg-white/80 border border-gray-200/50"
          }`}
        >
          {/* Header con gradiente sutil */}
          <div
            className={`relative px-8 py-8 backdrop-blur-sm ${
              darkMode
                ? "bg-gradient-to-r from-emerald-500/10 to-blue-500/10"
                : "bg-gradient-to-r from-emerald-50 to-blue-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
                      darkMode
                        ? "bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-lg shadow-emerald-900/30"
                        : "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-600/20"
                    }`}
                  >
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <button
                    className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 ${
                      darkMode
                        ? "bg-gray-800 border-2 border-emerald-500"
                        : "bg-white border-2 border-emerald-500 shadow-md"
                    }`}
                  >
                    <Camera className="h-4 w-4 text-emerald-600" />
                  </button>
                </div>
                <div>
                  <h2
                    className={`text-2xl font-bold tracking-tight ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Dr. {profileData.nombre}
                  </h2>
                  <p
                    className={`text-base mt-1 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {profileData.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {editingProfile ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md font-medium"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contenido del perfil */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información profesional */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                    }`}
                  >
                    <Stethoscope
                      className={`h-5 w-5 ${
                        darkMode ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-xl font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Información Profesional
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: Mail,
                      label: "Email",
                      value: profileData.email,
                      field: "email",
                      type: "email",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                        darkMode
                          ? "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                          : "bg-gray-50/80 border border-gray-200/50 hover:bg-white hover:border-gray-300/50 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl transition-colors duration-300 ${
                          darkMode
                            ? "bg-emerald-500/20 group-hover:bg-emerald-500/30"
                            : "bg-emerald-100 group-hover:bg-emerald-200"
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 ${
                            darkMode ? "text-emerald-400" : "text-emerald-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium mb-1 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {item.label}
                        </p>
                        {editingProfile ? (
                          <input
                            type={item.type}
                            value={profileData[item.field] || ""}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                [item.field]: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                              darkMode
                                ? "border-white/20 bg-white/10 text-white placeholder-gray-400"
                                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                            }`}
                          />
                        ) : (
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información de contacto */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode ? "bg-blue-500/20" : "bg-blue-100"
                    }`}
                  >
                    <Bell
                      className={`h-5 w-5 ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-xl font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Información de Contacto
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: Users,
                      label: "Nombre Completo",
                      value: profileData.nombre,
                      field: "nombre",
                      type: "text",
                    },
                    {
                      icon: Shield,
                      label: "Direccion de Correo Electronico",
                      value: profileData.email || "No especificado",
                      field: "email",
                      type: "email",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                        darkMode
                          ? "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                          : "bg-gray-50/80 border border-gray-200/50 hover:bg-white hover:border-gray-300/50 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl transition-colors duration-300 ${
                          darkMode
                            ? "bg-blue-500/20 group-hover:bg-blue-500/30"
                            : "bg-blue-100 group-hover:bg-blue-200"
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 ${
                            darkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium mb-1 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {item.label}
                        </p>
                        {editingProfile ? (
                          <input
                            type={item.type}
                            value={profileData[item.field] || ""}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                [item.field]: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                              darkMode
                                ? "border-white/20 bg-white/10 text-white placeholder-gray-400"
                                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder={`Ingrese ${item.label.toLowerCase()}`}
                          />
                        ) : (
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-2 ${
              darkMode
                ? "border-emerald-400 border-t-transparent"
                : "border-emerald-600 border-t-transparent"
            }`}
          ></div>
        </div>
      );
    }

    switch (activeTab) {
      case "perfil":
        return <ProfileSection />;
      default:
        return <ProfileSection />;
    }
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
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold mb-2 tracking-tight ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Panel del Doctor
          </h1>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Gestión de su perfil médico y estadísticas
          </p>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`flex space-x-1 rounded-2xl p-1 mb-8 backdrop-blur-sm ${
            darkMode
              ? "bg-white/10 border border-white/10"
              : "bg-gray-100/80 border border-gray-200/50"
          }`}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? `bg-emerald-600 text-white shadow-md scale-105`
                    : `${
                        darkMode
                          ? "text-gray-300 hover:text-white hover:bg-white/10"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                      }`
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="transition-all duration-500">{renderContent()}</div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
