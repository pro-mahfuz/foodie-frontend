import { apiRequest } from "../../lib/api";
import type { CreateDishInput, Dish } from "./types";

export const dishService = {
  listForRestaurant: (restaurantId: number) => apiRequest<Dish[]>(`/api/restaurants/${restaurantId}/dishes`),
  get: (id: number) => apiRequest<Dish>(`/api/dishes/${id}`),
  update: (restaurantId: number, id: number, input: CreateDishInput) => apiRequest<Dish>(`/api/restaurants/${restaurantId}/dishes/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  create: (restaurantId: number, input: CreateDishInput) => apiRequest<Dish>(`/api/restaurants/${restaurantId}/dishes`, { method: "POST", body: JSON.stringify(input) }),
};
