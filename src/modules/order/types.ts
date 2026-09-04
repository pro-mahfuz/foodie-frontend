export type OrderItemInput = { dishId: number; quantity: number };
export type OrderReceipt = { totalAmount?: number; orderDate?: string; items?: { dishId: number; dishName: string; quantity: number; price: number; subtotal: number }[] };
export type CreateOrderInput = { customerId: number; restaurantId: number; items: OrderItemInput[] };
export type Order = OrderReceipt & { orderId?: number; id?: number; customerId?: number; customerName?: string; restaurantId?: number; restaurantName?: string; itemCount?: number; createdAt?: string; status?: string; total?: number };
