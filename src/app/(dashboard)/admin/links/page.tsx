"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Environment = { id: string; name: string; displayName: string };
type Project = { id: string; name: string; emoji: string };
type Link = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  project: Project;
  environment: Environment;
};

const defaultForm = { name: "", url: "", description: "", projectId: "", environmentId: "" };

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Link | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState("all");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [linksRes, projectsRes, envsRes] = await Promise.all([
      fetch("/api/links"),
      fetch("/api/projects"),
      fetch("/api/environments"),
    ]);
    if (linksRes.ok) setLinks(await linksRes.json());
    if (projectsRes.ok) setProjects(await projectsRes.json());
    if (envsRes.ok) setEnvironments(await envsRes.json());
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...defaultForm, projectId: projects[0]?.id ?? "", environmentId: environments[0]?.id ?? "" });
    setShowForm(true);
  }

  function openEdit(link: Link) {
    setEditing(link);
    setForm({
      name: link.name,
      url: link.url,
      description: link.description ?? "",
      projectId: link.project.id,
      environmentId: link.environment.id,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/links/${editing.id}` : "/api/links";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    setShowForm(false);
    fetchAll();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this link?")) return;
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    fetchAll();
    router.refresh();
  }

  const filteredLinks = filterProject === "all"
    ? links
    : links.filter((l) => l.project.id === filterProject);

  const ENV_COLORS: Record<string, string> = {
    prod: "bg-green-100 text-green-700",
    stg: "bg-yellow-100 text-yellow-700",
    dev: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Links</h2>
        <button
          onClick={openCreate}
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + New Link
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilterProject("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filterProject === "all" ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          All
        </button>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setFilterProject(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filterProject === p.id ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {p.emoji} {p.name}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editing ? "Edit Link" : "New Link"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Link name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                  <input
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    required
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="">Select project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment *</label>
                  <select
                    value={form.environmentId}
                    onChange={(e) => setForm({ ...form, environmentId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="">Select environment...</option>
                    {environments.map((env) => (
                      <option key={env.id} value={env.id}>{env.displayName}</option>
                    ))}
                  </select>
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

      {/* Links List */}
      <div className="space-y-2">
        {filteredLinks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No links yet.
          </div>
        )}
        {filteredLinks.map((link) => (
          <div
            key={link.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 text-sm">{link.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ENV_COLORS[link.environment.name] ?? "bg-gray-100 text-gray-700"}`}>
                  {link.environment.displayName}
                </span>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-700 truncate block"
              >
                {link.url}
              </a>
              {link.description && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{link.description}</p>
              )}
            </div>
            <div className="text-xs text-gray-400 shrink-0">
              {link.project.emoji} {link.project.name}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => openEdit(link)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(link.id)}
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
