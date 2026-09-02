import axiosInstance from "../../../api/axios";
import { Account } from './accountTypes';
import type { AxiosRequestConfig } from 'axios';

export const fetchAll = async () => {
  try {

    const res = await axiosInstance.get('protected/account/list');
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const getBalanceStatement = async () => {
  try {

    const res = await axiosInstance.get('protected/report/balance/statement');
    
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const getAssetStatement = async () => {
  try {

    const res = await axiosInstance.get('protected/report/asset/statement');
    
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const create = async (createData: Account, config?: AxiosRequestConfig) => {
  try {

    const res = await axiosInstance.post('protected/account/create', createData, config);
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const fetchById = async (id: number) => {
  try {

    const res = await axiosInstance.get(`protected/account/${id}/view`);
    return res.data.data;

  } catch {
    throw new Error('Failed to fetch');
  }
};

export const update = async (updateData: Account, config?: AxiosRequestConfig) => {
  try {
    console.log("updateData: ", updateData);
    const res = await axiosInstance.put(`protected/account/update`, updateData, config);
    return res.data.data;

  } catch {
    throw new Error('Failed to update');
  }
};

export const destroy = async (id: number) => {
  try {

    const res = await axiosInstance.post(`protected/account/${id}/delete`);
    return res.data.data;

  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

