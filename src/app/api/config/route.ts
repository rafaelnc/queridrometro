import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const config = db.getConfig();
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isMaster) {
    return NextResponse.json(
      { error: "Apenas o administrador pode alterar as configurações" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const { title, logo } = body as { title?: unknown; logo?: unknown };

  const updates: { title?: string; logo?: string | null } = {};
  if (title !== undefined) {
    if (typeof title !== "string") {
      return NextResponse.json({ error: "Título deve ser uma string" }, { status: 400 });
    }
    updates.title = title;
  }
  if (logo !== undefined) {
    if (logo !== null && typeof logo !== "string") {
      return NextResponse.json({ error: "Logo deve ser uma string (data URL) ou null" }, { status: 400 });
    }
    updates.logo = (logo as string | null) ?? null;
  }

  const db = await getDb();
  await db.updateConfig(updates);
  const config = db.getConfig();

  return NextResponse.json({ config });
}

