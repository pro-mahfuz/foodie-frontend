import { apiRequest } from "../../lib/api";
import type { Restaurant, RestaurantInput } from "./types";

export const restaurantService = {
  list: () => apiRequest<Restaurant[]>("/api/restaurants"),
  get: (id: number) => apiRequest<Restaurant>(`/api/restaurants/${id}`),
  create: (input: RestaurantInput) => apiRequest<Restaurant>("/api/restaurants", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, input: RestaurantInput) => apiRequest<Restaurant>(`/api/restaurants/${id}`, { method: "PUT", body: JSON.stringify(input) }),
};
