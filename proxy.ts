import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_HEADER, localizedPath } from "@/lib/locales";

const PUBLIC_FILE_PATTERN = /\.[^/]+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || PUBLIC_FILE_PATTERN.test(pathname)) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/")[1];

  if (isLocale(firstSegment)) {
    const headers = new Headers(request.headers);

    headers.set(LOCALE_HEADER, firstSegment);

    return NextResponse.next({
      request: { headers }
    });
  }

  if (
    pathname === "/" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/docs" ||
    pathname.startsWith("/docs/")
  ) {
    const url = request.nextUrl.clone();

    url.pathname = localizedPath(DEFAULT_LOCALE, pathname === "/" ? "/admin/projects" : pathname);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)"
};
