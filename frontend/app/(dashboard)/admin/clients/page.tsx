"use client";

import { useEffect, useState } from "react";

type Client = {
  id: string;
  name: string;
  retellWorkspaceId: string;
  gcsBucket: string;
  cloudRunUrl: string;
  status?: string;
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: "",
    name: "",
    retellWorkspaceId: "",
    gcsBucket: "",
    cloudRunUrl: "",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load clients");
      setClients(data.clients || []);
    } catch (err: any) {
      setError(err.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to create client");
      }
      setForm({ id: "", name: "", retellWorkspaceId: "", gcsBucket: "", cloudRunUrl: "" });
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to create client");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-gray-600">Create and manage client records.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Add Client</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onSubmit}>
          <input
            className="input"
            placeholder="Client ID (slug)"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Client name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Retell workspace ID"
            value={form.retellWorkspaceId}
            onChange={(e) => setForm({ ...form, retellWorkspaceId: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="GCS bucket"
            value={form.gcsBucket}
            onChange={(e) => setForm({ ...form, gcsBucket: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Cloud Run URL"
            value={form.cloudRunUrl}
            onChange={(e) => setForm({ ...form, cloudRunUrl: e.target.value })}
            required
          />
          <div className="md:col-span-2">
            <button className="button" type="submit">
              Add Client
            </button>
          </div>
        </form>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Existing Clients</h2>
        {loading ? (
          <div>Loading...</div>
        ) : clients.length === 0 ? (
          <div>No clients found.</div>
        ) : (
          <div className="space-y-2">
            {clients.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-md p-3">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">{c.id}</div>
                <div className="text-xs text-gray-500">Workspace: {c.retellWorkspaceId}</div>
                <div className="text-xs text-gray-500">Bucket: {c.gcsBucket}</div>
                <div className="text-xs text-gray-500">Cloud Run: {c.cloudRunUrl}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


