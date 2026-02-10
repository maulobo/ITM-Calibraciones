import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';

export const useContacts = (search?: string) => {
  return useQuery({
    queryKey: ['contacts', search],
    queryFn: () => usersApi.getUsers({ search }),
  });
};

export const useContact = (id: string) => {
    return useQuery({
        queryKey: ['contact', id],
        queryFn: () => usersApi.getUserById(id),
        enabled: !!id,
    });
};
