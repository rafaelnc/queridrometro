import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const dbPath =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), "data", "db.json");

export type User = {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  photo: string | null;
  is_master: number;
  created_at: string;
  participant_id?: number | null;
};

export type Participant = {
  id: number;
  name: string;
  photo: string | null;
  created_at: string;
};

export type Vote = {
  id: number;
  user_id: number;
  participant_id: number;
  emoji: string;
  vote_date: string;
  created_at: string;
};

export type Emoji = {
  id: number;
  emoji: string;
  label: string;
};

export type Config = {
  title: string;
  logo: string | null;
};

type Data = {
  users: User[];
  participants: Participant[];
  votes: Vote[];
  emojis: Emoji[];
  config: Config;
};

const EMOJIS_PADRAO: { emoji: string; label: string }[] = [
  { emoji: "😊", label: "Feliz" },
  { emoji: "🐍", label: "Cobra" },
  { emoji: "😠", label: "Bravo" },
  { emoji: "🤢", label: "Nojo" },
  { emoji: "❤️", label: "Amor" },
  { emoji: "💣", label: "Bomba" },
  { emoji: "🍌", label: "Banana" },
  { emoji: "💔", label: "Coração partido" },
  { emoji: "🍆", label: "Beringela" },
  { emoji: "🍑", label: "Pêssego" },
];

let data: Data | null = null;
let writeLock: Promise<unknown> = Promise.resolve();

function ensureDir() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function load(): Data {
  ensureDir();
  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    data = JSON.parse(raw) as Data;
  } catch {
    data = {
      users: [],
      participants: [],
      votes: [],
      emojis: [],
      config: { title: "Queridômetro", logo: null },
    };
  }
  const d = data;
  if (!d.emojis) d.emojis = [];
  if (d.emojis.length === 0) {
    d.emojis = EMOJIS_PADRAO.map((e, i) => ({ id: i + 1, emoji: e.emoji, label: e.label }));
    save();
  }
  if (!(d as any).config) {
    (d as any).config = { title: "Queridômetro", logo: null };
    save();
  }
  const hasMaster = d.users.some((u) => u.is_master === 1);
  if (!hasMaster) {
    const hash = bcrypt.hashSync("admin123", 10);
    const id = nextId(d.users);
    d.users.push({
      id,
      email: "admin@queridometro.com",
      password_hash: hash,
      name: "Administrador",
      photo: null,
      is_master: 1,
      created_at: now(),
    });
    save();
  }
  return data!;
}

function getData(): Data {
  if (data) return data;
  return load();
}

function save() {
  ensureDir();
  fs.writeFileSync(dbPath, JSON.stringify(getData(), null, 2), "utf8");
}

function nextId(arr: { id: number }[]): number {
  if (arr.length === 0) return 1;
  return Math.max(...arr.map((x) => x.id)) + 1;
}

function now(): string {
  return new Date().toISOString();
}

async function withLock<T>(fn: () => T): Promise<T> {
  const prev = writeLock;
  let resolve: (value: T) => void;
  const resultPromise = new Promise<T>((r) => { resolve = r; });
  writeLock = prev.then(() => {
    load();
    const result = fn();
    resolve(result);
    return result;
  });
  return resultPromise;
}

