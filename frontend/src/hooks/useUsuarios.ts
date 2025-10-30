import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import type { User, UserFormData } from "../models/User";

export function useUsuarios() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: userService.getAll,
  });

  const createUser = useMutation({
    mutationFn: userService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserFormData }) =>
      userService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => userService.delete(id),
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
