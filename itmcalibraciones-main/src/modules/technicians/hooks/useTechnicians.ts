import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { techniciansApi } from "../api/techniciansApi";
import type { CreateOrUpdateTechnicianDTO } from "../types/technicianTypes";

const TECHNICIANS_KEY = ["technicians"];

export const useTechnicians = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TECHNICIANS_KEY,
    queryFn: techniciansApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: techniciansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TECHNICIANS_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateOrUpdateTechnicianDTO;
    }) => techniciansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TECHNICIANS_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: techniciansApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TECHNICIANS_KEY });
    },
  });

  return {
    technicians: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createTechnician: createMutation.mutateAsync,
    updateTechnician: updateMutation.mutateAsync,
    deleteTechnician: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
