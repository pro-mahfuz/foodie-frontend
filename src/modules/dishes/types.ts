export type Dish = {
  dishId?: number;
  id?: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  restaurantId?: number;
};

export type CreateDishInput = { name: string; description: string; price: number; category: string; image?: string };

export const dishId = (dish: Dish) => dish.dishId ?? dish.id ?? 1;
