"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PasswordInput } from "@/components/PasswordInput";

type User = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
};

const defaultForm = { email: "", password: "", role: "USER" as "ADMIN" | "USER" };

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; role: "ADMIN" | "USER" } | null>(null);
  const [editingPw, setEditingPw] = useState<{ id: string; password: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create user");
      return;
    }
    setShowCreate(false);
    setForm(defaultForm);
    fetchUsers();
  }

  async function handleRoleChange(id: string, role: "ADMIN" | "USER") {
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setEditingRole(null);
    fetchUsers();
  }

  async function handlePasswordChange(id: string, password: string) {
    if (!password) return;
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setEditingPw(null);
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Delete user "${email}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    fetchUsers();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Users</h2>
        <button
          onClick={() => { setShowCreate(true); setError(""); setForm(defaultForm); }}
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + New User
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">New User</h3>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="user@defikit.net"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <PasswordInput
                    value={form.password}
                    onChange={(v) => setForm({ ...form, password: v })}
                    required
                    placeholder="min 8 characters"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="flex gap-3">
                    {(["USER", "ADMIN"] as const).map((r) => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value={r}
                          checked={form.role === r}
                          onChange={() => setForm({ ...form, role: r })}
                          className="text-violet-600"
                        />
                        <span className="text-sm text-gray-700">{r === "ADMIN" ? "Admin" : "User"}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    User: view only · Admin: full access
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password change modal */}
      {editingPw && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
              <PasswordInput
                value={editingPw.password}
                onChange={(v) => setEditingPw({ ...editingPw, password: v })}
                autoFocus
                placeholder="New password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingPw(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePasswordChange(editingPw.id, editingPw.password)}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users list */}
      <div className="space-y-2">
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-400">No users yet.</div>
        )}
        {users.map((user) => {
          const isSelf = session?.user?.id === user.id;
          return (
            <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700 shrink-0">
                {user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">{user.email}</span>
                  {isSelf && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">you</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Role badge / toggle */}
              {editingRole?.id === user.id ? (
                <div className="flex gap-2 items-center">
                  {(["USER", "ADMIN"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(user.id, r)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        r === "ADMIN"
                          ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                  <button onClick={() => setEditingRole(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => !isSelf && setEditingRole({ id: user.id, role: user.role })}
                  title={isSelf ? "Cannot change your own role" : "Click to change role"}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === "ADMIN"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-gray-100 text-gray-600"
                  } ${!isSelf ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`}
                >
                  {user.role}
                </button>
              )}

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setEditingPw({ id: user.id, password: "" })}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
                  title="Change password"
                >
                  🔑 Password
                </button>
                {!isSelf && (
                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
