import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import concierto from "@/assets/login/concierto-1.png";
import UsuarioService from "@/services/UsuarioService";
import NotificationService from "@/services/NotificationService";
import LogoLight from "@/assets/Logo_Unite_Modo_Claro.svg";
import LogoDark from "@/assets/Logo_Unite_Modo_Oscuro.svg";
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/hooks/useModoOscuro";
import React from "react";
import { GenericService } from "@/services/GenericService";

export const Registro = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaValido, setCaptchaValido] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [email, setEmail] = useState("");

  const { isDark, toggleDarkMode } = useDarkMode();

  
  const navigate = useNavigate();
  const contraseñasCoinciden =
    password === confirmPassword || confirmPassword === "";
  const esEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // --- VALIDACIONES ---
  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
    setDni(value);
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
    setTelefono(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const esDniValido = dni.length === 8;
  const esTelefonoValido = telefono.length === 9;
  const todosLlenos =
    nombres &&
    apellidoPaterno &&
    apellidoMaterno &&
    dni &&
    telefono &&
    email &&
    password &&
    confirmPassword;

  const puedeRegistrar =
    todosLlenos &&
    esDniValido &&
    esTelefonoValido &&
    esEmailValido && 
    captchaValido &&
    aceptaTerminos &&
    contraseñasCoinciden;

  const handleSubmit = async () => {
    if (!puedeRegistrar) {
      NotificationService.warning("Por favor, completa todos los campos correctamente.");
      return;
    }

    setLoading(true);
    try {
      const nuevoUsuario = {
        nombre: nombres,
        apellidoPaterno,
        apellidoMaterno,
        dni,
        celular: telefono,
        email,
        password,
        rol: "CLIENTE",
        activo: true,
      };

      const response = await UsuarioService.create(nuevoUsuario);

      if (response.success) {
        setShowPopup(true);
      } else {
        NotificationService.error(response.message || "Hubo un problema al registrar el usuario");
      }
    } catch (error: any) {
      console.error("Error al registrar usuario:", error);
      NotificationService.error("Error al conectarse con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen 
                bg-gray-100 dark:bg-gray-900 
                text-gray-900 dark:text-gray-100 
                transition-colors">

      {/* Fondo */}
      <img
        src={concierto}
        alt="Fondo concierto"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />

      {/* Header */}
      <header className="
        absolute top-0 left-0 w-full 
        flex items-center justify-between 
        px-6 py-3 
        bg-white/80 dark:bg-gray-900/80 
        backdrop-blur-md shadow-md
      ">
      {/* Logo */}
      <img
        src={isDark ? LogoDark : LogoLight}
        alt="Logo Unite"
        className="h-12 w-auto transition-opacity duration-300 cursor-pointer"
        onClick={() => navigate("/eventos")}
      />

      {/* Toggle Dark Mode */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 
                  hover:scale-110 transition flex items-center justify-center"
        title="Cambiar tema"
      >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-300" />
      ) : (
        <Moon className="h-5 w-5 text-gray-800" />
      )}
    </button>
  </header>

      {/* Contenido */}
      <div className="relative z-10 flex flex-1 justify-center items-center p-6 mt-20">
        <div className="
          bg-white/90 dark:bg-gray-800/90 
          backdrop-blur-md 
          shadow-xl rounded-2xl p-10 
          w-[90%] max-w-5xl 
          transition-colors
        ">

          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 font-medium mb-2 text-center ">
            Crear cuenta
          </h2>

          {/* Volver al login */}
          <p className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-center">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Ingresa aquí
            </Link>
          </p>

          {/* Quiere ser Organizador */}
          <p className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-center">
            ¿Quieres una cuenta de organizador?{" "}
            <Link to="/organizador/registro" className="text-blue-600 hover:underline">
              Trata por aquí
            </Link>
          </p>

          {/* Nombres */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Nombres</label>
            <input
              type="text"
              placeholder="Ingresa tus nombres"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className={`
                w-full px-4 py-3 
                rounded-lg 
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100 
                border 
                ${nombres.length > 0 ? "border-gray-300 dark:border-gray-600" : "border-red-500"}
                focus:ring-2 focus:ring-orange-500 
                caret-orange-500
                outline-none
              `}
              />

          </div>

          {/* Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Apellido Paterno
              </label>
              <input
                type="text"
                placeholder="Ingresa tu apellido paterno"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                className={`
                  w-full px-4 py-3 
                  rounded-lg 
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100 
                  border 
                  ${apellidoPaterno.length > 0 ? "border-gray-300 dark:border-gray-600" : "border-red-500"}
                  focus:ring-2 focus:ring-orange-500 
                  caret-orange-500
                  outline-none
                `}

              />
              {!apellidoPaterno}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Apellido Materno
              </label>
              <input
                type="text"
                placeholder="Ingresa tu apellido materno"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                className={`
                  w-full px-4 py-3 
                  rounded-lg 
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100 
                  border 
                  ${apellidoMaterno.length > 0 ? "border-gray-300 dark:border-gray-600" : "border-red-500"}
                  focus:ring-2 focus:ring-orange-500 
                  caret-orange-500
                  outline-none
                `}
              />
              {!apellidoMaterno}
            </div>
          </div>

          {/* Documento y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                N° Documento de Identidad
              </label>
              <input
                type="text"
                placeholder="Ingresa tu DNI"
                value={dni}
                onChange={handleDniChange}
                className={`
                  w-full px-4 py-3 
                  rounded-lg 
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100 
                  border 
                  ${dni.length > 0 ? "border-gray-300 dark:border-gray-600" : "border-red-500"}
                  focus:ring-2 focus:ring-orange-500 
                  caret-orange-500
                  outline-none
                `}
              />
              <div className="h-5">
                {!esDniValido && dni.length > 0 && (
                  <p className="text-red-500 text-sm">
                    Deben ser 8 caracteres numéricos
                  </p>
                )}
              </div>
              {!dni}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="Ingresa tu número de teléfono"
                value={telefono}
                onChange={handleTelefonoChange}
                className={`
                  w-full px-4 py-3 
                  rounded-lg 
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100 
                  border 
                  ${telefono.length > 0 ? "border-gray-300 dark:border-gray-600" : "border-red-500"}
                  focus:ring-2 focus:ring-orange-500 
                  caret-orange-500
                  outline-none
                `}

              />
              <div className="h-5">
                {!esTelefonoValido && telefono.length > 0 && (
                  <p className="text-red-500 text-sm">
                    Deben ser 9 caracteres numéricos
                  </p>
                )}
              </div>
              {!telefono}
            </div>
          </div>

          {/* Correo */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={handleEmailChange}
              required
              className={`
                w-full px-4 py-3 
                rounded-lg 
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100 
                border 
                ${email.length > 0 ? "border-gray-300 dark:border-gray-600" : "border-red-500"}
                focus:ring-2 focus:ring-orange-500 
                caret-orange-500
                outline-none
              `}
            />
            <div className="h-5">
              {!esEmailValido && email.length > 0 && (
                <p className="text-red-500 text-sm">
                  El correo no es válido
                </p>
              )}
            </div>
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`
                  w-full px-4 py-3 
                  rounded-lg 
                  pr-12
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100 
                  border 
                  ${password.length > 0 ? "border-gray-300 dark:border-gray-600" : "border-red-500"}
                  focus:ring-2 focus:ring-orange-500 
                  caret-orange-500
                  outline-none
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-12 -translate-y-1/2 mt-2 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
              {!password}
            </div>

            <div className="relative">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Confirmar contraseña
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`
                  w-full px-4 py-3 
                  rounded-lg 
                  pr-12
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100 
                  border 
                  ${confirmPassword.length > 0 ? "border-gray-300 dark:border-gray-600" : "border-red-500"}
                  focus:ring-2 focus:ring-orange-500
                  caret-orange-500 
                  outline-none
                `}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-12 -translate-y-1/2 mt-2 text-gray-600 hover:text-gray-900"
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
              <div className="h-5">
                {!contraseñasCoinciden && (
                  <p className="text-red-500 text-sm">
                    Las contraseñas deben coincidir
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Captcha */}
          <div className="flex justify-center mt-6 mb-6">
            <ReCAPTCHA
              sitekey="6LdJnfcrAAAAAMgCVoBka3Z4bewdmH7MOw9FiKTi"
              onChange={(token: string | null) => setCaptchaValido(!!token)}
            />
          </div>

          {/* Términos */}
          <div className="flex flex-row items-center mb-6">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="mr-2"
            />
            <div>
              <span className="text-gray-700 text-sm dark:text-gray-300 font-medium mb-2">
                Acepto los {" "} 
                <a href={GenericService.TYC_LINK} target="_blank" rel="noopener noreferrer" className='text-[#D08700]'>
                  Términos y Condiciones
                </a>
                {" "} y la Política de Privacidad de UNITE.
              </span>
            </div>
          </div>

          {/* Botón registrar */}
          <button
            onClick={handleSubmit}
            disabled={!puedeRegistrar || loading}
            className={`w-full py-3 rounded-full font-semibold text-lg transition-all duration-200 ${
              puedeRegistrar
                ? "bg-[#e58c00] hover:bg-[#cc7b00] text-white"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            {loading ? "Registrando..." : "REGISTRAR"}
          </button>
        </div>
      </div>

      {/* Popup de confirmación */}
      {showPopup && (
        <div className="
          fixed inset-0 flex items-center justify-center 
          bg-black/50 dark:bg-black/70 
          backdrop-blur-sm 
          z-50 transition-colors
        ">
          <div className="
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            rounded-2xl shadow-lg p-8 
            text-center max-w-md w-[90%]
            transition-colors
          ">
            <h3 className="text-2xl font-semibold mb-4">
              Registro exitoso
            </h3>

            <p className="mb-6">
              Tu cuenta ha sido creada correctamente.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="
                w-full 
                bg-[#e58c00] hover:bg-[#cc7b00] 
                text-white font-semibold 
                py-3 rounded-full 
                transition-all
              "
            >
          VOLVER AL INICIO
        </button>
      </div>
    </div>
  )}

    </div>
  );
};

export default Registro;
