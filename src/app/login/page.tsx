"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AppConfig = { title: string; logo: string | null };

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { login: email.trim(), password }
          : { email: email.trim(), password, name: name.trim() };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao processar");
        return;
      }
      // Redirecionamento completo para garantir que o cookie seja enviado
      window.location.href = "/votar";
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .login-root { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; background: linear-gradient(to bottom right, #0f172a 0%, #3b0764 50%, #0f172a 100%); }
        .login-root .login-box { width: 100%; max-width: 28rem; border-radius: 1rem; background: rgba(30,41,59,0.9); border: 1px solid rgba(71,85,105,0.5); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); padding: 2rem; }
        .login-root .login-title { font-size: 1.875rem; font-weight: 700; background: linear-gradient(to right, #c084fc, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-align: center; margin-bottom: 0.5rem; }
        .login-root .login-sub { color: #94a3b8; font-size: 0.875rem; text-align: center; margin-bottom: 2rem; }
        .login-root label { display: block; font-size: 0.875rem; font-weight: 500; color: #cbd5e1; margin-bottom: 0.25rem; }
        .login-root input { width: 100%; border-radius: 0.75rem; background: rgba(51,65,85,0.5); border: 1px solid #475569; color: #fff; padding: 0.75rem 1rem; margin-bottom: 1.25rem; box-sizing: border-box; }
        .login-root input::placeholder { color: #64748b; }
        .login-root input:focus { outline: none; border-color: #a855f7; box-shadow: 0 0 0 2px rgba(168,85,247,0.3); }
        .login-root .login-btn { width: 100%; border-radius: 0.75rem; background: linear-gradient(to right, #9333ea, #ea580c); color: #fff; font-weight: 600; padding: 0.75rem 1rem; border: none; cursor: pointer; margin-top: 0.5rem; }
        .login-root .login-btn:hover:not(:disabled) { opacity: 0.95; }
        .login-root .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-root .login-error { color: #f87171; font-size: 0.875rem; text-align: center; margin-bottom: 0.5rem; }
        .login-root .login-footer { text-align: center; color: #94a3b8; font-size: 0.875rem; margin-top: 1.5rem; }
        .login-root .login-link { color: #c084fc; background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0; }
      `}</style>
      <div className="login-root min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900">
        <div className="w-full max-w-md">
          <div className="login-box rounded-2xl bg-slate-800/80 backdrop-blur border border-slate-700/50 shadow-2xl p-8">
            <div className="text-center mb-8 flex flex-col items-center gap-3">
              {config?.logo && (
                <div className="w-16 h-16 rounded-2xl bg-slate-900/40 border border-slate-700 overflow-hidden flex items-center justify-center mx-auto">
                  <img src={config.logo} alt={config.title} className="w-full h-full object-contain" />
                </div>
              )}
              <h1 className="login-title text-3xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                {config?.title || "Queridômetro"}
              </h1>
              <p className="login-sub text-slate-400 mt-2 text-sm">
                Vote nos participantes com emojis
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-slate-700/50 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Seu nome"
                    required={mode === "register"}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email ou nome (participante)
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-700/50 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="seu@email.com ou seu nome"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-700/50 border border-slate-600 text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <p className="login-error text-red-400 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="login-btn w-full rounded-xl bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-500 hover:to-orange-500 text-white font-semibold py-3 px-4 transition disabled:opacity-50"
              >
                {loading
                  ? "Aguarde..."
                  : mode === "login"
                    ? "Entrar"
                    : "Cadastrar"}
              </button>
            </form>

            <p className="login-footer text-center text-slate-400 text-sm mt-6">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="login-link text-purple-400 hover:underline"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="login-link text-purple-400 hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
