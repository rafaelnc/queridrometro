import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

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
    const { emoji, label } = body;
    const db = await getDb();
    await db.updateEmoji(id, {
      ...(emoji !== undefined && { emoji: String(emoji).trim() }),
      ...(label !== undefined && { label: String(label).trim() }),
    });
    const list = db.getEmojis();
    const row = list.find((e) => e.id === id);
    return NextResponse.json({ emoji: row });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao atualizar emoji" },
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
  await db.deleteEmoji(id);
  return NextResponse.json({ ok: true });
}
