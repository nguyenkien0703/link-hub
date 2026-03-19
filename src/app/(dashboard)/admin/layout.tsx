import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition">
                ← Back
              </Link>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-48 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-3 space-y-1">
                <NavItem href="/admin/projects" label="📁 Projects" />
                <NavItem href="/admin/environments" label="🌍 Environments" />
                <NavItem href="/admin/links" label="🔗 Links" />
                <div className="h-px bg-gray-100 my-1" />
                <NavItem href="/admin/users" label="👥 Users" />
              </div>
            </div>
          </nav>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition"
    >
      {label}
    </Link>
  );
}
