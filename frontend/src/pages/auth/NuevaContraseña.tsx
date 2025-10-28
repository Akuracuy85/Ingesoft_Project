import { useState } from "react";
import logoUnite from "@/assets/Logo_Unite.svg";
import concierto from "@/assets/login/concierto-1.png";
import { Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";

export const NuevaContraseña = () => {
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [captchaValido, setCaptchaValido] = useState(false);
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const navigate = useNavigate();

  const contraseñasCoinciden =
    password.trim() !== "" &&
    confirmarPassword.trim() !== "" &&
    password === confirmarPassword;

  const handleGuardar = () => {
    if (contraseñasCoinciden && captchaValido) {
      setMostrarPopup(true);
    }
  };

  const handleVolver = () => {
    setMostrarPopup(false);
    navigate("/login");
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

      {/* Contenedor principal */}
      <div className="relative z-10 flex flex-1 justify-center items-center p-6">
        <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-10 pt-16 w-[90%] max-w-md mt-16 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">
            Nueva Contraseña
          </h2>

          {/* Campo contraseña */}
          <div className="text-left mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="Ingresa tu nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {password && (
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  {mostrarPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              )}
            </div>
          </div>

          {/* Campo confirmar contraseña */}
          <div className="text-left mb-2">
            <label className="block text-gray-700 font-medium mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                placeholder="Vuelve a ingresar tu contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg pr-12 focus:outline-none focus:ring-2 ${
                  confirmarPassword && !contraseñasCoinciden
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-orange-500"
                }`}
              />
              {confirmarPassword && (
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  {mostrarConfirmar ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              )}
            </div>
            {confirmarPassword && !contraseñasCoinciden && (
              <p className="text-red-500 text-sm mt-2">
                Las contraseñas deben coincidir.
              </p>
            )}
          </div>

          {/* Captcha */}
          <div className="flex justify-center mt-6">
            <ReCAPTCHA
              sitekey="6LdJnfcrAAAAAMgCVoBka3Z4bewdmH7MOw9FiKTi"
              onChange={(token: string | null) => setCaptchaValido(!!token)}
            />
          </div>

          {/* Botón GUARDAR */}
          <button
            onClick={handleGuardar}
            disabled={!contraseñasCoinciden || !captchaValido}
            className={`mt-8 w-full font-semibold py-3 rounded-full transition-all duration-200 ${
              !contraseñasCoinciden || !captchaValido
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#e58c00] hover:bg-[#cc7b00] text-white cursor-pointer"
            }`}
          >
            GUARDAR
          </button>
        </div>
      </div>

      {/* Popup de confirmación */}
      {mostrarPopup && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-white/5">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center w-[90%] max-w-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
                ¡Se cambió la contraseña con éxito!
            </h3>
            <button
                onClick={handleVolver}
                className="mt-2 bg-[#e58c00] hover:bg-[#cc7b00] text-white font-semibold py-2 px-6 rounded-full transition-all duration-200"
            >
                VOLVER AL INICIO
            </button>
            </div>
        </div>
        )}
    </div>
  );
};

export default NuevaContraseña;
