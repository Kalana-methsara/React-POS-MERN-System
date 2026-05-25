import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import Table from "../components/Table";
import api from "../services/api";
import type { Item } from "../types";

const ItemPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Item>({
    id: "",
    description: "",
    price: 0,
    quantity: 0,
    unit: "",
  });

  const isEdit = useMemo(() => form.id.trim().length > 0, [form.id]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await api.get("/item/all");
      setItems(Array.isArray(response.data?.data) ? response.data.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    void fetchItems();
  }, []);

  const resetForm = () => {
    setForm({ id: "", description: "", price: 0, quantity: 0, unit: "" });
  };

  const startEdit = (item: Item) => {
    setForm({
      id: item.id ?? "",
      description: item.description ?? "",
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
      unit: item.unit ?? "",
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      id: form.id.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      quantity: Number(form.quantity) || 0,
      unit: form.unit.trim(),
    };

    if (!payload.description) {
      alert("Description is required");
      return;
    }

    setSubmitting(true);
    try {
      await (isEdit ? api.put("/item", payload) : api.post("/item", payload));
      await fetchItems();
      resetForm();
      alert(isEdit ? "Item updated successfully" : "Item saved successfully");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message || err.message
        : err instanceof Error
          ? err.message
          : "Save failed";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id || !confirm(`Delete item ${id}?`)) return;

    try {
      await api.delete(`/item/${encodeURIComponent(id)}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (form.id === id) resetForm();
      alert("Item deleted successfully");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message || err.message
        : err instanceof Error
          ? err.message
          : "Delete failed";
      alert(message);
    }
  };

  const columns = [
    { header: "ID", key: "id" as const },
    { header: "Description", key: "description" as const },
    { header: "Price", key: "price" as const },
    { header: "Quantity", key: "quantity" as const },
    { header: "Unit", key: "unit" as const },
    {
      header: "Actions",
      render: (row: Item) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => startEdit(row)} className="text-blue-600 hover:underline">
            Edit
          </button>
          <button type="button" onClick={() => void handleDelete(row.id)} className="text-red-500 hover:underline">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Item Management</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Item" : "Add Item"}</h2>
          <button type="button" onClick={resetForm} className="text-sm text-gray-600 hover:underline" disabled={submitting}>
            Clear
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            value={form.id}
            onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
            placeholder="ID (update only)"
            className="px-4 py-2 rounded-lg border border-gray-300"
          />
          <input
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className="px-4 py-2 rounded-lg border border-gray-300"
            required
          />
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
            placeholder="Price"
            min={0}
            className="px-4 py-2 rounded-lg border border-gray-300"
          />
          <input
            type="number"
            value={form.quantity}
            onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
            placeholder="Quantity"
            min={0}
            className="px-4 py-2 rounded-lg border border-gray-300"
          />
          <input
            value={form.unit}
            onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
            placeholder="Unit"
            className="px-4 py-2 rounded-lg border border-gray-300"
          />
          <div className="md:col-span-5">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-60"
            >
              {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
            </button>
            {loading ? <span className="ml-3 text-sm text-gray-500">Loading...</span> : null}
          </div>
        </form>
      </div>

      <Table columns={columns} data={items} emptyMessage="No items found in the system." />
    </div>
  );
};

export default ItemPage;
