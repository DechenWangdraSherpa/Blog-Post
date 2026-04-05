"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useSession } from "../lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

export default function Navbar() {
  const { session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
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
      className="navbar-bar fixed top-0 left-0 w-full z-50"
      style={{ height: 60 }}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-black text-lg tracking-tight t-heading transition-colors">
            Dw4ngSh3rs
            <span className="t-accent">.blog</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/">Home</NavLink>
          {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          {!isLoggedIn ? (
            <>
              <NavLink href="/auth/login">Login</NavLink>
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
            className="navbar-hamburger p-2 rounded-lg"
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
        <div className="navbar-mobile-menu md:hidden absolute top-[60px] left-0 right-0 py-3 px-4 flex flex-col gap-1">
          <MobileLink href="/" onClick={() => setMenuOpen(false)}>Home</MobileLink>
          {isAdmin && <MobileLink href="/admin" onClick={() => setMenuOpen(false)}>Admin</MobileLink>}
          {!isLoggedIn ? (
            <>
              <MobileLink href="/auth/login" onClick={() => setMenuOpen(false)}>Login</MobileLink>
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
              className="navbar-mobile-logout text-left text-sm font-semibold py-2 px-3 rounded-lg"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="navbar-link text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="navbar-mobile-link text-sm font-semibold py-2 px-3 rounded-lg"
    >
      {children}
    </Link>
  );
}
