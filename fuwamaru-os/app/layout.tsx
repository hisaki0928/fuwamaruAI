import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fuwamaru OS",
  description: "カフェ向けゲーミフィケーション業務管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter, ui-sans-serif, system-ui, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
