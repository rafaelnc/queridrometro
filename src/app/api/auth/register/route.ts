import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/auth";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, senha e nome são obrigatórios" },
        { status: 400 }
      );
    }
    const db = await getDb();
    const existing = db.getUserByEmail(email.trim());
    if (existing) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      );
    }
    const hash = bcrypt.hashSync(password, 10);
    const user = await db.createUser({
      email: email.trim(),
      password_hash: hash,
      name: name.trim(),
      is_master: 0,
    });
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
      { error: "Erro ao cadastrar" },
      { status: 500 }
    );
  }
}
