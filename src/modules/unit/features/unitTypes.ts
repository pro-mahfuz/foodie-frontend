
// Unit interface
export interface Unit {
  id?: number;
  businessId?: number;
  name?: string;
  isActive?: boolean;
}

export interface UnitState {
  data: Unit[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}