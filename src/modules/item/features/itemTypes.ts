import { Invoice } from "../../invoice/features/invoiceTypes";
import { Container } from "../../container/features/containerTypes";
import { Category } from "../../category/features/categoryTypes";
import { Warehouse } from "../../warehouse/features/warehouseTypes";

// Item interface
export interface Item {
  id?: number;
  businessId?: number;
  uniqueId?: number;
  containerId?: number | null;
  containerNo?: string | null,
  itemId?: number;
  code?: string;
  categoryId?: number | null;
  category?: Category;
  name?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  subTotal?: number;
  warehouseName?: string;
  warehouseId?: number | null;
  warehouse?: Warehouse;
  itemGrandTotal?: number;
  invoice?: Invoice;
  container?: Container;
  stockIn?: number;
  stockOut?: number;
  isActive?: boolean;
  invoiceNo?: string;
  vatInvoiceRefNo?: string;
  system: number;
  itemVat: number;
  vatPercentage: number;
  itemType?: string;
  purity?: number | undefined;
}

export interface ItemState {
  data: Item[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}