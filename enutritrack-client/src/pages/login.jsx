import React, { useState, useCallback } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  Activity,
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
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon
              className={`h-4.5 w-4.5 transition-colors duration-200 ${
                error
                  ? "text-red-400"
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
          className={`w-full ${Icon ? "pl-11" : "pl-4"} ${
            type === "password" ? "pr-11" : "pr-4"
          } py-3.5 border border-gray-300 bg-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 placeholder:text-gray-500 ${
            error
              ? "border-red-300 focus:border-red-500 text-red-600"
              : "border-gray-300 focus:border-emerald-400 text-gray-700"
          }`}
        />
        {type === "password" && togglePassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200 z-10"
          >
            {showPassword ? (
              <EyeOff className="h-4.5 w-4.5 text-gray-400 hover:text-emerald-500" />
            ) : (
              <Eye className="h-4.5 w-4.5 text-gray-400 hover:text-emerald-500" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1.5 text-red-500 text-xs font-medium pl-1">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
);

const AuthContainer = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLoginChange = useCallback((e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));

    setErrors((prevErrors) => {
      // Limpiar el error del campo actual si existe
      if (prevErrors[name]) {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      }

      // Limpiar error general si existe
      if (prevErrors.general) {
        const { general, ...rest } = prevErrors;
        return rest;
      }

      return prevErrors;
    });

    // Limpiar mensaje de éxito al empezar a escribir
    setSuccess("");
  }, []);

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

  const handleLoginSubmit = async () => {
    const newErrors = validateLogin();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccess(""); // Limpiar éxito si hay errores
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
      setSuccess(""); // Limpiar éxito si hay error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLoginSubmit();
      }
    },
    [loginData]
  );

  // Determinar qué mensaje mostrar
  const getStatusMessage = () => {
    if (errors.general) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="text-red-800 font-medium text-sm">
              {errors.general}
            </span>
          </div>
        </div>
      );
    }

    if (success) {
      return (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="text-emerald-800 font-medium text-sm">
              {success}
            </span>
          </div>
        </div>
      );
    }

    // Estado normal - mensaje por defecto
    return (
      <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="text-emerald-800 font-medium text-sm">
            Plataforma segura y confiable para profesionales médicos
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Balanced decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-white rounded-full blur-2xl"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Panel - Balanced Brand */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <Activity className="absolute top-8 left-8 w-24 h-24" />
                <Activity className="absolute bottom-8 right-8 w-20 h-20" />
              </div>

              <div className="relative z-10 text-center space-y-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Stethoscope className="h-10 w-10 text-white" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight">
                    Hello
                    <br />
                    EnutriTrack! 👋
                  </h1>
                  <p className="text-emerald-100 font-medium max-w-sm leading-relaxed">
                    Gestiona la salud de tus pacientes de manera eficiente.
                    Acceso exclusivo para profesionales médicos.
                  </p>
                </div>

                <div className="pt-6 space-y-3 text-left max-w-sm">
                  {[
                    "Seguimiento nutricional personalizado",
                    "Análisis de datos en tiempo real",
                    "Historial clínico completo",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 text-emerald-50 text-sm"
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-3 left-0 right-0 text-center">
                <p className="text-emerald-100 text-sm">
                  © 2025 EnutriTrack. Todos los derechos reservados.
                </p>
              </div>
            </div>

            {/* Right Panel - Balanced Login Form */}
            <div className="p-10 flex flex-col justify-center bg-white">
              <div className="max-w-sm w-full mx-auto space-y-8">
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600 font-medium">
                    Ingresa tus credenciales para acceder
                  </p>
                </div>

                {/* Status Message - Condicional */}
                {getStatusMessage()}

                {/* Login Form */}
                <div className="space-y-6">
                  <InputField
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    onKeyPress={handleKeyPress}
                    error={errors.email}
                    icon={Mail}
                    placeholder="hisalim.ux@gmail.com"
                  />

                  <InputField
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    onKeyPress={handleKeyPress}
                    error={errors.password}
                    icon={Lock}
                    placeholder="Password"
                    showPassword={showPassword}
                    togglePassword={() => setShowPassword(!showPassword)}
                  />

                  <button
                    onClick={handleLoginSubmit}
                    disabled={isLoading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Login Now"
                    )}
                  </button>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                  <div className="text-center">
                    <p className="text-blue-800 text-xs font-medium">
                      🔒 <strong>Acceso exclusivo:</strong> Esta plataforma es
                      solo para profesionales médicos autorizados
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
