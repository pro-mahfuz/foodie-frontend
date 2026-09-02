import { User } from "../../user/features/userTypes";
import { Stock } from "../../stock/features/stockTypes";

export type ContainerLifecycleStatus = "Draft" | "In Transit" | "Arrived" | "Customs Clearance" | "Available" | "Closed" | "Inactive";

// Item interface
export interface Container {
  id?: number;
  businessId?: number;
  date: string;
  blNo: string;
  soNo?: string;
  oceanVesselName?: string;
  description?: string;
  voyageNo?: string;
  agentDetails?: string;
  placeOfReceipt?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  placeOfDelivery?: string;
  containerNo: string;
  sealNo?: string;
  stocks?: Stock[];
  user?: User;
  isActive: boolean;
  status?: ContainerLifecycleStatus;
  createdUserId?: number;
  updatedUserId?: number;
}


export interface ContainerState {
  data: Container[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
