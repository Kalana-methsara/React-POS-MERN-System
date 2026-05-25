import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import Table from "../components/Table";
import api from "../services/api";
import type { Customer } from "../types";
import { getCustomerId } from "../utils/customer";

const CustomerPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Updated state to match your MongoDB schema
  const [form, setForm] = useState({
    id: '', // Used for update/delete
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const isEdit = useMemo(() => form.id.trim().length > 0, [form.id]);

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      // Updated to match pagination endpoint
      const response = await api.get(`/customer?page=${page}&limit=10`);
      setCustomers(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCustomers();
  }, []);

  const resetForm = () => {
    setForm({ id: '', name: '', email: '', phone: '', address: '' });
  };

  const startEdit = (c: any) => {
    setForm({
      id: c._id ?? c.id ?? '', // Handle both _id (MongoDB) and id
      name: c.name ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      address: c.address ?? '',
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/customer/${form.id}`, payload);
      } else {
        await api.post('/customer', payload);
      }

      await fetchCustomers();
      resetForm();
      alert(isEdit ? 'Customer Updated Successfully' : 'Customer Saved Successfully');
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : 'Save failed';
      alert(message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete customer?`)) return;

    try {
      await api.delete(`/customer/${id}`);
      setCustomers((prev) => prev.filter((c: any) => (c._id || c.id) !== id));
      if (form.id === id) resetForm();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const columns = [
  { header: "Name", key: "name" as const },
  { header: "Email", key: "email" as const },
  { header: "Phone", key: "phone" as const },
  { header: "Address", key: "address" as const },
  {
    header: 'Actions', 
    render: (row: Customer) => (
      <div className="flex gap-2">
        <button 
          onClick={() => startEdit(row)} 
          className="text-blue-600 hover:underline"
        >
          Edit
        </button>
        <button 
          onClick={() => void handleDelete(getCustomerId(row))}
          className="text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    )
  }
];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
      
      {/* Form Fields Updated */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input value={form.name} onChange={(e) => setForm(p => ({...p, name: e.target.value}))} placeholder="Name" className="border p-2 rounded" required />
        <input value={form.email} onChange={(e) => setForm(p => ({...p, email: e.target.value}))} placeholder="Email" className="border p-2 rounded" />
        <input value={form.phone} onChange={(e) => setForm(p => ({...p, phone: e.target.value}))} placeholder="Phone" className="border p-2 rounded" />
        <input value={form.address} onChange={(e) => setForm(p => ({...p, address: e.target.value}))} placeholder="Address" className="border p-2 rounded" />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white p-2 rounded disabled:opacity-60"
        >
          {submitting ? "Saving..." : isEdit ? "Update" : "Add"}
        </button>
      </form>

      <Table columns={columns} data={customers} loading={loading} />
    </div>
  );
};

export default CustomerPage;