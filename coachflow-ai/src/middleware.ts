import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isAdminPath = url.pathname.startsWith("/admin");

  if (!isAdminPath) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const anonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-coachflow-pathname", url.pathname);

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        for (const c of cookiesToSet) {
          res.cookies.set(c);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const isLogin = url.pathname === "/admin/login";

  if (!data.user && !isLogin) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (data.user && isLogin) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
