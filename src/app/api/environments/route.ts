import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const environments = await prisma.environment.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(environments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, displayName, order } = body;

  if (!name || !displayName) {
    return NextResponse.json({ error: "Name and displayName are required" }, { status: 400 });
  }

  const environment = await prisma.environment.create({
    data: { name, displayName, order: order ?? 0 },
  });
  return NextResponse.json(environment, { status: 201 });
}
