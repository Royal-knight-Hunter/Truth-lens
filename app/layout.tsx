import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Truth Lens — Misinformation Triage Platform",
  description:
    "AI-assisted claim verification and misinformation triage. Submit, flag, and review viral claims in real time. Hackathon ID: AZIS-T22ZVX.",
  keywords: ["fact-check", "misinformation", "claim verification", "truth lens"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
