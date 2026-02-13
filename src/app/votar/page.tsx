"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
type Participant = { id: number; name: string; photo: string | null };
type EmojiItem = { id: number; emoji: string; label: string };
type VotesMap = Record<number, string>;
type AppConfig = { title: string; logo: string | null };

export default function VotarPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [votes, setVotes] = useState<VotesMap>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [user, setUser] = useState<{ name: string; isMaster: boolean } | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, pRes, vRes, eRes, cRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/participants"),
          fetch("/api/votes"),
          fetch("/api/emojis"),
          fetch("/api/config"),
        ]);
        const sData = await sRes.json();
        const pData = await pRes.json();
        const vData = await vRes.json();
        const eData = await eRes.json();
        const cData = await cRes.json();
        if (sData.user) setUser(sData.user);
        if (pData.participants) setParticipants(pData.participants);
        if (vData.votes) setVotes(vData.votes);
        if (eData.emojis) setEmojis(eData.emojis);
        if (cData.config) setConfig(cData.config);
      } catch {
        setMessage({ type: "err", text: "Erro ao carregar" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function vote(emoji: string) {
    if (!selectedId) return;
    setMessage(null);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: selectedId, emoji }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Erro ao votar" });
        return;
      }
      setVotes((prev) => ({ ...prev, [selectedId]: emoji }));
      setMessage({ type: "ok", text: "Voto registrado!" });
    } catch {
      setMessage({ type: "err", text: "Erro ao enviar voto" });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Carregando...</p>
      </div>
    );
  }

  const notLogged = !user;
  if (notLogged) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-300">Faça login para votar.</p>
        <Link
          href="/login"
          className="rounded-xl bg-purple-600 text-white px-6 py-2 font-medium"
        >
          Entrar
        </Link>
      </div>
    );
  }

  const selected = selectedId ? participants.find((p) => p.id === selectedId) : null;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-700/50 bg-slate-900/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config?.logo && (
              <div className="w-9 h-9 rounded-xl bg-slate-900/60 border border-slate-700 overflow-hidden flex items-center justify-center">
                <img src={config.logo} alt={config.title} className="w-full h-full object-contain" />
              </div>
            )}
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
              {config?.title || "Queridômetro"}
            </h1>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/resumo"
              className="text-slate-300 hover:text-white text-sm font-medium"
            >
              Resumo do dia
            </Link>
            <Link
              href="/perfil"
              className="text-slate-300 hover:text-white text-sm font-medium"
            >
              Perfil
            </Link>
            {user.isMaster && (
              <Link
                href="/admin"
                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
              className="text-slate-400 hover:text-white text-sm"
            >
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-slate-400 text-sm mb-4">
          Olá, <span className="text-white font-medium">{user.name}</span>. Escolha um participante e vote com um emoji (1 voto por participante por dia).
        </p>

        {message && (
          <div
            className={`mb-4 rounded-xl px-4 py-2 text-sm ${
              message.type === "ok"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {participants.map((p) => {
            const voted = votes[p.id];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`rounded-2xl border-2 p-4 transition text-center ${
                  selectedId === p.id
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                }`}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 flex items-center justify-center text-2xl">
                  {p.photo ? (
                    <img
                      src={p.photo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-500">?</span>
                  )}
                </div>
                <p className="mt-2 font-medium text-white truncate text-sm">
                  {p.name}
                </p>
                {voted && (
                  <p className="text-2xl mt-1" title="Seu voto hoje">
                    {voted}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {participants.length === 0 && (
          <p className="text-slate-400 text-center py-8">
            Nenhum participante cadastrado ainda.
            {user.isMaster && " Vá em Admin para cadastrar."}
          </p>
        )}

        {selected && (
          <div className="rounded-2xl border border-slate-600 bg-slate-800/50 p-6">
            <p className="text-slate-400 text-sm mb-2">Votar em:</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 flex items-center justify-center text-xl">
                {selected.photo ? (
                  <img
                    src={selected.photo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-500">?</span>
                )}
              </div>
              <span className="font-semibold text-lg text-white">
                {selected.name}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-2">Escolha um emoji:</p>
            <div className="flex flex-wrap gap-2">
              {emojis.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => vote(e.emoji)}
                  className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-2xl flex items-center justify-center transition"
                  title={e.label}
                >
                  {e.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
