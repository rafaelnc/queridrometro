"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AppConfig = { title: string; logo: string | null };

export default function PerfilPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
    photo: string | null;
  } | null>(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/profile"), fetch("/api/config")])
      .then(async ([rProfile, rConfig]) => {
        const dataProfile = await rProfile.json();
        const dataConfig = await rConfig.json();
        if (dataProfile.user) {
          setUser(dataProfile.user);
          setName(dataProfile.user.name);
          setPhoto(dataProfile.user.photo);
        } else {
          router.push("/login");
        }
        if (dataConfig.config) setConfig(dataConfig.config);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setMessage(null);
    setSaving(true);
    try {
      const body: { name?: string; photo?: string | null; currentPassword?: string; newPassword?: string } = {
        name: name.trim(),
        photo: photo ?? null,
      };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Erro ao salvar" });
        return;
      }
      setMessage({ type: "ok", text: "Perfil atualizado!" });
      setCurrentPassword("");
      setNewPassword("");
      if (data.user) setUser(data.user);
    } catch {
      setMessage({ type: "err", text: "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Carregando...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/90">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/votar"
            className="text-slate-400 hover:text-white text-sm font-medium"
          >
            ← Voltar
          </Link>
          <div className="flex items-center gap-3">
            {config?.logo && (
              <div className="w-8 h-8 rounded-xl bg-slate-900/60 border border-slate-700 overflow-hidden flex items-center justify-center">
                <img src={config.logo} alt={config.title} className="w-full h-full object-contain" />
              </div>
            )}
            <h1 className="text-lg font-semibold text-white">Meu perfil</h1>
          </div>
          <span />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-full bg-slate-700 border-2 border-slate-600 overflow-hidden flex items-center justify-center text-3xl text-slate-500 hover:border-purple-500 transition"
            >
              {photo ? (
                <img src={photo} alt="" className="w-full h-full object-cover" />
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
            <span className="text-slate-400 text-sm">Clique para trocar a foto</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-slate-400 px-4 py-3 cursor-not-allowed"
            />
            <p className="text-slate-500 text-xs mt-1">Email não pode ser alterado.</p>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-slate-300 font-medium mb-3">Alterar senha</h2>
            <div className="space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Senha atual"
                className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha (deixe em branco para não alterar)"
                className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {message && (
            <p
              className={
                message.type === "ok"
                  ? "text-emerald-400 text-sm"
                  : "text-red-400 text-sm"
              }
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-500 hover:to-orange-500 text-white font-semibold py-3 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </main>
    </div>
  );
}
