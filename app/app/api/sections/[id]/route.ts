import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name:  z.string().min(1).max(60).optional(),
  icon:  z.string().optional(),
  color: z.string().optional(),
});

async function ownsSection(userId: string, sectionId: string) {
  const section = await prisma.section.findFirst({ where: { id: sectionId, userId } });
  return !!section;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await ownsSection(session.user.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const section = await prisma.section.update({
      where:   { id },
      data,
      include: { positions: true },
    });
    return NextResponse.json({ section });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await ownsSection(session.user.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.section.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
