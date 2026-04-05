"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export default function ThemeProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
