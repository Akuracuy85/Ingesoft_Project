import React, { useState } from "react";
import { createPortal } from "react-dom";
import LogoUnite from "@/assets/Logo_Unite.svg";
import { CreditCard, Calendar, Lock, User, Mail } from "lucide-react";
import NotificationService from "@/services/NotificationService";
import { TipoDeTarjeta } from "@/utils/TarjetaUtils";
import PerfilService from "@/services/PerfilService";

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
  const [rememberCard, setRememberCard] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePay = async () => {
    const { tarjeta, fecha, cvv, nombre, apellido, email } = form;
    if (!tarjeta || !fecha || !cvv || !nombre || !apellido || !email) {
      NotificationService.warning("Por favor, completa todos los campos del pago.");
      return;
    }

    if(TipoDeTarjeta(tarjeta) === "Desconocida") {
      NotificationService.warning("El número de tarjeta ingresado no es válido. Recuerda que debe ser Visa o Mastercard");
      return;
    }

    setIsPaying(true);
    await onConfirm();
    setIsPaying(false);
    try {
      if (rememberCard) {
        await PerfilService.guardarTarjeta({
          numeroTarjeta: tarjeta,
          mesExp: parseInt(fecha.split("/")[0]),
          anExp: parseInt(fecha.split("/")[1]),
          cvv: cvv,
        })
        NotificationService.success("Tarjeta guardada correctamente en tu perfil");
      }
    } catch (e) {
      NotificationService.warning("No se pudo guardar la tarjeta en tu perfil. Pero tu compra se procesó correctamente");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-8 relative border border-gray-200">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>

        {/* Logo y encabezado */}
        <div className="text-center mb-6">
          <img src={LogoUnite} alt="Logo Unite" className="h-14 mx-auto mb-4" />
          <p className="text-gray-700 text-sm leading-tight">
            <strong>Recuerda activar las compras por internet</strong>
            <br />con tu banco
          </p>
        </div>

        {/* Campos */}
        <div className="space-y-3">
          {/* Número de tarjeta */}
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

          {/* MM/AA y CVV */}
          <div className="flex gap-2">
            <div className="relative w-1/2">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                name="fecha"
                placeholder="MM/AA"
                value={form.fecha}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 2)
                    value = value.slice(0, 2) + "/" + value.slice(2, 4);
                  else value = value.slice(0, 2);
                  setForm({ ...form, fecha: value });
                }}
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

          {/* Nombre y Apellido */}
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

          {/* Remember card check */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberCard"
              checked={rememberCard}
              onChange={() => setRememberCard(!rememberCard)}
              className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-2 focus:ring-amber-600"
            />
            <label htmlFor="rememberCard" className="ml-2 text-sm text-gray-700">
              Recordar tarjeta 
            </label>
          </div>

          {/* Email */}
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

        {/* Botón pagar */}
        <button
          onClick={handlePay}
          disabled={isPaying}
          className="mt-6 w-full bg-[#c87b00] text-white font-semibold rounded-md py-2 text-lg hover:bg-[#b36d00] transition disabled:opacity-60"
        >
          {isPaying ? "Procesando..." : `Pagar S/${total.toFixed(2)}`}
        </button>

        {/* Info inferior */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>
            Infórmate sobre el tratamiento de tus datos personales{" "}
            <a href="#" className="text-amber-600 font-semibold">
              aquí
            </a>
          </p>

          <div className="flex justify-center gap-3 mt-2 opacity-80">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" className="h-5" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" className="h-5" />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PagoNiubiz;
