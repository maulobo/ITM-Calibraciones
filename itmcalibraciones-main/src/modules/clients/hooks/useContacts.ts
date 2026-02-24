
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import type { User, CreateUserDTO } from '../api/usersApi';

export const useContacts = (search?: string) => {
  return useQuery({
    queryKey: ['contacts', search],
    queryFn: () => usersApi.getUsers({ search }), // DO NOT pass limit/offset, let backend return all matches
    placeholderData: keepPreviousData,
  });
};

export const useContactsByOffice = (officeId?: string) => {
  return useQuery({
    queryKey: ['contacts', 'office', officeId],
    queryFn: () => usersApi.getUsers({ office: officeId }),
    enabled: !!officeId,
  });
};

export const useContact = (id: string) => {
    return useQuery({
        queryKey: ['contact', id],
        queryFn: () => usersApi.getUserById(id),
        enabled: !!id,
    });
};

export const useUpdateContactMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
            usersApi.updateUser(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contact', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
    });
};

export const useCreateContactMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUserDTO) => usersApi.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
    });
};
