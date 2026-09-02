import axiosInstance from "../../../api/axios";
import { Unit } from './unitTypes';

export const fetchAll = async () => {
  try {

    const res = await axiosInstance.get('protected/unit/list');
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const create = async (createData: Unit) => {
  try {

    const res = await axiosInstance.post('protected/unit/create', createData);
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const fetchById = async (id: number) => {
  try {

    const res = await axiosInstance.get(`protected/unit/${id}/view`);
    return res.data.data;

  } catch {
    throw new Error('Failed to fetch');
  }
};

export const update = async (updateData: Unit) => {
  try {

    const res = await axiosInstance.put(`protected/unit/update`, updateData);
    return res.data.data;

  } catch {
    throw new Error('Failed to update');
  }
};

export const destroy = async (id: number) => {
  try {

    const res = await axiosInstance.post(`protected/unit/${id}/delete`);
    return res.data.data;

  } catch {
    throw new Error('Failed to delete');
  }
};

