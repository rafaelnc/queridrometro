"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ParticipantSummary = {
  id: number;
  name: string;
  photo: string | null;
  emojis: { emoji: string; count: number }[];
};

type DaySummary = {
  date: string;
  participants: ParticipantSummary[];
};

type AppConfig = { title: string; logo: string | null };

const EMOJI_BG: Record<string, string> = {
  "😊": "bg-slate-700",
  "🐍": "bg-slate-600",
  "😠": "bg-slate-700",
  "🤢": "bg-slate-600",
  "❤️": "bg-slate-700",
  "💣": "bg-slate-600",
  "🍌": "bg-slate-700",
  "💔": "bg-slate-600",
  "🍆": "bg-slate-700",
  "🍑": "bg-slate-600",
};

function formatDateBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function AdminResumoPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ isMaster: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<DaySummary[]>([]);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [fetching, setFetching] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/auth/session"), fetch("/api/config")])
      .then(async ([rSession, rConfig]) => {
        const dataSession = await rSession.json();
        const dataConfig = await rConfig.json();
        if (dataSession.user) setUser(dataSession.user);
        else setUser(null);
        if (dataConfig.config) setConfig(dataConfig.config);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!from || !to || !user?.isMaster) return;
    setFetching(true);
    fetch(`/api/admin/resumo?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error && data.error !== "Apenas o administrador pode acessar") {
          setDays([]);
          return;
        }
        if (data.days) setDays(data.days);
        else setDays([]);
      })
      .catch(() => setDays([]))
      .finally(() => setFetching(false));
  }, [from, to, user?.isMaster]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Carregando...</p>
      </div>
    );
  }

  if (!user?.isMaster) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/90 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <Link
            href="/admin"
            className="text-slate-400 hover:text-white text-sm font-medium"
          >
            ← Admin
          </Link>
          <div className="flex items-center gap-3">
            {config?.logo && (
              <div className="w-8 h-8 rounded-xl bg-slate-900/60 border border-slate-700 overflow-hidden flex items-center justify-center">
                <img src={config.logo} alt={config.title} className="w-full h-full object-contain" />
              </div>
            )}
            <h1 className="text-lg font-semibold text-amber-400">
              {(config?.title || "Queridômetro") + " – resumo por período"}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 mb-6">
          <p className="text-slate-300 text-sm font-medium mb-3">Filtrar por data (início e fim)</p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Data início</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Data fim</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            {fetching && (
              <span className="text-slate-400 text-sm">Carregando...</span>
            )}
          </div>
        </div>

        {days.length === 0 && !fetching && (
          <p className="text-slate-400 text-center py-8">
            Nenhum dia no período ou altere as datas.
          </p>
        )}

        <div className="space-y-8">
          {days.map((day) => {
            const hasVotes = day.participants.some((p) =>
              p.emojis.some((e) => e.count > 0)
            );
            return (
              <section key={day.date} className="rounded-2xl bg-slate-800/80 border border-slate-700/50 overflow-hidden">
                <div className="bg-slate-700/50 px-4 py-2 border-b border-slate-700">
                  <h2 className="text-lg font-semibold text-white">
                    {formatDateBr(day.date)}
                    {!hasVotes && (
                      <span className="ml-2 text-slate-400 font-normal text-sm">
                        (sem votos)
                      </span>
                    )}
                  </h2>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {day.participants.map((p) => (
                    <div
                      key={`${day.date}-${p.id}`}
                      className="flex items-center gap-4 rounded-xl bg-slate-800 border border-slate-700 p-3"
                    >
                      <div className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-sky-400/50 bg-slate-700 overflow-hidden flex items-center justify-center text-xl text-slate-500">
                        {p.photo ? (
                          <img
                            src={p.photo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "?"
                        )}
                      </div>
                      <span className="flex-shrink-0 w-28 text-sky-300 font-medium text-sm uppercase">
                        {p.name}
                      </span>
                      <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0">
                        {p.emojis.map(({ emoji, count }) => (
                          <div
                            key={emoji}
                            className={`flex flex-col items-center rounded-full p-1.5 min-w-[2.5rem] ${EMOJI_BG[emoji] ?? "bg-slate-600/90"}`}
                          >
                            <span className="text-xl">{emoji}</span>
                            <span className="text-white text-xs font-bold mt-0.5 bg-amber-900/40 rounded px-1">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
