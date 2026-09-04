import { apiRequest } from "../../lib/api";
import type { CreateOrderInput, Order } from "./types";

export const orderService = {
  list: () => apiRequest<Order[]>("/api/orders"),
  create: (order: CreateOrderInput) => apiRequest<Order>("/api/orders", { method: "POST", body: JSON.stringify(order) }),
  get: (id: number) => apiRequest<Order>(`/api/orders/${id}`),
};
