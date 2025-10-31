import { useState, useEffect, useCallback } from "react";
import UsuarioService from "../services/UsuarioService";
import type { Usuario } from "../services/UsuarioService";


interface UseUsuariosOptions {
  rol?: string;
  autoFetch?: boolean; // si se quiere cargar automáticamente
}

export const useUsuarios = (options: UseUsuariosOptions = {}) => {
  const { rol, autoFetch = true } = options;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar usuarios por rol (o todos si no se pasa rol)
   */
  const fetchUsuarios = useCallback(async () => {
    if (!rol) return;
    setLoading(true);
    setError(null);
    try {
      const response = await UsuarioService.getByRol(rol);
      if (response.success) {
        setUsuarios(response.usuarios);
      }
    } catch (err: any) {
      setError(err.message || "Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  }, [rol]);

  /**
   * Cargar usuario por ID
   */
  const fetchUsuarioById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UsuarioService.getById(id);
      if (response.success) {
        setUsuario(response.usuario);
      }
    } catch (err: any) {
      setError(err.message || "Error al obtener usuario");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear usuario
   */
  const createUsuario = useCallback(async (data: Partial<Usuario>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UsuarioService.create(data);
      if (response.success) await fetchUsuarios();
    } catch (err: any) {
      setError(err.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios]);

  /**
   * Editar usuario
   */
  const updateUsuario = useCallback(async (id: number, data: Partial<Usuario>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UsuarioService.update(id, data);
      if (response.success) await fetchUsuarios();
    } catch (err: any) {
      setError(err.message || "Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios]);

  /**
   * Eliminar (desactivar) usuario
   */
  const removeUsuario = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UsuarioService.remove(id);
      if (response.success) await fetchUsuarios();
    } catch (err: any) {
      setError(err.message || "Error al eliminar usuario");
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios]);

  /**
   * Activar / desactivar usuario
   */
  const toggleUsuarioActivo = useCallback(async (id: number, activar: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = activar
        ? await UsuarioService.activate(id)
        : await UsuarioService.deactivate(id);
      if (response.success) await fetchUsuarios();
    } catch (err: any) {
      setError(err.message || "Error al cambiar estado del usuario");
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios]);

  // Auto-fetch al montar (solo si se pasa rol)
  useEffect(() => {
    if (autoFetch && rol) {
      fetchUsuarios();
    }
  }, [autoFetch, rol, fetchUsuarios]);

  return {
    usuarios,
    usuario,
    loading,
    error,
    fetchUsuarios,
    fetchUsuarioById,
    createUsuario,
    updateUsuario,
    removeUsuario,
    toggleUsuarioActivo,
  };
};
