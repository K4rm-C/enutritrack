import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Target,
  Activity,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  UserPlus,
  TrendingUp,
  Heart,
  X,
  Lock,
  ChevronDown,
  Utensils,
  HeartPulse,
  Brain,
  History,
  BarChart3,
  Apple,
  Flame,
  Clock,
  Calendar as CalendarIcon,
  MapIcon,
  Scale,
  Droplets,
  Dumbbell,
  DumbbellIcon,
  FileText,
  Stethoscope,
  StethoscopeIcon,
  AlertTriangle,
  Thermometer,
  ThermometerIcon,
} from "lucide-react";
import { useUsers } from "../../context/user/user.context";
import { useAuth } from "../../context/auth/auth.context";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UsersListDashboard = ({ darkMode = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterActivity, setFilterActivity] = useState("");
  const [sortBy, setSortBy] = useState("nombre");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { createUser, updateUser, getUsers, getUsersByDoctorId, deleteUser } = useUsers();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    contraseña: "",
    genero: "",
    fecha_nacimiento: "",
    altura: "",
    peso_actual: "",
    objetivo_peso: "",
    nivel_actividad: "",
    doctorId: user?.userId || "",
  });

  // Actualizar formData cuando user cambie
  useEffect(() => {
    if (user?.userId) {
      setFormData((prev) => ({
        ...prev,
        doctorId: user.userId,
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenForm = (userdata = null) => {
    if (userdata) {
      // Modo edición
      setEditingUser(userdata);
      setFormData({
        nombre: userdata.nombre || "",
        email: userdata.email || "",
        contraseña: "",
        genero: userdata.genero || userdata.género || "",
        fecha_nacimiento:
          userdata.fechaNacimiento || userdata.fecha_nacimiento || "",
        altura: userdata.altura || "",
        peso_actual: userdata.pesoActual || userdata.peso_actual || "",
        objetivo_peso: userdata.objetivoPeso || userdata.objetivo_peso || "",
        nivel_actividad:
          userdata.nivelActividad || userdata.nivel_actividad || "",
        doctorId: user?.userId || "",
      });
    } else {
      // Modo creación
      setEditingUser(null);
      setFormData({
        nombre: "",
        email: "",
        contraseña: "",
        genero: "",
        fecha_nacimiento: "",
        altura: "",
        peso_actual: "",
        objetivo_peso: "",
        nivel_actividad: "",
        doctorId: user?.userId || "",
      });
    }
    setShowFormModal(true);
  };

  // Función para calcular edad
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    try {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      if (isNaN(nacimiento.getTime())) return null;
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    } catch (error) {
      return null;
    }
  };

  // Función para calcular IMC
  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return null;
    const alturaEnMetros = parseFloat(altura) / 100;
    const pesoNum = parseFloat(peso);
    if (alturaEnMetros <= 0 || pesoNum <= 0) return null;
    return (pesoNum / (alturaEnMetros * alturaEnMetros)).toFixed(1);
  };

  // Función para obtener estado del IMC
  const getEstadoIMC = (imc) => {
    if (!imc) return { estado: "Sin datos", color: "gray" };
    const valorIMC = parseFloat(imc);
    if (valorIMC < 18.5) return { estado: "Bajo peso", color: "blue" };
    if (valorIMC < 25) return { estado: "Normal", color: "green" };
    if (valorIMC < 30) return { estado: "Sobrepeso", color: "yellow" };
    return { estado: "Obesidad", color: "red" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Actualizar usuario existente
        const updatedUser = await updateUser(editingUser.userId, formData);
        setUsers(
          users.map((user) =>
            user.id === editingUser.userId ? updatedUser : user
          )
        );
        toast.success("Usuario actualizado correctamente");
      } else {
        // Crear nuevo usuario
        const newUser = await createUser(formData);
        setUsers([...users, newUser]);
        toast.success("Usuario creado correctamente");
      }
      setShowFormModal(false);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      toast.error("Error al guardar el usuario");
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      if (!user?.id) {
        console.log('No hay usuario logueado');
        return;
      }

      setIsLoading(true);
      try {
        console.log('Cargando pacientes del doctor:', user.id);
        
        // Usar el endpoint optimizado para obtener solo los pacientes de este doctor
        const usersData = await getUsersByDoctorId(user.id);
        console.log('Pacientes recibidos del doctor:', usersData);
        
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error("Error cargando pacientes del doctor:", error);
        toast.error("Error al cargar los pacientes");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, [user?.id]);

  // Filtrar y ordenar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender =
      !filterGender ||
      user.genero === filterGender ||
      user.género === filterGender;
    const matchesActivity =
      !filterActivity ||
      user.nivelActividad === filterActivity ||
      user.nivel_actividad === filterActivity;

    return matchesSearch && matchesGender && matchesActivity;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy] || "";
    let bValue = b[sortBy] || "";

    if (sortBy === "edad") {
      aValue = calcularEdad(a.fechaNacimiento || a.fecha_nacimiento) || 0;
      bValue = calcularEdad(b.fechaNacimiento || b.fecha_nacimiento) || 0;
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const u = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  // Estadísticas generales
  const stats = {
    total: u.length,
    hombres: u.filter((u) => (u.genero || u.género) === "M").length,
    mujeres: u.filter((u) => (u.genero || u.género) === "F").length,
    edadPromedio:
      u.length > 0
        ? (
            u.reduce((sum, u) => {
              const edad = calcularEdad(
                u.fechaNacimiento || u.fecha_nacimiento
              );
              return sum + (edad || 0);
            }, 0) /
            u.filter((u) =>
              calcularEdad(u.fechaNacimiento || u.fecha_nacimiento)
            ).length
          ).toFixed(1)
        : 0,
  };

  const handleDeleteUser = async (userId) => {
    // Mostrar toast de confirmación
    toast.info(
      <div>
        <p>¿Estás seguro de que quieres eliminar este usuario?</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: "10px",
          }}
        >
          <button
            onClick={async () => {
              try {
                await deleteUser(userId);
                setUsers(u.filter((user) => user.id !== userId));
                toast.success("Usuario eliminado correctamente");
              } catch (error) {
                console.error("Error eliminando usuario:", error);
                toast.error("Error al eliminar el usuario");
              }
              toast.dismiss();
            }}
            style={{
              padding: "5px 15px",
              backgroundColor: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Sí, eliminar
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{
              padding: "5px 15px",
              backgroundColor: "#718096",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const UserCard = ({ user }) => {
    const edad = calcularEdad(user.fechaNacimiento || user.fecha_nacimiento);
    const imc = calcularIMC(user.pesoActual || user.peso_actual, user.altura);
    const estadoIMC = getEstadoIMC(imc);

    return (
      <div
        className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
          darkMode
            ? "bg-white/5 border border-white/10 hover:bg-white/10"
            : "bg-white border border-gray-200/50 hover:shadow-lg"
        }`}
      >
        {/* Header de la card */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                darkMode
                  ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-600"
              }`}
            >
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3
                className={`font-semibold text-lg ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {user.nombre || "Sin nombre"}
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {user.email}
              </p>
            </div>
          </div>

          {/* Menú de acciones */}
          <div className="relative group">
            <button
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-white/10 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            <div
              className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowUserModal(true);
                }}
                className={`w-full flex items-center px-4 py-2 text-sm hover:bg-opacity-50 ${
                  darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </button>
              <button
                onClick={() => handleOpenForm(user)}
                className={`w-full flex items-center px-4 py-2 text-sm hover:bg-opacity-50 ${
                  darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className={`w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 ${
                  darkMode ? "hover:bg-red-900/20" : ""
                }`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Edad
            </span>
            <span className={darkMode ? "text-white" : "text-gray-900"}>
              {edad ? `${edad} años` : "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Género
            </span>
            <span className={darkMode ? "text-white" : "text-gray-900"}>
              {user.genero || user.género || "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              IMC
            </span>
            <div className="flex items-center space-x-2">
              <span className={darkMode ? "text-white" : "text-gray-900"}>
                {imc || "N/A"}
              </span>
              {imc && (
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    estadoIMC.color === "green"
                      ? "bg-green-100 text-green-800"
                      : estadoIMC.color === "yellow"
                      ? "bg-yellow-100 text-yellow-800"
                      : estadoIMC.color === "red"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {estadoIMC.estado}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Actividad
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                (user.nivelActividad || user.nivel_actividad) === "alto"
                  ? "bg-green-100 text-green-800"
                  : (user.nivelActividad || user.nivel_actividad) === "moderado"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {user.nivelActividad || user.nivel_actividad || "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const UserModal = () => {
    if (!selectedUser) return null;

    const [activeTab, setActiveTab] = useState("personal");
    const edad = calcularEdad(
      selectedUser.fechaNacimiento || selectedUser.fecha_nacimiento
    );
    const imc = calcularIMC(
      selectedUser.pesoActual || selectedUser.peso_actual,
      selectedUser.altura
    );
    const estadoIMC = getEstadoIMC(imc);

    // Datos de ejemplo para las nuevas secciones
    const nutritionalData = {
      dailyCalories: 2000,
      protein: 150,
      carbs: 250,
      fat: 70,
      water: 2.5,
      meals: [
        { time: "08:00", name: "Desayuno", calories: 450, icon: "☀️" },
        { time: "13:00", name: "Almuerzo", calories: 650, icon: "🌅" },
        { time: "18:00", name: "Cena", calories: 600, icon: "🌙" },
        { time: "11:00", name: "Merienda", calories: 300, icon: "🍎" },
      ],
    };

    const activityData = {
      dailySteps: 8543,
      activeMinutes: 45,
      workouts: [
        {
          date: "2023-10-15",
          type: "Caminata",
          duration: 30,
          calories: 180,
          icon: "🚶",
        },
        {
          date: "2023-10-14",
          type: "Yoga",
          duration: 45,
          calories: 150,
          icon: "🧘",
        },
        {
          date: "2023-10-13",
          type: "Ciclismo",
          duration: 60,
          calories: 420,
          icon: "🚴",
        },
      ],
    };

    const aiRecommendations = [
      {
        text: "Aumentar ingesta de proteínas en 10% para mejorar tono muscular",
        priority: "high",
        category: "nutrición",
      },
      {
        text: "Considerar reducir carbohidratos simples después de las 6 PM",
        priority: "medium",
        category: "nutrición",
      },
      {
        text: "Incluir 15 minutos más de cardio en tu rutina semanal",
        priority: "high",
        category: "ejercicio",
      },
      {
        text: "Mantener hidratación con al menos 2L de agua diarios",
        priority: "medium",
        category: "salud",
      },
    ];

    const medicalHistory = [
      {
        date: "2023-08-12",
        diagnosis: "Control rutinario",
        doctor: "Dr. Pérez",
        status: "completed",
        notes: "Resultados dentro de parámetros normales",
      },
      {
        date: "2023-05-22",
        diagnosis: "Resfriado común",
        doctor: "Dr. González",
        status: "resolved",
        notes: "Recuperación completa en 7 días",
      },
      {
        date: "2023-02-10",
        diagnosis: "Chequeo anual",
        doctor: "Dr. López",
        status: "completed",
        notes: "Exámenes preventivos realizados",
      },
    ];

    // Componente para métricas con progreso
    const MetricCard = ({
      icon: Icon,
      label,
      value,
      progress,
      color = "blue",
    }) => (
      <div
        className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 ${
          darkMode
            ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-gray-600/50"
            : "bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <Icon className={`h-6 w-6 text-${color}-500`} />
          {progress && (
            <div
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                darkMode
                  ? `bg-${color}-900/50 text-${color}-300`
                  : `bg-${color}-100 text-${color}-700`
              }`}
            >
              {progress}%
            </div>
          )}
        </div>
        <p
          className={`text-sm font-medium mb-1 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {label}
        </p>
        <p
          className={`text-lg font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {value}
        </p>
        {progress && (
          <div
            className={`mt-2 h-1.5 rounded-full overflow-hidden ${
              darkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <div
              className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-600 transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );

    // Componente para tabs mejorado
    const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
      <button
        onClick={() => onClick(id)}
        className={`relative flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
          isActive
            ? darkMode
              ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700/50"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : darkMode
            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
        {isActive && (
          <div
            className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
              darkMode ? "bg-emerald-400" : "bg-emerald-500"
            }`}
          />
        )}
      </button>
    );

    const tabs = [
      { id: "personal", label: "Personal", icon: User },
      { id: "nutrition", label: "Nutrición", icon: Apple },
      { id: "activity", label: "Actividad", icon: Activity },
      { id: "ai", label: "IA Recomendaciones", icon: Brain },
      { id: "medical", label: "Historial", icon: File },
    ];

    // Componentes para cada pestaña
    const PersonalInfoTab = () => (
      <div className="space-y-8">
        <div>
          <h3
            className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <User className="h-5 w-5 text-emerald-500" />
            <span>Información Personal</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MetricCard
              icon={Mail}
              label="Email"
              value={selectedUser.email}
              color="emerald"
            />
            <MetricCard
              icon={Calendar}
              label="Edad"
              value={edad ? `${edad} años` : "No especificado"}
              color="emerald"
            />
            <MetricCard
              icon={User}
              label="Género"
              value={
                selectedUser.genero || selectedUser.género || "No especificado"
              }
              color="emerald"
            />
            <MetricCard
              icon={MapIcon}
              label="Ubicación"
              value="México"
              color="emerald"
            />
          </div>
        </div>

        <div>
          <h3
            className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Scale className="h-5 w-5 text-blue-500" />
            <span>Métricas Corporales</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MetricCard
              icon={Ruler}
              label="Altura"
              value={
                selectedUser.altura
                  ? `${selectedUser.altura} cm`
                  : "No especificado"
              }
              color="blue"
            />
            <MetricCard
              icon={Weight}
              label="Peso Actual"
              value={
                selectedUser.pesoActual || selectedUser.peso_actual
                  ? `${selectedUser.pesoActual || selectedUser.peso_actual} kg`
                  : "No especificado"
              }
              progress={75}
              color="blue"
            />
            <MetricCard
              icon={Target}
              label="Peso Objetivo"
              value={
                selectedUser.objetivoPeso || selectedUser.objetivo_peso
                  ? `${
                      selectedUser.objetivoPeso || selectedUser.objetivo_peso
                    } kg`
                  : "No especificado"
              }
              color="blue"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={`p-6 rounded-xl ${
                darkMode
                  ? "bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-800/30"
                  : "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200"
              }`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp
                  className={`h-6 w-6 ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
                <h4
                  className={`font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Índice de Masa Corporal
                </h4>
              </div>
              <div className="text-center">
                <div
                  className={`text-3xl font-bold mb-2 ${
                    darkMode ? "text-purple-300" : "text-purple-700"
                  }`}
                >
                  {imc || "--"}
                </div>
                <div
                  className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
                    estadoIMC?.color === "green"
                      ? darkMode
                        ? "bg-green-900/50 text-green-300"
                        : "bg-green-100 text-green-800"
                      : estadoIMC?.color === "yellow"
                      ? darkMode
                        ? "bg-yellow-900/50 text-yellow-300"
                        : "bg-yellow-100 text-yellow-800"
                      : darkMode
                      ? "bg-red-900/50 text-red-300"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {estadoIMC?.estado || "Sin datos"}
                </div>
              </div>
            </div>

            <MetricCard
              icon={Activity}
              label="Nivel de Actividad"
              value={
                selectedUser.nivelActividad ||
                selectedUser.nivel_actividad ||
                "No especificado"
              }
              progress={60}
              color="indigo"
            />
          </div>
        </div>
      </div>
    );

    const NutritionTab = () => (
      <div className="space-y-8">
        <div>
          <h3
            className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Apple className="h-5 w-5 text-green-500" />
            <span>Panel Nutricional</span>
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard
              icon={Flame}
              label="Calorías"
              value={`${nutritionalData.dailyCalories} kcal`}
              progress={85}
              color="orange"
            />
            <MetricCard
              icon={Apple}
              label="Proteínas"
              value={`${nutritionalData.protein} g`}
              progress={92}
              color="red"
            />
            <MetricCard
              icon={BarChart3}
              label="Carbohidratos"
              value={`${nutritionalData.carbs} g`}
              progress={78}
              color="yellow"
            />
            <MetricCard
              icon={TrendingUp}
              label="Grasas"
              value={`${nutritionalData.fat} g`}
              progress={65}
              color="purple"
            />
            <MetricCard
              icon={Droplets}
              label="Agua"
              value={`${nutritionalData.water} L`}
              progress={83}
              color="blue"
            />
          </div>
        </div>

        <div>
          <h4
            className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Clock className="h-5 w-5 text-emerald-500" />
            <span>Registro de Comidas</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nutritionalData.meals.map((meal, index) => (
              <div
                key={index}
                className={`group p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? "bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/50 hover:border-emerald-500/30"
                    : "bg-gradient-to-r from-white to-gray-50 border border-gray-200 hover:border-emerald-300 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{meal.icon}</span>
                    <div>
                      <p
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {meal.name}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {meal.time}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-right ${
                      darkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    <div className="font-bold text-lg">{meal.calories}</div>
                    <div className="text-xs">kcal</div>
                  </div>
                </div>
                <div
                  className={`h-1.5 rounded-full overflow-hidden ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                    style={{ width: `${(meal.calories / 700) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const ActivityTab = () => (
      <div className="space-y-8">
        <div>
          <h3
            className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Activity className="h-5 w-5 text-blue-500" />
            <span>Resumen de Actividad</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <MetricCard
              icon={Activity}
              label="Pasos diarios"
              value={activityData.dailySteps.toLocaleString()}
              progress={85}
              color="blue"
            />
            <MetricCard
              icon={Clock}
              label="Minutos activos"
              value={activityData.activeMinutes}
              progress={75}
              color="indigo"
            />
            <MetricCard
              icon={Flame}
              label="Calorías quemadas"
              value="645 kcal"
              progress={88}
              color="orange"
            />
          </div>
        </div>

        <div>
          <h4
            className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <DumbbellIcon className="h-5 w-5 text-purple-500" />
            <span>Historial de Ejercicios</span>
          </h4>

          <div className="space-y-4">
            {activityData.workouts.map((workout, index) => (
              <div
                key={index}
                className={`group p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                  darkMode
                    ? "bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/50 hover:border-purple-500/30"
                    : "bg-gradient-to-r from-white to-gray-50 border border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-purple-900/50" : "bg-purple-100"
                      }`}
                    >
                      <span className="text-2xl">{workout.icon}</span>
                    </div>
                    <div>
                      <h5
                        className={`font-semibold text-lg ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {workout.type}
                      </h5>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {workout.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div
                      className={`font-medium ${
                        darkMode ? "text-purple-400" : "text-purple-600"
                      }`}
                    >
                      {workout.duration} min
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        darkMode ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    >
                      {workout.calories} kcal
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const AIRecommendationsTab = () => (
      <div className="space-y-8">
        <div>
          <h3
            className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Brain className="h-5 w-5 text-purple-500" />
            <span>Recomendaciones Personalizadas con IA</span>
          </h3>

          <div className="space-y-4">
            {aiRecommendations.map((recommendation, index) => {
              const priorityColors = {
                high: darkMode
                  ? "from-red-900/30 to-orange-900/30 border-red-800/50 text-red-200"
                  : "from-red-50 to-orange-50 border-red-200 text-red-800",
                medium: darkMode
                  ? "from-yellow-900/30 to-amber-900/30 border-yellow-800/50 text-yellow-200"
                  : "from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800",
                low: darkMode
                  ? "from-green-900/30 to-emerald-900/30 border-green-800/50 text-green-200"
                  : "from-green-50 to-emerald-50 border-green-200 text-green-800",
              };

              return (
                <div
                  key={index}
                  className={`group p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r ${
                    priorityColors[recommendation.priority]
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-2 rounded-lg ${
                        recommendation.priority === "high"
                          ? darkMode
                            ? "bg-red-800/50"
                            : "bg-red-100"
                          : recommendation.priority === "medium"
                          ? darkMode
                            ? "bg-yellow-800/50"
                            : "bg-yellow-100"
                          : darkMode
                          ? "bg-green-800/50"
                          : "bg-green-100"
                      }`}
                    >
                      <Brain className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            recommendation.priority === "high"
                              ? darkMode
                                ? "bg-red-800 text-red-200"
                                : "bg-red-200 text-red-800"
                              : recommendation.priority === "medium"
                              ? darkMode
                                ? "bg-yellow-800 text-yellow-200"
                                : "bg-yellow-200 text-yellow-800"
                              : darkMode
                              ? "bg-green-800 text-green-200"
                              : "bg-green-200 text-green-800"
                          }`}
                        >
                          {recommendation.category.toUpperCase()}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            recommendation.priority === "high"
                              ? darkMode
                                ? "bg-red-700 text-red-100"
                                : "bg-red-100 text-red-700"
                              : recommendation.priority === "medium"
                              ? darkMode
                                ? "bg-yellow-700 text-yellow-100"
                                : "bg-yellow-100 text-yellow-700"
                              : darkMode
                              ? "bg-green-700 text-green-100"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {recommendation.priority === "high"
                            ? "ALTA"
                            : recommendation.priority === "medium"
                            ? "MEDIA"
                            : "BAJA"}
                        </span>
                      </div>
                      <p className="font-medium leading-relaxed">
                        {recommendation.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border ${
            darkMode
              ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50"
              : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
          }`}
        >
          <h4
            className={`font-bold text-lg mb-4 flex items-center space-x-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Plan de Acción Semanal</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                day: "Lunes",
                activity: "30 min cardio + aumento proteínas",
                icon: "💪",
              },
              {
                day: "Martes",
                activity: "Entrenamiento fuerza + reducir carbohidratos noche",
                icon: "🏋️",
              },
              {
                day: "Miércoles",
                activity: "Descanso activo (caminata 20 min)",
                icon: "🚶",
              },
              {
                day: "Jueves",
                activity: "40 min cardio + control hidratación",
                icon: "🏃",
              },
              {
                day: "Viernes",
                activity: "Entrenamiento fuerza + medir progreso",
                icon: "📊",
              },
              {
                day: "Sábado",
                activity: "Actividad recreativa (60 min)",
                icon: "🎯",
              },
              {
                day: "Domingo",
                activity: "Descanso y planificación semana siguiente",
                icon: "📅",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-gray-700/50" : "bg-white/70"
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <span
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {item.activity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const MedicalHistoryTab = () => (
      <div className="space-y-8">
        <div>
          <h3
            className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <FileText className="h-5 w-5 text-green-500" />
            <span>Historial Médico</span>
          </h3>

          <div className="space-y-4">
            {medicalHistory.map((record, index) => {
              const statusColors = {
                completed: darkMode
                  ? "bg-green-900/30 text-green-300 border-green-800/50"
                  : "bg-green-50 text-green-800 border-green-200",
                resolved: darkMode
                  ? "bg-blue-900/30 text-blue-300 border-blue-800/50"
                  : "bg-blue-50 text-blue-800 border-blue-200",
                pending: darkMode
                  ? "bg-yellow-900/30 text-yellow-300 border-yellow-800/50"
                  : "bg-yellow-50 text-yellow-800 border-yellow-200",
              };

              return (
                <div
                  key={index}
                  className={`group p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                    darkMode
                      ? "bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-700/50 hover:border-green-500/30"
                      : "bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          darkMode ? "bg-green-900/50" : "bg-green-100"
                        }`}
                      >
                        <StethoscopeIcon
                          className={`h-5 w-5 ${
                            darkMode ? "text-green-400" : "text-green-600"
                          }`}
                        />
                      </div>
                      <div>
                        <h4
                          className={`font-semibold text-lg ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {record.diagnosis}
                        </h4>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Dr. {record.doctor} • {record.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full border ${
                        statusColors[record.status]
                      }`}
                    >
                      {record.status === "completed"
                        ? "COMPLETADO"
                        : record.status === "resolved"
                        ? "RESUELTO"
                        : "PENDIENTE"}
                    </span>
                  </div>

                  <p
                    className={`text-sm mb-3 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {record.notes}
                  </p>

                  {index === 0 && (
                    <div
                      className={`p-4 rounded-lg border-l-4 ${
                        darkMode
                          ? "bg-blue-900/20 border-blue-500 text-blue-200"
                          : "bg-blue-50 border-blue-500 text-blue-800"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Próxima Cita</span>
                      </div>
                      <p className="text-sm">
                        15 de Noviembre, 2023 - Dr. Pérez (Control de progreso)
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4
              className={`font-bold text-lg mb-4 flex items-center space-x-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Alergias y Condiciones</span>
            </h4>
            <div className="space-y-3">
              {[
                { text: "Sin alergias conocidas", type: "success", icon: "✅" },
                { text: "Presión arterial normal", type: "info", icon: "💓" },
                {
                  text: "Sin condiciones crónicas",
                  type: "success",
                  icon: "🌟",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    item.type === "success"
                      ? darkMode
                        ? "bg-green-900/30 border border-green-800/50"
                        : "bg-green-50 border border-green-200"
                      : darkMode
                      ? "bg-blue-900/30 border border-blue-800/50"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className={`font-medium ${
                      item.type === "success"
                        ? darkMode
                          ? "text-green-200"
                          : "text-green-800"
                        : darkMode
                        ? "text-blue-200"
                        : "text-blue-800"
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4
              className={`font-bold text-lg mb-4 flex items-center space-x-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <Heart className="h-5 w-5 text-red-500" />
              <span>Signos Vitales</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={Heart}
                label="Frecuencia Cardíaca"
                value="72 bpm"
                progress={85}
                color="red"
              />
              <MetricCard
                icon={ThermometerIcon}
                label="Temperatura"
                value="36.5°C"
                progress={100}
                color="orange"
              />
              <MetricCard
                icon={Activity}
                label="Presión Arterial"
                value="120/80"
                progress={90}
                color="green"
              />
              <MetricCard
                icon={Droplets}
                label="Saturación O2"
                value="98%"
                progress={98}
                color="blue"
              />
            </div>
          </div>
        </div>
      </div>
    );

    // Renderizar la pestaña activa
    const renderActiveTab = () => {
      switch (activeTab) {
        case "personal":
          return <PersonalInfoTab />;
        case "nutrition":
          return <NutritionTab />;
        case "activity":
          return <ActivityTab />;
        case "ai":
          return <AIRecommendationsTab />;
        case "medical":
          return <MedicalHistoryTab />;
        default:
          return <PersonalInfoTab />;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${
            darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          {/* Header del modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
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
                  {selectedUser.nombre}
                </h2>
                <p
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {selectedUser.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUserModal(false)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Pestañas de navegación */}
          <div
            className={`border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex overflow-x-auto px-6">
              {[
                { id: "personal", label: "Personal", icon: User },
                { id: "nutrition", label: "Nutrición", icon: Utensils },
                { id: "activity", label: "Actividad", icon: HeartPulse },
                { id: "ai", label: "Recomendaciones IA", icon: Brain },
                { id: "medical", label: "Historial Médico", icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? darkMode
                        ? "border-emerald-400 text-emerald-400"
                        : "border-emerald-600 text-emerald-600"
                      : `border-transparent ${
                          darkMode
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        }`
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">{renderActiveTab()}</div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen transition-all duration-500 ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className={`text-4xl font-bold mb-2 tracking-tight ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Gestión de Pacientes
            </h1>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Administra todos los pacientes del sistema
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Nuevo Paciente
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            className={`p-6 rounded-2xl ${
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
                  {stats.total}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Pacientes
                </p>
              </div>
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div
            className={`p-6 rounded-2xl ${
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
                  {stats.hombres}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Hombres
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div
            className={`p-6 rounded-2xl ${
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
                  {stats.mujeres}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Mujeres
                </p>
              </div>
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
          </div>

          <div
            className={`p-6 rounded-2xl ${
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
                  {stats.edadPromedio}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Edad Promedio
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div
          className={`p-6 rounded-2xl mb-8 ${
            darkMode
              ? "bg-white/5 border border-white/10"
              : "bg-white border border-gray-200/50"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Buscar pacientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                  darkMode
                    ? "border-white/20 bg-white/10 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Filtro por género */}
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                darkMode
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="">Todos los géneros</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>

            {/* Filtro por actividad */}
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
              className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                darkMode
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="">Todos los niveles</option>
              <option value="sedentario">Bajo</option>
              <option value="moderado">Moderado</option>
              <option value="activo">Alto</option>
              <option value="muy_activo">Muy Alto</option>
            </select>

            {/* Ordenar */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                darkMode
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="nombre-asc">Nombre A-Z</option>
              <option value="nombre-desc">Nombre Z-A</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
              <option value="edad-asc">Edad (Menor a mayor)</option>
              <option value="edad-desc">Edad (Mayor a menor)</option>
            </select>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Mostrando {indexOfFirstUser + 1}-
              {Math.min(indexOfLastUser, sortedUsers.length)} de{" "}
              {sortedUsers.length} pacientes
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 1
                    ? darkMode
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : darkMode
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Anterior
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentPage === page
                        ? "bg-emerald-600 text-white"
                        : darkMode
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === totalPages
                    ? darkMode
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : darkMode
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay usuarios */}
        {sortedUsers.length === 0 && (
          <div
            className={`text-center py-12 rounded-2xl ${
              darkMode
                ? "bg-white/5 border border-white/10"
                : "bg-white border border-gray-200/50"
            }`}
          >
            <Users
              className={`h-12 w-12 mx-auto mb-4 ${
                darkMode ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <h3
              className={`text-lg font-medium mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              No se encontraron pacientes
            </h3>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {searchTerm || filterGender || filterActivity
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay pacientes registrados en el sistema"}
            </p>
          </div>
        )}

        {/* Modal de detalles del usuario */}
        {showUserModal && <UserModal />}

        {/* Modal de formulario (se mantiene igual) */}
        {showFormModal && (
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
                    <UserPlus
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
                      {editingUser ? "Editar Usuario" : "Crear Usuario"}
                    </h2>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {editingUser
                        ? "Actualiza la información del usuario"
                        : "Completa todos los campos requeridos"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFormModal(false)}
                  className={`p-2 rounded-full transition-colors ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="p-6 max-h-[70vh] overflow-y-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Columna izquierda */}
                  <div className="space-y-5">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Nombre completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          required
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                            darkMode
                              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                          }`}
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                            darkMode
                              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                          }`}
                          placeholder="ejemplo@correo.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="password"
                          name="contraseña"
                          value={formData.contraseña}
                          onChange={handleInputChange}
                          required={!editingUser}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                            darkMode
                              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                          }`}
                          placeholder={
                            editingUser
                              ? "Dejar en blanco para no cambiar"
                              : "Mínimo 8 caracteres"
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Género
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          name="genero"
                          value={formData.genero}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-10 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 appearance-none ${
                            darkMode
                              ? "border-gray-700 bg-gray-800 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        >
                          <option value="">Seleccionar género</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                          <option value="O">Otro</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-5">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Fecha de Nacimiento
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="fecha_nacimiento"
                          value={formData.fecha_nacimiento}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
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
                        Altura (cm)
                      </label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          name="altura"
                          value={formData.altura}
                          onChange={handleInputChange}
                          min="0"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                            darkMode
                              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                          }`}
                          placeholder="Ej: 175"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Peso Actual (kg)
                      </label>
                      <div className="relative">
                        <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          step="0.1"
                          name="peso_actual"
                          value={formData.peso_actual}
                          onChange={handleInputChange}
                          min="0"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                            darkMode
                              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                          }`}
                          placeholder="Ej: 68.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Peso Objetivo (kg)
                      </label>
                      <div className="relative">
                        <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          step="0.1"
                          name="objetivo_peso"
                          value={formData.objetivo_peso}
                          onChange={handleInputChange}
                          min="0"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
                            darkMode
                              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                          }`}
                          placeholder="Ej: 65.0"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Nivel de Actividad
                      </label>
                      <div className="relative">
                        <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          name="nivel_actividad"
                          value={formData.nivel_actividad}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-10 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 appearance-none ${
                            darkMode
                              ? "border-gray-700 bg-gray-800 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        >
                          <option value="">Seleccionar nivel</option>
                          <option value="sedentario">Sedentario</option>
                          <option value="moderado">Moderado</option>
                          <option value="activo">Activo</option>
                          <option value="muy_activo">Muy Activo</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campo oculto para doctorId */}
                <input
                  type="hidden"
                  name="doctorId"
                  value={formData.doctorId}
                />

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3 pt-8 mt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
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
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    {editingUser ? "Actualizar Usuario" : "Crear Usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersListDashboard;
