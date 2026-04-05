"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useSession } from "../lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = session?.user?.email === adminEmail;
  const isLoggedIn = !!session?.user;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50"
      style={{
        height: 60,
        background: isDark ? "rgba(10,10,15,0.85)" : "rgba(250,248,245,0.94)",
        backdropFilter: isDark ? "blur(20px)" : "blur(12px)",
        WebkitBackdropFilter: isDark ? "blur(20px)" : "blur(12px)",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="font-black text-lg tracking-tight transition-colors"
            style={{ color: isDark ? "rgba(255,255,255,0.95)" : "#1a1025" }}
          >
            Dw4ngSh3rs
            <span style={{ color: isDark ? "#7C5CFC" : "#c96a3a" }}>.blog</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/" isDark={isDark}>Home</NavLink>
          {isAdmin && <NavLink href="/admin" isDark={isDark}>Admin</NavLink>}
          {!isLoggedIn ? (
            <>
              <NavLink href="/auth/login" isDark={isDark}>Login</NavLink>
              <Link
                href="/auth/signup"
                className="btn-primary ml-2 text-sm"
                style={{ padding: "0.4rem 1.1rem" }}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="btn-ghost text-sm"
              style={{ padding: "0.4rem 1.1rem" }}
            >
              Logout
            </button>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg"
            style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#78716c" }}
            aria-label="Open menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden absolute top-[60px] left-0 right-0 py-3 px-4 flex flex-col gap-1"
          style={{
            background: isDark ? "rgba(12,12,20,0.97)" : "#faf8f5",
            borderBottom: isDark
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(0,0,0,0.07)",
            backdropFilter: isDark ? "blur(20px)" : "none",
          }}
        >
          <MobileLink href="/" onClick={() => setMenuOpen(false)} isDark={isDark}>Home</MobileLink>
          {isAdmin && <MobileLink href="/admin" onClick={() => setMenuOpen(false)} isDark={isDark}>Admin</MobileLink>}
          {!isLoggedIn ? (
            <>
              <MobileLink href="/auth/login" onClick={() => setMenuOpen(false)} isDark={isDark}>Login</MobileLink>
              <Link
                href="/auth/signup"
                className="btn-primary mt-1 text-sm text-center"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="text-left text-sm font-semibold py-2 px-3 rounded-lg"
              style={{ color: isDark ? "#f87171" : "#b45309" }}
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children, isDark }: { href: string; children: React.ReactNode; isDark: boolean }) {
  const baseColor  = isDark ? "rgba(255,255,255,0.65)" : "#44403c";
  const hoverColor = isDark ? "#7C5CFC" : "#c96a3a";
  const hoverBg    = isDark ? "rgba(124,92,252,0.1)" : "rgba(201,106,58,0.08)";
  return (
    <Link
      href={href}
      className="text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
      style={{ color: baseColor }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = hoverColor;
        (e.currentTarget as HTMLElement).style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = baseColor;
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick, isDark }: { href: string; children: React.ReactNode; onClick: () => void; isDark: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-sm font-semibold py-2 px-3 rounded-lg"
      style={{ color: isDark ? "rgba(255,255,255,0.75)" : "#44403c" }}
    >
      {children}
    </Link>
  );
}
