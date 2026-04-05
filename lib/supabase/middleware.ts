import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

export async function getSession(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        getAll() {
          return req.cookies.getAll().map((c) => ({
            name: c.name,
            value: c.value,
          }));
        },
        set(name: string, value: string, options?: any) {
          // No-op: setting cookies requires a Response object in middleware
        },
        setAll(_cookies: Array<{ name: string; value: string; options?: any }>) {
          // No-op: setting cookies requires a Response object in middleware
        },
        remove(name: string) {
          // No-op: removing cookies requires a Response object in middleware
        },
      },
    }
  )
    .auth.getSession()
    .then(({ data: { session } }) => session);
}