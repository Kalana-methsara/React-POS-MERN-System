import api from "./api";
import type { Customer, PaginatedResponse } from "../types";

export type CustomerListResult = Pick<PaginatedResponse<Customer>, "data" | "pagination">;

export const getAllCustomers = async (
  page = 1,
  limit = 10,
): Promise<CustomerListResult> => {
  const res = await api.get<PaginatedResponse<Customer>>(`/customer?page=${page}&limit=${limit}`);
  const body = res.data;
  return {
    data: Array.isArray(body?.data) ? body.data : [],
    pagination: body?.pagination ?? {
      totalData: 0,
      totalPages: 1,
      currentPage: page,
      limit,
    },
  };
};

export const saveCustomer = async (customer: Omit<Customer, "_id">) => {
  const res = await api.post("/customer", customer);
  return res.data;
};

export const updateCustomer = async (id: string, customer: Partial<Omit<Customer, "_id">>) => {
  const res = await api.put(`/customer/${encodeURIComponent(id)}`, customer);
  return res.data;
};

export const deleteCustomer = async (id: string) => {
  const res = await api.delete(`/customer/${encodeURIComponent(id)}`);
  return res.data;
};
