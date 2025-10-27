import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logoUnite from "@/assets/Logo_Unite.svg";
import concierto from "@/assets/login/concierto-1.png";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 relative overflow-hidden">
      {/* Fondo del concierto */}
      <img
        src={concierto}
        alt="Concierto"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
      />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-300 py-2 px-8 flex items-center shadow-sm">
        <img src={logoUnite} alt="Logo Unite" className="h-12 w-auto" />
      </header>

      {/* Contenedor animado del formulario */}
      <motion.div
        initial={{ x: "100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100vw", opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative z-10 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-10 w-[90%] max-w-md mt-16"
      >
        <h1 className="text-3xl font-semibold text-center mb-6 text-gray-900">
          Iniciar Sesión
        </h1>

        {/* Campo de correo */}
        <label htmlFor="email" className="block text-gray-800 font-medium mb-2">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="Ingresa tu correo"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-5 text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
        />

        {/* Campo de contraseña */}
        <label htmlFor="password" className="block text-gray-800 font-medium mb-2">
          Contraseña
        </label>
        <div className="relative mb-5">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
          />
          {password.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          )}
        </div>

        {/* Botón de ingresar */}
        <button className="w-full bg-[#e58c00] hover:bg-[#d47d00] text-white font-semibold text-lg py-3 rounded-full transition-all cursor-pointer">
          INGRESAR
        </button>

        {/* Enlaces inferiores */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm">
          <Link
            to="/restablecer"
            className="text-blue-600 hover:underline mb-2 sm:mb-0 cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <div>
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <Link
              to="/registro"
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Regístrate
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
