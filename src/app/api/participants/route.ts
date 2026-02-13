import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function gerarSenhaTemporaria(): string {
  return crypto.randomBytes(4).toString("hex");
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const db = await getDb();
  const list = db.getParticipants().map((p) => ({ id: p.id, name: p.name, photo: p.photo }));
  return NextResponse.json({ participants: list });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.isMaster) {
    return NextResponse.json({ error: "Apenas o administrador pode cadastrar participantes" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { name, photo } = body;
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }
    const db = await getDb();
    const row = await db.createParticipant({ name: name.trim(), photo: photo ?? null });
    const senhaTemporaria = gerarSenhaTemporaria();
    await db.createUser({
      email: `p${row.id}@interno.queridometro`,
      password_hash: bcrypt.hashSync(senhaTemporaria, 10),
      name: row.name,
      photo: row.photo,
      is_master: 0,
      participant_id: row.id,
    });
    return NextResponse.json({
      participant: { id: row.id, name: row.name, photo: row.photo },
      login: row.name,
      senha: senhaTemporaria,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao cadastrar participante" },
      { status: 500 }
    );
  }
}
