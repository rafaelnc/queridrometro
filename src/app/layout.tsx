import type { Metadata } from "next";
import { Outfit, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
  display: "swap",
});

const body = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kabaret do Rhadonym",
  description: "Queridômetro do Kabaret do Rhadonym - votação por emojis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased text-slate-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
