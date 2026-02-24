import api from "../../../api/axios";
import type {
  CreateServiceOrderDTO,
  ServiceOrder,
  UpdateServiceOrderDTO,
} from "../types";

export const getServiceOrders = async (): Promise<ServiceOrder[]> => {
  const { data } = await api.get("/service-orders");
  return data;
};

export const getServiceOrdersByClient = async (clientId: string): Promise<ServiceOrder[]> => {
  const { data } = await api.get(`/service-orders?client=${clientId}`);
  return data;
};

export const getServiceOrderById = async (id: string): Promise<ServiceOrder> => {
  const { data } = await api.get(`/service-orders/${id}`);
  return data;
};

export const createServiceOrder = async (
  dto: CreateServiceOrderDTO,
): Promise<ServiceOrder> => {
  const { data } = await api.post("/service-orders", dto);
  return data;
};

export const updateServiceOrder = async (
  id: string,
  dto: UpdateServiceOrderDTO,
): Promise<ServiceOrder> => {
  const { data } = await api.patch(`/service-orders/${id}`, dto);
  return data;
};
