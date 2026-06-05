import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, image: true, bio: true, location: true, province: true, district: true,
      role: true, rating: true, reviewCount: true, jobsCompleted: true, successRate: true,
      avgResponseTime: true, verified: true, phoneVerified: true, emailVerified: true,
      isBlocked: true, skills: true, specialties: true, yearsExperience: true, portfolio: true,
      createdAt: true,
      receivedReviews: {
        include: { reviewer: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...user,
    skills: JSON.parse(user.skills),
    specialties: JSON.parse(user.specialties),
    portfolio: JSON.parse(user.portfolio),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if ((session.user as any).id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, bio, location, province, district, phone, image, skills, specialties, yearsExperience, portfolio } = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: {
      name, bio, location, province, district, phone, image,
      skills: skills ? JSON.stringify(skills) : undefined,
      specialties: specialties ? JSON.stringify(specialties) : undefined,
      yearsExperience: yearsExperience ?? undefined,
      portfolio: portfolio ? JSON.stringify(portfolio) : undefined,
    },
    select: {
      id: true, name: true, image: true, bio: true, location: true, province: true, district: true,
      phone: true, skills: true, specialties: true, yearsExperience: true, portfolio: true,
    },
  });

  return NextResponse.json({
    ...user,
    skills: JSON.parse(user.skills),
    specialties: JSON.parse(user.specialties),
    portfolio: JSON.parse(user.portfolio),
  });
}
