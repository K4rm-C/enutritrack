import React, { useState, useEffect } from "react";
import {
  User,
  Edit3,
  Save,
  Camera,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Target,
  Activity,
  X,
  Heart,
  Flame,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/auth/auth.context";
import { useUsers } from "../context/user/user.context";
import { useNutrition } from "../context/nutrition/nutrition.context";
import { usePhysicalActivity } from "../context/activity/activity.context";

const ProfileDashboard = ({ darkMode = false }) => {
  const [activeTab, setActiveTab] = useState("perfil");
  const [editingProfile, setEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const { user } = useAuth();
  const { updateUser, getUserById } = useUsers();
  const { weeklySummary, getWeeklySummary } = usePhysicalActivity();
  const { foodRecords, getFoodRecordsByUser } = useNutrition();
  const [userData, setUserData] = useState(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const [profileData, setProfileData] = useState({
    nombre: "",
    email: "",
    fecha_nacimiento: "",
    género: "",
    altura: "",
    peso_actual: "",
    objetivo_peso: "",
    nivel_actividad: "",
  });

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;

    try {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);

      // Verificar que la fecha sea válida
      if (isNaN(nacimiento.getTime())) return null;

      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();

      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }

      return edad;
    } catch (error) {
      console.error("Error calculando edad:", error);
      return null;
    }
  };

  // Función para calcular el IMC
  const calcularIMC = () => {
    if (!userData || !userData.pesoActual || !userData.altura) return null;

    const alturaEnMetros = parseFloat(userData.altura) / 100;
    const peso = parseFloat(userData.pesoActual);

    if (alturaEnMetros <= 0 || peso <= 0) return null;

    return (peso / (alturaEnMetros * alturaEnMetros)).toFixed(1);
  };

  // Función para obtener el estado del IMC
  const getEstadoIMC = (imc) => {
    if (!imc) return { estado: "Sin datos", color: "gray" };

    const valorIMC = parseFloat(imc);
    if (valorIMC < 18.5) return { estado: "Bajo peso", color: "blue" };
    if (valorIMC < 25) return { estado: "Peso normal", color: "green" };
    if (valorIMC < 30) return { estado: "Sobrepeso", color: "yellow" };
    return { estado: "Obesidad", color: "red" };
  };

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!user || !user.userId) {
        return;
      }
      setIsLoadingUser(true);
      try {
        const userDataForm = await getUserById(user.userId);
        setUserData(userDataForm);
        setProfileData({
          nombre: userDataForm.nombre || "",
          email: userDataForm.email || "",
          fecha_nacimiento:
            userDataForm.fechaNacimiento || userDataForm.fecha_nacimiento || "",
          género: userDataForm.género || userDataForm.genero || "",
          altura: userDataForm.altura || "",
          peso_actual:
            userDataForm.pesoActual || userDataForm.peso_actual || "",
          objetivo_peso:
            userDataForm.objetivoPeso || userDataForm.objetivo_peso || "",
          nivel_actividad:
            userDataForm.nivelActividad || userDataForm.nivel_actividad || "",
        });
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserData();
  }, [user]);

  useEffect(() => {
    const loadActivityAndNutritionData = async () => {
      if (!user || !user.userId) return;

      try {
        // Obtener resumen semanal de actividad física
        await getWeeklySummary(user.userId);

        // Obtener registros de comida de la semana actual
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Inicio de la semana (domingo)

        const endOfWeek = new Date();
        endOfWeek.setHours(23, 59, 59, 999);
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay())); // Fin de la semana (sábado)

        await getFoodRecordsByUser(user.userId, startOfWeek, endOfWeek);
      } catch (error) {
        console.error("Error cargando datos de actividad y nutrición:", error);
      }
    };

    loadActivityAndNutritionData();
  }, [user]);

  // Calcular total de calorías cuando cambien los registros de comida
  useEffect(() => {
    if (foodRecords && foodRecords.length > 0) {
      const calories = foodRecords.reduce((total, record) => {
        // Convertir a número y sumar
        return total + (parseFloat(record.calorias) || 0);
      }, 0);
      setTotalCalories(calories);
    } else {
      setTotalCalories(0);
    }
  }, [foodRecords]);

  // Obtener minutos de actividad cuando cambie el resumen semanal
  useEffect(() => {
    if (weeklySummary && weeklySummary.totalMinutes !== undefined) {
      setTotalMinutes(weeklySummary.totalMinutes);
    } else {
      setTotalMinutes(0);
    }
  }, [weeklySummary]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Preparar datos para actualizar
      const updatedData = {
        nombre: profileData.nombre,
        email: profileData.email,
        fechaNacimiento: profileData.fecha_nacimiento,
        genero: profileData.género,
        altura: profileData.altura,
        pesoActual: profileData.peso_actual,
        objetivoPeso: profileData.objetivo_peso,
        nivelActividad: profileData.nivel_actividad,
      };

      // Actualizar usuario
      await updateUser(user.userId, updatedData); // Recargar datos actualizados
      const updatedUser = await getUserById(user.userId);
      setUserData(updatedUser);

      setEditingProfile(false);
      console.log("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [{ id: "perfil", name: "Perfil", icon: User, color: "emerald" }];

  // Componente de Perfil
  const ProfileSection = () => {
    if (isLoadingUser) {
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

    const edad = calcularEdad(profileData.fecha_nacimiento);
    const imc = calcularIMC();
    const estadoIMC = getEstadoIMC(imc);

    // Calcular diferencia de peso para el objetivo
    const diferenciaPeso =
      userData && userData.pesoActual && userData.objetivoPeso
        ? (
            parseFloat(userData.objetivoPeso) - parseFloat(userData.pesoActual)
          ).toFixed(1)
        : null;

    // Cards de métricas principales con datos dinámicos
    const metrics = [
      {
        icon: Target,
        title: imc || "--",
        subtitle: "IMC (kg/m²)",
        status: estadoIMC.estado,
        change: "+0.2",
        changeColor: "text-emerald-600",
        bgColor: darkMode ? "bg-emerald-500/10" : "bg-emerald-50",
        iconBg: darkMode ? "bg-emerald-500/20" : "bg-emerald-100",
        iconColor: "text-emerald-600",
        statusColor:
          estadoIMC.color === "green"
            ? "text-emerald-600"
            : estadoIMC.color === "yellow"
            ? "text-yellow-600"
            : estadoIMC.color === "red"
            ? "text-red-600"
            : "text-blue-600",
      },
      {
        icon: TrendingUp,
        title: diferenciaPeso ? Math.abs(diferenciaPeso) : "--",
        subtitle: "Peso Objetivo (kg restantes)",
        status: diferenciaPeso > 0 ? "En progreso" : "Logrado",
        change: diferenciaPeso > 0 ? "-1.2" : "¡Meta alcanzada!",
        changeColor: diferenciaPeso > 0 ? "text-red-500" : "text-emerald-600",
        bgColor: darkMode ? "bg-blue-500/10" : "bg-blue-50",
        iconBg: darkMode ? "bg-blue-500/20" : "bg-blue-100",
        iconColor: "text-blue-600",
        statusColor: diferenciaPeso > 0 ? "text-blue-600" : "text-emerald-600",
      },
      {
        icon: Activity,
        title:
          userData?.nivelActividad === "bajo"
            ? "2.5"
            : userData?.nivelActividad === "moderado"
            ? "4.2"
            : "6.8",
        subtitle: "Actividad Semanal (horas)",
        status:
          userData?.nivelActividad === "bajo"
            ? "Principiante"
            : userData?.nivelActividad === "moderado"
            ? "Activo"
            : "Avanzado",
        change: "+15%",
        changeColor: "text-emerald-600",
        bgColor: darkMode ? "bg-green-500/10" : "bg-green-50",
        iconBg: darkMode ? "bg-green-500/20" : "bg-green-100",
        iconColor: "text-green-600",
        statusColor: "text-green-600",
      },
      {
        icon: Flame,
        title: totalCalories.toLocaleString() || "--",
        subtitle: "Calorías Consumidas (semana)",
        status:
          totalMinutes > 0 ? `${totalMinutes} min actividad` : "Sin actividad",
        change: "+5%",
        changeColor: "text-emerald-600",
        bgColor: darkMode ? "bg-orange-500/10" : "bg-orange-50",
        iconBg: darkMode ? "bg-orange-500/20" : "bg-orange-100",
        iconColor: "text-orange-600",
        statusColor: "text-orange-600",
      },
    ];

    return (
      <div className="space-y-8">
        {/* Cards de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
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
                    {profileData.nombre || "Usuario"}
                  </h2>
                  <p
                    className={`text-base mt-1 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {profileData.email}
                  </p>
                  <div className="flex items-center mt-3 space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Perfil Activo
                    </span>
                  </div>
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
              {/* Información personal */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                    }`}
                  >
                    <User
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
                    Información Personal
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
                    {
                      icon: Calendar,
                      label: "Edad",
                      value: edad !== null ? `${edad} años` : "No especificado",
                      field: "fecha_nacimiento",
                      type: "date",
                      showAge: true,
                    },
                    {
                      icon: User,
                      label: "Género",
                      value: profileData.género || "No especificado",
                      field: "género",
                      type: "select",
                      options: ["masculino", "femenino", "otro"],
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
                        {editingProfile && item.field === "fecha_nacimiento" ? (
                          <div>
                            <input
                              type="date"
                              value={profileData.fecha_nacimiento || ""}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  fecha_nacimiento: e.target.value,
                                }))
                              }
                              className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                                darkMode
                                  ? "border-white/20 bg-white/10 text-white placeholder-gray-400"
                                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                              }`}
                            />
                            {profileData.fecha_nacimiento && (
                              <p className="text-sm text-gray-500 mt-1">
                                Edad calculada:{" "}
                                {calcularEdad(profileData.fecha_nacimiento)}{" "}
                                años
                              </p>
                            )}
                          </div>
                        ) : editingProfile && item.field === "género" ? (
                          <select
                            value={profileData.género || ""}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                género: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                              darkMode
                                ? "border-white/20 bg-white/10 text-white"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                          >
                            <option value="">Seleccionar género</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                          </select>
                        ) : editingProfile ? (
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

              {/* Métricas corporales */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode ? "bg-blue-500/20" : "bg-blue-100"
                    }`}
                  >
                    <Activity
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
                    Métricas Corporales
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: Ruler,
                      label: "Altura",
                      value: profileData.altura,
                      field: "altura",
                      type: "number",
                      unidad: "cm",
                    },
                    {
                      icon: Weight,
                      label: "Peso Actual",
                      value: profileData.peso_actual,
                      field: "peso_actual",
                      type: "number",
                      unidad: "kg",
                    },
                    {
                      icon: Target,
                      label: "Peso Objetivo",
                      value: profileData.objetivo_peso,
                      field: "objetivo_peso",
                      type: "number",
                      unidad: "kg",
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
                          <div className="flex items-center">
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
                            />
                            <span className="ml-2 text-gray-500">
                              {item.unidad}
                            </span>
                          </div>
                        ) : (
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {item.value || "No especificado"}{" "}
                            {item.value && item.unidad}
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
            Mi Dashboard
          </h1>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Tu centro de control para una vida saludable
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
