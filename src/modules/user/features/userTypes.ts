import { Business } from "../../business/features/businessTypes";

export interface Permission {
  id: string;
  name: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  action: string;
  permissions?: Permission[];
}

export interface Profile {
  userId?: number;
  fullName: string;
  birthDate: string;
  gender: string;
  nationality: string;
  contactEmail: string;
  countryCode: string;
  phoneCode: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  profilePicture: string | File;
}

export interface BaseUser {
  id?: number;
  businessId: number;
  name: string;
  email: string;
  countryCode: string;
  phoneCode: string;
  phoneNumber: string;
  roleId: number;
  password?: string;
  isActive: boolean;
}

export interface User extends BaseUser {
  business?: Business;
  role?: Role;
  profile?: Profile;
}

export interface UserState {
  data: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}


