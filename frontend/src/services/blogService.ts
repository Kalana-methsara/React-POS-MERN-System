import api from "./api";
import type { Blog, PaginatedResponse } from "../types";

export const createBlog = async (data: FormData) => {
  const res = await api.post("/blog/create", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getAllBlog = async (
  page: number,
  limit: number,
): Promise<PaginatedResponse<Blog>> => {
  const res = await api.get(`/blog?page=${page}&limit=${limit}`);
  return res.data;
};

export const getMyBlog = async (
  page: number,
  limit: number,
): Promise<PaginatedResponse<Blog>> => {
  const res = await api.get(`/blog/me?page=${page}&limit=${limit}`);
  return res.data;
};

export const updateBlog = async (id: string, data: FormData) => {
  const res = await api.put(`/blog/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteBlog = async (id: string) => {
  const res = await api.delete(`/blog/${id}`);
  return res.data;
};