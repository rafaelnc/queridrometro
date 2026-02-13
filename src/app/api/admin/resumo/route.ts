import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseDate(s: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function buildDateRange(from: string, to: string): string[] {
  const start = new Date(from);
  const end = new Date(to);
  if (start.getTime() > end.getTime()) return [];
  const cur = new Date(start);
  const result: string[] = [];
  while (cur.getTime() <= end.getTime()) {
    result.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.isMaster) {
    return NextResponse.json({ error: "Apenas o administrador pode acessar" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const today = new Date().toISOString().slice(0, 10);
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  const from = fromParam ? parseDate(fromParam) : defaultFrom.toISOString().slice(0, 10);
  const to = toParam ? parseDate(toParam) : today;

  if (!from || !to) {
    return NextResponse.json(
      { error: "Parâmetros from e to devem ser datas no formato YYYY-MM-DD" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const participants = db.getParticipants();
  const emojisList = db.getEmojis();

  const days: { date: string; participants: { id: number; name: string; photo: string | null; emojis: { emoji: string; count: number }[] }[] }[] = [];

  for (const voteDate of buildDateRange(from, to)) {
    const votes = db.getVoteCountsByDate(voteDate);
    const byParticipant: Record<
      number,
      { name: string; photo: string | null; emojis: { emoji: string; count: number }[] }
    > = {};
    for (const p of participants) {
      byParticipant[p.id] = {
        name: p.name,
        photo: p.photo,
        emojis: emojisList.map((e) => ({ emoji: e.emoji, count: 0 })),
      };
    }
    for (const v of votes) {
      const rec = byParticipant[v.participant_id];
      if (rec) {
        const item = rec.emojis.find((x) => x.emoji === v.emoji);
        if (item) item.count = v.count;
      }
    }
    days.push({
      date: voteDate,
      participants: participants.map((p) => ({
        id: p.id,
        name: p.name,
        photo: p.photo,
        emojis: byParticipant[p.id]?.emojis ?? emojisList.map((e) => ({ emoji: e.emoji, count: 0 })),
      })),
    });
  }

  return NextResponse.json({ days });
}
