import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const { taskId, amount, message, estimatedDuration } = await req.json();
  if (!taskId || !amount || !message || !estimatedDuration) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.status !== "OPEN") {
    return NextResponse.json({ error: "Task not available" }, { status: 400 });
  }
  if (task.clientId === userId) {
    return NextResponse.json({ error: "Cannot bid on your own task" }, { status: 400 });
  }

  const existing = await prisma.bid.findFirst({ where: { taskId, workerId: userId } });
  if (existing) return NextResponse.json({ error: "Already bid on this task" }, { status: 409 });

  const bid = await prisma.bid.create({
    data: { taskId, workerId: userId, amount: parseFloat(amount), message, estimatedDuration },
    include: { worker: { select: { id: true, name: true, image: true, rating: true, reviewCount: true, jobsCompleted: true } } },
  });

  // Notify client
  await prisma.notification.create({
    data: {
      userId: task.clientId,
      type: "NEW_BID",
      title: "New Bid Received",
      message: `${session.user.name} submitted a bid of $${amount} on "${task.title}"`,
      data: JSON.stringify({ taskId, bidId: bid.id }),
    },
  });

  return NextResponse.json(bid, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const bids = await prisma.bid.findMany({
    where: { workerId: userId },
    include: {
      task: {
        include: {
          client: { select: { id: true, name: true, image: true } },
          _count: { select: { bids: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bids.map((b: any) => ({ ...b, task: { ...b.task, photos: JSON.parse(b.task.photos ?? "[]") } })));
}
