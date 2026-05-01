"use client";

import { useEffect, useState } from "react";

type AuditEntry = {
  id: number;
  action: string;
  incTicket: string | null;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  performedBy: string;
  createdAt: string;
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-[#EEF3FF] dark:bg-zinc-950 p-8 space-y-8 text-zinc-950 dark:text-zinc-100">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Audit Log</h1>
          <p className="text-sm font-bold text-[#2C72FF] uppercase tracking-wide mt-1">Historie van alle wijzigingen</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-[#2C72FF]" />
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Laden...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-16 text-center shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="text-4xl mb-4">📜</div>
          <h3 className="text-lg font-black tracking-tight mb-1">Geen logs</h3>
          <p className="text-zinc-500 text-sm">Er zijn nog geen acties gelogd in het systeem.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="p-4 font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Tijd</th>
                  <th className="p-4 font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Actie</th>
                  <th className="p-4 font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Ticket</th>
                  <th className="p-4 font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Veld</th>
                  <th className="p-4 font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Oude waarde</th>
                  <th className="p-4 font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Nieuwe waarde</th>
                  <th className="p-4 font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Door</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#EEF3FF] dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="p-4 whitespace-nowrap font-bold text-zinc-950 dark:text-zinc-300">
                      {new Date(log.createdAt).toLocaleString("nl-NL")}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        log.action === "update" ? "bg-blue-100 text-[#2C72FF] border border-[#2C72FF]/20" :
                        log.action === "delete" ? "bg-red-100 text-red-600 border border-red-600/20" :
                        "bg-[#EEF7F6] text-[#2F9A92] border border-[#2F9A92]/20"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-black text-[#2C72FF]">{log.incTicket || "—"}</td>
                    <td className="p-4 font-bold text-zinc-600 dark:text-zinc-400">{log.field || "—"}</td>
                    <td className="p-4 max-w-xs truncate text-zinc-500 italic">{log.oldValue || "—"}</td>
                    <td className="p-4 max-w-xs truncate text-zinc-900 dark:text-zinc-100 font-medium">{log.newValue || "—"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2F9A92] to-[#2C72FF] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {log.performedBy.charAt(0)}
                        </div>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{log.performedBy}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
