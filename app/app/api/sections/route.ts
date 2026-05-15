import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const createSchema = z.object({
  name:  z.string().min(1).max(60),
  icon:  z.string().default("📊"),
  color: z.string().default("#d4a843"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sections = await prisma.section.findMany({
    where:   { userId: session.user.id },
    include: { positions: { orderBy: { addedAt: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ sections });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, icon, color } = createSchema.parse(body);

    const section = await prisma.section.create({
      data: { name, icon, color, userId: session.user.id },
      include: { positions: true },
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
