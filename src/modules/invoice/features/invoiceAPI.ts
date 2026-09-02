import axiosInstance from "../../../api/axios";
import { Invoice } from './invoiceTypes';

export interface PaginatedInvoiceResponse {
  invoices: Invoice[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const fetchAll = async () => {
  try {
    const res = await axiosInstance.get(`protected/invoice/list`);
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const fetchAllWithPagination = async ({ page = 1, limit = 10, type="", filterText="", date="", categoryId="", partyName="", invoiceType="" }: { page?: number; limit?: number, type?: string, filterText?:string, date?: string, categoryId?: number | "", partyName?: string, invoiceType?: string }): Promise<PaginatedInvoiceResponse> => {
  try {
    const res = await axiosInstance.get('protected/invoice/list', { params: { page, limit, type, filterText: filterText || undefined, date: date || undefined, categoryId: categoryId || undefined, partyName: partyName || undefined, invoiceType: invoiceType || undefined } });
    
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const getPurchaseReport = async () => {
  try {

    const res = await axiosInstance.post('protected/invoice/getPurchaseReport');
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const getSaleReport = async () => {
  try {

    const res = await axiosInstance.post('protected/invoice/getSaleReport');
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const getSaleContainerReport = async () => {
  try {

    const res = await axiosInstance.post('protected/invoice/getSaleContainerReport');
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const getSaleCashReport = async () => {
  try {

    const res = await axiosInstance.post('protected/invoice/getSaleCashReport');
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const getBillReport = async () => {
  try {

    const res = await axiosInstance.post('protected/invoice/getBillReport');
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const getProfitLossReport = async () => {
  try {

    const res = await axiosInstance.post('protected/invoice/getProfitLossReport');

    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const getDailyProfitLossReport = async () => {
  try {

    const res = await axiosInstance.post('protected/invoice/getDailyProfitLossReport');

    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const getSalePaymentReport = async () => {
  try {

    const res = await axiosInstance.post('protected/invoice/getSalePaymentReport');
    return res.data.data;

  } catch {
    throw new Error('No data available');
  }
};

export const create = async (createData: Invoice) => {
  try {

    const res = await axiosInstance.post('protected/invoice/create', createData);
    return res.data.data;

  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create invoice');
  }
};

export const fetchById = async (id: number) => {
  try {

    const res = await axiosInstance.get(`protected/invoice/${id}/view`);
    return res.data.data;

  } catch {
    throw new Error('Failed to fetch');
  }
};

export const update = async (updateData: Invoice) => {
  try {

    const res = await axiosInstance.put(`protected/invoice/update`, updateData);
    return res.data.data;

  } catch {
    throw new Error('Failed to update');
  }
};

export const destroy = async (id: number) => {
  try {

    const res = await axiosInstance.post(`protected/invoice/${id}/delete`);
    return res.data.data;

  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

