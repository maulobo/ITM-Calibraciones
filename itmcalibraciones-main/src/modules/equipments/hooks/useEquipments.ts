import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEquipments, getAllEquipments, getEquipmentById,
  updateEquipment, registerCalibration, registerTechnicalResult, unblockEquipment, sendBlockNotification, clientRequestReturn, deliverEquipment,
  type RegisterCalibrationPayload, type RegisterTechnicalResultPayload, type DeliverEquipmentPayload,
} from "../api";

export const useEquipments = (search?: string, clientId?: string, tag?: string) => {
  return useQuery({
    queryKey: ["equipments", "search", search, clientId, tag],
    queryFn: () => getEquipments(search, clientId, tag),
    enabled: (!!search && search.length >= 2) || (!!tag && tag.length >= 1),
  });
};

export const useAllEquipments = () => {
  return useQuery({
    queryKey: ["equipments", "all"],
    queryFn: getAllEquipments,
  });
};

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
};

export const useRegisterCalibration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RegisterCalibrationPayload }) =>
      registerCalibration(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["equipment", id] });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
  });
};

export const useRegisterTechnicalResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RegisterTechnicalResultPayload }) =>
      registerTechnicalResult(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["equipment", id] });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
  });
};

export const useUnblockEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unblockEquipment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["equipment", id] });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
};

export const useSendBlockNotification = () => {
  return useMutation({
    mutationFn: (id: string) => sendBlockNotification(id),
  });
};

export const useEquipmentById = (id?: string) => {
  return useQuery({
    queryKey: ["equipment", id],
    queryFn: () => getEquipmentById(id!),
    enabled: !!id,
  });
};

export const useClientRequestReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientRequestReturn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["equipment", id] });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
      queryClient.invalidateQueries({ queryKey: ["portal-equipments"] });
    },
  });
};

export const useDeliverEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: DeliverEquipmentPayload }) =>
      deliverEquipment(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["equipment", id] });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
  });
};
