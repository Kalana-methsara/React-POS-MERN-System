import api from "./api";
import type { Item } from "../types";

export const getAllItems = async (): Promise<Item[]> => {
  const res = await api.get("/item/all");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

export const saveItem = async (item: Omit<Item, "id"> & { id?: string }) => {
  const res = await api.post("/item", item);
  return res.data;
};

export const updateItem = async (item: Item) => {
  const res = await api.put("/item", item);
  return res.data;
};

export const deleteItem = async (id: string) => {
  const res = await api.delete(`/item/${encodeURIComponent(id)}`);
  return res.data;
};
