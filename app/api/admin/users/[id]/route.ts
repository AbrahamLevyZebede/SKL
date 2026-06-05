import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  return user?.role === "ADMIN" ? user : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { action } = await req.json();

  if (action === "block") {
    await prisma.user.update({ where: { id }, data: { isBlocked: true } });
  } else if (action === "unblock") {
    await prisma.user.update({ where: { id }, data: { isBlocked: false } });
  } else if (action === "verify") {
    await prisma.user.update({ where: { id }, data: { verified: true } });
  } else if (action === "unverify") {
    await prisma.user.update({ where: { id }, data: { verified: false } });
  } else if (action === "makeAdmin") {
    await prisma.user.update({ where: { id }, data: { role: "ADMIN" } });
  }

  return NextResponse.json({ success: true });
}
