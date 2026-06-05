import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, image: true, rating: true, reviewCount: true, jobsCompleted: true, verified: true, location: true } },
      bids: {
        include: {
          worker: { select: { id: true, name: true, image: true, rating: true, reviewCount: true, jobsCompleted: true, verified: true, successRate: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      acceptedBid: { include: { worker: { select: { id: true, name: true, image: true } } } },
      reviews: { include: { reviewer: { select: { id: true, name: true, image: true } } } },
      payment: true,
    },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  // Increment view count
  await prisma.task.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  return NextResponse.json({ ...task, photos: JSON.parse(task.photos ?? "[]") });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (task.clientId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updateData: any = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.location !== undefined) updateData.location = body.location;
  if (body.province !== undefined) updateData.province = body.province;
  if (body.district !== undefined) updateData.district = body.district;
  if (body.budget !== undefined) updateData.budget = parseFloat(body.budget);
  if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null;
  if (body.photos !== undefined) updateData.photos = JSON.stringify(body.photos);
  if (body.urgent !== undefined) updateData.urgent = body.urgent;
  if (body.isDraft !== undefined) updateData.isDraft = body.isDraft;

  const updated = await prisma.task.update({ where: { id }, data: updateData });
  return NextResponse.json({ ...updated, photos: JSON.parse(updated.photos ?? "[]") });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (task.clientId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.task.update({ where: { id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ success: true });
}
