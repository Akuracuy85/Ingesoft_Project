import React, { useState } from "react";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";

import concierto from "@/assets/login/concierto-1.png";
import LogoLight from "@/assets/Logo_Unite_Actualizado.png";
import LogoDark from "@/assets/Logo_Unite_Actualizado_2.png";

import { useAuth } from "@/hooks/useAuth";
import NotificationService from "@/services/NotificationService";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaValido, setCaptchaValido] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 🌙 Estado del modo oscuro
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleDarkMode = () => {
    const html = document.documentElement;

    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      setIsDark(false);
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      setIsDark(true);
      localStorage.setItem("theme", "dark");
    }
  };

  // Mantener el tema entre recargas
  React.useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaValido) {
      NotificationService.warning("Por favor, verifica el captcha antes de continuar.");
      return;
    }

    try {
      const res = await login(email, password);

      if (res.success) {
        NotificationService.success("Inicio de sesión correcto");

        if (res.rol === "ORGANIZADOR") navigate("/organizador/eventos");
        else if (res.rol === "ADMINISTRADOR") navigate("/admin/eventos");
        else navigate("/eventos");

      } else {
        NotificationService.error("Credenciales inválidas");
      }

    } catch (err) {
      console.error(err);
      NotificationService.error("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div
      className="
        flex flex-col items-center justify-center min-h-screen relative overflow-hidden
        bg-gray-100 dark:bg-gray-900
        text-gray-900 dark:text-gray-100
        transition-colors
      "
    >

      {/* Fondo */}
      <img
        src={concierto}
        alt="Concierto"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
      />

      {/* HEADER */}
      <header
        className="
          absolute top-0 left-0 w-full px-6 py-3
          flex items-center justify-between
          bg-white/80 dark:bg-gray-900/80 
          backdrop-blur-md shadow-md
          transition-colors
        "
      >
        {/* Logo dinámico */}
        <img
          src={isDark ? LogoDark : LogoLight}
          alt="Logo Unite"
          className="h-12 w-auto transition-opacity"
        />

        {/* Botón modo oscuro */}
        <button
  onClick={toggleDarkMode}
  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 
             hover:scale-110 transition flex items-center justify-center
             mr-4"
  title="Cambiar tema"
>

          {isDark ? (
            <Sun className="h-5 w-5 text-yellow-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-800" />
          )}
        </button>
      </header>

      {/* FORMULARIO */}
      <motion.div
        initial={{ x: "100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="
          relative z-10 
          bg-white/90 dark:bg-gray-800/90 
          backdrop-blur-md 
          shadow-xl rounded-2xl 
          p-10 w-[90%] max-w-md mt-20
          transition-colors
        "
      >
        <h1 className="text-3xl font-semibold text-center mb-6">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200">
            Correo electrónico
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo"
            required
            className="
              w-full px-4 py-3 mb-5 rounded-xl border
              bg-white dark:bg-gray-700
              border-gray-300 dark:border-gray-600
              text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-orange-500
              transition-colors
            "
          />

          {/* PASSWORD */}
          <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200">
            Contraseña
          </label>

          <div className="relative mb-5">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              className="
                w-full px-4 py-3 pr-12 rounded-xl border
                bg-white dark:bg-gray-700
                border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-orange-500
                transition-colors
              "
            />

            {password.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute right-3 top-3 
                  text-gray-600 dark:text-gray-300 
                  hover:text-gray-900 dark:hover:text-white
                "
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            )}
          </div>

          {/* CAPTCHA */}
          <div className="flex justify-center mt-4 mb-6">
            <ReCAPTCHA
              sitekey="6LdJnfcrAAAAAMgCVoBka3Z4bewdmH7MOw9FiKTi"
              onChange={(token) => setCaptchaValido(!!token)}
            />
          </div>

          {/* BOTÓN LOGIN */}
          <button
            type="submit"
            disabled={!captchaValido}
            className={`
              w-full py-3 rounded-full font-semibold text-lg transition-all
              ${
                captchaValido
                  ? "bg-[#e58c00] hover:bg-[#cc7b00] text-white cursor-pointer"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }
            `}
          >
            INGRESAR
          </button>
        </form>

        {/* Enlaces */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm">
          <Link to="/restablecer" className="text-blue-500 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>

          <div className="mt-2 sm:mt-0">
            <span className="text-gray-700 dark:text-gray-300">
              ¿No tienes cuenta?{" "}
            </span>
            <Link to="/registro" className="text-blue-500 hover:underline">
              Regístrate
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
