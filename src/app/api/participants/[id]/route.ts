import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const db = await getDb();
  const row = db.getParticipant(id);
  if (!row) {
    return NextResponse.json({ error: "Participante não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ participant: { id: row.id, name: row.name, photo: row.photo } });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.isMaster) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const { name, photo } = body;
    const db = await getDb();
    await db.updateParticipant(id, { name: name?.trim(), photo });
    const row = db.getParticipant(id);
    if (!row) return NextResponse.json({ error: "Participante não encontrado" }, { status: 404 });
    return NextResponse.json({ participant: { id: row.id, name: row.name, photo: row.photo } });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao atualizar participante" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.isMaster) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const db = await getDb();
  await db.deleteParticipant(id);
  return NextResponse.json({ ok: true });
}
