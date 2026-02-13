import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const participants = db.getParticipants();
  const emojisList = db.getEmojis();
  const voteDate = new Date().toISOString().slice(0, 10);
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

  const list = participants.map((p) => ({
    id: p.id,
    name: p.name,
    photo: p.photo,
    emojis: byParticipant[p.id]?.emojis ?? emojisList.map((e) => ({ emoji: e.emoji, count: 0 })),
  }));

  return NextResponse.json({ participants: list });
}
