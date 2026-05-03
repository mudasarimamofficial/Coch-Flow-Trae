import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== "/") return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/coachflow-rebuilt-1.html";
  const res = NextResponse.rewrite(url);
  res.headers.set("x-cf-mw", "1");
  return res;
}

export const config = {
  matcher: ["/"],
};

