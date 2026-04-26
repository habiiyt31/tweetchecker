import type { Metadata } from "next";
import { Sora, Instrument_Serif, JetBrains_Mono } from "next/font/google";

import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TweetChecker",
  description:
    "Detect Twitter/X scams in seconds. Powered by GenLayer Intelligent Contracts and multi-validator AI consensus.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23c8ff00'/%3E%3Cpath d='M9 16l5 5 9-10' stroke='%230a0a0c' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${instrument.variable} ${mono.variable}`}
    >
      <body className="body-ambient font-sans">
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
