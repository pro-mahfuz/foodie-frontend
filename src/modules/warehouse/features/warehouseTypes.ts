export interface Warehouse {
  id?: number;
  businessId?: number;
  name: string;
  location: string;
  isActive: boolean;
}

export interface WarehouseState {
  data: Warehouse[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}