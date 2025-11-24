import React, { useState } from "react";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import concierto from "@/assets/login/concierto-1.png";
import UsuarioService from "@/services/UsuarioService";
import NotificationService from "@/services/NotificationService";
import LogoLight from "@/assets/Logo_Unite_Modo_Claro.svg";
import LogoDark from "@/assets/Logo_Unite_Modo_Oscuro.svg";
import { useDarkMode } from "@/hooks/useModoOscuro";
import { GenericService } from "@/services/GenericService";


export const RegistroOrganizador = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [captchaValido, setCaptchaValido] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ruc, setRuc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");

  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [email, setEmail] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { isDark, toggleDarkMode } = useDarkMode();

  // === VALIDACIONES ===
  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDni(e.target.value.replace(/[^0-9]/g, "").slice(0, 8));

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTelefono(e.target.value.replace(/[^0-9]/g, "").slice(0, 9));

  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setRuc(e.target.value.replace(/[^0-9]/g, "").slice(0, 11));

  const esDniValido = dni.length === 8;
  const esTelefonoValido = telefono.length === 9;
  const esRucValido = ruc.length === 11;
  const esEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const contraseñasCoinciden =
    password === confirmPassword || confirmPassword === "";

  const todosLlenos =
    nombres &&
    apellidoPaterno &&
    apellidoMaterno &&
    dni &&
    telefono &&
    email &&
    password &&
    confirmPassword &&
    ruc &&
    razonSocial;

  const puedeRegistrar =
    todosLlenos &&
    esDniValido &&
    esTelefonoValido &&
    esRucValido &&
    esEmailValido &&
    captchaValido &&
    aceptaTerminos &&
    contraseñasCoinciden;

  // === SUBMIT ===
  const handleSubmit = async () => {
    if (!puedeRegistrar) {
      NotificationService.warning("Por favor, completa todos los campos correctamente.");
      return;
    }

    setLoading(true);
    try {
      const nuevoOrganizador = {
        nombre: nombres,
        apellidoPaterno,
        apellidoMaterno,
        dni,
        celular: telefono,
        email,
        password,
        rol: "ORGANIZADOR",
        RUC: ruc,
        RazonSocial: razonSocial,
        activo: true,
      };

      const response = await UsuarioService.create(nuevoOrganizador);

      if (response.success) {
        setShowPopup(true);
      } else {
        NotificationService.error(response.message || "Error al registrar.");
      }
    } catch (error) {
      NotificationService.error("Error al conectarse con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // VALIDACIONES
  const inputClass = (valid = true) =>
    `w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 
   text-gray-900 dark:text-gray-100 border 
   ${valid ? "border-gray-300 dark:border-gray-600" : "border-red-500"} 
   focus:ring-2 focus:ring-orange-500 outline-none`;

  return (
    <div
      className="
        relative flex flex-col min-h-screen
        bg-gray-100 dark:bg-gray-900
        text-gray-900 dark:text-gray-100
        transition-colors
      "
    >
      {/* Fondo */}
      <img
        src={concierto}
        alt="Fondo concierto"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />

      {/* HEADER */}
      <header
        className="
          absolute top-0 left-0 w-full
          flex items-center justify-between
          px-6 py-3
          bg-white/80 dark:bg-gray-900/80 
          backdrop-blur-md shadow-md
        "
      >
        <img
          src={isDark ? LogoDark : LogoLight}
          alt="Logo Unite"
          className="h-12 w-auto transition-opacity duration-300"
        />

        {/* Botón Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className="
            p-2 rounded-full
            bg-gray-200 dark:bg-gray-700
            hover:scale-110 transition
            flex items-center justify-center
          "
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-yellow-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-800" />
          )}
        </button>
      </header>

      {/* CONTENIDO */}
      <div className="relative z-10 flex flex-1 justify-center items-center p-6 mt-20">
        <div
          className="
            bg-white/90 dark:bg-gray-800/90
            backdrop-blur-md shadow-xl
            rounded-2xl p-10
            w-[90%] max-w-5xl
            transition-colors
          "
        >
          <h2 className="text-3xl font-semibold text-center mb-6">
            Registro de Organizador
          </h2>

          <p className="text-center text-gray-700 dark:text-gray-300">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Ingresa aquí
            </Link>
          </p>

          {/* === DATOS DEL REPRESENTANTE === */}
          <h3 className="text-xl font-semibold mt-10 mb-4 border-b border-gray-400 pb-2">
            Datos del Representante
          </h3>

          {/* Nombres */}
          <div className="mb-6">
            <label>Nombres</label>
            <input
              type="text"
              placeholder="Ingresa tus nombres"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className={inputClass(!!nombres)}
            />
          </div>

          {/* Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label>Apellido Paterno</label>
              <input
                type="text"
                placeholder="Apellido Paterno"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                className={inputClass(!!apellidoPaterno)}
              />
            </div>

            <div>
              <label>Apellido Materno</label>
              <input
                type="text"
                placeholder="Apellido Materno"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                className={inputClass(!!apellidoMaterno)}
              />
            </div>
          </div>

          {/* DNI / Tel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label>DNI</label>
              <input
                type="text"
                placeholder="DNI"
                value={dni}
                onChange={handleDniChange}
                className={inputClass(esDniValido)}
              />
              {!esDniValido && dni && (
                <p className="text-red-500 text-sm mt-1">
                  Deben ser 8 caracteres numéricos
                </p>
              )}
            </div>

            <div>
              <label>Teléfono</label>
              <input
                type="text"
                placeholder="Teléfono"
                value={telefono}
                onChange={handleTelefonoChange}
                className={inputClass(esTelefonoValido)}
              />
              {!esTelefonoValido && telefono && (
                <p className="text-red-500 text-sm mt-1">
                  Deben ser 9 caracteres numéricos
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass(esEmailValido)}
            />
            {!esEmailValido && email && (
              <p className="text-red-500 text-sm mt-1">
                El correo no es válido
              </p>
            )}
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <label>Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass(!!password)} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-11 text-gray-500"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            <div className="relative">
              <label>Confirmar contraseña</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClass(confirmPassword.length > 0 && contraseñasCoinciden)} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-11 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>

              {!contraseñasCoinciden && confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>
          </div>

          {/* === DATOS DE LA ORGANIZACIÓN === */}
          <h3 className="text-xl font-semibold mt-10 mb-4 border-b border-gray-400 pb-2">
            Datos de la Organización
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label>RUC</label>
              <input
                type="text"
                placeholder="RUC"
                value={ruc}
                onChange={handleRucChange}
                className={inputClass(esRucValido)}
              />
              {!esRucValido && ruc && (
                <p className="text-red-500 text-sm mt-1">
                  Deben ser 11 caracteres numéricos
                </p>
              )}
            </div>

            <div>
              <label>Razón Social</label>
              <input
                type="text"
                placeholder="Razón Social"
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                className={inputClass(!!razonSocial)}
              />
            </div>
          </div>

          {/* Captcha */}
          <div className="flex justify-center my-6">
            <ReCAPTCHA
              sitekey="6LdJnfcrAAAAAMgCVoBka3Z4bewdmH7MOw9FiKTi"
              onChange={(token) => setCaptchaValido(!!token)}
            />
          </div>

          {/* Términos */}
          <div className="flex items-center mb-6 text-gray-700 dark:text-gray-300">
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

          {/* Botón */}
          <button
            onClick={handleSubmit}
            disabled={!puedeRegistrar || loading}
            className={`
              w-full py-3 rounded-full font-semibold text-lg transition-all
              ${puedeRegistrar ? "bg-[#e58c00] hover:bg-[#cc7b00]" : "bg-gray-500"}
              text-white
            `}
          >
            {loading ? "Registrando..." : "REGISTRAR ORGANIZADOR"}
          </button>
        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div
          className="
      fixed inset-0 flex items-center justify-center
      bg-black/50 dark:bg-black/70
      backdrop-blur-sm
      z-50 transition-colors
    "
        >
          <div
            className="
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-100
        rounded-2xl shadow-lg p-8
        text-center max-w-md w-[90%]
        transition-colors
      "
          >
            <h3 className="text-2xl font-semibold mb-4">
              Registro exitoso
            </h3>

            <p className="mb-6">
              Tu cuenta de organizador ha sido creada correctamente.
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

export default RegistroOrganizador;
