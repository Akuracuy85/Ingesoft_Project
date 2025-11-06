import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import type { User, UserFormData } from "../models/User";

export function useUsuarios() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<User[]>({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const token = localStorage.getItem("token")
      return userService.getAll(token || undefined)
    },
  })

  const createUser = useMutation({
    mutationFn: (data: UserFormData) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] })
    },
  })

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserFormData }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] })
    },
  })

  const deleteUser = useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] })
    },
  })

   const toggleStatus = useMutation({
    mutationFn: ({ id, currentStatus }: { id: number; currentStatus: string }) =>
      userService.toggleStatus(id, currentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] })
    },
  })
  return {
    usersQuery,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
  };
}
