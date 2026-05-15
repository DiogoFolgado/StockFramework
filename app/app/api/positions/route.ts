import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const createSchema = z.object({
  sectionId:     z.string(),
  ticker:        z.string().min(1).max(20),
  companyName:   z.string().min(1).max(120),
  purchasePrice: z.number().positive().optional(),
  quantity:      z.number().positive().optional(),
  currency:      z.string().default("USD"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { sectionId, ticker, companyName, purchasePrice, quantity, currency } = createSchema.parse(body);

    const section = await prisma.section.findFirst({ where: { id: sectionId, userId: session.user.id } });
    if (!section) return NextResponse.json({ error: "Section not found" }, { status: 404 });

    const position = await prisma.position.create({
      data: { sectionId, ticker: ticker.toUpperCase(), companyName, purchasePrice, quantity, currency },
    });

    return NextResponse.json({ position }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Failed to create position" }, { status: 500 });
  }
}
