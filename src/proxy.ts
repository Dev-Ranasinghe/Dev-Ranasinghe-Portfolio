import { NextResponse, type NextRequest } from "next/server";

// Every visitor's first trip starts in 1996, whichever year's link they opened.
// After that first response sets the cookie, links go where they point.

const VISITED = "tm-visited";
const START = "/1996";

export function proxy(request: NextRequest) {
  if (request.cookies.has(VISITED)) return NextResponse.next();

  const res =
    request.nextUrl.pathname === START
      ? NextResponse.next()
      : NextResponse.redirect(new URL(START, request.url), 307);
  res.cookies.set(VISITED, "1", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}

export const config = {
  // the year pages only: never static files, images or the sound/asset folders
  matcher: ["/1986", "/1996", "/2006", "/2016", "/2036", "/2046"],
};
