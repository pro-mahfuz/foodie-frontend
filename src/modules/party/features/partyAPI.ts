
import axiosInstance from "../../../api/axios";
import { Party } from './partyTypes';

export interface PaginatedPartyResponse {
  parties: Party[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const fetchParty = async ({ type="" }: { type?: string }) => {
  try {

    const res = await axiosInstance.get(`protected/party/list?type=${type}`);
    console.log("partyData: ", res.data.data);
    return res.data.data;

  } catch {
      throw new Error('No data available');
  }
};

export const fetchPartyPaginated = async ({ page, limit, type="", filterText, sortByName = false }: { page?: number; limit?: number, type?: string, filterText?: string | number, sortByName?: boolean }): Promise<PaginatedPartyResponse> => {
  try {
    const res = await axiosInstance.get('protected/party/list/paginated', {
      params: {
        page,
        limit,
        type: type || undefined,
        filterText: filterText === undefined || filterText === null || filterText === '' ? undefined : filterText,
        sortByName: sortByName || undefined,
      },
    });
    return res.data.data;

  } catch {
      throw new Error('No data available');
  }
};

export const fetchReceivablePayable = async () => {
  try {

    const res = await axiosInstance.get(`protected/party/getReceivablePayable`);
    return res.data.data;

  } catch {
      throw new Error('No data available');
  }
};

export const createParty = async (partyData: Party) => {
  try {
    const res = await axiosInstance.post('protected/party/create', partyData);
    return res.data.data;
  } catch {
      throw new Error('No data available');
  }
};

export const fetchPartyById = async (id: number) => {
  try {
    const res = await axiosInstance.get(`protected/party/${id}`);
    return res.data.data;
  } catch {
    throw new Error('Failed to fetch user');
  }
};

export const updateParty = async (id: number, partyData: Party) => {
  try {

    const res = await axiosInstance.put(`protected/party/${id}`, partyData);
    return res.data.data;

  } catch {

    throw new Error('Failed to update party');

  }
};

export const deleteParty = async (id: number) => {
  try {

    const res = await axiosInstance.post(`protected/party/${id}/deactive`);
    return res.data.data;

  } catch {
    
    throw new Error('Failed to delete party');
  }
};

