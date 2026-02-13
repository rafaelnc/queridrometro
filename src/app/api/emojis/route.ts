import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const emojis = db.getEmojis();
  return NextResponse.json({ emojis });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.isMaster) {
    return NextResponse.json({ error: "Apenas o administrador pode cadastrar emojis" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { emoji, label } = body;
    if (!emoji || typeof emoji !== "string" || !emoji.trim()) {
      return NextResponse.json(
        { error: "Informe o emoji (use o teclado do celular para escolher)" },
        { status: 400 }
      );
    }
    const db = await getDb();
    const row = await db.addEmoji({ emoji: emoji.trim(), label: (label || "").trim() || emoji.trim() });
    return NextResponse.json({ emoji: row });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao cadastrar emoji" },
      { status: 500 }
    );
  }
}
