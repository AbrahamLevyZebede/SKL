import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const otherId = searchParams.get("with");

  if (otherId) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    await prisma.message.updateMany({
      where: { senderId: otherId, receiverId: userId, read: false },
      data: { read: true },
    });
    return NextResponse.json(messages.map((m) => ({ ...m, images: JSON.parse(m.images) })));
  }

  // Get conversation list
  const convos = await prisma.$queryRaw`
    SELECT DISTINCT
      CASE WHEN senderId = ${userId} THEN receiverId ELSE senderId END as partnerId
    FROM Message
    WHERE senderId = ${userId} OR receiverId = ${userId}
  ` as { partnerId: string }[];

  const partnerIds = convos.map((c) => c.partnerId);
  const partners = await prisma.user.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, name: true, image: true, role: true },
  });

  const conversations = await Promise.all(
    partners.map(async (p) => {
      const last = await prisma.message.findFirst({
        where: {
          OR: [{ senderId: userId, receiverId: p.id }, { senderId: p.id, receiverId: userId }],
        },
        orderBy: { createdAt: "desc" },
      });
      const unread = await prisma.message.count({
        where: { senderId: p.id, receiverId: userId, read: false },
      });
      return { partner: p, lastMessage: last ? { ...last, images: JSON.parse(last.images) } : null, unread };
    })
  );

  return NextResponse.json(conversations.sort((a, b) =>
    new Date(b.lastMessage?.createdAt ?? 0).getTime() - new Date(a.lastMessage?.createdAt ?? 0).getTime()
  ));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const senderId = (session.user as any).id;
  const { receiverId, content, taskId } = await req.json();
  if (!receiverId || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const message = await prisma.message.create({
    data: { senderId, receiverId, content, taskId, images: "[]" },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "NEW_MESSAGE",
      title: `Message from ${session.user.name}`,
      message: content.length > 60 ? content.slice(0, 60) + "…" : content,
      data: JSON.stringify({ senderId }),
    },
  });

  return NextResponse.json({ ...message, images: [] }, { status: 201 });
}
