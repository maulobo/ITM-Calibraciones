import api from "../../../api/axios";
import type { CreateServiceOrderDTO, ServiceOrder } from "../types";

export const getServiceOrders = async (): Promise<ServiceOrder[]> => {
  const { data } = await api.get("/service-orders");
  return data;
};

export const getServiceOrderById = async (id: string): Promise<ServiceOrder> => {
  const { data } = await api.get(`/service-orders/${id}`);
  return data;
};

export const createServiceOrder = async (dto: CreateServiceOrderDTO): Promise<ServiceOrder> => {
  const { data } = await api.post("/service-orders", dto);
  return data;
};
