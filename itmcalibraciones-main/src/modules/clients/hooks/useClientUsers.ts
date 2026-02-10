import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import type { CreateUserDTO } from "../api/usersApi";

export const useClientUsers = (clientId?: string, officeId?: string) => {
  return useQuery({
    queryKey: ["client-users", clientId, officeId],
    queryFn: () => {
      if (!clientId) return [];
      return usersApi.getUsersByClient(clientId, officeId);
    },
    enabled: !!clientId,
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDTO) => usersApi.createUser(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["client-users", variables.client],
      });
    },
  });
};
