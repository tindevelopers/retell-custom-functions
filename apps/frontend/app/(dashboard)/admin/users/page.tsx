"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
  assignedClients?: string[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", name: "", role: "user", assignedClients: "" });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load users");
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
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
      const payload = {
        email: form.email,
        name: form.name,
        role: form.role,
        assignedClients: form.assignedClients
          ? form.assignedClients.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to create user");
      }
      setForm({ email: "", name: "", role: "user", assignedClients: "" });
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-gray-600">Manage admin access to Retell clients.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Add User</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onSubmit}>
          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="client_admin">Client Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <input
            className="input"
            placeholder="Assigned clients (comma-separated IDs)"
            value={form.assignedClients}
            onChange={(e) => setForm({ ...form, assignedClients: e.target.value })}
          />
          <div className="md:col-span-2">
            <button className="button" type="submit">
              Add User
            </button>
          </div>
        </form>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Existing Users</h2>
        {loading ? (
          <div>Loading...</div>
        ) : users.length === 0 ? (
          <div>No users found.</div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="border border-gray-200 rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{u.email}</div>
                  <div className="text-sm text-gray-600">
                    {u.name} • {u.role}
                  </div>
                  {u.assignedClients?.length ? (
                    <div className="text-xs text-gray-500">Clients: {u.assignedClients.join(', ')}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


