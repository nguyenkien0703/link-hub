"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Environment = {
  id: string;
  name: string;
  displayName: string;
  order: number;
};

const defaultForm = { name: "", displayName: "", order: 0 };

export default function EnvironmentsPage() {
  const router = useRouter();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Environment | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEnvironments(); }, []);

  async function fetchEnvironments() {
    const res = await fetch("/api/environments");
    if (res.ok) setEnvironments(await res.json());
  }

  function openCreate() {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  }

  function openEdit(env: Environment) {
    setEditing(env);
    setForm({ name: env.name, displayName: env.displayName, order: env.order });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/environments/${editing.id}` : "/api/environments";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    setShowForm(false);
    fetchEnvironments();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this environment? All links in it will also be deleted.")) return;
    await fetch(`/api/environments/${id}`, { method: "DELETE" });
    fetchEnvironments();
    router.refresh();
  }

  const ENV_COLORS: Record<string, string> = {
    prod: "bg-green-100 text-green-700",
    stg: "bg-yellow-100 text-yellow-700",
    dev: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Environments</h2>
        <button
          onClick={openCreate}
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + New Environment
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editing ? "Edit Environment" : "New Environment"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name * <span className="text-gray-400 font-normal">(slug, e.g. "prod")</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="prod"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Production"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                  >
                    {loading ? "Saving..." : editing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {environments.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No environments yet.
          </div>
        )}
        {environments.map((env) => (
          <div
            key={env.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
          >
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${ENV_COLORS[env.name] ?? "bg-gray-100 text-gray-700"}`}
            >
              {env.displayName}
            </span>
            <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{env.name}</code>
            <span className="text-xs text-gray-400">order: {env.order}</span>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => openEdit(env)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(env.id)}
                className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
