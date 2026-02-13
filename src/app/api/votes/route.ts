import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { participantId, emoji } = body;
    const pid = parseInt(participantId, 10);
    if (isNaN(pid)) {
      return NextResponse.json(
        { error: "Participante inválido" },
        { status: 400 }
      );
    }
    const dbForValidation = await getDb();
    const emojisList = dbForValidation.getEmojis();
    const validEmoji = emojisList.some((e) => e.emoji === emoji);
    if (!validEmoji) {
      return NextResponse.json(
        { error: "Emoji inválido. Escolha um emoji da lista." },
        { status: 400 }
      );
    }
    const voteDate = today();
    const db = await getDb();
    try {
      await db.addVote({
        userId: session.userId,
        participantId: pid,
        emoji,
        voteDate,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("UNIQUE")) {
        return NextResponse.json(
          { error: "Você já votou neste participante hoje. Amanhã você pode votar novamente." },
          { status: 400 }
        );
      }
      throw err;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao registrar voto" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const voteDate = today();
  const db = await getDb();
  const rows = db.getVotesByUserAndDate(session.userId, voteDate);
  const map: Record<number, string> = {};
  for (const r of rows) {
    map[r.participant_id] = r.emoji;
  }
  return NextResponse.json({ votes: map });
}
