import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(portfolioCtx: string): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  return `You are a specialized stock analytics advisor embedded in StockFramework, a personal investment tracking application.

Your expertise: stock analysis (four-pillar scoring: Fundamental 30%, Technical 35%, Entropy 10%, Semantic 25%), portfolio management, sector analysis, risk assessment.

Response rules — strictly follow:
- Be EXTREMELY concise. 1–4 sentences max unless a list is truly necessary.
- No preamble, no "Great question!", no filler. Answer directly.
- Use bullet points only when listing 3+ distinct items.
- Mention risk in one short clause only.
- Never guarantee returns or promise outcomes.

User's Portfolio:
${portfolioCtx}

Today: ${today}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await req.json() as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  // Build portfolio context from DB
  let portfolioCtx = "No portfolio sections defined yet.";
  try {
    const sections = await prisma.section.findMany({
      where:   { userId: session.user.id },
      include: { positions: true },
      orderBy: { createdAt: "asc" },
    });
    if (sections.length > 0) {
      portfolioCtx = sections.map(sec => {
        const header = `Section: "${sec.name}"`;
        if (sec.positions.length === 0) return header + "\n  (empty)";
        const rows = sec.positions.map(p => {
          let row = `  - ${p.ticker}`;
          if (p.companyName) row += ` (${p.companyName})`;
          if (p.quantity)     row += ` — ${p.quantity} shares`;
          if (p.purchasePrice) row += ` @ ${p.currency} ${p.purchasePrice} avg buy`;
          return row;
        });
        return [header, ...rows].join("\n");
      }).join("\n\n");
    }
  } catch { /* proceed without portfolio context */ }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  try {
    const response = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system:     buildSystemPrompt(portfolioCtx),
      messages:   messages.slice(-20),
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "(no response)";
    return NextResponse.json({ reply: text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
