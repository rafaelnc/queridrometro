import { NextRequest, NextResponse } from "next/server";
import { getSession, updateProfile, updatePassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      photo: session.photo,
      isMaster: session.isMaster,
    },
  });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (body.name != null) {
      updateProfile(session.userId, { name: String(body.name).trim() });
    }
    if (body.photo !== undefined) {
      updateProfile(session.userId, { photo: body.photo });
    }
    if (body.newPassword) {
      if (body.currentPassword === undefined) {
        return NextResponse.json(
          { error: "Senha atual é obrigatória para alterar a senha" },
          { status: 400 }
        );
      }
      const { verifyLogin } = await import("@/lib/auth");
      const ok = await verifyLogin(session.email, body.currentPassword);
      if (!ok) {
        return NextResponse.json(
          { error: "Senha atual incorreta" },
          { status: 400 }
        );
      }
      updatePassword(session.userId, body.newPassword);
    }
    const { getSession } = await import("@/lib/auth");
    const newSession = await getSession();
    return NextResponse.json({
      user: newSession
        ? {
            id: newSession.userId,
            email: newSession.email,
            name: newSession.name,
            photo: newSession.photo,
            isMaster: newSession.isMaster,
          }
        : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}
