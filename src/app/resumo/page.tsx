"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import KabaretLogo from "@/components/KabaretLogo";
type ParticipantSummary = {
  id: number;
  name: string;
  photo: string | null;
  emojis: { emoji: string; count: number }[];
};
type AppConfig = { title: string; logo: string | null };

// Cores de fundo em contraste com o emoji (neutras/escuras para o emoji destacar)
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

export default function ResumoPage() {
  const [participants, setParticipants] = useState<ParticipantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([fetch("/api/resumo"), fetch("/api/config")])
      .then(async ([rResumo, rConfig]) => {
        const dataResumo = await rResumo.json();
        const dataConfig = await rConfig.json();
        if (dataResumo.participants?.length) {
          setParticipants(dataResumo.participants);
        }
        if (dataConfig.config) setConfig(dataConfig.config);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Carregando...</p>
      </div>
    );
  }

  const list = participants.length ? participants : [];
  const duplicated = [...list, ...list];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="kabaret-band flex-shrink-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {config?.logo && (
              <div className="w-10 h-10 rounded-full bg-[#fdf0e0] overflow-hidden flex items-center justify-center">
                <img src={config.logo} alt={config.title} className="w-full h-full object-contain" />
              </div>
            )}
            <KabaretLogo size="md" />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline font-display font-bold text-sm text-[#fdf0e0] uppercase tracking-wider">
              {(config?.title || "Queridômetro") + " do dia"}
            </span>
            <Link href="/votar" className="kabaret-nav-link">
              ← Voltar
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden" ref={scrollRef}>
        {list.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">Nenhum participante ou voto hoje.</p>
          </div>
        ) : (
          <div className="h-full overflow-hidden py-4">
            <div className="animate-scroll-slow flex flex-col gap-4 px-4">
              {duplicated.map((p, idx) => (
                <div
                  key={`${p.id}-${idx}`}
                  className="flex-shrink-0 flex items-center gap-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 p-4 shadow-lg"
                >
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-full border-2 border-sky-400/50 bg-slate-700 overflow-hidden flex items-center justify-center text-2xl text-slate-500">
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
                    <span className="rounded-lg bg-sky-500/20 text-sky-300 px-3 py-1 text-sm font-medium uppercase tracking-wide">
                      {p.name}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0">
                    {p.emojis.map(({ emoji, count }) => (
                      <div
                        key={emoji}
                        className={`flex flex-col items-center rounded-full p-2 min-w-[3.5rem] ${EMOJI_BG[emoji] ?? "bg-slate-600/90"}`}
                      >
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-white text-sm font-bold mt-0.5 bg-amber-900/40 rounded px-1.5">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
