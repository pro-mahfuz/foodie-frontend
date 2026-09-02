import type { AxiosRequestConfig } from 'axios';
import axiosInstance from "../../../api/axios";

export const fetchAll = async () => {
  try {

    const res = await axiosInstance.get('protected/business/list');
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const create = async (createData: FormData, config?: AxiosRequestConfig) => {
  try {

    const res = await axiosInstance.post('protected/business/create', createData, config);
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const fetchById = async (id: number) => {
  try {

    const res = await axiosInstance.get(`protected/business/${id}/view`);
    return res.data.data;

  } catch {
    throw new Error('Failed to fetch');
  }
};

export const update = async (updatedData: FormData, config?: AxiosRequestConfig) => {
  try {

    const res = await axiosInstance.put(`protected/business/update`, updatedData, config);
    return res.data.data;

  } catch {
    throw new Error('Failed to update');
  }
};

export const destroy = async (id: number) => {
  try {

    const res = await axiosInstance.post(`protected/business/${id}/delete`);
    return res.data.data;

  } catch {
    throw new Error('Failed to delete');
  }
};

