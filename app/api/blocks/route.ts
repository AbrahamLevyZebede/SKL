import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const blockerId = (session.user as any).id;
  const { blockedId } = await req.json();
  if (!blockedId || blockedId === blockerId) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    update: {},
    create: { blockerId, blockedId },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const blockerId = (session.user as any).id;
  const { blockedId } = await req.json();

  await prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const blockerId = (session.user as any).id;

  const blocks = await prisma.userBlock.findMany({
    where: { blockerId },
    include: { blocked: { select: { id: true, name: true, image: true } } },
  });
  return NextResponse.json(blocks);
}
