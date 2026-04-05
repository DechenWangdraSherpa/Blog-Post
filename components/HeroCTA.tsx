"use client";
import Link from "next/link";
import { useSession } from "../lib/supabase/client";
import { useTheme } from "next-themes";

export default function HeroCTA() {
  const { session } = useSession();
  const { theme } = useTheme();
  const isLoggedIn = !!session?.user;
  const isDark = theme !== "light";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!isLoggedIn && (
        <>
          <Link href="/auth/signup" className="btn-primary">
            Join the community
          </Link>
          <Link href="/auth/login" className="btn-ghost">
            Already a member? Login
          </Link>
        </>
      )}
      {isLoggedIn && (
        <span className="text-sm font-semibold" style={{ color: isDark ? "#7C5CFC" : "#c96a3a" }}>
          Welcome back 👋
        </span>
      )}
    </div>
  );
}
