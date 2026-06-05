import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SERVICE_FEE_RATE = 0.10;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clientId = (session.user as any).id;

  const { taskId, action } = await req.json();

  if (action === "escrow") {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { acceptedBid: true },
    });
    if (!task || task.clientId !== clientId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!task.acceptedBid) return NextResponse.json({ error: "No accepted bid" }, { status: 400 });

    const amount = task.acceptedBid.amount;
    const serviceFee = amount * SERVICE_FEE_RATE;
    const workerPayout = amount - serviceFee;

    const payment = await prisma.payment.upsert({
      where: { taskId },
      update: { status: "ESCROWED" },
      create: { taskId, clientId, amount, serviceFee, workerPayout, status: "ESCROWED" },
    });

    return NextResponse.json(payment);
  }

  if (action === "release") {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { acceptedBid: true, payment: true },
    });
    if (!task || task.clientId !== clientId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.$transaction([
      prisma.payment.update({ where: { taskId }, data: { status: "RELEASED" } }),
      prisma.task.update({ where: { id: taskId }, data: { status: "COMPLETED" } }),
    ]);

    if (task.acceptedBid) {
      await prisma.notification.create({
        data: {
          userId: task.acceptedBid.workerId,
          type: "PAYMENT_RELEASED",
          title: "Payment Released!",
          message: `Payment of $${task.payment?.workerPayout.toFixed(2)} has been released to you.`,
          data: JSON.stringify({ taskId }),
        },
      });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const payments = await prisma.payment.findMany({
    where: { clientId: userId },
    include: { task: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(payments);
}
