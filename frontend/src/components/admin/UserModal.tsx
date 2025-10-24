import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";


// --- 1. INTERFACES PARA DATOS Y ESTADO ---

// 1.1. Interfaz para los datos del usuario (lo que se recibe/edita)
interface User {
  name: string;
  email: string;
  dni: string;
  // Usamos "Union Types" para restringir los valores válidos
  role: 'Cliente' | 'Organizador' | 'Administrador';
  status: 'Activo' | 'Inactivo';
}

// 1.2. Interfaz para el estado del formulario (es igual a User, pero dni puede ser opcional/vacio)
// En este caso, son idénticas, pero es buena práctica tenerlas separadas.
interface UserFormData {
  name: string;
  email: string;
  dni: string;
  role: 'Cliente' | 'Organizador' | 'Administrador';
  status: 'Activo' | 'Inactivo';
}


// --- 2. INTERFAZ PARA PROPIEDADES (PROPS) ---

// 2. Interfaz para las propiedades que recibe el componente
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  // La función onSave recibe los datos del formulario (UserFormData)
  onSave: (data: UserFormData) => void; 
  // 'user' es opcional y puede ser 'null' o un objeto 'User'
  user: User | null; 
}

// --- 3. COMPONENTE CON TIPADO ---

// Tipamos el componente con las props definidas
const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  
  // Tipamos el estado inicial con UserFormData
  const initialFormData: UserFormData = {
    name: "",
    email: "",
    dni: "",
    role: "Cliente",
    status: "Activo",
  };
  
  const [formData, setFormData] = useState<UserFormData>(initialFormData);

  // Efecto para inicializar el formulario cuando 'user' o 'isOpen' cambian
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        dni: user.dni || "",
        role: user.role,
        status: user.status,
      });
    } else {
      setFormData(initialFormData);
    }
    // Añadimos 'initialFormData' como dependencia si fuese una prop, pero aquí es constante
  }, [user, isOpen]); 

  // Tipamos el evento de envío del formulario
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null; // no mostrar si está cerrado

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6 border border-border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          {user ? "Editar usuario" : "Crear usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              value={formData.name}
              // El evento 'e' en onChange no necesita ser tipado aquí, TypeScript lo infiere
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: María López"
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ej: maria@unite.com"
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">DNI</label>
            <input
              type="text"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              placeholder="Ej: 12345678A"
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              value={formData.role}
              // Aseguramos que el valor de e.target.value coincida con los Union Types definidos
              onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="Cliente">Cliente</option>
              <option value="Organizador">Organizador</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={formData.status}
              // Aseguramos que el valor de e.target.value coincida con los Union Types definidos
              onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
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
}

export default UserModal;