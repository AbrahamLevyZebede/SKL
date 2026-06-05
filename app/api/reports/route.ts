import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reporterId = (session.user as any).id;
  const { reportedId, reason, details } = await req.json();
  if (!reportedId || !reason) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (reportedId === reporterId) return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });

  const report = await prisma.report.create({
    data: { reporterId, reportedId, reason, details },
  });

  // Notify admin
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  await prisma.notification.createMany({
    data: admins.map((a: any) => ({
      userId: a.id,
      type: "ADMIN_REPORT",
      title: "Nuevo reporte de usuario",
      message: `${session.user?.name} reportó a un usuario. Razón: ${reason}`,
      data: JSON.stringify({ reportId: report.id, reportedId }),
    })),
  });

  return NextResponse.json(report, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      reported: { select: { id: true, name: true, email: true, isBlocked: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reports);
}
