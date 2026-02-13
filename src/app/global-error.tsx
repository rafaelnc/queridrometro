"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#0f172a", color: "#f1f5f9", fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Erro inesperado</h2>
        <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.875rem" }}>{error.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "#9333ea", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500 }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
