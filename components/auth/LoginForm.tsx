"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase/client";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      globalThis.location.href = "/";
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 relative">
      {/* orbs */}
      <div className="orb orb-purple" style={{ width: 400, height: 400, top: "-10%", left: "-10%", opacity: 0.5 }} />
      <div className="orb orb-cyan"   style={{ width: 260, height: 260, bottom: "5%", right: "-5%", opacity: 0.35 }} />

      <div
        className="relative z-10 w-full max-w-[420px] p-8 rounded-3xl"
        style={{
          background: "rgba(18,18,26,0.85)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 48px rgba(124,92,252,0.12), 0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <div className="mb-7">
          <Link href="/" className="inline-block mb-5">
            <span className="font-black text-lg" style={{ color: "rgba(255,255,255,0.9)" }}>
              Dw4ngSh3rs<span style={{ color: "#7C5CFC" }}>.blog</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black mb-1" style={{ color: "rgba(255,255,255,0.95)" }}>Welcome back</h1>
          <p className="text-sm" style={{ color: "#8A8A9A" }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A8A9A" }} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-dark"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A8A9A" }} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-dark"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div
              className="text-sm rounded-xl px-4 py-3"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center mt-1" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center" style={{ color: "#8A8A9A" }}>
          No account?{" "}
          <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: "#7C5CFC" }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
