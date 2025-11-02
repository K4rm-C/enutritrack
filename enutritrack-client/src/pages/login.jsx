import React, { useState, useCallback } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth/auth.context";

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

const AuthContainer = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estados para el formulario de login
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Estados para validación y errores
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // Validaciones
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handlers memoizados
  const handleLoginChange = useCallback((e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));

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
      // Siempre login como doctor
      const result = await login({
        email: loginData.email,
        password: loginData.password,
      });

      setSuccess("¡Inicio de sesión exitoso como Doctor! Redirigiendo...");

      // Redirigir al dashboard de doctor
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error en login:", error);

      let errorMessage = "Error al iniciar sesión";

      if (error.response?.status === 401) {
        errorMessage = "Email o contraseña incorrectos";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar envío con Enter
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLoginSubmit();
      }
    },
    [loginData]
  );

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
            <div className="flex items-center justify-center">
              <Stethoscope className="h-8 w-8 text-emerald-600 mr-2" />
              <h2 className="text-3xl font-bold text-gray-900">
                Acceso Doctores
              </h2>
            </div>
            <p className="text-gray-600 font-medium">
              Accede a tu cuenta médica de EnutriTrack
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

        {/* Formulario de Login */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
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

            <button
              onClick={handleLoginSubmit}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <>Iniciar Sesión como Doctor</>
              )}
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="text-center">
            <p className="text-blue-800 text-sm font-medium">
              🔒 <strong>Acceso exclusivo:</strong> Esta plataforma es solo para
              profesionales médicos autorizados
            </p>
          </div>
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
