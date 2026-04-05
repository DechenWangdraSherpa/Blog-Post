import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookies) {
          for (const { name, value, options } of cookies) {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (session.user.email !== adminEmail) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
