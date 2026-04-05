import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../lib/supabase/middleware";

export async function middleware(req: NextRequest) {
  const session = await getSession(req);
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (session.user.email !== adminEmail) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  return NextResponse.next();
}
