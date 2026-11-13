"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KabaretLogo from "@/components/KabaretLogo";

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
        .login-root { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1rem; background-color: #ff6a00; background-image: url("/kabaret-pattern.svg"); background-size: 240px 240px; position: relative; }
        .login-root::before { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(228,84,15,0.92) 0%, rgba(228,84,15,0.75) 45%, rgba(228,84,15,0.2) 100%); pointer-events: none; }
        .login-root > * { position: relative; }
        .login-root .login-hero { margin-bottom: 1.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .login-root .login-box { width: 100%; max-width: 26rem; border-radius: 1.5rem; background: #fdf0e0; border: none; box-shadow: 10px 10px 0 #e8125c, 0 25px 50px -12px rgba(0,0,0,0.45); padding: 2rem; color: #4d200c; }
        .login-root .login-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 900; color: #e4540f; text-align: center; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 0.25rem; }
        .login-root .login-sub { color: #93502c; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem; }
        .login-root label { display: block; font-size: 0.8rem; font-weight: 600; color: #71361a; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.08em; }
        .login-root input { width: 100%; border-radius: 0.75rem; background: #fff8f0; border: 2px solid #f0c9a3; color: #2f1105; padding: 0.75rem 1rem; margin-bottom: 1.1rem; box-sizing: border-box; }
        .login-root input::placeholder { color: #c07f55; }
        .login-root input:focus { outline: none; border-color: #ff6a00; box-shadow: 0 0 0 3px rgba(255,196,0,0.45); }
        .login-root .login-btn { width: 100%; border-radius: 999px; background: #e4540f; color: #fdf0e0; font-family: var(--font-display); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 0.85rem 1rem; border: none; cursor: pointer; margin-top: 0.5rem; box-shadow: 0 4px 0 #b80d48; transition: transform .1s, box-shadow .1s; }
        .login-root .login-btn:hover:not(:disabled) { background: #ff6a00; }
        .login-root .login-btn:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 #b80d48; }
        .login-root .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-root .login-error { color: #b80d48; font-weight: 600; font-size: 0.875rem; text-align: center; margin-bottom: 0.5rem; }
        .login-root .login-footer { text-align: center; color: #93502c; font-size: 0.875rem; margin-top: 1.5rem; }
        .login-root .login-link { color: #e8125c; font-weight: 700; background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0; }
      `}</style>
      <div className="login-root">
        <div className="login-hero">
          {config?.logo && (
            <div className="w-16 h-16 rounded-full bg-[#fdf0e0] overflow-hidden flex items-center justify-center">
              <img src={config.logo} alt={config.title} className="w-full h-full object-contain" />
            </div>
          )}
          <KabaretLogo size="lg" />
        </div>
        <div className="w-full max-w-md flex justify-center">
          <div className="login-box">
            <div className="text-center">
              <h1 className="login-title">{config?.title || "Queridômetro"}</h1>
              <p className="login-sub">Vote nos participantes com emojis</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <div>
                  <label>
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    required={mode === "register"}
                  />
                </div>
              )}
              <div>
                <label>
                  Email ou nome (participante)
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com ou seu nome"
                  required
                />
              </div>
              <div>
                <label>
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <p className="login-error">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="login-btn"
              >
                {loading
                  ? "Aguarde..."
                  : mode === "login"
                    ? "Entrar"
                    : "Cadastrar"}
              </button>
            </form>

            <p className="login-footer">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="login-link"
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
                  className="login-link"
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
