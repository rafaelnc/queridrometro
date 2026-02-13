import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/resumo"];
const authPaths = ["/votar", "/perfil", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get("queridometro_session")?.value;

  if (pathname === "/" || pathname === "/login") {
    if (cookie) {
      return NextResponse.redirect(new URL("/votar", request.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (authPaths.some((p) => pathname.startsWith(p)) && !cookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/votar", "/votar/", "/perfil", "/perfil/", "/admin", "/admin/", "/resumo", "/resumo/"],
};
