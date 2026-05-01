"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SimilarIncident = {
  id: number;
  incTicket: string;
  datum: string;
  onderwerp: string;
  segment: string | null;
  solved: boolean;
  similarity: number;
};

export function SubjectSimilarity() {
  const [subject, setSubject] = useState("");
  const [matches, setMatches] = useState<SimilarIncident[]>([]);
  const [selectedParent, setSelectedParent] = useState<SimilarIncident | null>(
    null,
  );
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    const trimmed = subject.trim();

    if (trimmed.length < 4) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      try {
        const response = await fetch(
          `/api/incidents/similar?subject=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Similarity request failed");
        }

        const data = (await response.json()) as { incidents: SimilarIncident[] };
        setMatches(data.incidents);
        setSelectedParent((current) => {
          if (!current) {
            return null;
          }

          return data.incidents.some((incident) => incident.id === current.id)
            ? current
            : null;
        });
        setStatus("idle");
      } catch {
        if (!controller.signal.aborted) {
          setStatus("error");
        }
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [subject]);

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        Onderwerp *
      </label>
      <input
        type="hidden"
        name="voorgaandTicket"
        value={selectedParent?.incTicket ?? ""}
      />
      <input
        name="onderwerp"
        required
        value={subject}
        onChange={(event) => {
          const nextSubject = event.target.value;
          setSubject(nextSubject);
          setSelectedParent(null);
          setSkipped(false);
          if (nextSubject.trim().length < 4) {
            setMatches([]);
            setStatus("idle");
          }
        }}
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 shadow-sm outline-none transition focus:border-[#578FFF] focus:ring-4 focus:ring-[#578FFF]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />

      {(status !== "idle" || matches.length > 0) && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#ADC8FF] bg-white shadow-sm dark:border-[#578FFF]/35 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3 border-b border-[#ADC8FF] bg-[#EEF3FF] px-5 py-4 dark:border-[#578FFF]/30 dark:bg-zinc-950">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-[#2C72FF]">
                Top 5 matches
              </div>
              <div className="mt-1 text-base font-black text-zinc-950 dark:text-white">
                Kies een bovenliggend incident
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedParent(null);
                setSkipped(true);
              }}
              className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                skipped
                  ? "border-zinc-950 bg-zinc-950 text-white dark:border-[#578FFF] dark:bg-[#578FFF] dark:text-zinc-950"
                  : "border-[#ADC8FF] bg-white text-zinc-800 hover:bg-[#EEF7F6] dark:bg-zinc-950 dark:text-[#82ACFF]"
              }`}
            >
              Geen parent
            </button>
          </div>

          <div className="p-4">
            {status === "loading" && (
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Zoeken...
              </p>
            )}

            {status === "error" && (
              <p className="text-sm font-medium text-red-600">
                Vergelijken is tijdelijk niet gelukt.
              </p>
            )}

            {status === "idle" && matches.length === 0 && (
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Geen matches gevonden.
              </p>
            )}

            {matches.length > 0 && (
              <div className="space-y-3">
                {matches.map((match) => {
                  const selected = selectedParent?.id === match.id;

                  return (
                    <div
                      key={match.id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        selected
                          ? "border-[#2F9A92] bg-[#EEF7F6] shadow-sm dark:bg-zinc-950"
                          : "border-zinc-200 bg-zinc-50 hover:border-[#578FFF]/60 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-[#578FFF]/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/incident/${match.id}`}
                              className="text-base font-black text-[#2C72FF] hover:text-[#245ccc]"
                            >
                              {match.incTicket}
                            </Link>
                            <span className="rounded-full bg-[#FFAC24] px-2.5 py-1 text-xs font-black text-zinc-950">
                              {Math.round(match.similarity * 100)}% match
                            </span>
                          </div>
                          <div className="mt-2 text-base leading-6 text-zinc-900 dark:text-zinc-100">
                            {match.onderwerp}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                            {match.segment && (
                              <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                                {match.segment}
                              </span>
                            )}
                            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                              {match.solved ? "Opgelost" : "Open"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParent(match);
                            setSkipped(false);
                          }}
                          className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                            selected
                              ? "bg-[#2F9A92] text-zinc-950"
                              : "bg-white text-zinc-800 ring-1 ring-[#ADC8FF] hover:bg-[#EEF3FF] dark:bg-zinc-900 dark:text-[#82ACFF]"
                          }`}
                        >
                          {selected ? "Gekozen" : "Als parent"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {(selectedParent || skipped) && (
        <div className="mt-3 rounded-xl bg-[#EEF7F6] px-4 py-3 text-sm font-semibold text-[#23756f] ring-1 ring-[#2F9A92]/20 dark:bg-zinc-950 dark:text-[#84C3BE]">
          {selectedParent
            ? `${selectedParent.incTicket} wordt opgeslagen als voorgaand ticket.`
            : "Er wordt geen parent incident opgeslagen."}
        </div>
      )}
    </div>
  );
}
