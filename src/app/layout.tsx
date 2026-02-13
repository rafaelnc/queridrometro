import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Queridômetro",
  description: "Sistema de votação por emojis - Estilo BBB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className="antialiased bg-slate-900 text-slate-100 min-h-screen"
        style={{
          backgroundColor: "var(--bg-page, #0f172a)",
          color: "var(--text-page, #f1f5f9)",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
