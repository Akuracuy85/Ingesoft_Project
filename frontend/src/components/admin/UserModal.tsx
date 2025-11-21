import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { User, UserFormData } from "../../models/User";
import NotificationService from "@/services/NotificationService";
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  user: User | null;
}

const soloLetras = (valor: string) =>
  /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(valor);

const emailValido = (valor: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

const soloNumeros = (valor: string) =>
  /^[0-9]*$/.test(valor);

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const initialFormData: UserFormData = {
    nombre: "",
    password: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    dni: "",
    email: "",
    celular: "",
    rol: "CLIENTE",
    activo: true,
  };

  const [formData, setFormData] = useState<UserFormData>(initialFormData);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        password: "",
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        dni: user.dni,
        email: user.email,
        celular: user.celular,
        rol: user.rol,
        activo: user.activo,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [user, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (["nombre", "apellidoPaterno", "apellidoMaterno"].includes(name)) {
      if (!soloLetras(value) && value !== "") return;
    }

    if (name === "dni") {
      if (!soloNumeros(value) || value.length > 8) return;
    }

    if (name === "celular") {
      if (!soloNumeros(value) || value.length > 9) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "activo" ? value === "true" : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!soloLetras(formData.nombre)) {
      NotificationService.warning("El nombre solo debe contener letras.");
      return;
    }

    if (!soloLetras(formData.apellidoPaterno)) {
      NotificationService.warning("El apellido paterno solo debe contener letras.");
      return;
    }

    if (!soloLetras(formData.apellidoMaterno)) {
      NotificationService.warning("El apellido materno solo debe contener letras.");
      return;
    }

    if (!soloNumeros(formData.dni) || formData.dni.length !== 8) {
      NotificationService.warning("El DNI debe tener exactamente 8 dígitos.");
      return;
    }

    if (!emailValido(formData.email)) {
      NotificationService.warning("Correo electrónico inválido.");
      return;
    }

    if (!soloNumeros(formData.celular) || formData.celular.length !== 9) {
      NotificationService.warning("El número de celular debe tener 9 dígitos.");
      return;
    }

    onSave(formData);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6 border border-border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          {user ? "Editar usuario" : "Crear usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className="border rounded-md px-3 py-2 col-span-2"
              required
            />

            <input
              name="apellidoPaterno"
              value={formData.apellidoPaterno}
              onChange={handleChange}
              placeholder="Apellido paterno"
              className="border rounded-md px-3 py-2"
              required
            />

            <input
              name="apellidoMaterno"
              value={formData.apellidoMaterno}
              onChange={handleChange}
              placeholder="Apellido materno"
              className="border rounded-md px-3 py-2"
              required
            />

            <input
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="DNI (8 dígitos)"
              className="border rounded-md px-3 py-2 col-span-2"
              required
            />

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              className="border rounded-md px-3 py-2 col-span-2"
              required
            />

            <input
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="Celular (9 dígitos)"
              className="border rounded-md px-3 py-2 col-span-2"
            />

            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 col-span-2"
            >
              <option value="Cliente">Cliente</option>
              <option value="Organizador">Organizador</option>
              <option value="Administrador">Administrador</option>
            </select>

            <select
              name="activo"
              value={formData.activo ? "true" : "false"}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 col-span-2"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-border text-muted-foreground px-4 py-2 rounded-md hover:bg-muted/20"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
