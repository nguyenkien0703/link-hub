import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: { links: { include: { environment: true } } },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, emoji, color, order } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const project = await prisma.project.create({
    data: { name, description, emoji: emoji || "🔗", color: color || "#6366f1", order: order ?? 0 },
  });
  return NextResponse.json(project, { status: 201 });
}
