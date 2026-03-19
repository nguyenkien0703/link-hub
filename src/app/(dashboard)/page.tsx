import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const [session, projects, environments] = await Promise.all([
    getServerSession(authOptions),
    prisma.project.findMany({
      orderBy: { order: "asc" },
      include: {
        links: {
          include: { environment: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.environment.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <DashboardClient
      projects={projects}
      environments={environments}
      isAdmin={session?.user?.role === "ADMIN"}
      isLoggedIn={!!session}
    />
  );
}
