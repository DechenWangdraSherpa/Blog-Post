"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: 52, height: 28 }} />;

  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex-shrink-0 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
      style={{
        width: 52,
        height: 28,
        background: isDark
          ? "rgba(124,92,252,0.25)"
          : "rgba(201,106,58,0.12)",
        border: isDark
          ? "1px solid rgba(124,92,252,0.4)"
          : "1px solid rgba(201,106,58,0.3)",
      }}
    >
      {/* Track icons */}
      <span
        className="absolute top-1/2 -translate-y-1/2 text-[10px] select-none pointer-events-none transition-opacity duration-200"
        style={{ left: 7, opacity: isDark ? 0.5 : 0 }}
      >
        ☀
      </span>
      <span
        className="absolute top-1/2 -translate-y-1/2 text-[10px] select-none pointer-events-none transition-opacity duration-200"
        style={{ right: 7, opacity: isDark ? 0.9 : 0 }}
      >
        🌙
      </span>

      {/* Sliding thumb */}
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[11px] transition-all duration-300 shadow-md"
        style={{
          width: 22,
          height: 22,
          left: isDark ? 26 : 3,
          background: isDark ? "#7C5CFC" : "#c96a3a",
          boxShadow: isDark
            ? "0 0 8px rgba(124,92,252,0.6)"
            : "0 0 8px rgba(201,106,58,0.45)",
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
