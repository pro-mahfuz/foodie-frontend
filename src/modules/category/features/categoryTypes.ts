import { Item } from "../../item/features/itemTypes";
// Invoice interface
export interface Category {
    id?: number;
    businessId: number;
    name: string;
    items?: Item[];
    isAction: boolean;
}

export interface CategoryState {
  data: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
