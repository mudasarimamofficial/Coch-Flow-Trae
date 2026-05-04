import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/coachflow-rebuilt-1.html", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};

