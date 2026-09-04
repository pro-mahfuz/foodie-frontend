import type { Dish } from "../dishes";
export type CartLine = { dish: Dish; quantity: number };
export type CartView = { customerId: number; items: { dishId: number; dishName: string; quantity: number; unitPrice: number; subtotal: number }[]; total: number };
