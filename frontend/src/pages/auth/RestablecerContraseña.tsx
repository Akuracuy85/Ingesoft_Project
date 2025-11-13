import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoUnite from "@/assets/Logo_Unite.svg";
import concierto from "@/assets/login/concierto-1.png";
import ReCAPTCHA from "react-google-recaptcha";

export const RestablecerContraseña = () => {
  const [email, setEmail] = useState("");
  const [captchaValido, setCaptchaValido] = useState(false);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (email && captchaValido) {
      setMostrarPopup(true);
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
      <div className="relative z-10 flex flex-1 justify-center items-center p-6">
        <div className="relative z-10 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-10 pt-16 w-[90%] max-w-md mt-16">
          {/* Botón volver */}
          <div className="absolute left-6 top-6 flex items-center text-sm">
            <Link
              to="/login"
              className="flex items-center text-gray-700 hover:text-gray-900 cursor-pointer text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver
            </Link>
          </div>

          <h2 className="text-3xl font-semibold text-center mb-4 text-gray-900">
            Restablecer contraseña
          </h2>
          <p className="text-gray-600 mb-6">
            Ingresa los datos requeridos para restablecer tu contraseña
          </p>

          <div className="text-left">
            <label className="block text-gray-700 font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex justify-center mt-6">
            <ReCAPTCHA
              sitekey="6LdJnfcrAAAAAMgCVoBka3Z4bewdmH7MOw9FiKTi"
              onChange={(token: string | null) => setCaptchaValido(!!token)}
            />
          </div>

          {/* Botón principal */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!email || !captchaValido}
            className={`mt-8 w-full font-semibold py-3 rounded-full transition-all duration-200 ${
              !email || !captchaValido
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#e58c00] hover:bg-[#cc7b00] text-white cursor-pointer"
            }`}
          >
            ENVIAR SOLICITUD
          </button>
        </div>
      </div>

      {/* Popup de confirmación */}
      {mostrarPopup && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-white/10">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center">
            <p className="text-black-600 mb-8 leading-relaxed">
              La solicitud ha sido procesada satisfactoriamente. En unos
              instantes recibirás un correo con las instrucciones para
              restablecer tu contraseña.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#e58c00] hover:bg-[#cc7b00] text-white font-semibold py-3 rounded-full transition-all duration-200 cursor-pointer"
            >
              VOLVER AL INICIO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestablecerContraseña;
