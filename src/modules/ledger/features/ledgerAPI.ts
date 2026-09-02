import axiosInstance from "../../../api/axios";
import { Ledger } from './ledgerTypes';

export const fetchAll = async ({ summary = false, partyId }: { summary?: boolean; partyId?: number } = {}) => {
  try {

    const res = await axiosInstance.get('protected/ledger/list', { params: { summary: summary || undefined, partyId } });
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const create = async (createData: Ledger) => {
  try {

    const res = await axiosInstance.post('protected/ledger/create', createData);
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const fetchById = async (id: number) => {
  try {

    const res = await axiosInstance.get(`protected/ledger/${id}/view`);
    return res.data.data;

  } catch {
    throw new Error('Failed to fetch');
  }
};

export const update = async (updateData: Ledger) => {
  try {

    const res = await axiosInstance.put(`protected/ledger/update`, updateData);
    return res.data.data;

  } catch {
    throw new Error('Failed to update');
  }
};

export const destroy = async (id: number) => {
  try {

    const res = await axiosInstance.post(`protected/ledger/${id}/delete`);
    return res.data.data;

  } catch {
    throw new Error('Failed to delete');
  }
};

