import { NextRequest, NextResponse } from "next/server";
import { verifyLogin, createSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const login = body.login ?? body.email;
    const { password } = body;
    if (!login || !password) {
      return NextResponse.json(
        { error: "Login (email ou nome) e senha são obrigatórios" },
        { status: 400 }
      );
    }
    const user = await verifyLogin(login.trim(), password);
    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      );
    }
    const cookie = createSessionCookie(user.id);
    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        photo: user.photo,
        isMaster: user.is_master === 1,
      },
    });
    res.cookies.set("queridometro_session", cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao fazer login" },
      { status: 500 }
    );
  }
}
