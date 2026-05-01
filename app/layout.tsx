"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

const UserContext = createContext<{ 
  user: string | null; 
  setUser: (name: string) => void;
  logout: () => void;
}>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const useTheme = () => useContext(ThemeContext);
export const useUser = () => useContext(UserContext);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);
  const [user, setUserName] = useState<string | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempName, setTempName] = useState("");

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) setTheme(storedTheme);
    
    const storedUser = localStorage.getItem("userName");
    if (storedUser) {
      setUserName(storedUser);
    } else {
      setShowNamePrompt(true);
    }

    const collapsed = localStorage.getItem("sidebarCollapsed") === "true";
    setIsCollapsed(collapsed);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const handleSetName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tempName.trim()) {
      localStorage.setItem("userName", tempName.trim());
      setUserName(tempName.trim());
      setShowNamePrompt(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("userName");
    setUserName(null);
    setShowNamePrompt(true);
  };

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  };

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const navLinks = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/add", label: "Incident toevoegen", icon: "➕" },
    { href: "/features", label: "Features", icon: "💡" },
    { href: "/audit", label: "Audit log", icon: "📜" },
  ];

  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${theme}`}
    >
      <body className={`min-h-full flex ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-[#EEF3FF] text-zinc-900'}`}>
        <ThemeContext.Provider value={{ theme, toggle }}>
          <UserContext.Provider value={{ user, setUser: (n) => setUserName(n), logout }}>
            {/* Name Prompt Modal */}
            {mounted && showNamePrompt && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-300">
                  <header className="relative bg-zinc-950 p-8 text-white overflow-hidden text-center">
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#2C72FF] via-[#2F9A92] to-[#FFAC24]" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2C72FF] to-[#2F9A92] flex items-center justify-center text-white font-black text-3xl shadow-xl mx-auto mb-4">
                      O
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Welkom bij Odido</h2>
                    <p className="text-sm font-bold text-[#FFAC24] uppercase tracking-widest mt-1">Incidenten Dashboard</p>
                  </header>
                  <div className="p-8">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 text-center italic">
                      Voordat we beginnen, hoe mogen we je noemen?
                    </p>
                    <form onSubmit={handleSetName} className="space-y-4">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Typ je naam..."
                        autoFocus
                        className="w-full px-5 py-4 text-base font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#2C72FF]/20 focus:border-[#2C72FF] transition-all text-center"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-4 text-sm font-black bg-[#2C72FF] text-white rounded-2xl hover:bg-[#245ccc] transition-all shadow-lg shadow-[#2C72FF]/20"
                      >
                        Aan de slag
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar */}
            <aside className={`relative transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 flex flex-col shrink-0 border-r border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden`}>
              {/* Odido Gradient Top Bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2C72FF] via-[#2F9A92] to-[#FFAC24]" />
              
              <div className={`p-6 border-b border-zinc-100 dark:border-zinc-800/50 mt-1 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2C72FF] to-[#2F9A92] flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
                      O
                    </div>
                    <div className="overflow-hidden">
                      <h1 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight uppercase truncate">Incidenten</h1>
                      <p className="text-[10px] font-bold text-[#FFAC24] uppercase tracking-widest leading-none mt-0.5">Odido beheer</p>
                    </div>
                  </div>
                )}
                <button 
                  onClick={toggleSidebar}
                  className={`p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${isCollapsed ? '' : 'ml-2'}`}
                >
                  {isCollapsed ? '➡️' : '⬅️'}
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-2 mt-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      title={isCollapsed ? link.label : ""}
                      className={`group flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                        isActive
                          ? "bg-[#2C72FF] text-white shadow-lg shadow-[#2C72FF]/20"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="text-lg shrink-0">{link.icon}</span>
                      {!isCollapsed && <span>{link.label}</span>}
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile / Logout */}
              <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/50">
                {!isCollapsed && user && (
                  <div className="mb-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2F9A92] to-[#2C72FF] flex items-center justify-center text-white text-[10px] font-black uppercase">
                      {user.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Ingelogd als</p>
                      <p className="text-xs font-black text-zinc-900 dark:text-white truncate mt-1">{user}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={toggle}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-3 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all w-full border border-zinc-100 dark:border-zinc-800/50`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
                    {!isCollapsed && <span>{theme === "dark" ? "Light" : "Dark"} mode</span>}
                  </div>
                </button>
                {!isCollapsed && user && (
                  <button
                    onClick={logout}
                    className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full"
                  >
                    <span>🚪</span> Uitloggen
                  </button>
                )}
              </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-auto">{children}</main>
          </UserContext.Provider>
        </ThemeContext.Provider>
      </body>
    </html>
  );
}
