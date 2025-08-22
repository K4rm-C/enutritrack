import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const AuthContainer = () => {
  const [currentView, setCurrentView] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para el formulario de login
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Estados para el formulario de registro
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
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

  // Manejar cambios en el formulario de login
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));

    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Manejar cambios en el formulario de registro
  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setRegisterData((prev) => ({ ...prev, [name]: newValue }));

    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

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

    if (!registerData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }

    if (!registerData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    }

    if (!registerData.email) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    if (!registerData.phone) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!validatePhone(registerData.phone)) {
      newErrors.phone = "Ingresa un teléfono válido";
    }

    if (!registerData.birthDate) {
      newErrors.birthDate = "La fecha de nacimiento es requerida";
    }

    if (!registerData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (!validatePassword(registerData.password)) {
      newErrors.password =
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número";
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
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

    try {
      // Simular llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");

      // Aquí harías la llamada real a tu API
      // const response = await loginAPI(loginData);
    } catch (error) {
      setErrors({
        general: "Error al iniciar sesión. Verifica tus credenciales.",
      });
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

    try {
      // Simular llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess("¡Registro exitoso! Revisa tu email para activar tu cuenta.");

      // Aquí harías la llamada real a tu API
      // const response = await registerAPI(registerData);
    } catch (error) {
      setErrors({ general: "Error al registrar usuario. Inténtalo de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    error,
    icon: Icon,
    placeholder,
    showPassword,
    togglePassword,
  }) => (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type === "password" && showPassword ? "text" : type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} ${
            type === "password" ? "pr-10" : "pr-3"
          } py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white ${
            error ? "border-red-500 focus:ring-red-500" : ""
          }`}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <img
              src="/Logo_ico.png"
              alt="Enutritrack Logo"
              className="w-30 h-30 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {currentView === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>
          <p className="mt-2 text-gray-600">
            {currentView === "login"
              ? "Accede a tu cuenta de EnutriTrack"
              : "Únete a EnutriTrack y mejora tu alimentación"}
          </p>
        </div>

        {/* Mensajes de éxito */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Errores generales */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
            <button
              onClick={() => {
                setCurrentView("login");
                setErrors({});
                setSuccess("");
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                currentView === "login"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setCurrentView("register");
                setErrors({});
                setSuccess("");
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                currentView === "register"
                  ? "bg-white text-emerald-600 shadow-sm"
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
                error={errors.password}
                icon={Lock}
                placeholder="••••••••"
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-emerald-600 hover:text-emerald-500 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                onClick={handleLoginSubmit}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Nombre"
                  name="firstName"
                  value={registerData.firstName}
                  onChange={handleRegisterChange}
                  error={errors.firstName}
                  icon={User}
                  placeholder="Juan"
                />
                <InputField
                  label="Apellido"
                  name="lastName"
                  value={registerData.lastName}
                  onChange={handleRegisterChange}
                  error={errors.lastName}
                  placeholder="Pérez"
                />
              </div>

              <InputField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                error={errors.email}
                icon={Mail}
                placeholder="tu@email.com"
              />

              <InputField
                label="Teléfono"
                name="phone"
                type="tel"
                value={registerData.phone}
                onChange={handleRegisterChange}
                error={errors.phone}
                icon={Phone}
                placeholder="+52 123 456 7890"
              />

              <InputField
                label="Fecha de Nacimiento"
                name="birthDate"
                type="date"
                value={registerData.birthDate}
                onChange={handleRegisterChange}
                error={errors.birthDate}
                icon={Calendar}
              />

              <InputField
                label="Contraseña"
                name="password"
                type="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                error={errors.password}
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
                error={errors.confirmPassword}
                placeholder="••••••••"
                showPassword={showConfirmPassword}
                togglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />

              <div className="space-y-2">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={registerData.acceptTerms}
                    onChange={handleRegisterChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-1"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Acepto los{" "}
                    <button
                      type="button"
                      className="text-emerald-600 hover:text-emerald-500 font-medium"
                    >
                      términos y condiciones
                    </button>{" "}
                    y la{" "}
                    <button
                      type="button"
                      className="text-emerald-600 hover:text-emerald-500 font-medium"
                    >
                      política de privacidad
                    </button>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.acceptTerms}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleRegisterSubmit}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
