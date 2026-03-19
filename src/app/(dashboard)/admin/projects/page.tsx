"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  color: string;
  order: number;
};

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6",
];

const EMOJIS = ["🔗", "📊", "🚀", "🌙", "🔥", "⚡", "🎯", "🛠️", "📡", "🔮", "🌐", "🏗️"];

const defaultForm = { name: "", description: "", emoji: "🔗", color: "#6366f1", order: 0 };

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
  }

  function openCreate() {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({ name: p.name, description: p.description ?? "", emoji: p.emoji, color: p.color, order: p.order });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/projects/${editing.id}` : "/api/projects";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    setShowForm(false);
    fetchProjects();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project and all its links?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Projects</h2>
        <button
          onClick={openCreate}
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + New Project
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editing ? "Edit Project" : "New Project"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="My Project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setForm({ ...form, emoji })}
                        className={`w-9 h-9 text-xl rounded-lg transition ${form.emoji === emoji ? "bg-violet-100 ring-2 ring-violet-500" : "hover:bg-gray-100"}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, color })}
                        className={`w-8 h-8 rounded-full transition ${form.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
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

      {/* Projects List */}
      <div className="space-y-3">
        {projects.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No projects yet. Create your first one!
          </div>
        )}
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: project.color + "20" }}
            >
              {project.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{project.name}</p>
              {project.description && (
                <p className="text-sm text-gray-500 truncate">{project.description}</p>
              )}
            </div>
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => openEdit(project)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(project.id)}
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
