import React, { useState, useCallback } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Ruler,
  Weight,
  Target,
  Activity,
  CircleSmall,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth/auth.context";
import { useUsers } from "../context/user/user.context";

// Componente InputField memoizado FUERA del componente principal
const InputField = React.memo(
  ({
    label,
    name,
    type = "text",
    value,
    onChange,
    onKeyPress,
    error,
    icon: Icon,
    placeholder,
    showPassword,
    togglePassword,
  }) => (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              className={`h-5 w-5 transition-colors duration-200 ${
                error
                  ? "text-red-500"
                  : "text-gray-400 group-focus-within:text-emerald-500"
              }`}
            />
          </div>
        )}
        <input
          type={type === "password" && showPassword ? "text" : type}
          id={name}
          name={name}
          value={value || ""}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          autoComplete={type === "password" ? "current-password" : "on"}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} ${
            type === "password" ? "pr-10" : "pr-3"
          } py-3.5 border rounded-xl font-medium transition-all duration-200 bg-white focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-200 hover:border-gray-400"
          }`}
        />
        {type === "password" && togglePassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-105 transition-transform duration-150"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-emerald-600 transition-colors" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-emerald-600 transition-colors" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
);

const Gender = {
  MALE: "M",
  FEMALE: "F",
  OTHER: "O",
};

const ActivityLevel = {
  SEDENTARY: "sedentario",
  MODERATE: "moderado",
  ACTIVE: "activo",
  VERY_ACTIVE: "muy_activo",
};

const AuthContainer = () => {
  const [currentView, setCurrentView] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { createUser } = useUsers();

  // Estados para el formulario de login
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Estados para el formulario de registro
  const [registerData, setRegisterData] = useState({
    nombre: "",
    email: "",
    contraseña_hash: "",
    confirmPassword: "",
    fecha_nacimiento: "",
    género: Gender.MALE,
    altura: "",
    peso_actual: "",
    objetivo_peso: "",
    nivel_actividad: ActivityLevel.MODERATE,
    acceptTerms: false,
  });

  // Estados para validación y errores
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // Validaciones
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  const validatePhone = (phone) => {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ""));
  };

  // Handlers memoizados para prevenir re-renders
  const handleLoginChange = useCallback((e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));

    // Limpiar errores específicos
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const handleRegisterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setRegisterData((prev) => ({ ...prev, [name]: newValue }));

    // Limpiar errores específicos
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Validar formulario de login
  const validateLogin = () => {
    const newErrors = {};

    if (!loginData.email) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    if (!loginData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    return newErrors;
  };

  // Validar formulario de registro
  const validateRegister = () => {
    const newErrors = {};

    if (!registerData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (registerData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!registerData.email) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    if (!registerData.contraseña) {
      newErrors.contraseña = "La contraseña es requerida";
    } else if (!validatePassword(registerData.contraseña)) {
      newErrors.contraseña =
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número";
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (registerData.contraseña !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!registerData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida";
    }

    if (!registerData.altura) {
      newErrors.altura = "La altura es requerida";
    } else if (isNaN(registerData.altura) || registerData.altura <= 0) {
      newErrors.altura = "Ingresa una altura válida";
    }

    if (!registerData.peso_actual) {
      newErrors.peso_actual = "El peso actual es requerido";
    } else if (
      isNaN(registerData.peso_actual) ||
      registerData.peso_actual <= 0
    ) {
      newErrors.peso_actual = "Ingresa un peso válido";
    }

    if (!registerData.objetivo_peso) {
      newErrors.objetivo_peso = "El peso objetivo es requerido";
    } else if (
      isNaN(registerData.objetivo_peso) ||
      registerData.objetivo_peso <= 0
    ) {
      newErrors.objetivo_peso = "Ingresa un peso objetivo válido";
    }

    if (!registerData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
    }

    return newErrors;
  };

  // Manejar envío del formulario de login
  const handleLoginSubmit = async () => {
    const newErrors = validateLogin();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccess("");

    try {
      // Reemplaza mockLogin con tu función real: await login(loginData);
      await login(loginData);
      setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error en login:", error);
      setErrors({ general: error.message || "Error al iniciar sesión" });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar envío del formulario de registro
  const handleRegisterSubmit = async () => {
    const newErrors = validateRegister();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccess("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const userData = {
        nombre: registerData.nombre,
        email: registerData.email,
        contraseña: registerData.contraseña, // Nota: Esto debería ser hasheado en el backend
        fecha_nacimiento: registerData.fecha_nacimiento,
        género: registerData.género,
        altura: Number(registerData.altura),
        peso_actual: Number(registerData.peso_actual),
        objetivo_peso: Number(registerData.objetivo_peso),
        nivel_actividad: registerData.nivel_actividad,
      };

      await createUser(userData);
      setSuccess("¡Registro exitoso! Revisa tu email para activar tu cuenta.");

      setTimeout(() => {
        setCurrentView("login");
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error en registro:", error);
      setErrors({ general: "Error al registrar usuario. Inténtalo de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar envío con Enter - memoizado
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (currentView === "login") {
          handleLoginSubmit();
        } else {
          handleRegisterSubmit();
        }
      }
    },
    [currentView]
  );

  // Handlers para cambiar vista
  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
    setErrors({});
    setSuccess("");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-1">
            <img
              src="/Logo_ico.png"
              alt="Enutritrack Logo"
              className="w-24 h-24 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {currentView === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h2>
            <p className="text-gray-600 font-medium">
              {currentView === "login"
                ? "Accede a tu cuenta de EnutriTrack"
                : "Únete a EnutriTrack y mejora tu alimentación"}
            </p>
          </div>
        </div>

        {/* Mensajes de éxito */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Errores generales */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-50 rounded-xl p-1 mb-8">
            <button
              onClick={() => handleViewChange("login")}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                currentView === "login"
                  ? "bg-white text-emerald-600 shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => handleViewChange("register")}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                currentView === "register"
                  ? "bg-white text-emerald-600 shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Login Form */}
          {currentView === "login" && (
            <div className="space-y-6">
              <InputField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={loginData.email}
                onChange={handleLoginChange}
                onKeyPress={handleKeyPress}
                error={errors.email}
                icon={Mail}
                placeholder="tu@email.com"
              />

              <InputField
                label="Contraseña"
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleLoginChange}
                onKeyPress={handleKeyPress}
                error={errors.password}
                icon={Lock}
                placeholder="••••••••"
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded transition-colors"
                  />
                  <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800">
                    Recordarme
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-all"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                onClick={handleLoginSubmit}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </div>
          )}

          {/* Register Form */}
          {currentView === "register" && (
            <div className="space-y-6">
              <InputField
                label="Nombre Completo"
                name="nombre"
                value={registerData.nombre}
                onChange={handleRegisterChange}
                onKeyPress={handleKeyPress}
                error={errors.nombre}
                icon={User}
                placeholder="Juan Pérez"
              />

              <InputField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                onKeyPress={handleKeyPress}
                error={errors.email}
                icon={Mail}
                placeholder="tu@email.com"
              />

              <InputField
                label="Contraseña"
                name="contraseña"
                type="password"
                value={registerData.contraseña}
                onChange={handleRegisterChange}
                onKeyPress={handleKeyPress}
                error={errors.contraseña}
                icon={Lock}
                placeholder="••••••••"
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
              />

              <InputField
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                onKeyPress={handleKeyPress}
                error={errors.confirmPassword}
                placeholder="••••••••"
                showPassword={showConfirmPassword}
                togglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />

              <InputField
                label="Fecha de Nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={registerData.fecha_nacimiento}
                onChange={handleRegisterChange}
                onKeyPress={handleKeyPress}
                error={errors.fecha_nacimiento}
                icon={Calendar}
              />

              {/* Selector de Género */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Género
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CircleSmall className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500" />
                  </div>
                  <select
                    name="género"
                    value={registerData.género}
                    onChange={handleRegisterChange}
                    className="w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-xl font-medium transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-200 hover:border-gray-400"
                  >
                    <option value={Gender.MALE}>Masculino</option>
                    <option value={Gender.FEMALE}>Femenino</option>
                    <option value={Gender.OTHER}>Otro</option>
                  </select>
                </div>
              </div>

              <InputField
                label="Altura (cm)"
                name="altura"
                type="number"
                value={registerData.altura}
                onChange={handleRegisterChange}
                onKeyPress={handleKeyPress}
                error={errors.altura}
                icon={Ruler}
                placeholder="175"
              />

              <InputField
                label="Peso Actual (kg)"
                name="peso_actual"
                type="number"
                value={registerData.peso_actual}
                onChange={handleRegisterChange}
                onKeyPress={handleKeyPress}
                error={errors.peso_actual}
                icon={Weight}
                placeholder="70"
              />

              <InputField
                label="Peso Objetivo (kg)"
                name="objetivo_peso"
                type="number"
                value={registerData.objetivo_peso}
                onChange={handleRegisterChange}
                onKeyPress={handleKeyPress}
                error={errors.objetivo_peso}
                icon={Target}
                placeholder="65"
              />

              {/* Selector de Nivel de Actividad */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nivel de Actividad
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Activity className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500" />
                  </div>
                  <select
                    name="nivel_actividad"
                    value={registerData.nivel_actividad}
                    onChange={handleRegisterChange}
                    className="w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-xl font-medium transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-200 hover:border-gray-400"
                  >
                    <option value={ActivityLevel.SEDENTARY}>Sedentario</option>
                    <option value={ActivityLevel.MODERATE}>Moderado</option>
                    <option value={ActivityLevel.ACTIVE}>Activo</option>
                    <option value={ActivityLevel.VERY_ACTIVE}>
                      Muy Activo
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={registerData.acceptTerms}
                    onChange={handleRegisterChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-1 transition-colors"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Acepto los{" "}
                    <button
                      type="button"
                      className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                    >
                      términos y condiciones
                    </button>{" "}
                    y la{" "}
                    <button
                      type="button"
                      className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                    >
                      política de privacidad
                    </button>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm font-medium">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.acceptTerms}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleRegisterSubmit}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Crear Cuenta"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>© 2025 EnutriTrack. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
