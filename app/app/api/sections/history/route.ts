import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const entrySchema = z.object({
  sectionId:    z.string(),
  avgChangePct: z.number(),
  pnlEur:       z.number().default(0),
});

const postSchema = z.object({
  entries: z.array(entrySchema),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { entries } = postSchema.parse(await req.json());
    const userId = session.user.id;
    const date   = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Fetch section names for the given ids (verify ownership)
    const sections = await prisma.section.findMany({
      where: { userId, id: { in: entries.map(e => e.sectionId) } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(sections.map(s => [s.id, s.name]));

    await Promise.all(
      entries
        .filter(e => nameMap.has(e.sectionId))
        .map(e =>
          prisma.sectionSnapshot.upsert({
            where:  { userId_sectionId_date: { userId, sectionId: e.sectionId, date } },
            update: { avgChangePct: e.avgChangePct, pnlEur: e.pnlEur, sectionName: nameMap.get(e.sectionId)! },
            create: {
              userId,
              sectionId:    e.sectionId,
              sectionName:  nameMap.get(e.sectionId)!,
              date,
              avgChangePct: e.avgChangePct,
              pnlEur:       e.pnlEur,
            },
          })
        )
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Failed to save snapshot" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Get all snapshots grouped by section
  const snapshots = await prisma.sectionSnapshot.findMany({
    where:   { userId },
    orderBy: { date: "desc" },
  });

  // Get current sections (for icon + color)
  const sections = await prisma.section.findMany({
    where:  { userId },
    select: { id: true, name: true, icon: true, color: true },
  });
  const sectionMeta = new Map(sections.map(s => [s.id, s]));

  // Group by sectionId
  const grouped = new Map<string, {
    id: string; name: string; icon: string; color: string;
    snapshots: { date: string; avgChangePct: number; pnlEur: number }[];
  }>();

  for (const snap of snapshots) {
    if (!grouped.has(snap.sectionId)) {
      const meta = sectionMeta.get(snap.sectionId);
      grouped.set(snap.sectionId, {
        id:    snap.sectionId,
        name:  meta?.name  ?? snap.sectionName,
        icon:  meta?.icon  ?? "📊",
        color: meta?.color ?? "#d4a843",
        snapshots: [],
      });
    }
    grouped.get(snap.sectionId)!.snapshots.push({
      date:         snap.date,
      avgChangePct: snap.avgChangePct,
      pnlEur:       snap.pnlEur,
    });
  }

  return NextResponse.json({ sections: [...grouped.values()] });
}
