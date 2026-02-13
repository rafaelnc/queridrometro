"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Participant = { id: number; name: string; photo: string | null };
type EmojiItem = { id: number; emoji: string; label: string };
type AppConfig = { title: string; logo: string | null };

export default function AdminPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<{ isMaster: boolean } | null>(null);
  const [tab, setTab] = useState<"participantes" | "emojis" | "config">("participantes");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Participant | null>(null);
  const [formName, setFormName] = useState("");
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [credenciaisCriadas, setCredenciaisCriadas] = useState<{ login: string; senha: string } | null>(null);
  // Emojis: novo emoji (campo do teclado) e label; edição
  const [novoEmoji, setNovoEmoji] = useState("");
  const [novoEmojiLabel, setNovoEmojiLabel] = useState("");
  const [editandoEmoji, setEditandoEmoji] = useState<EmojiItem | null>(null);
  const [emojiEditVal, setEmojiEditVal] = useState("");
  const [emojiEditLabel, setEmojiEditLabel] = useState("");
  const [configTitle, setConfigTitle] = useState("");
  const [configLogo, setConfigLogo] = useState<string | null>(null);

  function loadParticipants() {
    fetch("/api/participants")
      .then((r) => r.json())
      .then((data) => {
        if (data.participants) setParticipants(data.participants);
      });
  }

  function loadEmojis() {
    fetch("/api/emojis")
      .then((r) => r.json())
      .then((data) => {
        if (data.emojis) setEmojis(data.emojis);
      });
  }

  function loadConfig() {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config);
          setConfigTitle(data.config.title);
          setConfigLogo(data.config.logo);
        }
      });
  }

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        if (!data.user.isMaster) {
          router.push("/votar");
          return;
        }
        setUser(data.user);
        loadParticipants();
        loadEmojis();
        loadConfig();
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setFormPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setConfigLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  function openNew() {
    setEditing({ id: 0, name: "", photo: null });
    setFormName("");
    setFormPhoto(null);
    setMessage(null);
    setCredenciaisCriadas(null);
  }

  function openEdit(p: Participant) {
    setEditing(p);
    setFormName(p.name);
    setFormPhoto(p.photo);
    setMessage(null);
  }

  function cancelEdit() {
    setEditing(null);
    setFormName("");
    setFormPhoto(null);
  }

  async function save() {
    if (!editing) return;
    setMessage(null);
    setSaving(true);
    try {
      if (editing.id === 0) {
        const res = await fetch("/api/participants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName.trim(), photo: formPhoto }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: "err", text: data.error || "Erro ao cadastrar" });
          return;
        }
        setMessage({ type: "ok", text: "Participante cadastrado! Copie o login e a senha abaixo." });
        setCredenciaisCriadas({ login: data.login ?? data.participant?.name ?? "", senha: data.senha ?? "" });
        loadParticipants();
        cancelEdit();
      } else {
        const res = await fetch(`/api/participants/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName.trim(), photo: formPhoto }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: "err", text: data.error || "Erro ao atualizar" });
          return;
        }
        setMessage({ type: "ok", text: "Participante atualizado!" });
        loadParticipants();
        cancelEdit();
      }
    } catch {
      setMessage({ type: "err", text: "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Participant) {
    if (!confirm(`Remover "${p.name}"? Os votos deste participante também serão excluídos.`)) return;
    try {
      const res = await fetch(`/api/participants/${p.id}`, { method: "DELETE" });
      if (res.ok) {
        loadParticipants();
        if (editing?.id === p.id) cancelEdit();
      }
    } catch {
      setMessage({ type: "err", text: "Erro ao remover" });
    }
  }

  async function adicionarEmoji() {
    if (!novoEmoji.trim()) {
      setMessage({ type: "err", text: "Digite ou cole um emoji (use o teclado de emojis do celular)." });
      return;
    }
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/emojis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji: novoEmoji.trim(), label: novoEmojiLabel.trim() || novoEmoji.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Erro ao cadastrar emoji" });
        return;
      }
      setMessage({ type: "ok", text: "Emoji adicionado!" });
      setNovoEmoji("");
      setNovoEmojiLabel("");
      loadEmojis();
    } catch {
      setMessage({ type: "err", text: "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  }

  function abrirEditarEmoji(e: EmojiItem) {
    setEditandoEmoji(e);
    setEmojiEditVal(e.emoji);
    setEmojiEditLabel(e.label);
  }

  async function salvarEditarEmoji() {
    if (!editandoEmoji) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/emojis/${editandoEmoji.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji: emojiEditVal.trim(), label: emojiEditLabel.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "err", text: data.error || "Erro ao atualizar" });
        return;
      }
      setMessage({ type: "ok", text: "Emoji atualizado!" });
      setEditandoEmoji(null);
      loadEmojis();
    } catch {
      setMessage({ type: "err", text: "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  }

  async function removerEmoji(e: EmojiItem) {
    if (!confirm(`Remover o emoji ${e.emoji}?`)) return;
    try {
      const res = await fetch(`/api/emojis/${e.id}`, { method: "DELETE" });
      if (res.ok) {
        loadEmojis();
        if (editandoEmoji?.id === e.id) setEditandoEmoji(null);
      }
    } catch {
      setMessage({ type: "err", text: "Erro ao remover" });
    }
  }

  async function salvarConfig() {
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: configTitle, logo: configLogo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Erro ao salvar configurações" });
        return;
      }
      if (data.config) {
        setConfig(data.config);
        setConfigTitle(data.config.title);
        setConfigLogo(data.config.logo);
      }
      setMessage({ type: "ok", text: "Configurações salvas!" });
    } catch {
      setMessage({ type: "err", text: "Erro ao salvar configurações" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Carregando...</p>
      </div>
    );
  }

  if (!user?.isMaster) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/90">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/votar"
            className="text-slate-400 hover:text-white text-sm font-medium"
          >
            ← Voltar
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("participantes")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === "participantes" ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white"}`}
            >
              Participantes
            </button>
            <button
              type="button"
              onClick={() => setTab("emojis")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === "emojis" ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white"}`}
            >
              Emojis
            </button>
            <button
              type="button"
              onClick={() => setTab("config")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === "config" ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white"}`}
            >
              Configuração
            </button>
            <Link
              href="/admin/resumo"
              className="text-slate-400 hover:text-amber-400 text-sm font-medium"
            >
              Resumo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {message && (
          <p
            className={`mb-4 text-sm ${message.type === "ok" ? "text-emerald-400" : "text-red-400"}`}
          >
            {message.text}
          </p>
        )}

        {credenciaisCriadas && (
          <div className="mb-6 p-4 rounded-xl bg-slate-800 border border-emerald-500/50">
            <p className="text-slate-300 text-sm font-medium mb-2">Credenciais do participante (pode alterar a senha em Perfil depois de logar):</p>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-500 text-xs">Login:</span>
                <p className="text-white font-mono font-semibold">{credenciaisCriadas.login}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Senha temporária:</span>
                <p className="text-white font-mono font-semibold">{credenciaisCriadas.senha}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const texto = `Login: ${credenciaisCriadas!.login}\nSenha: ${credenciaisCriadas!.senha}`;
                  navigator.clipboard.writeText(texto);
                  setMessage({ type: "ok", text: "Login e senha copiados!" });
                }}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2 px-4"
              >
                Copiar login e senha
              </button>
            </div>
          </div>
        )}

        {tab === "emojis" ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">
              <h2 className="text-white font-medium mb-3">Adicionar emoji</h2>
              <p className="text-slate-400 text-sm mb-3">Use o teclado do celular para escolher o emoji (toque no campo abaixo e abra o teclado de emojis).</p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs text-slate-500 mb-1">Emoji</label>
                  <input
                    type="text"
                    value={novoEmoji}
                    onChange={(e) => setNovoEmoji(e.target.value)}
                    className="w-full rounded-xl bg-slate-700 border border-slate-600 text-white px-4 py-3 text-2xl focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="😀 Toque aqui"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs text-slate-500 mb-1">Rótulo (opcional)</label>
                  <input
                    type="text"
                    value={novoEmojiLabel}
                    onChange={(e) => setNovoEmojiLabel(e.target.value)}
                    className="w-full rounded-xl bg-slate-700 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ex: Feliz"
                  />
                </div>
                <button
                  type="button"
                  onClick={adicionarEmoji}
                  disabled={saving || !novoEmoji.trim()}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-5 disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-white font-medium mb-3">Emojis para votação</h2>
              <ul className="space-y-2">
                {emojis.map((e) => (
                  <li key={e.id} className="flex items-center gap-4 rounded-xl bg-slate-800 border border-slate-700 p-3">
                    {editandoEmoji?.id === e.id ? (
                      <>
                        <input
                          type="text"
                          value={emojiEditVal}
                          onChange={(ev) => setEmojiEditVal(ev.target.value)}
                          className="w-14 rounded-lg bg-slate-700 border border-slate-600 text-2xl text-center py-1"
                        />
                        <input
                          type="text"
                          value={emojiEditLabel}
                          onChange={(ev) => setEmojiEditLabel(ev.target.value)}
                          className="flex-1 rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2"
                          placeholder="Rótulo"
                        />
                        <button type="button" onClick={salvarEditarEmoji} disabled={saving} className="text-emerald-400 text-sm">Salvar</button>
                        <button type="button" onClick={() => setEditandoEmoji(null)} className="text-slate-400 text-sm">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl w-12 text-center">{e.emoji}</span>
                        <span className="flex-1 text-white">{e.label || e.emoji}</span>
                        <button type="button" onClick={() => abrirEditarEmoji(e)} className="text-sky-400 text-sm">Editar</button>
                        <button type="button" onClick={() => removerEmoji(e)} className="text-red-400 text-sm">Remover</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {emojis.length === 0 && (
                <p className="text-slate-400 text-center py-6">Nenhum emoji. Adicione acima para aparecer na votação.</p>
              )}
            </div>
          </div>
        ) : tab === "config" ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">
              <h2 className="text-white font-medium mb-3">Identidade do Queridômetro</h2>
              <p className="text-slate-400 text-sm mb-4">
                Altere o <span className="font-semibold text-slate-200">nome do sistema</span> e, se quiser, envie uma{" "}
                <span className="font-semibold text-slate-200">logo</span> para aparecer no login e nas páginas.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Título / nome do sistema</label>
                  <input
                    type="text"
                    value={configTitle}
                    onChange={(e) => setConfigTitle(e.target.value)}
                    className="w-full rounded-xl bg-slate-700 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ex: Queridômetro da Família"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Logo (opcional)</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-16 h-16 rounded-xl bg-slate-700 border border-slate-600 overflow-hidden flex items-center justify-center text-2xl text-slate-400 hover:border-purple-500 transition"
                    >
                      {configLogo ? (
                        <img src={configLogo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        "📷"
                      )}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onLogoChange}
                    />
                    <div className="flex-1 text-xs text-slate-400 space-y-1">
                      <p>Recomendado: imagem quadrada ou retangular pequena.</p>
                      {configLogo && (
                        <button
                          type="button"
                          onClick={() => setConfigLogo(null)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium"
                        >
                          Remover logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={salvarConfig}
                    disabled={saving}
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-5 disabled:opacity-50"
                  >
                    {saving ? "Salvando..." : "Salvar configurações"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : !editing ? (
          <>
            <button
              type="button"
              onClick={openNew}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-orange-600 text-white font-medium py-2.5 px-5 mb-6"
            >
              + Novo participante
            </button>
            <ul className="space-y-3">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-4 rounded-xl bg-slate-800 border border-slate-700 p-4"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden border border-slate-600 flex items-center justify-center text-lg text-slate-500">
                    {p.photo ? (
                      <img src={p.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      "?"
                    )}
                  </div>
                  <span className="flex-1 font-medium text-white">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="text-sky-400 hover:text-sky-300 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
            {participants.length === 0 && (
              <p className="text-slate-400 text-center py-8">
                Nenhum participante. Clique em &quot;Novo participante&quot; para cadastrar.
              </p>
            )}
          </>
        ) : editing ? (
          <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
            <h2 className="text-lg font-medium text-white mb-4">
              {editing.id === 0 ? "Novo participante" : "Editar participante"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl bg-slate-700 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Nome do participante"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Foto</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-600 overflow-hidden flex items-center justify-center text-2xl text-slate-500 hover:border-purple-500 transition"
                  >
                    {formPhoto ? (
                      <img src={formPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      "📷"
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                  <span className="text-slate-500 text-sm">Clique para escolher</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={save}
                disabled={saving || !formName.trim()}
                className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-5 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium py-2.5 px-5"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
