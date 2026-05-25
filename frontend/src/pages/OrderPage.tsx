import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import api from "../services/api";
import { getAllCustomers } from "../services/customerService";
import { createOrder } from "../services/orderService";
import type { Customer, Item } from "../types";
import { getCustomerId } from "../utils/customer";

type OrderLine = {
  itemId: string;
  quantity: number;
};

const OrderPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([{ itemId: "", quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customerResult, itemRes] = await Promise.all([
          getAllCustomers(1, 100),
          api.get("/item/all"),
        ]);
        setCustomers(customerResult.data);
        setItems(Array.isArray(itemRes.data?.data) ? itemRes.data.data : []);
      } catch (error) {
        console.error(error);
        alert("Failed to load order data");
      }
    };

    void loadData();
  }, []);

  const updateLine = (index: number, field: keyof OrderLine, value: string | number) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)),
    );
  };

  const addLine = () => {
    setLines((prev) => [...prev, { itemId: "", quantity: 1 }]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!customerId) {
      alert("Please select a customer");
      return;
    }

    const validLines = lines.filter((line) => line.itemId && line.quantity > 0);
    if (validLines.length === 0) {
      alert("Add at least one item with quantity");
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({ customerId, items: validLines });
      alert("Order placed successfully");
      setCustomerId("");
      setLines([{ itemId: "", quantity: 1 }]);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message || err.message
        : err instanceof Error
          ? err.message
          : "Order failed";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Place Order</h1>
        <p className="text-sm text-gray-500">Select a customer and add items to create an order</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300"
            required
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={getCustomerId(customer)} value={getCustomerId(customer)}>
                {customer.name} — {customer.phone}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Order Items</h2>
            <button
              type="button"
              onClick={addLine}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Add line
            </button>
          </div>

          {lines.map((line, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <select
                  value={line.itemId}
                  onChange={(e) => updateLine(index, "itemId", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  required
                >
                  <option value="">Select item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.description} — {item.price} ({item.quantity} in stock)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => updateLine(index, "quantity", Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                    required
                  />
                </div>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="px-3 py-2 text-sm text-red-600 hover:underline self-end"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-60"
        >
          {submitting ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
};

export default OrderPage;
