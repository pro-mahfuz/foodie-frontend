

// Item interface
export interface Status {
  id?: number;
  businessId?: number;
  name: string;
  value: string;
  group: string;
  isActive?: boolean;
}

export interface StatusState {
  data: Status[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}