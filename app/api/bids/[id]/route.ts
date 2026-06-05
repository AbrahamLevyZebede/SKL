import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { action } = await req.json(); // "accept" | "reject"

  const bid = await prisma.bid.findUnique({ where: { id }, include: { task: true, worker: true } });
  if (!bid) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (bid.task.clientId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (action === "accept") {
    await prisma.$transaction([
      prisma.bid.update({ where: { id }, data: { status: "ACCEPTED" } }),
      prisma.task.update({ where: { id: bid.taskId }, data: { status: "IN_PROGRESS", acceptedBidId: id } }),
      prisma.bid.updateMany({ where: { taskId: bid.taskId, id: { not: id } }, data: { status: "REJECTED" } }),
    ]);

    await prisma.notification.create({
      data: {
        userId: bid.workerId,
        type: "BID_ACCEPTED",
        title: "Bid Accepted!",
        message: `Your bid of $${bid.amount} was accepted for "${bid.task.title}"`,
        data: JSON.stringify({ taskId: bid.taskId, bidId: id }),
      },
    });
  } else if (action === "reject") {
    await prisma.bid.update({ where: { id }, data: { status: "REJECTED" } });
  }

  return NextResponse.json({ success: true });
}
