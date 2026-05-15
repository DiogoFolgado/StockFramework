"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); return; }
      router.push("/login?registered=1");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 20,
    }}>
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)",
        padding: "36px 40px", width: "100%", maxWidth: 400,
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
            Stock Analysis Framework
          </div>
          <div style={{ color: "var(--text3)", fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>
            CREATE ACCOUNT
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ color: "var(--text3)", fontSize: 11, fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>EMAIL</div>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{
                width: "100%", background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 8,
                color: "var(--text)", padding: "10px 14px", fontSize: 14, outline: "none",
              }}
            />
          </div>
          <div>
            <div style={{ color: "var(--text3)", fontSize: 11, fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>
              PASSWORD <span style={{ color: "var(--text3)", fontWeight: 400 }}>(min 6 chars)</span>
            </div>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              style={{
                width: "100%", background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 8,
                color: "var(--text)", padding: "10px 14px", fontSize: 14, outline: "none",
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(232,93,93,.12)", border: "1px solid var(--red)", borderRadius: 7,
              padding: "10px 14px", color: "var(--red)", fontSize: 13,
            }}>⚠ {error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            background: "var(--gold)", color: "#000", border: "none", borderRadius: 8,
            padding: "12px", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
            marginTop: 4, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, color: "var(--text3)", fontSize: 13 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--gold)", textDecoration: "none" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
