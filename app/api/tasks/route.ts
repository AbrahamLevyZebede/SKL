import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status") ?? "OPEN";
  const search = searchParams.get("search") ?? "";
  const province = searchParams.get("province");
  const urgent = searchParams.get("urgent") === "true";
  const sort = searchParams.get("sort") ?? "newest";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where: any = { isDraft: false };
  if (status !== "ALL") where.status = status;
  if (category) where.category = category;
  if (province) where.province = province;
  if (urgent) where.urgent = true;
  if (search) where.OR = [
    { title: { contains: search } },
    { description: { contains: search } },
    { location: { contains: search } },
  ];

  const orderBy: any =
    sort === "budget_desc" ? { budget: "desc" } :
    sort === "budget_asc" ? { budget: "asc" } :
    sort === "deadline" ? { deadline: "asc" } :
    { createdAt: "desc" };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, image: true, rating: true, reviewCount: true, verified: true } },
        _count: { select: { bids: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({
    tasks: tasks.map((t: any) => ({ ...t, photos: JSON.parse(t.photos ?? "[]") })),
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, category, location, province, district, budget, deadline, photos, urgent, isDraft } = await req.json();

  if (!isDraft && (!title || !description || !category)) {
    return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: title || "Borrador",
      description: description || "",
      category: category || "OTHER",
      location: location || "Panamá",
      province,
      district,
      budget: parseFloat(budget) || 0,
      deadline: deadline ? new Date(deadline) : null,
      photos: JSON.stringify(photos ?? []),
      urgent: !!urgent,
      isDraft: !!isDraft,
      clientId: (session.user as any).id,
    },
    include: { client: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json({ ...task, photos: JSON.parse(task.photos ?? "[]") }, { status: 201 });
}
