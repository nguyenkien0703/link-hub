"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { LinkCard } from "@/components/LinkCard";

type Environment = {
  id: string;
  name: string;
  displayName: string;
  order: number;
};

type LinkItem = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  environment: Environment;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  color: string;
  order: number;
  links: LinkItem[];
};

interface DashboardClientProps {
  projects: Project[];
  environments: Environment[];
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export function DashboardClient({ projects, environments, isAdmin, isLoggedIn }: DashboardClientProps) {
  const [activeEnv, setActiveEnv] = useState<string>("all");

  const filteredProjects = projects
    .map((project) => ({
      ...project,
      links: activeEnv === "all"
        ? project.links
        : project.links.filter((l) => l.environment.name === activeEnv),
    }))
    .filter((p) => p.links.length > 0);

  const totalLinks = projects.reduce((acc, p) => acc + p.links.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Link Hub</h1>
                <p className="text-xs text-gray-500">{totalLinks} links across {projects.length} projects</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                      ⚙️ Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Environment Filter */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveEnv("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeEnv === "all"
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All
          </button>
          {environments.map((env) => (
            <button
              key={env.id}
              onClick={() => setActiveEnv(env.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeEnv === env.name
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {env.displayName}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
            <p className="text-gray-500">
              {activeEnv !== "all"
                ? `No links for this environment. Try switching to "All".`
                : isAdmin
                  ? "Add your first project and links in the admin panel."
                  : "No links have been added yet."}
            </p>
            {isAdmin && activeEnv === "all" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition mt-4"
              >
                Go to Admin
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredProjects.map((project) => (
              <div key={project.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
                    style={{ backgroundColor: project.color + "20", border: `2px solid ${project.color}30` }}
                  >
                    {project.emoji}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
                    {project.description && (
                      <p className="text-sm text-gray-500">{project.description}</p>
                    )}
                  </div>
                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {project.links.length} link{project.links.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {project.links.map((link) => (
                    <LinkCard key={link.id} link={link} projectColor={project.color} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
