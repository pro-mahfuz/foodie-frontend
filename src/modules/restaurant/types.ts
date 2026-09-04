export type Restaurant = {
  restaurantId?: number;
  id?: number;
  name: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  rating?: number;
  deliveryTime?: string;
  image?: string;
};
export type RestaurantInput = { name: string; address: string; phone: string; rating?: number };

export const restaurantId = (restaurant: Restaurant) => restaurant.restaurantId ?? restaurant.id ?? 1;
