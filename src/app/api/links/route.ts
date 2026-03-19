import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: true, environment: true },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, url, description, projectId, environmentId } = body;

  if (!name || !url || !projectId || !environmentId) {
    return NextResponse.json({ error: "name, url, projectId, environmentId are required" }, { status: 400 });
  }

  const link = await prisma.link.create({
    data: { name, url, description, projectId, environmentId },
    include: { project: true, environment: true },
  });
  return NextResponse.json(link, { status: 201 });
}
