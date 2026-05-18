import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NavBar } from "@/components/navigation/NavBar";
import { AiAdvisor } from "@/components/chat/AiAdvisor";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Analysis Framework",
  description: "Research-grade four-pillar stock analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ color: "var(--text)" }}>
        <SessionProvider>
          <NavBar />
          <main style={{ flex: 1, maxWidth: 1280, margin: "0 auto", width: "100%", padding: "24px 20px" }}>
            {children}
          </main>
          <AiAdvisor />
        </SessionProvider>
      </body>
    </html>
  );
}
