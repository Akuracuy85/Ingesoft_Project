import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { User, UserFormData, Rol } from "../../models/User";
import NotificationService from "@/services/NotificationService";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
}) => {
  const initialFormData: UserFormData = {
    nombre: "",
    password: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    dni: "",
    email: "",
    celular: "",
    rol: "CLIENTE" as Rol,
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
        rol: user.rol as Rol,
        activo: user.activo,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.rol) {
    NotificationService.warning("Selecciona un rol para el usuario.");
    return;
  }

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

    onSave({ ...formData, rol: formData.rol });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6 border border-border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          {user ? "Editar usuario" : "Crear usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* CAMPOS */}
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

            {/* ROL */}
            <Select
              value={formData.rol ?? undefined}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, rol: value as Rol }))
              }
            >
              <SelectTrigger className="w-full col-span-2">
                <SelectValue placeholder="Seleccione un rol" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="CLIENTE">Cliente</SelectItem>
                <SelectItem value="ORGANIZADOR">Organizador</SelectItem>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
              </SelectContent>
            </Select>

            {/* ACTIVO */}
            <Select
              value={formData.activo ? "true" : "false"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, activo: value === "true" }))
              }
            >
              <SelectTrigger className="w-full col-span-2">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-border text-muted-foreground px-4 py-2 rounded-md hover:bg-muted/20"
            >
              Cancelar
            </button>

            <Button type="submit" className="gap-2">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
