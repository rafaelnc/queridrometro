"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "#0f172a",
        color: "#f1f5f9",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        Algo deu errado
      </h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        {error.message}
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            background: "#9333ea",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Tentar de novo
        </button>
        <Link
          href="/login"
          style={{
            padding: "0.5rem 1rem",
            color: "#c084fc",
            textDecoration: "underline",
            fontWeight: 500,
          }}
        >
          Ir para o login
        </Link>
      </div>
    </div>
  );
}
