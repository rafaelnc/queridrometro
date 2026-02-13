import Link from "next/link";

export default function NotFound() {
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
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>404</h1>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        Página não encontrada.
      </p>
      <Link
        href="/login"
        style={{
          color: "#c084fc",
          textDecoration: "underline",
          fontWeight: 500,
        }}
      >
        Ir para o login
      </Link>
    </div>
  );
}
