# Data Migration: localStorage → PostgreSQL

## Overview

Your existing watchlist data lives in the browser's `localStorage` under the key `sections_v1`.
This guide walks you through exporting it and importing it into the new PostgreSQL database.

---

## Step 1 — Export from the old app

1. Open `StockFramework/backup/stock_framework_v5_25_backup.html` in your browser
2. Open DevTools → Console
3. Run:
   ```js
   copy(localStorage.getItem('sections_v1'))
   ```
4. Paste the clipboard content into a new file: `StockFramework/app/prisma/seed-data.json`

---

## Step 2 — Create a seed script

Create `StockFramework/app/prisma/seed.ts`:

```ts
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import data from "./seed-data.json";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

// Replace with your registered user's email
const USER_EMAIL = "your@email.com";

async function main() {
  const user = await prisma.user.findUnique({ where: { email: USER_EMAIL } });
  if (!user) { console.error("User not found — register first"); process.exit(1); }

  const sections = Array.isArray(data) ? data : [];
  for (const sec of sections) {
    const section = await prisma.section.create({
      data: {
        userId: user.id,
        name:   sec.name  ?? "Untitled",
        icon:   sec.icon  ?? "📊",
        color:  sec.color ?? "#d4a843",
      },
    });

    const positions = sec.positions ?? [];
    for (const pos of positions) {
      if (!pos.ticker) continue;
      await prisma.position.create({
        data: {
          sectionId:     section.id,
          ticker:        pos.ticker.toUpperCase(),
          companyName:   pos.companyName ?? pos.ticker,
          purchasePrice: pos.purchasePrice ?? pos.avgPrice ?? null,
          quantity:      pos.quantity ?? null,
          currency:      pos.currency ?? "USD",
        },
      });
    }
    console.log(`✓ Imported section: ${section.name} (${positions.length} positions)`);
  }
  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

---

## Step 3 — Run the seed

```bash
cd StockFramework/app
npx tsx prisma/seed.ts
```

---

## Step 4 — Verify in the app

Open http://localhost:3000/sections — all your watchlist sections should be there.
