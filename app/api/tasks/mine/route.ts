import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clientId = (session.user as any).id;

  const tasks = await prisma.task.findMany({
    where: { clientId },
    include: {
      client: { select: { id: true, name: true, image: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tasks: tasks.map((t) => ({ ...t, photos: JSON.parse(t.photos ?? "[]") })) });
}
