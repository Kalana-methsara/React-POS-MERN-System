import api from "./api";

export const createOrder = async (order: {
  customerId: string;
  items: Array<{ itemId: string; quantity: number }>;
}) => {
  const res = await api.post("/order", order);
  return res.data;
};

export const getAllOrders = async () => {
  const res = await api.get("/order/all");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};
