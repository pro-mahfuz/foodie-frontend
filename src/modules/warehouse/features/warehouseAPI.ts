import axiosInstance from "../../../api/axios";
import { Warehouse } from './warehouseTypes';

export const fetchAll = async () => {
  try {

    const res = await axiosInstance.get('protected/warehouse/list');

    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const create = async (createData: Warehouse) => {
  try {

    const res = await axiosInstance.post('protected/warehouse/create', createData);
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const fetchById = async (id: number) => {
  try {

    const res = await axiosInstance.get(`protected/warehouse/${id}/view`);
    return res.data.data;

  } catch {
    throw new Error('Failed to fetch');
  }
};

export const update = async (updateData: Warehouse) => {
  try {

    const res = await axiosInstance.put(`protected/warehouse/update`, updateData);
    return res.data.data;

  } catch {
    throw new Error('Failed to update');
  }
};

export const destroy = async (id: number) => {
  try {

    const res = await axiosInstance.post(`protected/warehouse/${id}/delete`);
    return res.data.data;

  } catch {
    throw new Error('Failed to delete');
  }
};

