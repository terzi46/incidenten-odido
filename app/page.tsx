"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./layout";
import type { IncidentModel } from "@/app/generated/prisma/models";

type Filters = {
  search: string;
  segment: string;
  solved: string;
  dateFrom: string;
  dateTo: string;
};

type SortKey = "incTicket" | "datum" | "postcodeHuisnr" | "klantnummer" | "onderwerp" | "segment" | "solved" | "aangemaaktDoor";
type SortDir = "asc" | "desc";

const SEGMENTS = ["TV", "Internet", "NT", "Telefonie"];

// ─── Saved filters ───
function loadSavedFilters(): Filters[] {
  try {
    return JSON.parse(localStorage.getItem("savedFilters") || "[]");
  } catch { return []; }
}
function saveSavedFilters(fs: Filters[]) {
  localStorage.setItem("savedFilters", JSON.stringify(fs));
}

// ─── Column visibility ───
const ALL_COLUMNS = [
  { key: "incTicket", label: "Ticket" },
  { key: "datum", label: "Datum" },
  { key: "postcodeHuisnr", label: "Postcode" },
  { key: "klantnummer", label: "Klantnr" },
  { key: "casenummer", label: "Casenummer" },
  { key: "goCareTicket", label: "GoCare" },
  { key: "onderwerp", label: "Onderwerp" },
  { key: "aangemaaktDoor", label: "Door" },
  { key: "segment", label: "Segment" },
  { key: "solved", label: "Status" },
  { key: "st", label: "ST" },
  { key: "opmerkingen", label: "Opmerkingen" },
  { key: "voorgaandTicket", label: "Voorgaand" },
] as const;