export async function getDb() {
  return {
    getUserById(id: number): User | undefined {
      return getData().users.find((u) => u.id === id);
    },
    getUserByEmail(email: string): User | undefined {
      return getData().users.find((u) => u.email === email);
    },
    getUserByName(name: string): User | undefined {
      const n = name.trim().toLowerCase();
      return getData().users.find((u) => u.name.trim().toLowerCase() === n);
    },
    async createUser(params: {
      email: string;
      password_hash: string;
      name: string;
      photo?: string | null;
      is_master: number;
      participant_id?: number | null;
    }): Promise<User> {
      return withLock(() => {
        const d = getData();
        const id = nextId(d.users);
        const user: User = {
          id,
          email: params.email,
          password_hash: params.password_hash,
          name: params.name,
          photo: params.photo ?? null,
          is_master: params.is_master,
          created_at: now(),
          participant_id: params.participant_id ?? null,
        };
        d.users.push(user);
        save();
        return user;
      });
    },
    async updateUser(
      id: number,
      updates: { name?: string; photo?: string | null; password_hash?: string }
    ): Promise<void> {
      return withLock(() => {
        const user = getData().users.find((u) => u.id === id);
        if (!user) return;
        if (updates.name != null) user.name = updates.name;
        if (updates.photo !== undefined) user.photo = updates.photo;
        if (updates.password_hash != null) user.password_hash = updates.password_hash;
        save();
      });
    },
    getParticipants(): Participant[] {
      const list = [...getData().participants];
      list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
      return list;
    },
    getParticipant(id: number): Participant | undefined {
      return getData().participants.find((p) => p.id === id);
    },
    async createParticipant(params: { name: string; photo?: string | null }): Promise<Participant> {
      return withLock(() => {
        const d = getData();
        const id = nextId(d.participants);
        const p: Participant = {
          id,
          name: params.name.trim(),
          photo: params.photo ?? null,
          created_at: now(),
        };
        d.participants.push(p);
        save();
        return p;
      });
    },
    async updateParticipant(
      id: number,
      updates: { name?: string; photo?: string | null }
    ): Promise<void> {
      return withLock(() => {
        const p = getData().participants.find((x) => x.id === id);
        if (!p) return;
        if (updates.name != null) p.name = updates.name.trim();
        if (updates.photo !== undefined) p.photo = updates.photo;
        save();
      });
    },
    async deleteParticipant(id: number): Promise<void> {
      return withLock(() => {
        const d = getData();
        d.participants = d.participants.filter((p) => p.id !== id);
        d.votes = d.votes.filter((v) => v.participant_id !== id);
        d.users = d.users.filter((u) => u.participant_id !== id);
        save();
      });
    },
    getVotesByUserAndDate(userId: number, voteDate: string): { participant_id: number; emoji: string }[] {
      return getData().votes
        .filter((v) => v.user_id === userId && v.vote_date === voteDate)
        .map((v) => ({ participant_id: v.participant_id, emoji: v.emoji }));
    },
    async addVote(params: {
      userId: number;
      participantId: number;
      emoji: string;
      voteDate: string;
    }): Promise<void> {
      return withLock(() => {
        const d = getData();
        const exists = d.votes.some(
          (v) =>
            v.user_id === params.userId &&
            v.participant_id === params.participantId &&
            v.vote_date === params.voteDate
        );
        if (exists) throw new Error("UNIQUE");
        const id = nextId(d.votes);
        d.votes.push({
          id,
          user_id: params.userId,
          participant_id: params.participantId,
          emoji: params.emoji,
          vote_date: params.voteDate,
          created_at: now(),
        });
        save();
      });
    },
    getVoteCountsByDate(voteDate: string): { participant_id: number; emoji: string; count: number }[] {
      const d = getData();
      const map = new Map<string, number>();
      for (const v of d.votes) {
        if (v.vote_date !== voteDate) continue;
        const key = `${v.participant_id}\u0001${v.emoji}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
      return Array.from(map.entries()).map(([key, count]) => {
        const [pid, emoji] = key.split("\u0001");
        return { participant_id: parseInt(pid, 10), emoji, count };
      });
    },
    getConfig(): Config {
      const d = getData();
      if (!(d as any).config) {
        (d as any).config = { title: "Queridômetro", logo: null };
        save();
      }
      return d.config;
    },
    async updateConfig(updates: { title?: string; logo?: string | null }): Promise<void> {
      return withLock(() => {
        const d = getData();
        if (!(d as any).config) {
          (d as any).config = { title: "Queridômetro", logo: null };
        }
        const cfg = d.config;
        if (updates.title !== undefined) {
          cfg.title = String(updates.title || "").trim() || "Queridômetro";
        }
        if (updates.logo !== undefined) {
          cfg.logo = updates.logo ?? null;
        }
        save();
      });
    },
    getEmojis(): Emoji[] {
      return [...getData().emojis].sort((a, b) => a.id - b.id);
    },
    async addEmoji(params: { emoji: string; label: string }): Promise<Emoji> {
      return withLock(() => {
        const d = getData();
        const id = nextId(d.emojis);
        const em: Emoji = { id, emoji: params.emoji.trim(), label: (params.label || "").trim() || params.emoji };
        d.emojis.push(em);
        save();
        return em;
      });
    },
    async updateEmoji(id: number, updates: { emoji?: string; label?: string }): Promise<void> {
      return withLock(() => {
        const em = getData().emojis.find((e) => e.id === id);
        if (!em) return;
        if (updates.emoji !== undefined) em.emoji = updates.emoji.trim();
        if (updates.label !== undefined) em.label = updates.label.trim();
        save();
      });
    },
    async deleteEmoji(id: number): Promise<void> {
      return withLock(() => {
        const d = getData();
        d.emojis = d.emojis.filter((e) => e.id !== id);
        save();
      });
    },
  };
}

export type Db = Awaited<ReturnType<typeof getDb>>;

export function persistDb() {
  if (data) save();
}
