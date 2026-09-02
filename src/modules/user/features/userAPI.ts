import type { AxiosRequestConfig } from 'axios';
import axiosInstance from "../../../api/axios";
import { User } from './userTypes';

export const fetchUser = async () => {
  try {

    const res = await axiosInstance.get('protected/user/list');
    
    return res.data.data.map((user: User): User => (
      {
        id: user.id,
        businessId: user.businessId,
        name: user.name,
        email: user.email,
        countryCode: user.countryCode || '',
        phoneCode: user.phoneCode || '',
        phoneNumber: user.phoneNumber || '',
        roleId: user.roleId,
        business: user.business,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive ?? true,
      }
    ));

  } catch {
      throw new Error('No data available');
  }
};

export const createUser = async (userData: User) => {
  try {
    const res = await axiosInstance.post('protected/user/create', userData);
    return res.data.data;
  } catch {
      throw new Error('No data available');
  }
};

export const fetchUserById = async (id: number) => {
  try {
    const res = await axiosInstance.get(`protected/user/${id}/view`);
    return res.data.data;
  } catch {
    throw new Error('Failed to fetch user');
  }
};

export const updateUser = async (userData: User) => {
  try {

    const res = await axiosInstance.put(`protected/user/update`, userData);
    return res.data.data;

  } catch {

    throw new Error('Failed to update user');

  }
};

export const deleteUser = async (id: number) => {
  try {

    const res = await axiosInstance.post(`protected/user/${id}/delete`);
    console.log("User deleted successfully:", res.data);
    return res.data.data;

  } catch {
    
    throw new Error('Failed to delete user');
  }
};

export const fetchProfileById = async (id: number) => {
  try {

    const res = await axiosInstance.get(`protected/profile/${id}`);
    console.log("User profile fetch successfully:", res.data);
    return res.data.data;

  } catch {
    
    throw new Error('Failed to fetch user profile');
  }
};

export const updateProfileById = async (
  id: number,
  updateData: FormData,
  config?: AxiosRequestConfig
) => {
  try {
    const res = await axiosInstance.put(`protected/profile/${id}`, updateData, config);
    console.log("User profile updated successfully:", res.data.data);
    return res.data.data;
  } catch (error) {
    console.error("Profile update failed", error);
    throw new Error('Failed to update user profile');
  }
};