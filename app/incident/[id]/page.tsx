"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "../../layout";
import type { IncidentModel } from "@/app/generated/prisma/models";

type FormData = {
  incTicket: string;
  datum: string;
  postcodeHuisnr: string;
  klantnummer: string;
  casenummer: string;
  goCareTicket: string;
  onderwerp: string;
  aangemaaktDoor: string;
  segment: string;
  solved: boolean;
  st: string;
  opmerkingen: string;
  voorgaandTicket: string;
};

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const router = useRouter();
  const [incident, setIncident] = useState<IncidentModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/incidents/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setIncident(data);
        setForm(formatForm(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function formatForm(data: any): FormData {
    const d = new Date(data.datum);
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const yy = String(d.getUTCFullYear()).slice(-2);
    return {
      incTicket: data.incTicket || "",
      datum: `${dd}.${mm}.${yy}`,
      postcodeHuisnr: data.postcodeHuisnr || "",
      klantnummer: data.klantnummer || "",
      casenummer: data.casenummer || "",
      goCareTicket: data.goCareTicket || "",
      onderwerp: data.onderwerp || "",
      aangemaaktDoor: data.aangemaaktDoor || "",
      segment: data.segment || "",
      solved: data.solved || false,
      st: data.st || "",
      opmerkingen: data.opmerkingen || "",
      voorgaandTicket: data.voorgaandTicket || "",
    };
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, performedBy: user || "Onbekend" }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setIncident(updated);
      setForm(formatForm(updated));
      setEditing(false);
      setMessage("✅ Opgeslagen");
    } catch {
      setMessage("❌ Fout bij opslaan");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je dit incident wilt verwijderen?")) return;
    try {
      const res = await fetch(`/api/incidents/${id}?performedBy=${encodeURIComponent(user || "Onbekend")}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/");
    } catch {
      setMessage("❌ Fout bij verwijderen");
    }
  }

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-[#EEF3FF] dark:bg-zinc-950 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-[#2C72FF]" />
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Laden...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Incident niet gevonden</h1>
        <button onClick={() => router.push("/")} className="mt-4 text-sm text-blue-500 hover:underline">
          ← Terug naar dashboard
        </button>
      </div>
    );
  }

  const fields: { label: string; key: keyof FormData; type?: string }[] = [
    { label: "INC Ticket", key: "incTicket" },
    { label: "Datum", key: "datum" },
    { label: "Postcode + huisnr", key: "postcodeHuisnr" },
    { label: "Klantnummer", key: "klantnummer" },
    { label: "Casenummer", key: "casenummer" },
    { label: "GoCare Ticket", key: "goCareTicket" },
    { label: "Onderwerp", key: "onderwerp" },
    { label: "Aangemaakt door", key: "aangemaaktDoor" },
    { label: "Segment", key: "segment" },
    { label: "ST", key: "st" },
    { label: "Opmerkingen", key: "opmerkingen" },
    { label: "Voorgaand ticket", key: "voorgaandTicket" },
  ];

  return (
    <div className="min-h-full bg-[#EEF3FF] dark:bg-zinc-950 p-8 text-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <button 
          onClick={() => router.push("/")} 
          className="group flex items-center gap-2 text-sm font-bold text-[#2C72FF] hover:text-[#245ccc] mb-8 transition-colors"
        >
          <span className="text-lg transition-transform group-hover:-translate-x-1">←</span> 
          Terug naar dashboard
        </button>

        <div className="bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800">
          <header className="relative bg-zinc-950 p-8 text-white overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#2C72FF] via-[#2F9A92] to-[#FFAC24]" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFAC24] mb-1">Incident Detail</p>
                <h1 className="text-3xl font-black tracking-tight">{incident.incTicket}</h1>
              </div>
              <div className="flex gap-3">
                {!editing ? (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-6 py-2.5 text-sm font-black bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/10"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-6 py-2.5 text-sm font-black bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
                    >
                      Verwijderen
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 text-sm font-black bg-[#2F9A92] text-zinc-950 rounded-xl hover:bg-[#23756f] transition-all shadow-lg shadow-[#2F9A92]/20 disabled:opacity-50"
                    >
                      {saving ? "Opslaan..." : "Opslaan"}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setForm(formatForm(incident)); }}
                      className="px-6 py-2.5 text-sm font-black bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/10"
                    >
                      Annuleren
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          <div className="p-8">
            {message && (
              <div className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${
                message.includes("✅") ? "bg-[#EEF7F6] text-[#2F9A92] border border-[#2F9A92]/20" : "bg-red-50 text-red-600 border border-red-100"
              }`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {fields.map(({ label, key, type }) => (
                <div key={key} className={key === "onderwerp" || key === "opmerkingen" ? "md:col-span-2" : ""}>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
                  {editing ? (
                    key === "opmerkingen" ? (
                      <textarea
                        value={(form as any)[key] ?? ""}
                        onChange={(e) => setForm({ ...form!, [key]: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2C72FF]/20 focus:border-[#2C72FF] transition-all"
                        rows={4}
                      />
                    ) : key === "solved" ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={(form as any)[key]}
                          onChange={(e) => setForm({ ...form!, [key]: e.target.checked })}
                          className="w-6 h-6 rounded border-zinc-300 text-[#2C72FF] focus:ring-[#2C72FF] accent-[#2C72FF]"
                        />
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Gemarkeerd als opgelost</span>
                      </div>
                    ) : (
                      <input
                        type={type || "text"}
                        value={(form as any)[key] ?? ""}
                        onChange={(e) => setForm({ ...form!, [key]: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2C72FF]/20 focus:border-[#2C72FF] transition-all"
                      />
                    )
                  ) : (
                    <div className={`p-4 rounded-2xl border transition-all ${
                      key === "solved" 
                        ? (incident.solved ? "bg-[#EEF7F6] border-[#2F9A92]/20" : "bg-zinc-50 border-zinc-100 dark:bg-zinc-800/30 dark:border-zinc-700")
                        : "bg-white dark:bg-zinc-800/30 border-zinc-50 dark:border-zinc-800 shadow-sm"
                    }`}>
                      {key === "solved" ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${incident.solved ? "bg-[#2F9A92]" : "bg-zinc-400"}`} />
                          <span className={`text-sm font-black uppercase tracking-wider ${
                            incident.solved ? "text-[#2F9A92]" : "text-zinc-500"
                          }`}>
                            {incident.solved ? "Opgelost" : "Openstaand"}
                          </span>
                        </div>
                      ) : key === "incTicket" ? (
                        <span className="text-lg font-black text-[#2C72FF] tracking-tight">{incident.incTicket}</span>
                      ) : key === "onderwerp" ? (
                        <span className="text-lg font-black text-zinc-900 dark:text-white leading-tight">{incident.onderwerp}</span>
                      ) : (
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{(incident as any)[key] || <span className="text-zinc-400 italic font-normal">Niet opgegeven</span>}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <footer className="p-8 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              ID: {incident.id} • Aangemaakt op {new Date(incident.createdAt).toLocaleDateString("nl-NL")}
            </div>
            {incident.updatedAt && (
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Laatste wijziging: {new Date(incident.updatedAt).toLocaleDateString("nl-NL")}
              </div>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
