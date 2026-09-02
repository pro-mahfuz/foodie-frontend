import axiosInstance from "../../../api/axios";
import { Container, ContainerLifecycleStatus } from './containerTypes';

export const fetchAll = async () => {
  try {

    const res = await axiosInstance.get('protected/container/list');
    return res.data.data;

  } catch (error) {
    throw error;
  }
};

export const create = async (createData: Container) => {
  try {

    const res = await axiosInstance.post('protected/container/create', createData);
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const fetchById = async (id: number) => {
  try {

    const res = await axiosInstance.get(`protected/container/${id}/view`);
    return res.data.data;

  } catch {
    throw new Error('Failed to fetch');
  }
};

export const update = async (updateData: Container) => {
  try {

    const res = await axiosInstance.put(`protected/container/update`, updateData);
    return res.data.data;

  } catch {
    throw new Error('Failed to update');
  }
};

export const destroy = async (id: number) => {
  try {

    const res = await axiosInstance.post(`protected/container/${id}/delete`);
    return res.data.data;

  } catch {
    throw new Error('Failed to delete');
  }
};

export const fetchOptions = async ({ page = 1, limit = 10, filterText = "" }: { page?: number; limit?: number; filterText?: string }) => {
  try {
    const res = await axiosInstance.get("protected/container/list", { params: { page, limit, filterText: filterText || undefined } });
    return res.data.data;
  } catch {
    throw new Error("No container data available");
  }
};

export const setStatus = async (id: number, status: ContainerLifecycleStatus) => {
  const res = await axiosInstance.post(`protected/container/${id}/status`, { status });
  return res.data.data;
};

