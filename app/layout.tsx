import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Incidenten Dashboard",
  description: "Odido incidenten beheer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        {/* Sidebar */}
        <aside className="w-56 bg-zinc-900 text-zinc-300 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-700">
            <h1 className="text-sm font-bold text-white tracking-tight">Incidenten</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Odido beheer</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg text-sm hover:bg-zinc-800 hover:text-white transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/add"
              className="block px-3 py-2 rounded-lg text-sm hover:bg-zinc-800 hover:text-white transition-colors"
            >
              ➕ Incident toevoegen
            </Link>
          </nav>
          <div className="p-4 border-t border-zinc-700 text-xs text-zinc-600">
            v1.0
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
