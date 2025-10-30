import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import type { User, UserFormData } from "../models/User";

export function useUsuarios() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await userService.getAll();
      return data;
    },
  });

  const createUser = useMutation({
    mutationFn: (userData: UserFormData) => userService.create(userData),
    onSuccess: (data) => {
      console.log("✅ Usuario creado:", data);
      // ✅ Invalida la cache de usuarios para recargar la tabla
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("❌ Error al crear usuario:", error);
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserFormData }) =>
      userService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const toggleStatus = useMutation({
  mutationFn: ({ id, currentStatus }: { id: number; currentStatus: string }) =>
    userService.toggleStatus(id, currentStatus),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
});

  return {
    usersQuery,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
  };
}
