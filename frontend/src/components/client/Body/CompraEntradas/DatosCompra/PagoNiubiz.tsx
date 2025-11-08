import React, { useState } from "react";
import LogoUnite from "@/assets/Logo_Unite.svg";
import { CreditCard, Calendar, Lock, User, Mail } from "lucide-react";

interface PagoNiubizProps {
  total: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const PagoNiubiz: React.FC<PagoNiubizProps> = ({ total, onClose, onConfirm }) => {
  const [form, setForm] = useState({
    tarjeta: "",
    fecha: "",
    cvv: "",
    nombre: "",
    apellido: "",
    email: "",
  });
  const [isPaying, setIsPaying] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePay = async () => {
    const { tarjeta, fecha, cvv, nombre, apellido, email } = form;
    if (!tarjeta || !fecha || !cvv || !nombre || !apellido || !email) {
      alert("Por favor, completa todos los campos del pago.");
      return;
    }

    setIsPaying(true);
    // Simulación de pago
    setTimeout(async () => {
      await onConfirm(); // dispara confirmación → envío correo desde el backend
      setIsPaying(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-transparent animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-6 relative animate-slideUp">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        {/* Logo y encabezado */}
        <div className="text-center mb-5">
          <img src={LogoUnite} alt="Logo Unite" className="h-12 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">
            <strong>Recuerda activar las compras por internet</strong><br />con tu banco
          </p>
        </div>

        {/* Campos */}
        <div className="space-y-3">
          <div className="relative">
            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              name="tarjeta"
              placeholder="Número de tarjeta"
              value={form.tarjeta}
              onChange={(e) =>
                setForm({
                  ...form,
                  tarjeta: e.target.value.replace(/\D/g, "").slice(0, 16),
                })
              }
              className="w-full border border-gray-300 rounded-md pl-9 py-2 text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative w-1/2">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                name="fecha"
                placeholder="MM/AA"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                maxLength={5}
                className="w-full border border-gray-300 rounded-md pl-9 py-2 text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
              />
            </div>
            <div className="relative w-1/2">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                name="cvv"
                placeholder="CVV"
                value={form.cvv}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
                  })
                }
                className="w-full border border-gray-300 rounded-md pl-9 py-2 text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative w-1/2">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md pl-9 py-2 text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
              />
            </div>
            <div className="relative w-1/2">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                name="apellido"
                placeholder="Apellido"
                value={form.apellido}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md pl-9 py-2 text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
              />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              name="email"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md pl-9 py-2 text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
            />
          </div>
        </div>

        {/* Botón de pago */}
        <button
          onClick={handlePay}
          disabled={isPaying}
          className="mt-6 w-full bg-[#c87b00] text-white font-semibold rounded-md py-2 text-lg hover:bg-[#b36d00] transition disabled:opacity-60"
        >
          {isPaying ? "Procesando..." : `Pagar S/${total.toFixed(2)}`}
        </button>

        {/* Información inferior */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>
            Informa sobre el tratamiento de tus datos personales{" "}
            <a href="#" className="text-amber-600 font-semibold">
              aquí
            </a>
          </p>

          <div className="flex justify-center gap-3 mt-2 opacity-80">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" className="h-5" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" className="h-5" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Diners_Club_Logo3.svg" className="h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoNiubiz;