function loadVisibleCols(): string[] {
  try {
    return JSON.parse(localStorage.getItem("visibleCols") || "[]");
  } catch { return []; }
}

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [incidents, setIncidents] = useState<IncidentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "", segment: "", solved: "all", dateFrom: "", dateTo: "",
  });
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("datum");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [savedFilters, setSavedFilters] = useState<Filters[]>([]);
  const [filterName, setFilterName] = useState("");
  const [showFilterSave, setShowFilterSave] = useState(false);
  const [visibleCols, setVisibleCols] = useState<string[]>([]);
  const [showColPicker, setShowColPicker] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const perPage = 10;

  useEffect(() => {
    setSavedFilters(loadSavedFilters());
    const stored = loadVisibleCols();
    setVisibleCols(stored.length > 0 ? stored : ALL_COLUMNS.map((c) => c.key));
  }, []);

  useEffect(() => {
    fetch("/api/incidents")
      .then((r) => r.json())
      .then((data: Record<string, unknown>[]) => {
        const parsed = data.map((d) => ({
          ...d,
          datum: new Date(d.datum as string),
          createdAt: new Date(d.createdAt as string),
          updatedAt: new Date(d.updatedAt as string),
        })) as IncidentModel[];
        setIncidents(parsed);
        setLoading(false);
      });
  }, []);

  // ─── Filtering ───
  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const searchable = [inc.incTicket, inc.onderwerp, inc.postcodeHuisnr, inc.klantnummer, inc.aangemaaktDoor, inc.st, inc.opmerkingen].filter(Boolean).join(" ").toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (filters.segment && inc.segment !== filters.segment) return false;
      if (filters.solved === "true" && !inc.solved) return false;
      if (filters.solved === "false" && inc.solved) return false;
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (inc.datum < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (inc.datum > to) return false;
      }
      return true;
    });
  }, [incidents, filters]);

  // ─── Sorting ───
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (sortKey === "datum") {
        cmp = new Date(a.datum).getTime() - new Date(b.datum).getTime();
      } else if (sortKey === "solved") {
        cmp = Number(a.solved) - Number(b.solved);
      } else {
        cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  // ─── Stats ───
  const stats = useMemo(() => {
    const total = filtered.length;
    const solved = filtered.filter((i) => i.solved).length;
    const open = total - solved;
    const segments = SEGMENTS.map((s) => ({
      name: s,
      count: filtered.filter((i) => i.segment === s).length,
    }));
    const unknown = filtered.filter((i) => !i.segment || !SEGMENTS.includes(i.segment)).length;
    return { total, solved, open, segments, unknown };
  }, [filtered]);

  // ─── Sort toggle ───
  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  // ─── Bulk select ───
  function toggleAll() {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((i) => i.id)));
    }
  }

  function toggleOne(id: number) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function bulkToggleSolved(solved: boolean) {
    for (const id of selected) {
      await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solved, performedBy: user || "Onbekend" }),
      });
    }
    setSelected(new Set());
    // Refresh
    const res = await fetch("/api/incidents");
    const data = await res.json();
    setIncidents(data.map((d: any) => ({ ...d, datum: new Date(d.datum), createdAt: new Date(d.createdAt), updatedAt: new Date(d.updatedAt) })));
  }

  // ─── Saved filters ───
  function saveCurrentFilter() {
    if (!filterName.trim()) return;
    const newFilter = { ...filters, search: filterName };
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    saveSavedFilters(updated);
    setFilterName("");
    setShowFilterSave(false);
  }

  function applySavedFilter(f: Filters) {
    setFilters(f);
    setPage(1);
  }

  function deleteSavedFilter(idx: number) {
    const updated = savedFilters.filter((_, i) => i !== idx);
    setSavedFilters(updated);
    saveSavedFilters(updated);
  }

  // ─── Column visibility ───
  function toggleCol(key: string) {
    const next = visibleCols.includes(key)
      ? visibleCols.filter((c) => c !== key)
      : [...visibleCols, key];
    setVisibleCols(next);
    localStorage.setItem("visibleCols", JSON.stringify(next));
  }

  // ─── CSV export ───
  function exportCSV() {
    const headers = ALL_COLUMNS.map((c) => c.label).join(";");
    const rows = sorted.map((inc) =>
      ALL_COLUMNS.map((c) => {
        let val = (inc as any)[c.key];
        if (c.key === "datum") val = formatDate(val);
        if (c.key === "solved") val = val ? "Y" : "N";
        return `"${(val ?? "").toString().replace(/"/g, '""')}"`;
      }).join(";")
    );
    const bom = "\uFEFF";
    downloadFile(bom + [headers, ...rows].join("\n"), "incidenten.csv", "text/csv;charset=utf-8");
  }

  function exportJSON() {
    const data = sorted.map((inc) => ({
      ...inc,
      datum: formatDate(inc.datum),
      createdAt: inc.createdAt.toISOString(),
      updatedAt: inc.updatedAt.toISOString(),
    }));
    downloadFile(JSON.stringify(data, null, 2), "incidenten.json", "application/json");
  }

  function downloadFile(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── PDF export (simple) ───
  function exportPDF() {
    const rows = sorted.map((inc) =>
      `${inc.incTicket}\t${formatDate(inc.datum)}\t${inc.onderwerp}\t${inc.segment || "-"}\t${inc.solved ? "Opgelost" : "Open"}`
    ).join("\n");
    const text = `Incidenten Rapport\n${new Date().toLocaleDateString("nl-NL")}\n\nTicket\tDatum\tOnderwerp\tSegment\tStatus\n${rows}`;
    downloadFile(text, "incidenten.txt", "text/plain");
  }

  function formatDate(d: Date | string) {
    const date = new Date(d);
    return `${String(date.getUTCDate()).padStart(2, "0")}.${String(date.getUTCMonth() + 1).padStart(2, "0")}.${String(date.getUTCFullYear()).slice(-2)}`;
  }

  // ─── Active filter chips ───
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (filters.search) activeFilters.push({ label: `Zoek: "${filters.search}"`, clear: () => setFilters((f) => ({ ...f, search: "" })) });
  if (filters.segment) activeFilters.push({ label: `Segment: ${filters.segment}`, clear: () => setFilters((f) => ({ ...f, segment: "" })) });
  if (filters.solved !== "all") activeFilters.push({ label: `Status: ${filters.solved === "true" ? "Opgelost" : "Open"}`, clear: () => setFilters((f) => ({ ...f, solved: "all" })) });
  if (filters.dateFrom) activeFilters.push({ label: `Vanaf: ${filters.dateFrom}`, clear: () => setFilters((f) => ({ ...f, dateFrom: "" })) });
  if (filters.dateTo) activeFilters.push({ label: `Tot: ${filters.dateTo}`, clear: () => setFilters((f) => ({ ...f, dateTo: "" })) });

  return (
    <div className="min-h-full bg-[#EEF3FF] dark:bg-zinc-950 p-8 space-y-8 text-zinc-950 dark:text-zinc-100">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-sm font-bold text-[#2F9A92] uppercase tracking-wide mt-1">Incidenten overzicht & statistieken</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm">
            <span>⬇</span> CSV
          </button>
          <button onClick={exportJSON} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm">
            <span>⬇</span> JSON
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm">
            <span>⬇</span> PDF
          </button>
          <button onClick={() => router.push("/audit")} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#2C72FF] text-white rounded-xl hover:bg-[#245ccc] transition-all shadow-lg shadow-[#2C72FF]/20">
            <span>📋</span> Audit Log
          </button>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[24px] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 group">
          <div className="absolute top-0 right-0 p-3 opacity-10 transition-transform group-hover:scale-110">
            <div className="w-12 h-12 bg-[#2C72FF] rounded-full" />
          </div>
          <div className="text-3xl font-black text-[#2C72FF]">{stats.total}</div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Totaal</div>
        </div>
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[24px] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 group">
          <div className="absolute top-0 right-0 p-3 opacity-10 transition-transform group-hover:scale-110">
            <div className="w-12 h-12 bg-[#2F9A92] rounded-full" />
          </div>
          <div className="text-3xl font-black text-[#2F9A92]">{stats.solved}</div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Opgelost</div>
        </div>
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[24px] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 group">
          <div className="absolute top-0 right-0 p-3 opacity-10 transition-transform group-hover:scale-110">
            <div className="w-12 h-12 bg-[#FFAC24] rounded-full" />
          </div>
          <div className="text-3xl font-black text-[#FFAC24]">{stats.open}</div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Open</div>
        </div>
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[24px] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 group">
          <div className="absolute top-0 right-0 p-3 opacity-10 transition-transform group-hover:scale-110">
            <div className="w-12 h-12 bg-[#FF7621] rounded-full" />
          </div>
          <div className="text-3xl font-black text-[#FF7621]">{stats.segments.reduce((a, s) => a + s.count, 0) + stats.unknown}</div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Gefilterd</div>
        </div>
      </div>

      {/* ─── Filters & Segments ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[28px] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-[#2C72FF] rounded-full" />
            <h2 className="text-lg font-black tracking-tight">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Zoeken</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1); }}
                placeholder="Ticket, onderwerp..."
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C72FF]/20 focus:border-[#2C72FF] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Segment</label>
              <select
                value={filters.segment}
                onChange={(e) => { setFilters((f) => ({ ...f, segment: e.target.value })); setPage(1); }}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C72FF]/20 focus:border-[#2C72FF] transition-all appearance-none"
              >
                <option value="">Alle segmenten</option>
                {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="Onbekend">Onbekend</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Status</label>
              <select
                value={filters.solved}
                onChange={(e) => { setFilters((f) => ({ ...f, solved: e.target.value })); setPage(1); }}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C72FF]/20 focus:border-[#2C72FF] transition-all appearance-none"
              >
                <option value="all">Alle statussen</option>
                <option value="false">Open</option>
                <option value="true">Opgelost</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Vanaf</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => { setFilters((f) => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C72FF]/20 focus:border-[#2C72FF] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Tot</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => { setFilters((f) => ({ ...f, dateTo: e.target.value })); setPage(1); }}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C72FF]/20 focus:border-[#2C72FF] transition-all"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowFilterSave(!showFilterSave)}
                className="flex-1 px-4 py-3 text-xs font-bold bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all shadow-sm"
              >
                💾 Opslaan
              </button>
              <button
                onClick={() => setShowColPicker(!showColPicker)}
                className="flex-1 px-4 py-3 text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
              >
                👁 Kolommen
              </button>
            </div>
          </div>

          {/* Sub-panels (Active Filters etc) */}
          <div className="mt-6 space-y-4">
            {showFilterSave && (
              <div className="flex gap-2 items-center p-4 bg-[#EEF3FF] dark:bg-zinc-950 rounded-2xl border border-[#ADC8FF] dark:border-zinc-800">
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Filter naam..."
                  className="flex-1 px-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-[#ADC8FF] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#2C72FF]"
                  onKeyDown={(e) => e.key === "Enter" && saveCurrentFilter()}
                />
                <button onClick={saveCurrentFilter} className="px-6 py-2 text-xs font-bold bg-[#2F9A92] text-zinc-950 rounded-xl hover:bg-[#23756f] transition-all">Opslaan</button>
              </div>
            )}
            {showColPicker && (
              <div className="flex flex-wrap gap-3 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                {ALL_COLUMNS.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-[#2C72FF] transition-colors">
                    <input
                      type="checkbox"
                      checked={visibleCols.includes(col.key)}
                      onChange={() => toggleCol(col.key)}
                      className="w-4 h-4 rounded border-zinc-300 text-[#2C72FF] focus:ring-[#2C72FF] accent-[#2C72FF]"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mr-1">Actief:</span>
                {activeFilters.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 bg-[#EEF3FF] dark:bg-[#2C72FF]/10 border border-[#ADC8FF] dark:border-[#2C72FF]/20 px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-[#2C72FF]">{f.label}</span>
                    <button onClick={f.clear} className="text-[#2C72FF] hover:text-[#245ccc] ml-1">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-[#2F9A92] rounded-full" />
            <h2 className="text-lg font-black tracking-tight">Snel Segment</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...SEGMENTS, "Onbekend"].map((s) => (
              <button
                key={s}
                onClick={() => setFilters((f) => ({ ...f, segment: f.segment === s ? "" : s }))}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filters.segment === s
                    ? "bg-[#2C72FF] text-white shadow-md shadow-[#2C72FF]/20"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
              >
                {s} ({s === "Onbekend" ? stats.unknown : stats.segments.find(seg => seg.name === s)?.count || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Table (Full Width) ─── */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        {selected.size > 0 && (
          <div className="bg-zinc-950 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-[#FFAC24]">{selected.size} geselecteerd</span>
              <div className="flex gap-2">
                <button onClick={() => bulkToggleSolved(true)} className="px-4 py-2 text-xs font-black bg-[#2F9A92] text-zinc-950 rounded-xl hover:bg-[#23756f] transition-all">
                  Markeer opgelost
                </button>
                <button onClick={() => bulkToggleSolved(false)} className="px-4 py-2 text-xs font-black bg-[#FFAC24] text-zinc-950 rounded-xl hover:bg-[#e6951a] transition-all">
                  Markeer open
                </button>
              </div>
            </div>
            <button onClick={() => setSelected(new Set())} className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">
              Deselecteer alles
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-[#2C72FF]" />
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Laden...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-black tracking-tight mb-1">Geen incidenten</h3>
            <p className="text-zinc-500 text-sm">Pas je filters aan om resultaten te zien.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-left">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && selected.size === paginated.length}
                      onChange={toggleAll}
                      className="w-5 h-5 rounded border-zinc-300 text-[#2C72FF] focus:ring-[#2C72FF] accent-[#2C72FF]"
                    />
                  </th>
                  {ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((col) => (
                    <th
                      key={col.key}
                      className="p-4 font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px] cursor-pointer hover:text-[#2C72FF] transition-colors select-none whitespace-nowrap"
                      onClick={() => toggleSort(col.key as SortKey)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        <span className="text-[#2C72FF]">{sortIndicator(col.key as SortKey)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {paginated.map((inc) => (
                  <tr
                    key={inc.id}
                    className={`group hover:bg-[#EEF3FF] dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                      selected.has(inc.id) ? "bg-[#EEF3FF]/50 dark:bg-[#2C72FF]/5" : ""
                    }`}
                    onClick={() => router.push(`/incident/${inc.id}`)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(inc.id)}
                        onChange={() => toggleOne(inc.id)}
                        className="w-5 h-5 rounded border-zinc-300 text-[#2C72FF] focus:ring-[#2C72FF] accent-[#2C72FF]"
                      />
                    </td>
                    {ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((col) => (
                      <td key={col.key} className="p-4 whitespace-nowrap">
                        {col.key === "datum" ? (
                          <span className="font-bold text-zinc-950 dark:text-zinc-300">{formatDate(inc.datum)}</span>
                        ) : col.key === "solved" ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            inc.solved ? "bg-[#EEF7F6] text-[#2F9A92] border border-[#2F9A92]/20" : "bg-[#FFF8EE] text-[#FFAC24] border border-[#FFAC24]/20"
                          }`}>
                            {inc.solved ? "Opgelost" : "Open"}
                          </span>
                        ) : col.key === "onderwerp" ? (
                          <div className="max-w-md whitespace-normal font-bold text-zinc-900 dark:text-white leading-tight">{inc.onderwerp}</div>
                        ) : col.key === "incTicket" ? (
                          <span className="font-black text-[#2C72FF]">{inc.incTicket}</span>
                        ) : col.key === "opmerkingen" ? (
                          <div className="max-w-xs truncate text-zinc-500 italic text-xs">{inc.opmerkingen || "—"}</div>
                        ) : (
                          <span className="font-medium text-zinc-600 dark:text-zinc-400">{(inc as any)[col.key] || "—"}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-black bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 disabled:opacity-50 transition-all"
            >
              ← Vorige
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                    p === page 
                      ? "bg-[#2C72FF] text-white shadow-lg shadow-[#2C72FF]/20" 
                      : "bg-white dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 hover:border-[#2C72FF]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-xs font-black bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 disabled:opacity-50 transition-all"
            >
              Volgende →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
