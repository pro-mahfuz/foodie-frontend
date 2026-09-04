import { apiRequest } from "../../lib/api";
import type { CartView } from "./types";
import type { Order } from "../order";

export const cartService = {
  get: (customerId: number) => apiRequest<CartView>(`/api/customers/${customerId}/cart`),
  addItem: (customerId: number, dishId: number, quantity = 1) => apiRequest<CartView>(`/api/customers/${customerId}/cart/items`, { method: "POST", body: JSON.stringify({ dishId, quantity }) }),
  checkout: (customerId: number) => apiRequest<Order>(`/api/customers/${customerId}/cart/checkout`, { method: "POST" }),
  clear: (customerId: number) => apiRequest(`/api/customers/${customerId}/cart`, { method: "DELETE" }),
};
