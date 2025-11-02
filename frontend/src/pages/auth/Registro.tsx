import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import logoUnite from "@/assets/Logo_Unite.svg";
import concierto from "@/assets/login/concierto-1.png";
import UsuarioService from "@/services/UsuarioService";

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
      alert("Por favor, completa todos los campos correctamente.");
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
        alert(response.message || "Hubo un problema al registrar el usuario");
      }
    } catch (error: any) {
      console.error("Error al registrar usuario:", error);
      alert("Error al conectarse con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      {/* Fondo */}
      <img
        src={concierto}
        alt="Fondo concierto"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-300 py-2 px-8 flex items-center shadow-sm">
        <img src={logoUnite} alt="Logo Unite" className="h-12 w-auto" />
      </header>

      {/* Contenido */}
      <div className="relative z-10 flex flex-1 justify-center items-center p-6 mt-20">
        <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-10 w-[90%] max-w-5xl">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
            Crear cuenta
          </h2>

          {/* Volver al login */}
          <p className="text-center mt-6 text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Ingresa aquí
            </Link>
          </p>

          {/* Nombres */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Nombres</label>
            <input
              type="text"
              placeholder="Ingresa tus nombres"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                nombres ? "border-gray-300" : "border-red-500"
              }`}
            />

          </div>

          {/* Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Apellido Paterno
              </label>
              <input
                type="text"
                placeholder="Ingresa tu apellido paterno"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                  apellidoPaterno ? "border-gray-300" : "border-red-500"
                }`}
              />
              {!apellidoPaterno}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Apellido Materno
              </label>
              <input
                type="text"
                placeholder="Ingresa tu apellido materno"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                  apellidoMaterno ? "border-gray-300" : "border-red-500"
                }`}
              />
              {!apellidoMaterno}
            </div>
          </div>

          {/* Documento y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                N° Documento de Identidad
              </label>
              <input
                type="text"
                placeholder="Ingresa tu DNI"
                value={dni}
                onChange={handleDniChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                  esDniValido ? "border-gray-300" : "border-red-500"
                }`}
              />
              {!esDniValido && dni.length > 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Deben ser 8 caracteres numéricos
                </p>
              )}
              {!dni}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="Ingresa tu número de teléfono"
                value={telefono}
                onChange={handleTelefonoChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                  esTelefonoValido ? "border-gray-300" : "border-red-500"
                }`}
              />
              {!esTelefonoValido && telefono.length > 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Deben ser 9 caracteres numéricos
                </p>
              )}
              {!telefono}
            </div>
          </div>

          {/* Correo */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={handleEmailChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                email && esEmailValido ? "border-gray-300" : "border-red-500"
              }`}
            />
            {!esEmailValido && email.length > 0 && (
              <p className="text-red-500 text-sm mt-1">
                El correo no es válido
              </p>
            )}
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2">
                Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg pr-12 focus:ring-2 focus:ring-orange-500 outline-none ${
                  password ? "border-gray-300" : "border-red-500"
                }`}
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
              <label className="block text-gray-700 font-medium mb-2">
                Confirmar contraseña
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg pr-12 focus:ring-2 focus:ring-orange-500 outline-none border ${
                  confirmPassword && contraseñasCoinciden ? "border-gray-300" : "border-red-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-12 -translate-y-1/2 mt-2 text-gray-600 hover:text-gray-900"
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
              {!contraseñasCoinciden && (
                <p className="text-red-500 text-sm mt-1">
                  Las contraseñas deben coincidir
                </p>
              )}
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
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="mr-2"
            />
            <span className="text-gray-700 text-sm">
              Acepto los{" "}
              <span className="font-semibold text-blue-600 cursor-pointer">
                Términos y Condiciones
              </span>{" "}
              y la{" "}
              <span className="font-semibold text-blue-600 cursor-pointer">
                Política de Privacidad
              </span>{" "}
              de UNITE.
            </span>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-[90%]">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">
              Registro exitoso
            </h3>
            <p className="text-gray-700 mb-6">
              Tu cuenta ha sido creada correctamente.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#e58c00] hover:bg-[#cc7b00] text-white font-semibold py-3 rounded-full transition-all"
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
