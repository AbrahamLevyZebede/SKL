import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reviewerId = (session.user as any).id;
  const { taskId, revieweeId, rating, comment } = await req.json();

  if (!taskId || !revieweeId || !rating || !comment) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.review.findFirst({ where: { taskId, reviewerId } });
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const review = await prisma.review.create({
    data: { taskId, reviewerId, revieweeId, rating: parseInt(rating), comment },
  });

  // Update reviewee's rating
  const reviews = await prisma.review.findMany({ where: { revieweeId }, select: { rating: true } });
  const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
  await prisma.user.update({
    where: { id: revieweeId },
    data: { rating: avg, reviewCount: reviews.length, jobsCompleted: { increment: 1 } },
  });

  await prisma.notification.create({
    data: {
      userId: revieweeId,
      type: "NEW_REVIEW",
      title: "New Review",
      message: `${session.user.name} left you a ${rating}-star review`,
      data: JSON.stringify({ taskId }),
    },
  });

  return NextResponse.json(review, { status: 201 });
}
