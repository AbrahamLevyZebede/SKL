import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  return user?.role === "ADMIN" ? user : null;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [userCount, taskCount, bidCount, paymentStats, reportCount] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.bid.count(),
    prisma.payment.aggregate({ _sum: { amount: true, serviceFee: true } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true, verified: true, isBlocked: true, jobsCompleted: true },
  });

  const recentTasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      client: { select: { name: true } },
      _count: { select: { bids: true } },
    },
  });

  return NextResponse.json({
    stats: {
      users: userCount,
      tasks: taskCount,
      bids: bidCount,
      revenue: paymentStats._sum.serviceFee ?? 0,
      volume: paymentStats._sum.amount ?? 0,
      pendingReports: reportCount,
    },
    recentUsers,
    recentTasks: recentTasks.map((t: any) => ({ ...t, photos: JSON.parse(t.photos ?? "[]") })),
  });
}
