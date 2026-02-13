import { cookies } from "next/headers";
import { getDb, persistDb } from "./db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const COOKIE_NAME = "queridometro_session";
const SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production";

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export async function getSession(): Promise<{
  userId: number;
  email: string;
  name: string;
  photo: string | null;
  isMaster: boolean;
} | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const [payload, sig] = cookie.split(".");
    if (!payload || !sig || sign(payload) !== sig) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!decoded.userId || !decoded.exp) return null;
    if (Date.now() > decoded.exp) return null;
    const db = await getDb();
    const user = db.getUserById(decoded.userId);
    if (!user) return null;
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      photo: user.photo,
      isMaster: user.is_master === 1,
    };
  } catch {
    return null;
  }
}

export function createSessionCookie(userId: number): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = Buffer.from(
    JSON.stringify({ userId, exp }),
    "utf8"
  ).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export async function verifyLogin(
  login: string,
  password: string
): Promise<{ id: number; name: string; photo: string | null; is_master: number } | null> {
  const db = await getDb();
  const user = login.includes("@")
    ? db.getUserByEmail(login.trim())
    : db.getUserByName(login.trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return null;
  return {
    id: user.id,
    name: user.name,
    photo: user.photo,
    is_master: user.is_master,
  };
}

export async function updatePassword(userId: number, newPassword: string) {
  const db = await getDb();
  const hash = bcrypt.hashSync(newPassword, 10);
  await db.updateUser(userId, { password_hash: hash });
}

export async function updateProfile(
  userId: number,
  data: { name?: string; photo?: string | null }
) {
  const db = await getDb();
  if (data.name != null) await db.updateUser(userId, { name: data.name });
  if (data.photo !== undefined) await db.updateUser(userId, { photo: data.photo });
}
