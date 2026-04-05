"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase/client";
import Link from "next/link";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess("Account created! Check your email to confirm, then log in.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 relative">
      <div className="orb orb-purple" style={{ width: 380, height: 380, top: "-5%", right: "-5%", opacity: 0.45 }} />
      <div className="orb orb-orange" style={{ width: 260, height: 260, bottom: "5%", left: "-5%", opacity: 0.3 }} />

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
          <h1 className="text-2xl font-black mb-1" style={{ color: "rgba(255,255,255,0.95)" }}>Create account</h1>
          <p className="text-sm" style={{ color: "#8A8A9A" }}>Join the community. It&apos;s free.</p>
        </div>

        {success ? (
          <div
            className="rounded-xl px-4 py-4 text-sm"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}
          >
            {success}{" "}
            <Link href="/auth/login" className="font-semibold underline">Go to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Field id="username" label="Username">
              <input id="username" type="text" className="input-dark" placeholder="dw4ngsh3rs" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
            </Field>
            <Field id="email" label="Email">
              <input id="email" type="email" className="input-dark" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </Field>
            <Field id="password" label="Password">
              <input id="password" type="password" className="input-dark" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            </Field>

            {error && (
              <div className="text-sm rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center mt-1" disabled={loading}>
              {loading ? "Creating…" : "Create Account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-center" style={{ color: "#8A8A9A" }}>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "#7C5CFC" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8A8A9A" }} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}
